import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-lg focus:outline-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg" />
      
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <motion.div
          initial={false}
          animate={{ 
            rotate: isDark ? 180 : 0,
            scale: isDark ? 1 : 1.2
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
          className="relative z-10"
        >
          {isDark ? (
            <Moon className="w-5 h-5 text-blue-400" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
        </motion.div>
        
        {/* Animated stars only appear in dark mode */}
        {isDark && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 0.8],
                opacity: [0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute w-1 h-1 bg-blue-200 rounded-full top-0 right-0"
            />
            <motion.div
              animate={{
                scale: [1, 0.9],
                opacity: [0.5, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute w-1 h-1 bg-indigo-200 rounded-full bottom-1 left-0"
            />
          </div>
        )}
      </div>
    </motion.button>
  );
}