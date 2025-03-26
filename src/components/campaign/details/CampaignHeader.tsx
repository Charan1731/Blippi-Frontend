import React from 'react';
import { formatEther } from 'ethers';
import { Calendar, Target, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../../context/Web3Context';
import type { Campaign } from '../../../types/campaign';

interface CampaignHeaderProps {
  campaign: Campaign;
  campaignId: string;
  onDelete: () => void;
}

export default function CampaignHeader({ campaign, campaignId, onDelete }: CampaignHeaderProps) {
  const progress = Number(campaign.amountCollected) / Number(campaign.target) * 100;
  const { account } = useWeb3();
  const navigate = useNavigate();
  
  const isOwner = account && campaign.owner.toLowerCase() === account.toLowerCase();
  
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
        <div className="flex justify-between items-start">
          <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            {campaign.title}
          </h1>
          
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/campaign/edit/${campaignId}`)}
                className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
        
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