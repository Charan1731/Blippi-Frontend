import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
                  <button
                    onClick={openConnectModal}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openAccountModal}
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={account.address}
                  >
                    <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className='dark:text-white'>{`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}</span>
                  </button>
                  <button
                    onClick={() => disconnectWallet()}
                    className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    title="Disconnect wallet"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}