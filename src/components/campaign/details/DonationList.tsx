import React from 'react';
import { formatEther } from 'ethers';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';

interface Donation {
  address: string;
  amount: bigint;
  timestamp: number;
}

interface DonationListProps {
  donations: Donation[];
}

export default function DonationList({ donations }: DonationListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-semibold">Recent Donations</h3>
      
      <div className="space-y-3">
        {donations.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No donations yet. Be the first to contribute!
          </p>
        ) : (
          donations.map((donation, index) => (
            <div
              key={index}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {`${donation.address.slice(0, 6)}...${donation.address.slice(-4)}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(donation.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="font-display font-semibold text-blue-600 dark:text-blue-400">
                {formatEther(donation.amount)} ETH
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}