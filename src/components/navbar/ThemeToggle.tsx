import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
        dark:from-blue-400 dark:to-purple-500 rounded-lg blur opacity-0 
        group-hover:opacity-25 transition-opacity duration-300" />
      
      <div className="relative z-10 transform transition-transform duration-500 
        ease-in-out rotate-0 dark:-rotate-180">
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-blue-300" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-500" />
        )}
      </div>
    </button>
  );
}