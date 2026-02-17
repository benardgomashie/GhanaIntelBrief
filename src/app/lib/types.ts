export type Article = {
  id: string;
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
  sourceIds: string[];
  categoryIds: string[];
};
