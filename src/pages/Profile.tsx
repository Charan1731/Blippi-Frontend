import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCard from '../components/profile/StatsCard';
import CampaignCard from '../components/campaign/CampaignCard';
import DonatedCampaignList from '../components/profile/DonatedCampaignList';
import { motion } from 'framer-motion';
import { Pen, BookOpenText, MessageSquareText, Clock, Bookmark, Heart } from 'lucide-react';
import type { Campaign } from '../types/campaign';
import WalletButton from '../components/WalletButton';
export default function Profile() {
  const { provider, account } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donatedCampaigns, setDonatedCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blogs');

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

        // Find campaigns the user has donated to
        const donatedToCampaigns = allCampaigns
          .filter((campaign: any) => 
            campaign && campaign.exists && 
            (campaign.donators || []).some((donator: string) => 
              donator.toLowerCase() === account.toLowerCase()
            )
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
        setDonatedCampaigns(donatedToCampaigns);
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
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[70vh] px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Pen className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Connect Your Wallet</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-md mb-6">
          Please connect your wallet to view your profile and manage your blogs.
        </p>
        {/* <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/20 transition-all duration-200 transform hover:-translate-y-1">
          Connect Wallet
        </button> */}
        <WalletButton />
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 right-0 bottom-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
          <div className="absolute top-2 left-2 right-2 bottom-2 animate-ping rounded-full bg-blue-500 opacity-30 delay-75"></div>
          <div className="absolute top-4 left-4 right-4 bottom-4 animate-pulse rounded-full bg-blue-600 opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
            Loading
          </div>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'blogs', label: 'My Blogs', icon: <BookOpenText className="w-4 h-4 mr-2" /> },
    { id: 'donations', label: 'My Donations', icon: <Heart className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Decorative elements */}
      <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-blue-300/10 dark:bg-blue-600/10 filter blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-indigo-300/10 dark:bg-indigo-600/10 filter blur-3xl"></div>
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <ProfileHeader address={account} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard campaigns={campaigns} donatedCampaigns={donatedCampaigns} />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Custom tabs implementation */}
          <div className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === tab.id 
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6">
              {/* Tab content */}
              {activeTab === 'blogs' && (
                <div>
                  {campaigns.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <BookOpenText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No blogs yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                        You haven't created any blogs yet. Start writing and share your knowledge with the world.
                      </p>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">
                        Create New Blog
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {campaigns.map((campaign, index) => (
                        <CampaignCard 
                          key={campaign.id} 
                          campaign={campaign} 
                          index={index} 
                          userAddress={account}
                          showDonationBadge={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'donations' && (
                <DonatedCampaignList campaigns={donatedCampaigns} userAddress={account} />
              )}
              
              {activeTab === 'drafts' && (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Pen className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No drafts</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    You don't have any drafts saved. When you save a draft, it will appear here.
                  </p>
                </div>
              )}
              
              {activeTab === 'comments' && (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <MessageSquareText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No comments</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    You haven't made any comments yet. Join the conversation on blogs you read.
                  </p>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recent activity</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Your recent actions and interactions will be shown here.
                  </p>
                </div>
              )}
              
              {activeTab === 'bookmarks' && (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No bookmarks</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Blogs you bookmark will appear here for easy access.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}