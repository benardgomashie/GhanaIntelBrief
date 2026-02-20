export type Article = {
  id: string;
  slug: string;
  title: string;
  originalUrl: string;
  publishedAt: string;
  aggregatedAt: string;
  summary: string;
  whyThisMattersExplanation: string;
  imageThumbnailUrl?: string;
  isRelevantMoney: boolean;
  isRelevantPolicy: boolean;
  isRelevantOpportunity: boolean;
  isRelevantGrowth: boolean;
  aiProvider?: string;
  sourceIds: string[];
  categoryIds: string[];
};

export type Source = {
  id: string;
  name: string;
  baseUrl: string;
  feedUrl?: string;
  sourceType: string;
  country: string;
  language: string;
  lastFetchedAt?: string;
  articleIds?: string[];
};

export type Category = {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  articleIds?: string[];
};
