import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { getContract } from '../contracts';
import { parseEther } from 'ethers';
import CampaignHeader from '../components/campaign/details/CampaignHeader';
import DonationForm from '../components/campaign/details/DonationForm';
import DonationList from '../components/campaign/details/DonationList';
import type { Campaign } from '../types/campaign';
import MDEditor  from '@uiw/react-md-editor';

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { provider, signer, account } = useWeb3();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!provider || !id) return;
      
      try {
        const contract = getContract(provider);
        const campaigns = await contract.getCampaigns();
        
        // Find the campaign with the matching id and ensure it exists
        const campaignData = campaigns[parseInt(id)];
        
        if (!campaignData || !campaignData.exists) {
          setLoading(false);
          return; // Campaign not found or doesn't exist
        }
        
        // Map the data to our Campaign type
        setCampaign({
          id: Number(campaignData.id),  // Store the campaign ID
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
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error('Error donating to campaign:', error);
      alert('Failed to donate: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteCampaign = async () => {
    if (!signer || !id || !provider || !campaign) return;
    
    // Check if user is the campaign owner
    if (account?.toLowerCase() !== campaign.owner.toLowerCase()) {
      setErrorMessage('You are not authorized to delete this campaign');
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      
      const contract = getContract(provider, signer);
      
      console.log('Deleting campaign:', id);
      const tx = await contract.deleteCampaign(id, {
        gasLimit: 3000000 // Set a higher gas limit explicitly
      });
      
      console.log('Delete transaction submitted:', tx.hash);
      await tx.wait();
      
      // Redirect to home page after successful deletion
      navigate('/');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete campaign');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 min-h-[60vh] flex items-center justify-center">
        Campaign not found
      </div>
    );
  }

  const donations = campaign.donators.map((address, index) => ({
    address,
    amount: campaign.donations[index],
    timestamp: Date.now() - (index * 1000 * 60 * 60) // Simulated timestamps
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg mb-4">
                {errorMessage}
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                className="flex-1 py-2 px-4 bg-red-200 text-red-600 rounded-lg hover:bg-red-300 transition-colors flex justify-center items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <CampaignHeader 
          campaign={campaign} 
          campaignId={id!} 
          onDelete={handleDeleteConfirm} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold mb-4 dark:text-blue-400">About this campaign</h3>
              <div data-color-mode="light" className="prose prose-sm max-w-none dark:prose-invert">
                <MDEditor.Markdown 
                  source={campaign.description} 
                  style={{ whiteSpace: 'pre-wrap' }}
                  className='bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white p-4 rounded-lg'
                />
              </div>
            </div>
            
            <DonationList donations={donations} />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <DonationForm
                campaignId={id!}
                onDonate={handleDonate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}