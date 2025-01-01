import React, { useState } from 'react';
import { parseEther } from 'ethers';
import { Wallet } from 'lucide-react';
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
      <h3 className="font-display text-xl font-semibold">Support this blog</h3>
      
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
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              ETH
            </span>
          </div>
          
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10">
              {loading ? 'Processing...' : 'Donate Now'}
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-transform duration-500" />
          </button>
        </form>
      ) : (
        <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
          <Wallet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            Connect your wallet to donate
          </p>
        </div>
      )}
    </div>
  );
}