import React from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { ArrowRight, Clock, Users, Calendar, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import type { Campaign } from '../../types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

export default function CampaignCard({ campaign, index }: CampaignCardProps) {
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

  return (
    <motion.div 
      className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700"
      whileHover={{ y: -5 }}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="relative aspect-video overflow-hidden">
        <img
          src={campaign.image || 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800'}
          alt={campaign.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Like button */}
        <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110">
          <Heart className="w-4 h-4 text-gray-400 hover:text-pink-500 dark:text-gray-300 dark:hover:text-pink-400 transition-colors duration-200" />
        </button>
        
        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className={`
            px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm text-xs font-medium flex items-center
            ${isActive 
              ? 'bg-green-500/70 text-white'
              : 'bg-red-500/70 text-white'}
          `}>
            <Clock className="w-3 h-3 mr-1" />
            {getTimeRemaining(campaign.deadline)}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-sans text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {campaign.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2 transition-colors duration-200">
          {campaign.description}
        </p>
        
        <div className="space-y-4">
          {/* Progress bar with animation */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600"
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
              <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" />
              <span className="text-xs">{formatDate(campaign.deadline)}</span>
            </div>
            <div className="bg-gray-100/70 dark:bg-gray-700/50 rounded-lg p-2 flex items-center">
              <Users className="w-4 h-4 text-purple-500 dark:text-purple-400 mr-2" />
              <span className="text-xs">{campaign.donators.length} Supporters</span>
            </div>
          </div>
          
          <Link
            to={`/campaign/${campaignId}`}
            className="flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform group-hover:scale-[1.02] shadow-sm hover:shadow-blue-500/20"
          >
            <span>View Details</span>
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