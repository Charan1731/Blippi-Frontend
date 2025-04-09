import React from 'react';
import { User, Copy, CheckCircle, Sparkles, Wallet, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  address: string;
}

export default function ProfileHeader({ address }: ProfileHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background with multiple layers matching the Hero component style */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/20 to-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-800" />
      
      {/* Abstract shapes for visual interest */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      
      {/* Animated particles - matching Hero style */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full"
            style={{ 
              left: `${20 + Math.random() * 60}%`, 
              top: `${Math.random() * 100}%`,
              opacity: 0.3
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mt-10 rounded-2xl p-8"
      >
        <div className="relative flex flex-col md:flex-row gap-8 items-center">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-7 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 flex flex-col items-center w-full md:w-auto"
          >
            {/* Profile Image */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-[3px] shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                  <User className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
              
              {/* Status indicator */}
              <motion.div 
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-2 border-blue-600 dark:border-blue-500 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </motion.div>
            </div>
            
            {/* Tag line */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center px-3 py-1 mt-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              <span className="text-xs font-medium">Web3 Explorer</span>
            </motion.div>
            
            {/* Wallet Address */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={copyAddress}
              className="mt-4 cursor-pointer py-2 px-4 bg-gray-100 dark:bg-gray-700/50 rounded-full font-mono text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
            >
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              )}
            </motion.div>
          </motion.div>
          
          {/* Profile Info Section */}
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-center md:text-left mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              My Profile
            </motion.h1>
            
            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            >
              {/* Network Card */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Network</h3>
                    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Sepolia Testnet
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security Card */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Security</h3>
                    <p className="font-semibold text-gray-900 dark:text-white">Verified Account</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Role Tags */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start"
            >
              <div className="py-1.5 px-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                Creator
              </div>
              <div className="py-1.5 px-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                Publisher
              </div>
              <div className="py-1.5 px-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                Web3 Enthusiast
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}