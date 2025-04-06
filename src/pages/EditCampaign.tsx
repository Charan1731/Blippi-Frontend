import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther, formatEther } from 'ethers';
import FloatingInput from '../components/forms/FloatingInput';
import CampaignPreview from '../components/campaign/CampaignPreview';
import MDEditor from '@uiw/react-md-editor';
import Modal from '../components/Modal';
import SuccessConfirmation from '../components/SuccessConfirmation';

interface CampaignFormData {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const RETRY_DELAY = 5000;
const MAX_RETRIES = 2;
const CACHE_DURATION = 1000 * 60 * 60;

interface CacheEntry {
  result: boolean;
  timestamp: number;
}

const contentCache: Map<string, CacheEntry> = new Map();

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account, signer, provider } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isModeratingContent, setIsModeratingContent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    target: '',
    deadline: '',
    image: '',
  });
  const [contentError, setContentError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getCachedResult = (text: string): boolean | null => {
    const cached = contentCache.get(text);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      contentCache.delete(text);
      return null;
    }
    
    return cached.result;
  };

  const setCachedResult = (text: string, result: boolean) => {
    contentCache.set(text, {
      result,
      timestamp: Date.now()
    });
  };

  const analyzeContent = useCallback(async (text: string, retryCount = 0): Promise<{isAppropriate: boolean, error?: string}> => {
    const cachedResult = getCachedResult(text);
    if (cachedResult !== null) {
      return { isAppropriate: cachedResult };
    }

    const apiKey = import.meta.env.VITE_GEMINI?.replace(/["']/g, '');
    
    if (!apiKey) {
      console.error('Content analysis service is not properly configured - missing API key');
      return { 
        isAppropriate: true, 
        error: 'Content moderation service is not available. Please check your settings or try again later.'
      };
    }

    try {
      const endpoint = new URL(GEMINI_API_ENDPOINT);
      endpoint.searchParams.append('key', apiKey);

      const response = await fetch(endpoint.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze if the following text is appropriate for a fundraising campaign. Only mark as inappropriate if the content contains explicit harmful content such as hate speech, threats, explicit adult content, or illegal activities.

Text: ${text}

Reply with only "true" if appropriate or "false" if clearly inappropriate. When in doubt, reply with "true".`
            }]
          }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        })
      });

      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY * (retryCount + 1);
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return analyzeContent(text, retryCount + 1);
        }
        console.log('Rate limit retries exhausted, proceeding with content');
        return { isAppropriate: true, error: 'Content moderation service is busy. Your content has been accepted.' };
      }

      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        return { isAppropriate: true, error: 'Content moderation service encountered an error. Your content has been accepted.' };
      }

      const data = await response.json();
      
      console.log('Gemini API response:', JSON.stringify(data, null, 2));
      
      let result = true;
      if (data.candidates && data.candidates.length > 0) {
        const textResponse = data.candidates[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
        console.log('Gemini text response:', textResponse);
        
        if (textResponse === 'false') {
          result = false;
        }
      }
      
      setCachedResult(text, result);
      return { isAppropriate: result };
    } catch (error) {
      console.error('Content analysis error:', error);
      return { isAppropriate: true, error: 'Content moderation check failed. Your content has been accepted.' };
    }
  }, []);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!provider || !id) return;
      
      try {
        const contract = getContract(provider);
        const campaigns = await contract.getCampaigns();
        
        // Find the campaign with the matching id
        const campaignData = campaigns[parseInt(id)];
        
        if (!campaignData || !campaignData.exists) {
          setContentError('Campaign not found');
          setFetching(false);
          return;
        }
        
        // Check if current user is the owner
        if (account && campaignData.owner.toLowerCase() === account.toLowerCase()) {
          setIsOwner(true);
          
          // Convert timestamp to YYYY-MM-DD format for input
          const deadlineDate = new Date(Number(campaignData.deadline) * 1000);
          const formattedDate = deadlineDate.toISOString().split('T')[0];
          
          // Set form data
          setFormData({
            title: campaignData.title,
            description: campaignData.description,
            target: formatEther(campaignData.target),
            deadline: formattedDate,
            image: campaignData.image,
          });
        } else {
          setContentError('You are not authorized to edit this campaign');
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setContentError('Failed to load campaign data');
      } finally {
        setFetching(false);
      }
    };

    fetchCampaign();
  }, [provider, id, account]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    // Check if description is too long
    if (formData.description.length > 10000) {
      newErrors.description = 'Description is too long. Please keep it under 10,000 characters.';
    }
    if (!formData.target || parseFloat(formData.target) <= 0) {
      newErrors.target = 'Please enter a valid target amount';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'End date is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        newErrors.deadline = 'End date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !signer || !isOwner) {
      setContentError('You are not authorized to edit this campaign');
      return;
    }

    if (!validateForm() || !id) {
      return;
    }

    try {
      setLoading(true);
      setContentError('');

      // Check content moderation for title and description
      setIsModeratingContent(true);
      const combinedText = `Title: ${formData.title.trim()}\nDescription: ${formData.description.trim()}`;
      const { isAppropriate, error } = await analyzeContent(combinedText);
      setIsModeratingContent(false);
      
      if (error) {
        console.warn('Content moderation warning:', error);
      }
      
      if (!isAppropriate) {
        setContentError('Your campaign contains inappropriate content. Please revise and try again.');
        setLoading(false);
        return;
      }

      if (!provider) {
        setContentError('Provider not available');
        return;
      }

      const contract = getContract(provider, signer);
      const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);
      
      console.log('Editing campaign with params:', {
        id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        target: parseEther(formData.target).toString(),
        deadline: deadline,
        image: formData.image.trim()
      });
      
      const tx = await contract.editCampaign(
        id,
        formData.title.trim(),
        formData.description.trim(),
        parseEther(formData.target),
        deadline,
        formData.image.trim(),
        { 
          gasLimit: 3000000
        }
      );

      await tx.wait();
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating campaign:', error);
      setContentError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update campaign. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(`/campaign/${id}`);
  };

  const handleViewCampaign = () => {
    setShowSuccessModal(false);
    navigate(`/campaign/${id}`);
  };

  // Input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    id?: string
  ) => {
    // If e is a string, it's from the markdown editor
    if (typeof e === 'string') {
      setFormData(prev => ({ ...prev, description: e }));
      if (errors.description) {
        setErrors(prev => ({ ...prev, description: '' }));
      }
      return;
    }

    // Regular input handling
    const { id: inputId, value } = e.target;
    setFormData(prev => ({ ...prev, [inputId]: value }));
    if (errors[inputId as keyof CampaignFormData]) {
      setErrors(prev => ({ ...prev, [inputId]: '' }));
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{contentError || "You don't have permission to edit this campaign"}</p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 px-6 rounded-xl text-white font-medium bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid mt-10 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Edit Campaign
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Update your campaign details below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FloatingInput
                id="title"
                type="text"
                label="Campaign Title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                maxLength={100}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign Description
                </label>
                <div data-color-mode="light" className="w-full">
                  <MDEditor
                    value={formData.description}
                    onChange={(value) => handleInputChange(value || '', 'description')}
                    preview="edit"
                    height={300}
                    className='dark:bg-gray-800/50 dark:text-white p-4 rounded-lg'
                  />
                </div>
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <FloatingInput
                id="target"
                type="number"
                step="0.01"
                min="0"
                label="Target Amount (ETH)"
                value={formData.target}
                onChange={handleInputChange}
                error={errors.target}
              />

              <FloatingInput
                id="deadline"
                type="date"
                label="End Date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.deadline}
                onChange={handleInputChange}
                error={errors.deadline}
              />

              <FloatingInput
                id="image"
                type="url"
                label="Campaign Image URL"
                value={formData.image}
                onChange={handleInputChange}
                placeholder=""
              />

              {contentError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {contentError}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/campaign/${id}`)}
                  className="w-1/2 py-3 px-6 rounded-xl text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !account}
                  className={`
                    w-1/2 py-3 px-6 rounded-xl text-white font-medium
                    bg-gradient-to-r from-blue-600 to-indigo-600
                    hover:from-blue-700 hover:to-indigo-700
                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    transition-all duration-200 transform hover:-translate-y-0.5
                    disabled:opacity-50 disabled:cursor-not-allowed
                    relative overflow-hidden
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isModeratingContent ? 'Checking content...' : 'Updating Campaign...'}
                    </div>
                  ) : (
                    'Update Campaign'
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="hidden lg:block">
            <CampaignPreview data={formData} />
          </div>
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Campaign Updated!"
          type="success"
        >
          <SuccessConfirmation
            title="Campaign Successfully Updated!"
            message="Your campaign has been updated with the new information. Thank you for keeping your supporters informed."
            actionText="View Your Campaign"
            onAction={handleViewCampaign}
          />
        </Modal>
      </div>
    </div>
  );
} 