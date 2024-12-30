import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PenLine, User } from 'lucide-react';

interface NavLinksProps {
  isAuthenticated: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function NavLinks({ isAuthenticated, isMobile, onClose }: NavLinksProps) {
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/create', icon: PenLine, label: 'Create' },
    ...(isAuthenticated ? [{ to: '/profile', icon: User, label: 'Profile' }] : []),
  ];

  const baseClasses = `
    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
    hover:text-blue-600 dark:hover:text-blue-400
    relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 
    after:bg-blue-600 dark:after:bg-blue-400 after:scale-x-0 after:origin-left
    after:transition-transform hover:after:scale-x-100
  `;

  const activeClasses = 'text-blue-600 dark:text-blue-400 after:scale-x-100';
  const inactiveClasses = 'text-gray-600 dark:text-gray-300';

  return (
    <nav className={`
      ${isMobile ? 'flex flex-col gap-2' : 'hidden md:flex items-center gap-4'}
    `}>
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className={({ isActive }) => 
            `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
          }
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}