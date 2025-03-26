import { ethers } from 'ethers';

const contractAddress = '0xF208a9aF6019ECb9Ce5CDe6604136C26238582fF';

const contractABI = [
  "function createCampaign(string _title, string _description, uint256 _target, uint256 _deadline, string _image) public returns (uint256)",
  "function donateToCampaign(uint256 _id) public payable",
  "function getDonators(uint256 _id) public view returns (address[], uint256[])",
  "function getCampaigns() public view returns (tuple(uint256 id, address owner, string title, string description, uint256 target, uint256 deadline, uint256 amountCollected, string image, address[] donators, uint256[] donations, bool exists)[])",
  "function editCampaign(uint256 _id, string _newTitle, string _newDescription, uint256 _newTarget, uint256 _newDeadline, string _newImage) public",
  "function deleteCampaign(uint256 _id) public"
];

export function getContract(provider: ethers.Provider, signer?: ethers.Signer) {
  return new ethers.Contract(
    contractAddress,
    contractABI,
    signer || provider
  );
}