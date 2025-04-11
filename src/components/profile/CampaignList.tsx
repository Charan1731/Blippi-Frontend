import React from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { ArrowRight, Calendar, Users, Crown, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Campaign } from '../../types/campaign';

interface CampaignListProps {
  campaigns: Campaign[];
}

export default function CampaignList({ campaigns }: CampaignListProps) {
  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  // Function to format date from UNIX timestamp
  const formatDate = (timestamp: bigint | string) => {
    const date = new Date(Number(timestamp) * 1000);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Function to determine time remaining
  const getTimeRemaining = (deadline: bigint | string) => {
    const now = Date.now();
    const end = Number(deadline) * 1000;
    
    if (now > end) return 'Ended';
    
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 1) return `${days} days left`;
    if (days === 1) return 'Last day';
    
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${hours} hours left`;
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {campaigns.map((campaign, index) => {
        const isActive = Number(campaign.deadline) * 1000 > Date.now();
        const campaignId = campaign.id !== undefined ? campaign.id : index;
        const amountCollected = Number(campaign.amountCollected);
        const target = Number(campaign.target);
        const progress = (amountCollected / target) * 100;
        const formattedProgress = Math.min(100, progress).toFixed(1);
        const timeRemaining = getTimeRemaining(campaign.deadline);
        
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700"
            whileHover={{ y: -5 }}
          >
            {/* Featured Blog Tag */}
            {index === 0 && (
              <div className="absolute top-3 left-0 z-20 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs px-4 py-1 rounded-r-full font-medium shadow-md">
                <span className="flex items-center">
                  <Crown className="w-3 h-3 mr-1" /> Featured
                </span>
              </div>
            )}

            {/* Top gradient decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <div className="aspect-video overflow-hidden relative">
              <img
                src={campaign.image || 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800'}
                alt={campaign.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Status badge */}
              <div className="absolute top-3 right-3">
                <div className={`
                  px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm text-xs font-medium flex items-center
                  ${isActive 
                    ? 'bg-green-500/70 text-white'
                    : 'bg-red-500/70 text-white'}
                `}>
                  {isActive ? (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      {timeRemaining}
                    </>
                  ) : 'Ended'}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {campaign.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
                {campaign.description}
              </p>
              
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${formattedProgress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>{formattedProgress}% Complete</span>
                <span>{formatEther(campaign.amountCollected)} / {formatEther(campaign.target)} ETH</span>
              </div>
              
              {/* Info cards */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2 flex items-center">
                  <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-xs dark:text-white">{formatDate(campaign.deadline)}</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2 flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="text-xs dark:text-white">{campaign.donators.length} Supporters</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Active</span>
                </div>
                
                <Link
                  to={`/campaign/${campaignId}`}
                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:gap-2.5 transition-all duration-200 font-medium text-sm"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}