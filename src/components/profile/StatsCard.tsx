import React from 'react';
import { BarChart2, Target, Clock } from 'lucide-react';
import type { Campaign } from '../../types/campaign';

interface StatsCardProps {
  campaigns: Campaign[];
}

export default function StatsCard({ campaigns }: StatsCardProps) {
  const activeCampaigns = campaigns.filter(
    campaign => Number(campaign.deadline) * 1000 > Date.now()
  ).length;

  const totalRaised = campaigns.reduce(
    (acc, campaign) => acc + Number(campaign.amountCollected),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Campaigns</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {campaigns.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Raised</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(totalRaised / 10 ** 18).toFixed(6)} ETH
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10">
            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Campaigns</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeCampaigns}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}