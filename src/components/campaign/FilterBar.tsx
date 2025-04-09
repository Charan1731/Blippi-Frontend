import React from 'react';
import { Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CampaignStatus, SortOption } from '../../types/campaign';

interface FilterBarProps {
  status: CampaignStatus;
  onStatusChange: (status: CampaignStatus) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function FilterBar({
  status,
  onStatusChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  // Define select options with additional metadata
  const statusOptions = [
    { value: 'all', label: 'All Blogs' },
    { value: 'active', label: 'Active Blogs' },
    { value: 'ended', label: 'Ended Blogs' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'endingSoon', label: 'Ending Soon' },
    { value: 'mostFunded', label: 'Most Funded' },
    { value: 'leastFunded', label: 'Least Funded' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      {/* Status Filter */}
      <div className="group relative w-full sm:w-auto">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Filter By
          </label>
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as CampaignStatus)}
            className="w-full appearance-none bg-gray-50/70 dark:bg-gray-700/50 border border-gray-200/70 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            {statusOptions.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                {option.label}
              </option>
            ))}
          </select>
          <motion.div 
            className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
            animate={{ rotate: status === 'all' ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="group relative w-full sm:w-auto">
        <div className="flex items-center gap-2 mb-1">
          <ArrowUpDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Sort By
          </label>
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full appearance-none bg-gray-50/70 dark:bg-gray-700/50 border border-gray-200/70 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          >
            {sortOptions.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                {option.label}
              </option>
            ))}
          </select>
          <motion.div 
            className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
            animate={{ rotate: sortBy === 'newest' ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}