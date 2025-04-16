import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { CalendarDays, Edit, Share2, Flag, Trash2, CheckCircle2, Clock, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { Campaign } from '../../../types/campaign';
import { useWeb3 } from '../../../context/Web3Context';

interface CampaignHeaderProps {
  campaign: Campaign;
  campaignId: string;
  onDelete: () => void;
}

export default function CampaignHeader({
  campaign,
  campaignId,
  onDelete,
}: CampaignHeaderProps) {
  const { account } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Calculate progress percentage
  const progress = campaign.amountCollected === 0n 
    ? 0 
    : Math.min(Number(formatEther(campaign.amountCollected)) / Number(formatEther(campaign.target)) * 100, 100);
    
  // Format deadline
  const timeLeft = formatDistanceToNow(Number(campaign.deadline) * 1000, { addSuffix: false });
  const isExpired = Date.now() > Number(campaign.deadline) * 1000;
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Check if user is the campaign owner
  const isOwner = account && campaign.owner ? 
    account.toLowerCase() === campaign.owner.toLowerCase() : 
    false;

  // Function to copy campaign link
  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        {/* Campaign hero image with overlay */}
        <div className="relative aspect-video overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: isImageLoaded ? 1 : 0, 
              scale: isImageLoaded ? 1 : 1.1 
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img
              src={campaign.image || 'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75'}
              alt={campaign.title}
              className="w-full h-full object-cover"
              loading="eager"
              onLoad={() => setIsImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </motion.div>
          
          {/* Content overlay on top of the image */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <motion.h1 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md"
            >
              {campaign.title}
            </motion.h1>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 text-white/90"
            >
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-sm">By:</span>
                <span className="text-sm font-medium text-blue-300">{`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}`}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm">
                  {isExpired 
                    ? <span className="text-red-300">Campaign ended</span> 
                    : <span>{timeLeft} left</span>
                  }
                </span>
              </div>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm ${
                isExpired 
                  ? 'bg-red-500/40 text-white' 
                  : 'bg-green-500/40 text-white'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isExpired ? 'Expired' : 'Active'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Campaign action buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-wrap justify-between items-center gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-all duration-200"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-red-500/10 dark:from-pink-900/40 dark:to-red-900/40 text-pink-600 dark:text-pink-400 rounded-lg font-medium transition-all duration-200"
          >
            <Heart className="w-5 h-5" />
            <span>Like</span>
          </motion.button>
        </div>
        
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Link to={`/campaign/edit/${campaignId}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-600 dark:text-purple-400 rounded-lg font-medium transition-all duration-200"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit</span>
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-900/40 dark:to-orange-900/40 text-red-600 dark:text-red-400 rounded-lg font-medium transition-all duration-200"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </motion.button>
            </>
          )}
          
          {!isOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-600 dark:text-orange-400 rounded-lg font-medium transition-all duration-200"
            >
              <Flag className="w-5 h-5" />
              <span>Report</span>
            </motion.button>
          )}
        </div>
      </motion.div>
      
      {/* Campaign stats */}
      <motion.div 
        variants={fadeIn}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-blue-100 dark:border-blue-900/30"
      >
        <div className="space-y-6">
          {/* Progress bar section */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Raised</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {formatEther(campaign.amountCollected)} ETH
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Target</span>
                <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {formatEther(campaign.target)} ETH
                </span>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="overflow-hidden h-4 mb-1 text-xs flex rounded-xl bg-gray-200 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {campaign.donators.length} supporter{campaign.donators.length !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {progress.toFixed(1)}% Funded
                </span>
              </div>
            </div>
          </div>
          
          {/* Campaign stats cards */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl flex items-center gap-4 border border-blue-100 dark:border-blue-800/30"
            >
              <div className="p-3 bg-blue-500/20 dark:bg-blue-500/30 rounded-full">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Time remaining</p>
                <p className="font-bold text-xl text-gray-900 dark:text-white">
                  {isExpired ? 'Ended' : timeLeft}
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl flex items-center gap-4 border border-purple-100 dark:border-purple-800/30"
            >
              <div className="p-3 bg-purple-500/20 dark:bg-purple-500/30 rounded-full">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Supporters</p>
                <p className="font-bold text-xl text-gray-900 dark:text-white">
                  {campaign.donators?.length || 0}
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className={`${
                isExpired 
                  ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30' 
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
              } p-4 rounded-xl flex items-center gap-4 border ${
                isExpired 
                  ? 'border-red-100 dark:border-red-800/30' 
                  : 'border-emerald-100 dark:border-emerald-800/30'
              }`}
            >
              <div className={`p-3 ${
                isExpired 
                  ? 'bg-red-500/20 dark:bg-red-500/30' 
                  : 'bg-emerald-500/20 dark:bg-emerald-500/30'
              } rounded-full`}>
                <CalendarDays className={`w-6 h-6 ${
                  isExpired 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-emerald-600 dark:text-emerald-400'
                }`} />
              </div>
              <div>
                <p className={`text-xs text-gray-500 dark:text-gray-400`}>Status</p>
                <p className={`font-bold text-xl ${
                  isExpired 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {isExpired ? 'Ended' : 'Active'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}