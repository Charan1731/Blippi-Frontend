import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

interface WalletButtonProps {
  onProfileClick?: () => void;
}

export default function WalletButton({ onProfileClick }: WalletButtonProps) {
  const { account, disconnectWallet } = useWeb3();

  // Using RainbowKit's ConnectButton
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <motion.button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm shadow-md"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </motion.button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/30 px-4 py-2 rounded-xl text-sm hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-colors shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title={account.address}
                  >
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/40 to-indigo-600/40 rounded-full blur opacity-75"></div>
                      <div className="relative bg-white dark:bg-gray-800 rounded-full p-1">
                        <Wallet className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <span className='text-gray-700 dark:text-gray-200 font-medium'>{`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => disconnectWallet()}
                    className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors shadow-sm border border-red-100 dark:border-red-800/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Disconnect wallet"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}