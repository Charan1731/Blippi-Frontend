import React from 'react';
import { User, Edit } from 'lucide-react';

interface ProfileHeaderProps {
  address: string;
}

export default function ProfileHeader({ address }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl mt-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
      <div className="relative flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full overflow-hidden">
              <User className="w-full h-full p-4 text-white bg-gray-800" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1">
            <button className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
      </div>
    </div>
  );
}