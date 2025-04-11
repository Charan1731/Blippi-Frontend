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
import { motion } from 'framer-motion';
import { ShieldCheck, Image, Rocket, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

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
  const [showContentModerationModal, setShowContentModerationModal] = useState(false);
  const [inappropriateContentDetails, setInappropriateContentDetails] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [validationAttempted, setValidationAttempted] = useState(false);

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
    setValidationAttempted(true);
    
    if (!account || !signer || !isOwner) {
      setContentError('You are not authorized to edit this campaign');
      return;
    }

    if (!validateForm() || !id) {
      // If we're in the media tab and there are errors in the basic fields, switch to basic tab
      if (activeSection === 'media' && (errors.title || errors.description || errors.target || errors.deadline)) {
        setActiveSection('basic');
      }
      return;
    }

    try {
      setLoading(true);
      setContentError('');

      // Check content moderation for title and description
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

  const handleCloseContentModerationModal = () => {
    setShowContentModerationModal(false);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Check if form is ready for submission
  const isFormComplete = formData.title && formData.description && formData.target && formData.deadline;

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading campaign data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">{contentError || "You don't have permission to edit this campaign"}</p>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="w-full py-3 px-6 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 transition-colors duration-300">
      {/* Decorative elements */}
      <div className="absolute top-24 right-10 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-24 left-10 w-72 h-72 bg-blue-300/30 dark:bg-blue-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl mt-10 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Edit Your Blog
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Update your fundraising details and keep your supporters informed.
          </p>
        </motion.div>

        <motion.div 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid lg:grid-cols-2 gap-10">
            <motion.div 
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Form Progress */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Blog update progress
                  </p>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {isFormComplete ? 'Ready to update!' : 'Complete all fields'}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: formData.title ? 
                        (formData.description ? 
                          (formData.target ? 
                            (formData.deadline ? '100%' : '75%') 
                            : '50%') 
                          : '25%') 
                        : '0%' 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button 
                  onClick={() => setActiveSection('basic')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    activeSection === 'basic' 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>Blog Details</span>
                  {validationAttempted && (errors.title || errors.description || errors.target || errors.deadline) && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveSection('media')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    activeSection === 'media' 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>Media</span>
                  {validationAttempted && activeSection !== 'media' && !formData.image && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeSection === 'basic' && (
                  <motion.div 
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={fadeIn}>
                      <FloatingInput
                        id="title"
                        type="text"
                        label="Blog Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        error={errors.title}
                        maxLength={100}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                      {formData.title && !errors.title && (
                        <div className="flex items-center mt-1 text-green-600 dark:text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span>Great title! It's memorable and descriptive.</span>
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={fadeIn} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Blog Description
                      </label>
                      <div data-color-mode="light" className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <MDEditor
                          value={formData.description}
                          onChange={(value) => handleInputChange(value || '', 'description')}
                          preview="edit"
                          height={300}
                          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm dark:text-white rounded-lg"
                        />
                      </div>
                      {errors.description && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                      {formData.description && !errors.description && (
                        <div className="flex items-center mt-1 text-green-600 dark:text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span>{formData.description.length < 200 ? 'Consider adding more details to your description.' : 'Great description! It provides good details about your campaign.'}</span>
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={fadeIn}>
                      <FloatingInput
                        id="target"
                        type="number"
                        step="0.01"
                        min="0"
                        label="Target Amount (ETH)"
                        value={formData.target}
                        onChange={handleInputChange}
                        error={errors.target}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                    </motion.div>

                    <motion.div variants={fadeIn}>
                      <FloatingInput
                        id="deadline"
                        type="date"
                        label="End Date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.deadline}
                        onChange={handleInputChange}
                        error={errors.deadline}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                    </motion.div>
                  </motion.div>
                )}

                {activeSection === 'media' && (
                  <motion.div 
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={fadeIn}>
                      <FloatingInput
                        id="image"
                        type="url"
                        label="Blog Image URL"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder=""
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                      <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs italic">
                        {formData.image ? 'Image preview will appear on the right panel' : 'Image is optional but highly recommended for better engagement'}
                      </p>
                    </motion.div>

                    <motion.div variants={fadeIn} className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-full">
                          <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-blue-800 dark:text-blue-300">Image Guidelines</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            Use high-quality images (1200×630px recommended) that represent your campaign. 
                            Ensure you have rights to use any images you upload.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {contentError && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Error</p>
                      <p>{contentError}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex-1 flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span>Content will be reviewed for community guidelines</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/campaign/${id}`)}
                      className="py-3 px-5 rounded-xl text-gray-700 font-medium 
                        bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white 
                        dark:hover:bg-gray-600 transition-all duration-200
                        transform hover:-translate-y-1 hover:shadow-md"
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      disabled={loading || !account}
                      className={`
                        py-3 px-8 rounded-xl text-white font-medium
                        bg-gradient-to-r from-blue-600 to-indigo-600
                        hover:from-blue-700 hover:to-indigo-700
                        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                        relative overflow-hidden
                      `}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {isModeratingContent ? 'Checking content...' : 'Updating Campaign...'}
                        </div>
                      ) : (
                        'Update Campaign'
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>

            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="sticky top-20">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Blog Preview</h3>
                <CampaignPreview data={formData} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Moderation Modal */}
        <Modal
          isOpen={showContentModerationModal}
          onClose={handleCloseContentModerationModal}
          title="Inappropriate Content Detected"
          type="error"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Content Issue:</p>
              <p className="text-red-600 mt-2">{inappropriateContentDetails}</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Please revise your content to comply with our guidelines.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseContentModerationModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          title="Blog Updated!"
          type="success"
        >
          <SuccessConfirmation
            title="Blog Successfully Updated!"
            message="Your Blog has been updated with the new information. Thank you for keeping your supporters informed."
            actionText="View Your Blog"
            onAction={handleViewCampaign}
          />
        </Modal>
      </div>
    </div>
  );
} 