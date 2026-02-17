export type Article = {
  id: string;
  title: string;
  category: 'Business' | 'Tech' | 'Policy';
  date: string;
  imageUrlId: string;
  summary: string;
  relevance: string;
  sources: {
    name: string;
    url: string;
  }[];
};
