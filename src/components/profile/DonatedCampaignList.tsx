import React from 'react';
import { Campaign } from '../../types/campaign';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CampaignCard from '../campaign/CampaignCard';

interface DonatedCampaignListProps {
  campaigns: Campaign[];
  userAddress: string;
}

const DonatedCampaignList: React.FC<DonatedCampaignListProps> = ({ campaigns, userAddress }) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No donations yet</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
          You haven't donated to any campaigns yet. Browse campaigns and support causes you believe in.
        </p>
        <Link 
          to="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
        >
          Browse Campaigns
        </Link>
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
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {campaigns.map((campaign, index) => (
        <CampaignCard 
          key={campaign.id} 
          campaign={campaign} 
          index={index} 
          userAddress={userAddress}
          showDonationBadge={true}
        />
      ))}
    </motion.div>
  );
};

export default DonatedCampaignList; 