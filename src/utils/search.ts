import { Campaign } from '../types/campaign';

export function searchCampaigns(campaigns: Campaign[], query: string): Campaign[] {
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return campaigns.filter(campaign => {
    const searchableText = [
      campaign.title,
      campaign.description,
      campaign.owner
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
}