import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
        transition-colors group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 
        dark:from-blue-400 dark:to-purple-500 rounded-lg blur opacity-0 
        group-hover:opacity-20 transition duration-200" />
      
      <div className="relative transform transition-transform duration-500 rotate-0 
        dark:-rotate-180">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </div>
    </button>
  );
}