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
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as CampaignStatus)}
          className="bg-transparent text-gray-700 dark:text-gray-300 focus:ring-0 border-none appearance-none cursor-pointer"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")',
            backgroundPosition: 'right 0.25rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="all" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">All Blogs</option>
          <option value="active" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Active</option>
          <option value="ended" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Ended</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-transparent text-gray-700 dark:text-gray-300 focus:ring-0 border-none appearance-none cursor-pointer"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")',
            backgroundPosition: 'right 0.25rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="newest" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Newest First</option>
          <option value="endingSoon" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Ending Soon</option>
          <option value="mostFunded" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Most Funded</option>
          <option value="leastFunded" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Least Funded</option>
        </select>
      </div>
    </div>
  );
}