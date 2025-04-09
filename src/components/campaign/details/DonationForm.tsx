import React, { useState } from 'react';
import { parseEther } from 'ethers';
import { Wallet, ArrowRight, Gift, CreditCard, Zap } from 'lucide-react';
import { useWeb3 } from '../../../context/Web3Context';
import { motion } from 'framer-motion';

interface DonationFormProps {
  campaignId: string;
  onDonate: (amount: string) => Promise<void>;
}

export default function DonationForm({ campaignId, onDonate }: DonationFormProps) {
  const { account } = useWeb3();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);

  const predefinedAmounts = ['0.01', '0.05', '0.1', '0.5'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      setLoading(true);
      await onDonate(amount);
      setAmount('');
      setSelectedAmount(null);
    } catch (error) {
      console.error('Error donating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedAmount = (value: string) => {
    setAmount(value);
    setSelectedAmount(value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
        <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Support this campaign
      </h3>
      
      {account ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick select donation amounts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {predefinedAmounts.map((value) => (
              <motion.button
                key={value}
                type="button"
                onClick={() => handlePredefinedAmount(value)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedAmount === value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600/50'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {value} ETH
              </motion.button>
            ))}
          </div>

          <div className="relative">
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="Enter custom amount"
              className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              disabled={loading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
              ETH
            </span>
          </div>
          
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Fast & Secure Donations</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                  Your contribution is processed securely on the blockchain and will be available to the campaign owner immediately.
                </p>
              </div>
            </div>
          </div>
          
          <motion.button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-3 font-medium 
              transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
              relative overflow-hidden"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
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
            <motion.div 
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-purple-600 to-blue-600"
              animate={loading ? { translateX: 0 } : {}}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
          
          {loading && (
            <div className="text-center space-y-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              <p className="font-medium">Please confirm the transaction in your wallet...</p>
              <p className="text-xs">Do not close this window during processing.</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </form>
      ) : (
        <motion.div 
          className="text-center p-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
          
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please connect your wallet to make a donation to this campaign
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Connect Wallet
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}