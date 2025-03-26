import React from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { ArrowRight } from 'lucide-react';
import type { Campaign } from '../../types/campaign';

interface CampaignListProps {
  campaigns: Campaign[];
}

export default function CampaignList({ campaigns }: CampaignListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign, index) => {
        const isActive = Number(campaign.deadline) * 1000 > Date.now();
        const campaignId = campaign.id !== undefined ? campaign.id : index;
        
        return (
          <div
            key={index}
            className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={campaign.image || 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800'}
                alt={campaign.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${isActive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                `}>
                  {isActive ? 'Active' : 'Ended'}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {campaign.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {campaign.description}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Raised</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatEther(campaign.amountCollected)} ETH
                  </p>
                </div>
                
                <Link
                  to={`/campaign/${campaignId}`}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:gap-3 transition-all duration-200"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}