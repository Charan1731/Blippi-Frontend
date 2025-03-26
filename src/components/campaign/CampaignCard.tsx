import React from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { ArrowRight } from 'lucide-react';
import ProgressBar from './ProgressBar';
import type { Campaign } from '../../types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

export default function CampaignCard({ campaign, index }: CampaignCardProps) {
  const isActive = Number(campaign.deadline) * 1000 > Date.now();
  const progress = Number(campaign.amountCollected) / Number(campaign.target) * 100;
  
  const campaignId = campaign.id !== undefined ? campaign.id : index;

  return (
    <div className="group relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="aspect-video overflow-hidden">
        <img
          src={campaign.image || 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800'}
          alt={campaign.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={`
            px-2 py-1 text-xs font-medium rounded-full transition-colors duration-200
            ${isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}
          `}>
            {isActive ? 'Active' : 'Ended'}
          </div>
        </div>
        
        <h3 className="font-sans text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 transition-colors duration-200">
          {campaign.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 transition-colors duration-200">
          {campaign.description}
        </p>
        
        <div className="space-y-4">
          <ProgressBar progress={progress} />
          
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">Raised</p>
              <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                {formatEther(campaign.amountCollected)} ETH
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">Target</p>
              <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                {formatEther(campaign.target)} ETH
              </p>
            </div>
          </div>
          
          <Link
            to={`/campaign/${campaignId}`}
            className="block w-full text-center py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform group-hover:scale-[1.02]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}