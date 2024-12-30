import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther } from 'ethers';
import FloatingInput from '../components/forms/FloatingInput';
import FloatingTextarea from '../components/forms/FloatingTextarea';
import CampaignPreview from '../components/campaign/CampaignPreview';
import type { CampaignFormData } from '../types/campaign';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !signer) return;

    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.target) newErrors.target = 'Target amount is required';
    if (!formData.deadline) newErrors.deadline = 'End date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const contract = getContract(signer, signer);
      const deadline = new Date(formData.deadline).getTime() / 1000;
      
      const tx = await contract.createCampaign(
        account,
        formData.title,
        formData.description,
        parseEther(formData.target),
        BigInt(deadline),
        formData.image
      );

      await tx.wait();
      navigate('/');
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid mt-10 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Create Blog
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Share your story and start raising funds for your cause.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FloatingInput
                id="title"
                type="text"
                label="Blog Title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                error={errors.title}
              />

              <FloatingTextarea
                id="description"
                label="Blog Description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                error={errors.description}
              />

              <FloatingInput
                id="target"
                type="number"
                step="0.01"
                label="Target Amount (ETH)"
                value={formData.target}
                onChange={e => setFormData(prev => ({ ...prev, target: e.target.value }))}
                error={errors.target}
              />

              <FloatingInput
                id="deadline"
                type="date"
                label="End Date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.deadline}
                onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                error={errors.deadline}
              />

              <FloatingInput
                id="image"
                type="url"
                label="Campaign Image URL"
                value={formData.image}
                onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />

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
                    Creating...
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