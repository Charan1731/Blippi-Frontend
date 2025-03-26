import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCard from '../components/profile/StatsCard';
import CampaignList from '../components/profile/CampaignList';
import FadeIn from '../components/FadeIn';
import type { Campaign } from '../types/campaign';

export default function Profile() {
  const { provider, account } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCampaigns = async () => {
      if (!provider || !account) return;
      
      try {
        const contract = getContract(provider);
        const allCampaigns = await contract.getCampaigns();
        const userCampaigns = allCampaigns
          .filter((campaign: any) => 
            campaign && campaign.exists && campaign.owner.toLowerCase() === account.toLowerCase()
          )
          .map((campaign: any) => ({
            id: Number(campaign.id),
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: campaign.target,
            deadline: campaign.deadline,
            amountCollected: campaign.amountCollected,
            image: campaign.image,
            donators: campaign.donators || [],
            donations: campaign.donations || []
          }));
        setCampaigns(userCampaigns);
      } catch (error) {
        console.error('Error fetching user campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCampaigns();
  }, [provider, account]);

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Please connect your wallet to view your profile
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <FadeIn>
          <ProfileHeader address={account} />
        </FadeIn>

        <FadeIn delay={200}>
          <StatsCard campaigns={campaigns} />
        </FadeIn>

        <div className="space-y-6">
          <FadeIn delay={400}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Blogs
            </h2>
          </FadeIn>

          <FadeIn delay={600}>
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                You haven't created any Blogs yet
              </div>
            ) : (
              <CampaignList campaigns={campaigns} />
            )}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}