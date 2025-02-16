import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther } from 'ethers';
import FloatingInput from '../components/forms/FloatingInput';
import FloatingTextarea from '../components/forms/FloatingTextarea';
import CampaignPreview from '../components/campaign/CampaignPreview';

// Define proper types
interface CampaignFormData {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

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

  const validateForm = (): boolean => {
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
  };

  const analyzeContent = async (text: string): Promise<boolean> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the following text for inappropriate, spammy, or harmful content, including but not limited to hate speech, explicit material, threats, misinformation, scams, or any other form of harmful communication. Return "true" if the content is appropriate and "false" if it is inappropriate.

Text: ${text}

Return only "true" or "false" with no additional explanation.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() === 'true';
    } catch (error) {
      console.error('Content analysis failed:', error);
      throw new Error('Failed to analyze content');
    }
  };

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

      // Analyze content
      const [isTitleAppropriate, isDescriptionAppropriate] = await Promise.all([
        analyzeContent(formData.title),
        analyzeContent(formData.description)
      ]);

      if (!isTitleAppropriate || !isDescriptionAppropriate) {
        setContentError('Your content contains inappropriate material. Please revise it.');
        return;
      }

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
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