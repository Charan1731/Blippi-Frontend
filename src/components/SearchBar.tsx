import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Hide suggestions after 5 seconds if no interaction
  useEffect(() => {
    if (isFocused && !value) {
      setShowSuggestions(true);
      const timer = setTimeout(() => {
        setShowSuggestions(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
    }
  }, [isFocused, value]);
  
  const handleClear = () => {
    onChange('');
  };

  // Trending search suggestions relevant to Web3 publishing platform
  const suggestions = [
    { id: 1, text: 'web3' },
    { id: 2, text: 'ethereum' },
    { id: 3, text: 'defi' },
    { id: 4, text: 'nft' },
    { id: 5, text: 'dao' }
  ];

  return (
    <div className="relative max-w-md w-full">
      {/* Backdrop glow effect when focused */}
      <AnimatePresence>
        {isFocused && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-400/15 via-indigo-400/15 to-purple-400/15 dark:from-blue-500/15 dark:via-indigo-500/15 dark:to-purple-500/15 rounded-xl blur-xl -z-10"
          />
        )}
      </AnimatePresence>

      <div className={`flex items-center transition-all duration-300 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border ${
        isFocused 
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20 shadow-lg' 
          : 'border-gray-200/70 dark:border-gray-700/70 shadow-sm'
      } rounded-xl overflow-hidden`}>
        {/* Animated search icon */}
        <div className="flex items-center justify-center w-12 h-10 md:h-12">
          <motion.div
            animate={{
              scale: isFocused ? 1.1 : 1,
              rotate: isFocused ? 360 : 0
            }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <Search className={`w-5 h-5 transition-colors duration-200 ${
              isFocused 
                ? 'text-blue-500 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          </motion.div>
        </div>
        
        {/* Input field with animated underline */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              // Keep suggestions visible for a moment after blur
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent border-none py-2.5 md:py-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 transition-colors duration-200 text-sm md:text-base"
          />
          
          {/* Animated underline */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: isFocused ? 1 : 0,
              opacity: isFocused ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: "left" }}
          />
        </div>
        
        {/* Clear button with animation */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ duration: 0.2 }}
              onClick={handleClear}
              className="w-10 h-10 mr-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              aria-label="Clear search"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Results count with animation */}
      <AnimatePresence>
        {showCount && value && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="absolute left-0 -bottom-8 flex items-center text-xs md:text-sm font-medium"
          >
            {!resultsCount || resultsCount === 0 ? (
              <div className="flex items-center rounded-full bg-red-100/80 dark:bg-red-900/30 px-3 py-1 text-red-600 dark:text-red-400">
                <X className="w-3 h-3 mr-1.5" />
                <span>No results found</span>
              </div>
            ) : (
              <div className="flex items-center rounded-full bg-blue-100/80 dark:bg-blue-900/30 px-3 py-1 text-blue-600 dark:text-blue-400">
                {resultsCount && resultsCount > 10 ? (
                  <Sparkles className="w-3 h-3 mr-1.5" />
                ) : (
                  <BookOpen className="w-3 h-3 mr-1.5" />
                )}
                <span>
                  Found {resultsCount} {resultsCount === 1 ? 'blog' : 'blogs'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion tags - only show when focused and no value */}
      <AnimatePresence>
        {showSuggestions && !value && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-12 left-0 flex items-center z-20"
          >
            <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60">
              <TrendingUp className="w-3 h-3 text-blue-500 dark:text-blue-400 mr-1.5" />
              <span className="text-xs text-gray-600 dark:text-gray-300 mr-2 font-medium">Trending:</span>
              <div className="flex flex-wrap gap-1 overflow-x-auto max-w-[200px] md:max-w-[250px]">
                {suggestions.map((tag) => (
                  <motion.button
                    key={tag.id}
                    onClick={() => onChange(tag.text)}
                    className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 hover:text-blue-800 dark:hover:bg-blue-800/40 dark:hover:text-blue-200 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tag.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}