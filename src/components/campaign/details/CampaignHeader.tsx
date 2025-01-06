import React from 'react';
import { formatEther } from 'ethers';
import { Calendar, Target, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { Campaign } from '../../../types/campaign';

interface CampaignHeaderProps {
  campaign: Campaign;
}

export default function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const progress = Number(campaign.amountCollected) / Number(campaign.target) * 100;
  
  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm">
      <div className="aspect-[21/9] overflow-hidden rounded-t-2xl">
        <img
          src={campaign.image || 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1600'}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-8">
        <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          {campaign.title}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
              <p className="font-display font-semibold dark:text-blue-400">{formatEther(campaign.target)} ETH</p>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Backers</p>
              <p className="font-display font-semibold dark:text-purple-400">{campaign.donators.length}</p>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
              <p className="font-display font-semibold dark:text-green-400">
                {format(Number(campaign.deadline) * 1000, 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}