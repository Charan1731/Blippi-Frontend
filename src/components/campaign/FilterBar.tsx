import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
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
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-500" />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as CampaignStatus)}
          className="bg-transparent border-none text-gray-700 dark:text-gray-300 focus:ring-0"
        >
          <option value="all">All Blogs</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-5 h-5 text-gray-500" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-transparent border-none text-gray-700 dark:text-gray-300 focus:ring-0"
        >
          <option value="newest">Newest First</option>
          <option value="endingSoon">Ending Soon</option>
          <option value="mostFunded">Most Funded</option>
          <option value="leastFunded">Least Funded</option>
        </select>
      </div>
    </div>
  );
}