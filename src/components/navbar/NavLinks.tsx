import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PenLine, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavLinksProps {
  isAuthenticated: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function NavLinks({ isAuthenticated, isMobile, onClose }: NavLinksProps) {
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/create', icon: PenLine, label: 'Create' },
    ...(isAuthenticated ? [
      { to: '/profile', icon: User, label: 'Profile' },
      { to: '/ai', icon: Sparkles, label: 'AI-Blog Generator' }
    ] : []),
  ];

  const baseClasses = `
    flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300
    text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400
    relative overflow-hidden group
  `;

  const activeClasses = `
    text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20
    font-medium
  `;
  
  const inactiveClasses = `
    hover:bg-gray-50 dark:hover:bg-gray-800/60
  `;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: isMobile ? 20 : 0, x: isMobile ? 0 : 20 },
    show: { opacity: 1, y: 0, x: 0 }
  };

  return (
    <motion.nav 
      className={`
        ${isMobile ? 'flex flex-col gap-3 w-full' : 'hidden md:flex items-center gap-1'}
      `}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {links.map(({ to, icon: Icon, label }) => (
        <motion.div key={to} variants={item}>
          <NavLink
            to={to}
            onClick={onClose}
            className={({ isActive }) => 
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative z-10">
                  <Icon className={`w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </span>
                
                <span className="relative z-10 font-medium">
                  {label}
                </span>
                
                {/* Background hover effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                
                {/* Animated underline indicator */}
                {isActive && (
                  <motion.span 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
                    layoutId={isMobile ? "mobile-underline" : "desktop-underline"}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
  );
}