import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther } from 'ethers';
import FloatingInput from '../components/forms/FloatingInput';
import FloatingTextarea from '../components/forms/FloatingTextarea';
import CampaignPreview from '../components/campaign/CampaignPreview';

interface CampaignFormData {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const RETRY_DELAY = 5000; // Increased to 5 seconds
const MAX_RETRIES = 2;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

// Cache interface
interface CacheEntry {
  result: boolean;
  timestamp: number;
}

// In-memory cache
const contentCache: Map<string, CacheEntry> = new Map();

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { account, signer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    target: '',
    deadline: '',
    image: '',
  });
  const [contentError, setContentError] = useState('');

  // Cache management functions
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

  // Content analysis with caching
  const analyzeContent = useCallback(async (text: string, retryCount = 0): Promise<boolean> => {
    // Check cache first
    const cachedResult = getCachedResult(text);
    if (cachedResult !== null) {
      return cachedResult;
    }

    const apiKey = import.meta.env.VITE_GEMINI?.replace(/["']/g, '');
    
    if (!apiKey) {
      throw new Error('Content analysis service is not properly configured');
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
              text: `Analyze if the following text is appropriate for a fundraising campaign. Return "true" if appropriate, "false" if inappropriate.

Text: ${text}

Reply with only "true" or "false".`
            }]
          }]
        })
      });

      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY * (retryCount + 1);
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return analyzeContent(text, retryCount + 1);
        }
        // If we've exhausted retries, assume content is appropriate
        console.log('Rate limit retries exhausted, proceeding with content');
        return true;
      }

      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        // For other errors, proceed with content
        return true;
      }

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() === 'true';
      
      // Cache the result
      setCachedResult(text, result);
      return result;
    } catch (error) {
      console.error('Content analysis error:', error);
      // In case of errors, proceed with content
      return true;
    }
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
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

  // Form submission
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

      // Create campaign
      const contract = getContract(signer, signer);
      const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);
      
      const tx = await contract.createCampaign(
        account,
        formData.title.trim(),
        formData.description.trim(),
        parseEther(formData.target),
        BigInt(deadline),
        formData.image.trim()
      );

      await tx.wait();
      navigate('/');
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

  // Input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id as keyof CampaignFormData]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
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

              <FloatingTextarea
                id="description"
                label="Campaign Description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                maxLength={2000}
              />

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
                placeholder="https://example.com/image.jpg"
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
                    Creating Campaign...
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
      </div>
    </div>
  );
}