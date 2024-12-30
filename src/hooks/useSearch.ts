import { useState, useCallback, useMemo } from 'react';
import { Campaign } from '../types/campaign';
import { searchCampaigns } from '../utils/search';

export function useSearch(items: Campaign[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    return searchCampaigns(items, searchQuery);
  }, [items, searchQuery]);

  return {
    searchQuery,
    handleSearch,
    filteredItems,
    resultsCount: filteredItems.length,
    hasResults: filteredItems.length > 0,
    isSearching: searchQuery.trim().length > 0
  };
}