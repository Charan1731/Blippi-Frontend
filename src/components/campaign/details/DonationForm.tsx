import React, { useState } from 'react';
import { parseEther } from 'ethers';
import { Wallet, ArrowRight } from 'lucide-react';
import { useWeb3 } from '../../../context/Web3Context';

interface DonationFormProps {
  campaignId: string;
  onDonate: (amount: string) => Promise<void>;
}

export default function DonationForm({ campaignId, onDonate }: DonationFormProps) {
  const { account } = useWeb3();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      setLoading(true);
      await onDonate(amount);
      setAmount('');
    } catch (error) {
      console.error('Error donating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-xl font-semibold dark:text-blue-400">Support this blog</h3>
      
      {account ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in ETH"
              className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              disabled={loading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              ETH
            </span>
          </div>
          
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 font-medium 
              transition-all duration-200 hover:from-blue-700 hover:to-purple-700 
              disabled:opacity-50 disabled:cursor-not-allowed 
              relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="animate-pulse">Processing Transaction...</span>
                </>
              ) : (
                <>
                  Donate Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-transform duration-500" />
          </button>
          
          {loading && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
              <p>Please confirm the transaction in your wallet...</p>
              <p className="mt-1">Do not close this window during processing.</p>
            </div>
          )}
        </form>
      ) : (
        <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-400/80 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Connect your wallet to donate
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            You need to connect your wallet first to make a donation
          </p>
        </div>
      )}
    </div>
  );
}