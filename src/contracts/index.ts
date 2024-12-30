import { ethers } from 'ethers';

const contractAddress = '0xD481d66A7F4A0E543EADcae14d949468B4319760';

const contractABI = [
  "function createCampaign(address _owner, string _title, string _description, uint256 _target, uint256 _deadline, string _image) public returns (uint256)",
  "function donateToCampaign(uint256 _id) public payable",
  "function getDonators(uint256 _id) public view returns (address[], uint256[])",
  "function getCampaigns() public view returns (tuple(address owner, string title, string description, uint256 target, uint256 deadline, uint256 amountCollected, string image, address[] donators, uint256[] donations)[])"
];

export function getContract(provider: ethers.Provider, signer?: ethers.Signer) {
  return new ethers.Contract(
    contractAddress,
    contractABI,
    signer || provider
  );
}