import { formatEther } from 'ethers';
import { formatDistanceToNow } from 'date-fns';
import {  Users, ArrowDown, Coins, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Donation {
  address: string;
  amount: bigint;
  timestamp: number;
}

interface DonationListProps {
  donations: Donation[];
}

export default function DonationList({ donations }: DonationListProps) {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Recent Supporters
        </h3>
        
        <div className="flex items-center gap-2">
          {donations.length > 0 && (
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {donations.length} {donations.length === 1 ? 'donation' : 'donations'}
            </div>
          )}
          
          {donations.length >= 3 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer"
              onClick={() => document.getElementById('donor-leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Award className="w-3 h-3" />
              <span>See Leaderboard</span>
              <ArrowRight className="w-3 h-3" />
            </motion.div>
          )}
        </div>
      </div>
      
      <motion.div 
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {donations.length === 0 ? (
          <motion.div 
            variants={item}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 text-center space-y-4"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No donations yet</p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Be the first to support this campaign!
              </p>
            </div>
            <div className="pt-2">
              <ArrowDown className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto animate-bounce" />
            </div>
          </motion.div>
        ) : (
          donations.map((donation, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200"
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  {donation.address.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {`${donation.address.slice(0, 6)}...${donation.address.slice(-4)}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(donation.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 py-1.5 px-3 rounded-full">
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {formatEther(donation.amount)} ETH
                </p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}