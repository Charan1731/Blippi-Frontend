export interface Campaign {
  id?: number;  // Adding optional id field to store the campaign ID
  owner: string;
  title: string;
  description: string;
  target: bigint;
  deadline: bigint;
  amountCollected: bigint;
  image: string;
  donators: string[];
  donations: bigint[];
}

// Raw campaign data from contract
export interface CampaignData extends Omit<Campaign, 'id'> {
  id: bigint;
  exists: boolean;
}

export interface CampaignFormData {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

export type CampaignStatus = 'all' | 'active' | 'ended';
export type SortOption = 'newest' | 'endingSoon' | 'mostFunded' | 'leastFunded';