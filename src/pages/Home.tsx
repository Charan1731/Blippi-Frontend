import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import Hero from '../components/Hero';
import FilterBar from '../components/campaign/FilterBar';
import CampaignCard from '../components/campaign/CampaignCard';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import FadeIn from '../components/FadeIn';
import { useSearch } from '../hooks/useSearch';
import type { Campaign, CampaignStatus, SortOption } from '../types/campaign';

export default function Home() {
  const { provider } = useWeb3();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = useState<CampaignStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const { 
    searchQuery, 
    handleSearch, 
    filteredItems,
    resultsCount,
    isSearching
  } = useSearch(campaigns);

  React.useEffect(() => {
    const fetchCampaigns = async () => {
      if (!provider) return;
      
      try {
        const contract = getContract(provider);
        const data = await contract.getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [provider]);

  const filteredAndSortedCampaigns = React.useMemo(() => {
    let result = [...filteredItems];

    // Apply status filter
    if (status !== 'all') {
      const now = Date.now();
      result = result.filter(campaign => {
        const isActive = Number(campaign.deadline) * 1000 > now;
        return status === 'active' ? isActive : !isActive;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'endingSoon':
          return Number(a.deadline) - Number(b.deadline);
        case 'mostFunded':
          return Number(b.amountCollected) - Number(a.amountCollected);
        case 'leastFunded':
          return Number(a.amountCollected) - Number(b.amountCollected);
        // default: // newest
        //   return Number(b.deadline) - Number(a.deadline);
      }
    });

    return result;
  }, [filteredItems, status, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <SearchBar 
              value={searchQuery}
              onChange={handleSearch}
              resultsCount={resultsCount}
              showCount={isSearching}
            />
            <FilterBar
              status={status}
              onStatusChange={setStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          {filteredAndSortedCampaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No campaigns found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedCampaigns.map((campaign, index) => (
                <FadeIn key={index} delay={index * 100}>
                  <CampaignCard campaign={campaign} index={index} />
                </FadeIn>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
      <Footer />
    </div>
  );
}