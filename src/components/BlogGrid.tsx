import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import BlogCard from './BlogCard';
import FadeIn from './FadeIn';
import { Campaign } from '../types/campaign';

interface BlogGridProps {
  campaigns: Campaign[];
}

type SortOption = 'recent' | 'popular' | 'featured';

export default function BlogGrid({ campaigns }: BlogGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return Number(b.amountCollected) - Number(a.amountCollected);
      case 'featured':
        return Number(b.target) - Number(a.target);
      default:
        return Number(b.deadline) - Number(a.deadline);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <FadeIn>
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
            Latest Stories
          </h2>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="featured">Featured</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </FadeIn>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedCampaigns.map((campaign, index) => (
          <FadeIn key={index} delay={index * 100}>
            <BlogCard campaign={campaign} index={index} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}