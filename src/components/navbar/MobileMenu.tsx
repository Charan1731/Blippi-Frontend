import React from 'react';
import { Menu, X } from 'lucide-react';
import NavLinks from './NavLinks';

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export default function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 
        shadow-2xl z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-300 
              hover:text-blue-600 dark:hover:text-blue-400"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mt-8">
            <NavLinks 
              isAuthenticated={isAuthenticated} 
              isMobile 
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}