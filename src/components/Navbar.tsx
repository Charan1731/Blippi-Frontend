import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './navbar/Logo';
import NavLinks from './navbar/NavLinks';
import MobileMenu from './navbar/MobileMenu';
import ThemeToggle from './navbar/ThemeToggle';
import WalletButton from './WalletButton';
import { useWeb3 } from '../context/Web3Context';
import { useAccount, useBalance } from 'wagmi';

export default function Navbar() {
  const { account } = useWeb3();
  const [isScrolled, setIsScrolled] = useState(false);

  const { address, isConnected } = useAccount();

  const { data: balanceData, isLoading, isError } = useBalance({
    address,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      className={`
        fixed top-0 inset-x-0 z-50 transition-all duration-500
        ${isScrolled ? 'py-2' : 'py-4'}
      `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <AnimatePresence>
        {isScrolled && (
          <motion.div 
            className="absolute inset-0 backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-32 bg-blue-400/10 dark:bg-blue-500/10 rounded-full filter blur-3xl opacity-70"></div>
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-purple-400/10 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          
          <div className="hidden md:block mx-auto">
            <NavLinks isAuthenticated={!!account} />
          </div>
          
          <div className="flex items-center gap-4">
            {/* ✅ Show user balance if connected */}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ThemeToggle />
            </motion.div>
            
            {isConnected && (
              <motion.div 
                className="relative text-sm font-semibold px-4 py-2 rounded-xl overflow-hidden shadow-sm border border-blue-100 dark:border-blue-800/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30" />
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 dark:from-blue-800/20 dark:to-indigo-800/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {isLoading ? 'Loading...' : isError ? 'Error' : `${Number(balanceData?.formatted).toFixed(4)} ${balanceData?.symbol}`}
                  </span>
                </div>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <WalletButton />
            </motion.div>
            
            <MobileMenu isAuthenticated={!!account} />
          </div>
        </div>
      </div>
      
      {/* Bottom gradient line */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isScrolled ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.header>
  );
}
