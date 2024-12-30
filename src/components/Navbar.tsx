import React, { useEffect, useState } from 'react';
import Logo from './navbar/Logo';
import NavLinks from './navbar/NavLinks';
import MobileMenu from './navbar/MobileMenu';
import ThemeToggle from './navbar/ThemeToggle';
import WalletButton from './WalletButton';
import { useWeb3 } from '../context/Web3Context';

export default function Navbar() {
  const { account } = useWeb3();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`
      fixed top-0 inset-x-0 z-50 transition-all duration-300
      ${isScrolled 
        ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg'
        : 'bg-transparent'}
    `}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          <NavLinks isAuthenticated={!!account} />
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <WalletButton />
            <MobileMenu isAuthenticated={!!account} />
          </div>
        </div>
      </div>
    </header>
  );
}