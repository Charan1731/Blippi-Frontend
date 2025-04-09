import React from 'react';
import { BarChart2, Target, Clock, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
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
  
  const totalDonors = campaigns.reduce(
    (acc, campaign) => {
      // Create a Set to count unique donors
      const uniqueDonors = new Set([...campaign.donators]);
      return acc + uniqueDonors.size;
    },
    0
  );

  const fadeInUpVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({ 
      y: 0, 
      opacity: 1,
      transition: {
        delay: 0.1 * i,
        duration: 0.5
      }
    })
  };

  const stats = [
    {
      title: "Total Blogs",
      value: campaigns.length,
      icon: <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bgColor: "bg-blue-500/10 dark:bg-blue-600/20",
      gradient: "from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600",
      index: 1
    },
    {
      title: "Active Blogs",
      value: activeCampaigns,
      icon: <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />,
      bgColor: "bg-green-500/10 dark:bg-green-600/20",
      gradient: "from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600",
      index: 2
    },
    {
      title: "Total Raised",
      value: `${(totalRaised / 10 ** 18).toFixed(4)} ETH`,
      icon: <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      bgColor: "bg-purple-500/10 dark:bg-purple-600/20",
      gradient: "from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600",
      index: 3
    },
    {
      title: "Total Supporters",
      value: totalDonors,
      icon: <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
      bgColor: "bg-orange-500/10 dark:bg-orange-600/20",
      gradient: "from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600",
      index: 4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.title}
          custom={stat.index}
          variants={fadeInUpVariant}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Gradient background effect */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-gradient-to-br from-transparent via-transparent to-current" />
          
          {/* Animated circle accent */}
          <motion.div 
            className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 bg-gradient-to-r ${stat.gradient}`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              {stat.icon}
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                {stat.value}
              </p>
            </div>
          </div>
          
          {/* Trend indicator for visual interest */}
          {stat.index % 2 === 0 ? (
            <div className="absolute bottom-2 right-3 flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>12%</span>
            </div>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}