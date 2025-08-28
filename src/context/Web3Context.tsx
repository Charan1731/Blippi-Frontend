/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected && address) {
      setAccount(address);
      
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        provider.getSigner().then(signer => {
          setSigner(signer);
        }).catch(error => {
          console.error('Error getting signer:', error);
        });
      }
    } else {
      setAccount(null);
      setSigner(null);
    }
  }, [isConnected, address]);

  // This is called by our existing UI, but we'll now use RainbowKit's connect modal
  const connectWallet = async () => {
    // The actual connection happens through RainbowKit's UI
    // This function is now just a placeholder for compatibility
    if (!window.ethereum) {
      alert('Please install MetaMask or use another wallet!');
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setAccount(null);
    setSigner(null);
  };

  return (
    <Web3Context.Provider value={{ account, connectWallet, disconnectWallet, provider, signer }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}