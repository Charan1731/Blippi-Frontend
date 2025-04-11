import React, { useMemo, useState } from 'react';
import { formatEther } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Award, Medal, ShieldCheck, Gift, BadgeCheck, ChevronUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import AnimatedText from '../../AnimatedText';

interface DonorLeaderboardProps {
  donators: string[];
  donations: bigint[];
}

export default function DonorLeaderboard({ donators, donations }: DonorLeaderboardProps) {
  const { theme } = useTheme();
  const [hoveredDonor, setHoveredDonor] = useState<string | null>(null);
  
  // Process donations to calculate total by address and rank donors
  const topDonors = useMemo(() => {
    const donorMap = new Map<string, bigint>();
    
    // Sum donations by address
    donators.forEach((address, index) => {
      const amount = donations[index];
      const currentAmount = donorMap.get(address) || BigInt(0);
      donorMap.set(address, currentAmount + amount);
    });
    
    // Convert to array and sort by donation amount (descending)
    const donors = Array.from(donorMap.entries()).map(([address, amount]) => ({
      address,
      amount
    }));
    
    donors.sort((a, b) => {
      return a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0;
    });
    
    // Return top 5 donors
    return donors.slice(0, 5);
  }, [donators, donations]);
  
  // Get badge for rank with animation
  const getBadge = (rank: number, isHovered: boolean) => {
    return (
      <motion.div
        animate={{ 
          rotate: isHovered ? [0, -10, 10, -5, 5, 0] : 0,
          scale: isHovered ? [1, 1.2, 1] : 1 
        }}
        transition={{ duration: 0.5 }}
      >
        {rank === 0 ? (
          <Crown className="w-5 h-5 text-yellow-500 drop-shadow-md" />
        ) : rank === 1 ? (
          <Trophy className="w-5 h-5 text-gray-400 drop-shadow-md" />
        ) : rank === 2 ? (
          <Medal className="w-5 h-5 text-amber-700 drop-shadow-md" />
        ) : (
          <Gift className="w-5 h-5 text-blue-500 drop-shadow-md" />
        )}
      </motion.div>
    );
  };
  
  // Get background style for rank
  const getBackgroundStyle = (rank: number, isHovered: boolean) => {
    const baseStyle = 'transition-all duration-300 ';
    
    switch(rank) {
      case 0: 
        return `${baseStyle} ${isHovered 
          ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 dark:from-yellow-600/40 dark:to-amber-600/40 shadow-lg shadow-yellow-500/10' 
          : 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 dark:from-yellow-600/30 dark:to-amber-600/30'}`;
      case 1: 
        return `${baseStyle} ${isHovered 
          ? 'bg-gradient-to-r from-gray-300/30 to-gray-400/30 dark:from-gray-400/40 dark:to-gray-500/40 shadow-lg shadow-gray-400/10' 
          : 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 dark:from-gray-400/30 dark:to-gray-500/30'}`;
      case 2: 
        return `${baseStyle} ${isHovered 
          ? 'bg-gradient-to-r from-amber-700/30 to-amber-800/30 dark:from-amber-700/40 dark:to-amber-800/40 shadow-lg shadow-amber-700/10' 
          : 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 dark:from-amber-700/30 dark:to-amber-800/30'}`;
      default: 
        return `${baseStyle} ${isHovered 
          ? 'bg-white/80 dark:bg-gray-800/80 shadow-lg shadow-blue-500/10' 
          : 'bg-white/70 dark:bg-gray-800/70'}`;
    }
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (topDonors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" id="donor-leaderboard">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "mirror", 
              duration: 2,
              repeatDelay: 1
            }}
          >
            <Trophy className="w-6 h-6 text-amber-500 drop-shadow-md" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AnimatedText 
              text="Donor Leaderboard" 
              gradient={true} 
              speed={5} 
              fadeIn={true}
            />
          </h3>
        </div>
        <div className="text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 bg-clip-text text-transparent flex items-center">
          <BadgeCheck className="w-4 h-4 text-amber-500 mr-1" />
          Top {topDonors.length} Supporters
        </div>
      </div>
      
      <motion.div 
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {topDonors.map((donor, index) => {
          const isHovered = hoveredDonor === donor.address;
          return (
            <motion.div
              key={donor.address}
              variants={item}
              className={`rounded-xl p-4 flex items-center justify-between backdrop-blur-md transition-all duration-300 
                ${getBackgroundStyle(index, isHovered)}`}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 } 
              }}
              onMouseEnter={() => setHoveredDonor(donor.address)}
              onMouseLeave={() => setHoveredDonor(null)}
            >
              <div className="flex items-center gap-4">
                <div className={`relative flex items-center justify-center`}>
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10
                      ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 dark:from-yellow-600 dark:to-amber-600' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600' : 
                        index === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-800 dark:from-amber-800 dark:to-amber-900' : 
                        'bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600'} 
                      text-white font-bold shadow-md`}
                    animate={{ 
                      boxShadow: isHovered ? [
                        '0 0 0 rgba(0, 0, 0, 0)', 
                        '0 0 10px rgba(250, 204, 21, 0.5)', 
                        '0 0 0 rgba(0, 0, 0, 0)'
                      ] : '0 0 0 rgba(0, 0, 0, 0)' 
                    }}
                    transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
                  >
                    {index + 1}
                    {isHovered && (
                      <motion.div
                        className="absolute -inset-1 rounded-full opacity-75 z-0"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0, 0.5, 0],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          background: index === 0 
                            ? 'linear-gradient(to right, rgba(250, 204, 21, 0.3), rgba(245, 158, 11, 0.3))' 
                            : index === 1 
                              ? 'linear-gradient(to right, rgba(156, 163, 175, 0.3), rgba(107, 114, 128, 0.3))' 
                              : index === 2 
                                ? 'linear-gradient(to right, rgba(180, 83, 9, 0.3), rgba(146, 64, 14, 0.3))' 
                                : 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(79, 70, 229, 0.3))'
                        }}
                      />
                    )}
                  </motion.div>
                  <div className="absolute -top-1 -right-1 z-20">
                    {getBadge(index, isHovered)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {`${donor.address.slice(0, 6)}...${donor.address.slice(-4)}`}
                    </p>
                    {index === 0 && (
                      <motion.span 
                        className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full flex items-center gap-1"
                        animate={{ 
                          backgroundColor: isHovered ? [
                            'rgba(254, 249, 195, 0.8)', 
                            'rgba(254, 240, 138, 0.8)', 
                            'rgba(254, 249, 195, 0.8)'
                          ] : 'rgba(254, 249, 195, 0.3)'
                        }}
                        transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Top Donor</span>
                      </motion.span>
                    )}
                  </div>
                  <motion.div 
                    className="flex items-center gap-1.5 mt-1"
                    animate={{ 
                      y: isHovered ? [0, 2, 0] : 0 
                    }}
                    transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Supported with <span className="font-medium">{formatEther(donor.amount)} ETH</span>
                    </p>
                  </motion.div>
                </div>
              </div>
              
              <div className={`py-1.5 px-3 rounded-full 
                ${index === 0 
                  ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-yellow-800 dark:text-yellow-300' 
                  : index === 1 
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40 text-gray-700 dark:text-gray-300' 
                    : index === 2 
                      ? 'bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-800 dark:text-amber-300' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400'}`}
              >
                <div className="flex items-center gap-1">
                  <ChevronUp className={`w-3 h-3 ${
                    index === 0 ? 'text-yellow-600 dark:text-yellow-400' :
                    index === 1 ? 'text-gray-600 dark:text-gray-400' :
                    index === 2 ? 'text-amber-700 dark:text-amber-500' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                  <p className="font-semibold text-sm">
                    {index === 0 ? 'Gold' : index === 1 ? 'Silver' : index === 2 ? 'Bronze' : `#${index + 1}`}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Decorative elements */}
      <AnimatePresence>
        {hoveredDonor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-10 pointer-events-none"
          >
            <div className="absolute top-1/4 left-10 w-20 h-20 bg-amber-500/10 rounded-full filter blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-blue-500/10 rounded-full filter blur-2xl animate-pulse"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 