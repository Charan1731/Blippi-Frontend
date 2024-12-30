import React from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { format } from 'date-fns';
import { User } from 'lucide-react';
import type { Campaign } from '../types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

export default function CampaignCard({ campaign, index }: CampaignCardProps) {
  return (
    <Link
      to={`/campaign/${index}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <img
        src={campaign.image || 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800'}
        alt={campaign.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <User className="w-4 h-4" />
          <span>Created by {`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}`}</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {campaign.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {campaign.description}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Target</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatEther(campaign.target)} ETH
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Raised</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatEther(campaign.amountCollected)} ETH
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Deadline</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {format(Number(campaign.deadline) * 1000, 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}