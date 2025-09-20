import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther, formatEther } from 'ethers';
import CampaignHeader from '../components/campaign/details/CampaignHeader';
import DonationForm from '../components/campaign/details/DonationForm';
import DonationList from '../components/campaign/details/DonationList';
import DonorLeaderboard from '../components/campaign/details/DonorLeaderboard';
import type { Campaign } from '../types/campaign';
import MDEditor from '@uiw/react-md-editor';
import Modal from '../components/Modal';
import SuccessConfirmation from '../components/SuccessConfirmation';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Users, Sparkles } from 'lucide-react';
import { SummarizeButton } from '../components/ai';

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { provider, signer, account } = useWeb3();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [lastDonationAmount, setLastDonationAmount] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!provider || !id) return;
      
      try {
        const contract = getContract(provider);
        const campaigns = await contract.getCampaigns();
        const campaignData = campaigns[parseInt(id)];
        
        if (!campaignData || !campaignData.exists) {
          setLoading(false);
          return;
        }
        setCampaign({
          id: Number(campaignData.id),
          owner: campaignData.owner,
          title: campaignData.title,
          description: campaignData.description,
          target: campaignData.target,
          deadline: campaignData.deadline,
          amountCollected: campaignData.amountCollected,
          image: campaignData.image,
          donators: campaignData.donators || [],
          donations: campaignData.donations || []
        });
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [provider, id]);

  const handleDonate = async (amount: string) => {
    if (!signer || !id || !provider) return;

    try {
      const contract = getContract(provider, signer);
      console.log('Donating to campaign:', id, 'amount:', parseEther(amount).toString());
      
      const tx = await contract.donateToCampaign(id, {
        value: parseEther(amount),
        gasLimit: 3000000  // Set a higher gas limit explicitly
      });
      
      console.log('Donation transaction submitted:', tx.hash);
      // Save the donation amount for the success message
      setLastDonationAmount(amount);
      
      await tx.wait();
      
      // Show success modal instead of reloading the page
      setShowDonationSuccess(true);
    } catch (error) {
      console.error('Error donating to campaign:', error);
      alert('Failed to donate: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDonationSuccessClose = () => {
    setShowDonationSuccess(false);
    // Reload the page to update the donation list
    window.location.reload();
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteCampaign = async () => {
    if (!signer || !id || !provider || !campaign) return;
    
    if (account?.toLowerCase() !== campaign.owner.toLowerCase()) {
      setErrorMessage('You are not authorized to delete this Blog');
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      
      const contract = getContract(provider, signer);
      
      console.log('Deleting campaign:', id);
      const tx = await contract.deleteCampaign(id, {
        gasLimit: 3000000
      });
      
      console.log('Delete transaction submitted:', tx.hash);
      await tx.wait();
      
      const imageUrl = campaign?.image;
      if(imageUrl){
        const response = await fetch("https://s3-practice-1.onrender.com/delete",{
          method:"POST",
          headers:{
            'Content-type':"application/json"
          },
          body:JSON.stringify({imageUrl})
        })
        if(response.ok){
          console.log("Image deleted")
        }else{
          console.log("Failed to delete image")
        }
      }
      navigate('/');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete blog');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };



  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading Blog details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl max-w-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Campaign Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This campaign may have been deleted or does not exist.
          </p>
          <motion.button 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </motion.button>
        </div>
      </div>
    );
  }

  const donations = campaign.donators.map((address, index) => ({
    address,
    amount: campaign.donations[index],
    timestamp: Date.now() - (index * 1000 * 60 * 60) // Simulated timestamps
  }));

  // Calculate campaign stats
  const progress = Math.min(Number(campaign.amountCollected) / Number(campaign.target) * 100, 100);
  const isActive = Number(campaign.deadline) * 1000 > Date.now();
  const timeLeft = isActive ? Math.floor((Number(campaign.deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const amountRaised = formatEther(campaign.amountCollected);
  const targetAmount = formatEther(campaign.target);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 transition-colors duration-300">
      {/* Decorative elements */}
      <div className="absolute top-24 right-10 w-72 h-72 bg-purple-300/30 dark:bg-purple-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-24 left-10 w-72 h-72 bg-blue-300/30 dark:bg-blue-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title="Delete Blog"
        type="error"
      >
        <DeleteConfirmation
          onDelete={handleDeleteCampaign}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
          errorMessage={errorMessage}
        />
      </Modal>
      
      {/* Donation Success Modal */}
      <Modal
        isOpen={showDonationSuccess}
        onClose={handleDonationSuccessClose}
        title="Thank You!"
        type="success"
      >
        <SuccessConfirmation
          title="Donation Successful!"
          message={`Thank you for your generous donation of ${lastDonationAmount} ETH to this campaign. Your contribution will make a difference!`}
          actionText="Continue"
          onAction={handleDonationSuccessClose}
        />
      </Modal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 relative z-10">

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8 mt-16"
        >
          {/* Main campaign header */}
          <motion.div variants={fadeIn}>
            <CampaignHeader 
              campaign={campaign} 
              campaignId={id!} 
              onDelete={handleDeleteConfirm} 
            />
          </motion.div>
          
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              className="lg:col-span-2 space-y-8"
              variants={fadeIn}
            >
              <motion.div 
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  About this campaign
                </h3>
                <div className="flex justify-between items-center mb-3">
                  <motion.span 
                    className="inline-block text-xs font-semibold py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Campaign Description
                  </motion.span>
                  <SummarizeButton
                    content={campaign.description}
                    title="Campaign Summary"
                    variant="secondary"
                    size="sm"
                  />
                </div>
                <div data-color-mode="light" className="prose prose-blue max-w-none dark:prose-invert">
                  <MDEditor.Markdown 
                    source={campaign.description} 
                    style={{ whiteSpace: 'pre-wrap' }}
                    className='bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white p-6 rounded-lg'
                  />
                </div>
              </motion.div>
              
              {/* Donor Leaderboard */}
              <motion.div 
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-xl relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 dark:bg-amber-500/5 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/5 rounded-full filter blur-3xl"></div>
                
                {/* Header */}
                <div className="mb-6 relative z-10">
                  <motion.span 
                    className="inline-block text-xs font-semibold py-1 px-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Top Donations
                  </motion.span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Campaign Champions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Top supporters are recognized for their generous contributions
                  </p>
                </div>
                
                <DonorLeaderboard 
                  donators={campaign.donators} 
                  donations={campaign.donations} 
                />
              </motion.div>
              
              {/* Campaign stats */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div 
                  variants={fadeIn}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {amountRaised}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">ETH Raised</p>
                    <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {progress.toFixed(1)}% of {targetAmount} ETH
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={fadeIn}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {campaign.donators.length}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Supporters</p>
                    <div className="mt-3 flex justify-center">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(5, campaign.donators.length))].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {i < 4 ? i + 1 : `+${campaign.donators.length - 4}`}
                          </div>
                        ))}
                        {campaign.donators.length === 0 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={fadeIn}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                      {timeLeft > 0 ? timeLeft : 0}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Days {isActive ? 'Left' : 'Ended'}</p>
                    <div className="mt-3 flex justify-center">
                      <div className={`px-4 py-1 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {isActive ? 'Active Campaign' : 'Campaign Ended'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Donation list with animation */}
              <motion.div 
                variants={fadeIn}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-xl"
              >
                <DonationList donations={donations} />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="lg:col-span-1"
              variants={fadeIn}
            >
              <div className="sticky top-24">
                <motion.div 
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-xl"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <DonationForm
                    campaignId={id!}
                    onDonate={handleDonate}
                  />
                </motion.div>
                
                {/* Campaign owner info */}
                <motion.div 
                  className="mt-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    Campaign Creator
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {campaign.owner.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Campaign Creator
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}