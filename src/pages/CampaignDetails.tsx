import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther } from 'ethers';
import CampaignHeader from '../components/campaign/details/CampaignHeader';
import DonationForm from '../components/campaign/details/DonationForm';
import DonationList from '../components/campaign/details/DonationList';
import type { Campaign } from '../types/campaign';
import MDEditor  from '@uiw/react-md-editor';

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const { provider, signer } = useWeb3();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!provider || !id) return;
      
      try {
        const contract = getContract(provider);
        const campaigns = await contract.getCampaigns();
        setCampaign(campaigns[parseInt(id)]);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [provider, id]);

  const handleDonate = async (amount: string) => {
    if (!signer || !id) return;

    const contract = getContract(provider, signer);
    const tx = await contract.donateToCampaign(id, {
      value: parseEther(amount)
    });
    await tx.wait();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 min-h-[60vh] flex items-center justify-center">
        Campaign not found
      </div>
    );
  }

  const donations = campaign.donators.map((address, index) => ({
    address,
    amount: campaign.donations[index],
    timestamp: Date.now() - (index * 1000 * 60 * 60) // Simulated timestamps
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <CampaignHeader campaign={campaign} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold mb-4 dark:text-blue-400">About this campaign</h3>
              <div data-color-mode="light" className="prose prose-sm max-w-none dark:prose-invert">
                <MDEditor.Markdown 
                  source={campaign.description} 
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>
            </div>
            
            <DonationList donations={donations} />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <DonationForm
                campaignId={id!}
                onDonate={handleDonate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}