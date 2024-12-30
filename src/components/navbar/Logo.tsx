import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function Logo() {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-2 group"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-200" />
        <div className="relative p-2 bg-white dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700">
          <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        Blippi
      </span>
    </Link>
  );
}