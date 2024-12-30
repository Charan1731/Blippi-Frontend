export interface Campaign {
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

export interface CampaignFormData {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

export type CampaignStatus = 'all' | 'active' | 'ended';
export type SortOption = 'newest' | 'endingSoon' | 'mostFunded' | 'leastFunded';