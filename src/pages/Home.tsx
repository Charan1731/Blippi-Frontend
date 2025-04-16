import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import Hero from '../components/Hero';
import FilterBar from '../components/campaign/FilterBar';
import CampaignCard from '../components/campaign/CampaignCard';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import FadeIn from '../components/FadeIn';
import { useSearch } from '../hooks/useSearch';
import blockchainanimation from '../assets/blockchain.json';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Rocket, ChevronDown, Star, Zap, Award } from 'lucide-react';
import type { Campaign, CampaignStatus, SortOption } from '../types/campaign';
import Lottie from 'lottie-react';

export default function Home() {
  const { provider } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CampaignStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSepoliaNetwork, setIsSepoliaNetwork] = useState<boolean>(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  
  const { 
    searchQuery, 
    handleSearch, 
    filteredItems,
    resultsCount,
    isSearching
  } = useSearch(campaigns);

  // Check if connected to Sepolia
  useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          // Sepolia chainId is 11155111
          setIsSepoliaNetwork(network.chainId === 11155111n);
        } catch (error) {
          console.error('Error checking network:', error);
          setIsSepoliaNetwork(false);
        }
      } else {
        setIsSepoliaNetwork(false);
      }
    };

    checkNetwork();
  }, [provider]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!provider || !isSepoliaNetwork) {
        setLoading(false);
        return;
      }
      
      try {
        const contract = getContract(provider);
        const data = await contract.getCampaigns();
        
        const validCampaigns = data.filter((campaign: any) => 
          campaign && campaign.exists && campaign.owner && campaign.title
        ).map((campaign: any) => ({
          id: Number(campaign.id),
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          target: campaign.target,
          deadline: campaign.deadline,
          amountCollected: campaign.amountCollected,
          image: campaign.image,
          donators: campaign.donators || [],
          donations: campaign.donations || []
        }));
        
        setCampaigns(validCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [provider, isSepoliaNetwork]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredAndSortedCampaigns = React.useMemo(() => {
    let result = [...filteredItems];

    if (status !== 'all') {
      const now = Date.now();
      result = result.filter(campaign => {
        const isActive = Number(campaign.deadline) * 1000 > now;
        return status === 'active' ? isActive : !isActive;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'endingSoon':
          return Number(a.deadline) - Number(b.deadline);
        case 'mostFunded':
          return Number(b.amountCollected) - Number(a.amountCollected);
        case 'leastFunded':
          return Number(a.amountCollected) - Number(b.amountCollected);
        default: // newest
          return Number(b.deadline) - Number(a.deadline);
      }
    });

    return result;
  }, [filteredItems, status, sortBy]);

  // Featured campaign - choose the one with the most funding
  const featuredCampaign = React.useMemo(() => {
    if (campaigns.length === 0) return null;
    
    return campaigns.reduce((featured, current) => 
      Number(current.amountCollected) > Number(featured.amountCollected) ? current : featured
    , campaigns[0]);
  }, [campaigns]);

  // Category tabs
  const categories = [
    { name: "All", icon: <BookOpen className="w-4 h-4 mr-2" />, filter: 'all' },
    { name: "Technology", icon: <Zap className="w-4 h-4 mr-2" />, filter: 'active' },
    { name: "Featured", icon: <Star className="w-4 h-4 mr-2" />, filter: 'all' },
    { name: "Trending", icon: <TrendingUp className="w-4 h-4 mr-2" />, filter: 'active' },
    { name: "Latest", icon: <Rocket className="w-4 h-4 mr-2" />, filter: 'active' },
  ];

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-blue-900/30 dark:to-gray-800 transition-colors duration-300">
        <div className="flex flex-col justify-center items-center pt-28 pb-16 px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl animate-pulse" />
            <Lottie
              animationData={blockchainanimation}
              loop={true}
              autoplay={true}
              style={{ height: 320, width: 320 }}
              className="relative z-10"
            />
          </div>
          <h2 className="mt-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Loading Web3 Content
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-md text-center">
            Connect your Metamask wallet, enable the test network, and select Sepolia to view the blogs.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </main>
    );
  }

  if (!isSepoliaNetwork) {
    return (
      <main className="w-full min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-blue-900/30 dark:to-gray-800 transition-colors duration-300">
        <div className="flex flex-col justify-center items-center pt-28 pb-16 px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 dark:from-orange-500/10 dark:via-red-500/10 dark:to-pink-500/10 rounded-full blur-3xl animate-pulse" />
            <Lottie
              animationData={blockchainanimation}
              loop={true}
              autoplay={true}
              style={{ height: 320, width: 320 }}
              className="relative z-10"
            />
          </div>
          <h2 className="mt-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400">
            Network Connection Required
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-md text-center">
            Please connect to the Sepolia test network to view blogs and interact with the platform.
          </p>
          <button className="mt-8 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-orange-500/20 transition-all duration-200 transform hover:-translate-y-1">
            Switch to Sepolia
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 transition-colors duration-300">
      <Hero />
      
      {/* Scroll indicator */}
      {showScrollIndicator && (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <motion.div 
            className="absolute bottom-8 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </motion.div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Featured Content */}
        {featuredCampaign && (
          <FadeIn>
            <div className="relative overflow-hidden rounded-2xl mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10" />
              
              <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg flex items-center">
                <Award className="w-4 h-4 mr-2" /> Featured Blog
              </div>
              
              <div className="md:grid md:grid-cols-2 gap-8 relative z-10 p-6 md:p-8">
                <div className="aspect-video overflow-hidden rounded-xl shadow-lg mb-6 md:mb-0">
                  <img
                    src={featuredCampaign.image || 'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75'}
                    alt={featuredCampaign.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {featuredCampaign.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                    {featuredCampaign.description}
                  </p>
                  
                  <div className="space-y-4 max-w-md">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Number(featuredCampaign.amountCollected) / Number(featuredCampaign.target) * 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Raised</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {Number(featuredCampaign.amountCollected) / 10**18} ETH
                        </p>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
                        onClick={() => window.location.href = `/campaign/${featuredCampaign.id}`}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl transform -translate-y-1/2" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-xl" />
            </div>
          </FadeIn>
        )}
        
        
        <FadeIn>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-8">
            <SearchBar 
              value={searchQuery}
              onChange={handleSearch}
              resultsCount={resultsCount}
              showCount={isSearching}
            />
            <FilterBar
              status={status}
              onStatusChange={setStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </FadeIn>

        {/* Results count and section title */}
        <FadeIn delay={200}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {categories[activeCategoryIndex].name} Blogs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAndSortedCampaigns.length} {filteredAndSortedCampaigns.length === 1 ? 'blog' : 'blogs'} found
            </p>
          </div>
        </FadeIn>

        {/* Campaign cards with enhanced animation */}
        <FadeIn delay={300}>
          {filteredAndSortedCampaigns.length === 0 ? (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No blogs found</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {filteredAndSortedCampaigns.map((campaign, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    show: { y: 0, opacity: 1 }
                  }}
                >
                  <CampaignCard campaign={campaign} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </FadeIn>
        
      </div>
      <Footer />
    </div>
  );
}