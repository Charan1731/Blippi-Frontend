import React from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavLinks from './NavLinks';
import Logo from './Logo';

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export default function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <motion.button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none rounded-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Backdrop with animated entry/exit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer with animated sliding entry/exit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed top-0 right-0 h-full w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/5 dark:bg-blue-500/5 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/5 dark:bg-purple-500/5 rounded-full filter blur-3xl"></div>
            </div>
            
            <div className="p-6 relative">
              <div className="flex items-center justify-between mb-8">
                <Logo />
                
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="mt-6">
                <NavLinks 
                  isAuthenticated={isAuthenticated} 
                  isMobile 
                  onClose={() => setIsOpen(false)}
                />
              </div>
              
              {/* Bottom gradient line */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}