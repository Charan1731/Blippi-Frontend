import React from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { ArrowRight, Clock, Users, Calendar, Heart, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import type { Campaign } from '../../types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  showDonationBadge?: boolean;
  userAddress?: string;
}

export default function CampaignCard({ campaign, index, showDonationBadge, userAddress }: CampaignCardProps) {
  const isActive = Number(campaign.deadline) * 1000 > Date.now();
  const progress = Number(campaign.amountCollected) / Number(campaign.target) * 100;
  const formattedProgress = Math.min(100, progress).toFixed(1);
  const campaignId = campaign.id !== undefined ? campaign.id : index;

  // Format date
  const formatDate = (timestamp: bigint | string) => {
    const date = new Date(Number(timestamp) * 1000);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Calculate time remaining
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

  // Calculate user donation amount if userAddress is provided
  const getUserDonationAmount = () => {
    if (!userAddress || !campaign.donators) return null;
    
    let total = 0n;
    for (let i = 0; i < campaign.donators.length; i++) {
      if (campaign.donators[i].toLowerCase() === userAddress.toLowerCase()) {
        total += campaign.donations[i];
      }
    }
    return total > 0n ? total : null;
  };

  const userDonation = getUserDonationAmount();
  const hasDonated = userDonation !== null;

  return (
    <motion.div 
      className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700"
      whileHover={{ y: -5 }}
    >
      {/* Top gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' 
          : 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-500'
      }`} />
      
      <div className="relative aspect-video overflow-hidden">
        <img
          src={campaign.image || 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800'}
          alt={campaign.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay gradient on hover */}
        <div className={`absolute inset-0 ${
          isActive 
            ? 'bg-gradient-to-t from-black/60 to-transparent' 
            : 'bg-gradient-to-t from-red-900/60 to-transparent'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Like button */}
        <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110">
          <Heart className="w-4 h-4 text-gray-400 hover:text-pink-500 dark:text-gray-300 dark:hover:text-pink-400 transition-colors duration-200" />
        </button>
        
        {/* Status badge with enhanced red styling for ended campaigns */}
        <div className="absolute top-3 left-3 z-10">
          <div className={`
            px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm text-xs font-medium flex items-center
            ${isActive 
              ? 'bg-green-500/70 text-white'
              : 'bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/30 shadow-lg shadow-red-500/20'
            }
          `}>
            <Clock className={`w-3 h-3 ${isActive ? 'mr-1' : 'mr-1.5 text-red-200'}`} />
            <span className={isActive ? '' : 'font-semibold'}>{getTimeRemaining(campaign.deadline)}</span>
            {!isActive && (
              <motion.div 
                className="absolute inset-0 rounded-full bg-red-400/10 border border-red-400/20"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </div>
        
        {/* Donation badge */}
        {hasDonated && showDonationBadge && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="px-3 py-1.5 rounded-full bg-green-500/80 text-white shadow-lg backdrop-blur-sm text-xs font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              <span>You donated {formatEther(userDonation!).substring(0, 5)} ETH</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className={`font-sans text-xl font-bold mb-2 line-clamp-1 transition-colors duration-200 ${
          isActive 
            ? 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400' 
            : 'text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400'
        }`}>
          {campaign.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2 transition-colors duration-200">
          {campaign.description}
        </p>
        
        <div className="space-y-4">
          {/* Progress bar with animation */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${formattedProgress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>{formattedProgress}% Complete</span>
            <span>{formatEther(campaign.amountCollected)} / {formatEther(campaign.target)} ETH</span>
          </div>
          
          {/* Info cards */}
          <div className="grid grid-cols-2 gap-2 mb-1">
            <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2 flex items-center">
              <Calendar className={`w-4 h-4 mr-2 ${
                isActive 
                  ? 'text-blue-500 dark:text-blue-400' 
                  : 'text-red-500 dark:text-red-400'
              }`} />
              <span className="text-xs dark:text-white">{formatDate(campaign.deadline)}</span>
            </div>
            <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2 flex items-center">
              <Users className="w-4 h-4 text-purple-500 dark:text-purple-400 mr-2" />
              <span className="text-xs dark:text-white">{campaign.donators.length} Supporters</span>
            </div>
          </div>
          
          <Link
            to={`/campaign/${campaignId}`}
            className={`flex items-center justify-center w-full py-2.5 px-4 text-white rounded-lg font-medium transition-all duration-200 transform group-hover:scale-[1.02] shadow-sm hover:shadow-blue-500/20 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
            }`}
          >
            <span>{isActive ? 'View Details' : 'View Ended Blog'}</span>
            <motion.div 
              className="ml-2"
              initial={{ x: 0 }}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}