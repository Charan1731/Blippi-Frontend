import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';

const { wallets } = getDefaultWallets();
const sepoliaChain = sepolia;

// Updated to use Infura or Alchemy which have proper CORS setup
const config = createConfig({
  chains: [sepoliaChain],
  transports: {
    [sepoliaChain.id]: http('https://eth-sepolia.g.alchemy.com/v2/demo'),
  },
});

const queryClient = new QueryClient();

interface RainbowKitProviderProps {
  children: React.ReactNode;
}

export function RainbowKitConfig({ children }: RainbowKitProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 