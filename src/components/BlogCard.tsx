import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { format } from 'date-fns';
import { User, Clock, Target, Sparkles } from 'lucide-react';
import type { Campaign } from '../types/campaign';
import { SummarizeButton } from './ai';

interface BlogCardProps {
  campaign: Campaign;
  index: number;
}

export default function BlogCard({ campaign, index }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Handle click on the summarize button to prevent navigation
  const handleSummarizeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="relative group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/campaign/${index}`} className="block">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={campaign.image || 'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75'}
            alt={campaign.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{format(Number(campaign.deadline) * 1000, 'MMM dd')}</span>
            </div>
          </div>
          
          <h3 className="font-sans text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {campaign.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span>{formatEther(campaign.target)} ETH</span>
            </div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {formatEther(campaign.amountCollected)} ETH raised
            </div>
          </div>
        </div>
      </Link>

      {/* AI Summarize button that appears on hover */}
      <div 
        onClick={handleSummarizeClick}
        className={`absolute bottom-4 right-4 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <SummarizeButton
          content={campaign.description}
          title={`Summary: ${campaign.title}`}
          variant="secondary"
          size="sm"
        />
      </div>
    </div>
  );
}