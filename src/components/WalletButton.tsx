import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

interface WalletButtonProps {
  onProfileClick?: () => void;
}

export default function WalletButton({ onProfileClick }: WalletButtonProps) {
  const { account, connectWallet, disconnectWallet } = useWeb3();

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onProfileClick}
          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={account}
        >
          <Wallet className="w-4 h-4" />
          <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
        </button>
        <button
          onClick={disconnectWallet}
          className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </button>
  );
}