import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount?: number;
  showCount?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search Blogs...",
  resultsCount,
  showCount = true
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative max-w-md w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-12 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200 dark:placeholder-gray-400"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
      
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-200"
          aria-label="Clear search"
        >
          <X className="w-4 h-4 text-gray-400 dark:text-gray-300" />
        </button>
      )}
      
      {showCount && value && (
        <div className="absolute top-full mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          Found {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
        </div>
      )}
    </div>
  );
}