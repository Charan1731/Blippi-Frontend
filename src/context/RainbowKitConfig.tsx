import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';

// const { wallets } = getDefaultWallets();
const sepoliaChain = sepolia;

const config = createConfig({
  chains: [sepoliaChain],
  transports: {
    [sepoliaChain.id]: http('https://eth-sepolia.g.alchemy.com/v2/PuUVsZ8f1YrRGtbp295ycUcpSl8N6w58'),
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