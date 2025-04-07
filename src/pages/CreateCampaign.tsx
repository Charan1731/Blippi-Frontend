import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther } from 'ethers';
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

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { account, signer, provider } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [isModeratingContent, setIsModeratingContent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showContentModerationModal, setShowContentModerationModal] = useState(false);
  const [inappropriateContentDetails, setInappropriateContentDetails] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    target: '',
    deadline: '',
    image: '',
  });
  const [contentError, setContentError] = useState('');
  const [newCampaignId, setNewCampaignId] = useState<string | null>(null);

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

  const analyzeContent = useCallback(async (text: string, retryCount = 0): Promise<{isAppropriate: boolean, error?: string, details?: string}> => {
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
              text: `Analyze if the following text is appropriate for a fundraising campaign. Only mark as inappropriate if the content contains explicit harmful content such as hate speech, threats, explicit adult content, or illegal activities(consider bettings and scams as high level threats).

Text: ${text}

If the content is inappropriate, explain what specific part is inappropriate and why. If the content is appropriate, reply with "true".`
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
      let details = '';
      if (data.candidates && data.candidates.length > 0) {
        const textResponse = data.candidates[0]?.content?.parts?.[0]?.text?.trim();
        console.log('Gemini text response:', textResponse);
        
        if (textResponse.toLowerCase() === 'true') {
          result = true;
        } else {
          result = false;
          details = textResponse;
        }
      }
      
      setCachedResult(text, result);
      return { isAppropriate: result, details: details };
    } catch (error) {
      console.error('Content analysis error:', error);
      return { isAppropriate: true, error: 'Content moderation check failed. Your content has been accepted.' };
    }
  }, []);


  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
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
    
    if (!account || !signer) {
      setContentError('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setContentError('');


      setIsModeratingContent(true);
      const combinedText = `Title: ${formData.title.trim()}\nDescription: ${formData.description.trim()}`;
      const { isAppropriate, error, details } = await analyzeContent(combinedText);
      setIsModeratingContent(false);
      
      if (error) {
        console.warn('Content moderation warning:', error);
      }
      
      if (!isAppropriate) {
        setContentError('Your campaign contains inappropriate content. Please revise and try again.');
        setInappropriateContentDetails(details || 'Your content contains inappropriate material.');
        setShowContentModerationModal(true);
        setLoading(false);
        return;
      }

      if (!provider) {
        setContentError('Provider not available');
        return;
      }
      const contract = getContract(provider, signer);
      const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);
      
      console.log('Creating campaign with params:', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        target: parseEther(formData.target).toString(),
        deadline: deadline,
        image: formData.image.trim()
      });
      
      const tx = await contract.createCampaign(
        formData.title.trim(),
        formData.description.trim(),
        parseEther(formData.target),
        deadline,
        formData.image.trim(),
        { 
          gasLimit: 3000000
        }
      );

      const receipt = await tx.wait();
      console.log('Campaign created:', receipt);
      
      try {
        const event = receipt.logs
          .map((log: any) => contract.interface.parseLog(log))
          .find((event: any) => event && event.name === 'CampaignCreated');
        
        if (event && event.args) {
          const campaignId = event.args[0].toString();
          console.log('New campaign ID:', campaignId);
          setNewCampaignId(campaignId);
        }
      } catch (error) {
        console.error('Error parsing campaign ID from event:', error);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating campaign:', error);
      setContentError(
        error instanceof Error 
          ? error.message 
          : 'Failed to create campaign. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const handleViewCampaign = () => {
    setShowSuccessModal(false);
    if (newCampaignId) {
      navigate(`/campaign/${newCampaignId}`);
    } else {
      navigate('/');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    id?: string
  ) => {
    if (typeof e === 'string') {
      setFormData(prev => ({ ...prev, description: e }));
      if (errors.description) {
        setErrors(prev => ({ ...prev, description: '' }));
      }
      return;
    }

    const { id: inputId, value } = e.target;
    setFormData(prev => ({ ...prev, [inputId]: value }));
    if (errors[inputId as keyof CampaignFormData]) {
      setErrors(prev => ({ ...prev, [inputId]: '' }));
    }
  };

  const handleCloseContentModerationModal = () => {
    setShowContentModerationModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid mt-10 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Create Campaign
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Share your story and start raising funds for your cause.
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

              <button
                type="submit"
                disabled={loading || !account}
                className={`
                  w-full py-3 px-6 rounded-xl text-white font-medium
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
                    {isModeratingContent ? 'Checking content...' : 'Creating Campaign...'}
                  </div>
                ) : (
                  'Create Campaign'
                )}
              </button>
            </form>
          </div>
          <div className="hidden lg:block">
            <CampaignPreview data={formData} />
          </div>
        </div>

        {/* Content Moderation Modal */}
        <Modal
          isOpen={showContentModerationModal}
          onClose={handleCloseContentModerationModal}
          title="Inappropriate Content Detected"
          type="error"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We've detected inappropriate content in your campaign:
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Content Issue:</p>
              <p className="text-red-600 mt-2">{inappropriateContentDetails}</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Please review and revise your content to ensure it complies with our community guidelines.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseContentModerationModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Campaign Created!"
          type="success"
        >
          <SuccessConfirmation
            title="Campaign Successfully Created!"
            message="Your fundraising campaign has been created and is now live on the platform. Thank you for making a difference!"
            actionText={newCampaignId ? "View Your Campaign" : "Go to Home"}
            onAction={handleViewCampaign}
          />
        </Modal>
      </div>
    </div>
  );
}