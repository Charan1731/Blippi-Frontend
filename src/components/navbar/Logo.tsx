import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-2 group"
    >
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-300" />
        <div className="relative p-2 bg-white dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 shadow-md">
          <motion.div
            animate={{ 
              rotate: [0, 0, -10, 10, -5, 5, 0],
              scale: [1, 1, 1.2, 1.2, 1.1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 7
            }}
          >
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.span 
        className="text-xl font-bold"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
          Blippi
        </span>
      </motion.span>
    </Link>
  );
}