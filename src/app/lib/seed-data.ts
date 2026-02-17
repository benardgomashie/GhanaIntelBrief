import type { Article, Category, Source } from '@/app/lib/types';

export const categories: Omit<Category, 'id' | 'articleIds'>[] = [
  {
    name: 'Business',
    description: 'News and analysis on Ghanaian and African business.',
  },
  {
    name: 'Tech',
    description: 'The latest in technology and innovation in Ghana.',
  },
  {
    name: 'Policy',
    description: 'Government policy, regulations, and their impact.',
  },
];

export const sources: Omit<Source, 'id' | 'articleIds' | 'lastFetchedAt'>[] = [
    {
        name: 'GhanaWeb',
        baseUrl: 'https://www.ghanaweb.com',
        feedUrl: 'https://www.ghanaweb.com/feed/category/general',
        sourceType: 'RSS',
        country: 'GH',
        language: 'en',
    },
    {
        name: 'Joy Online',
        baseUrl: 'https://www.myjoyonline.com',
        feedUrl: 'https://www.myjoyonline.com/feed/',
        sourceType: 'RSS',
        country: 'GH',
        language: 'en',
    }
];

export const articles: Omit<Article, 'id' | 'sourceIds' | 'categoryIds' | 'aggregatedAt'>[] = [
    {
        title: "Ghana's Tech Scene: A Booming Hub for Innovation",
        originalUrl: "https://example.com/ghana-tech-boom",
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        summary: "- Ghana is rapidly becoming a major tech hub in West Africa.\n- Startups are flourishing, attracting international investment.\n- Key sectors include fintech, agritech, and healthtech.\n- Government initiatives are supporting the ecosystem's growth.\n- Challenges remain in infrastructure and talent development.",
        whyThisMattersExplanation: "This trend signifies a major shift in Ghana's economy, creating high-skilled jobs and opportunities for wealth creation. It positions Ghana as a leader in the digital transformation of Africa, impacting policy and economic growth.",
        imageThumbnailUrl: "https://images.unsplash.com/photo-1692369584496-3216a88f94c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxhZ3JpY3VsdHVyZSUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzcxMzE1MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isRelevantMoney: true,
        isRelevantPolicy: true,
        isRelevantOpportunity: true,
        isRelevantGrowth: true,
    },
    {
        title: "Central Bank Digital Currency: What it Means for Your Money",
        originalUrl: "https://example.com/cbdc-ghana",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        summary: "- The Bank of Ghana is exploring a digital cedi (e-cedi).\n- It aims to improve financial inclusion and payment efficiency.\n- Pilot programs are underway to test the technology.\n- Concerns around privacy and security are being addressed.\n- The e-cedi could co-exist with physical cash and mobile money.",
        whyThisMattersExplanation: "The introduction of a CBDC could revolutionize Ghana's financial landscape. It impacts monetary policy, the banking sector, and how every citizen interacts with money, presenting both opportunities for innovation and policy challenges.",
        imageThumbnailUrl: "https://images.unsplash.com/photo-1660139099083-03e0777ac6a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxkaWdpdGFsJTIwY3VycmVuY3l8ZW58MHx8fHwxNzcxMjc4MjU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isRelevantMoney: true,
        isRelevantPolicy: true,
        isRelevantOpportunity: false,
        isRelevantGrowth: true,
    },
    {
        title: "New Education Policy to Focus on STEM and Digital Skills",
        originalUrl: "https://example.com/ghana-education-policy",
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        summary: "- The Ministry of Education has announced a new policy reform.\n- The curriculum will prioritize Science, Technology, Engineering, and Mathematics (STEM).\n- Digital literacy programs will be implemented nationwide.\n- The goal is to prepare students for the future job market.\n- Teacher training is a key component of the new strategy.",
        whyThisMattersExplanation: "This policy is a long-term investment in Ghana's human capital. By focusing on STEM, it aims to fuel innovation and economic growth, creating a skilled workforce that can drive the country's development and seize global opportunities.",
        imageThumbnailUrl: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxlZHVjYXRpb24lMjB0ZWNobm9sb2d5fGVufDB8fHx8MTc3MTMxNTA0NHww&ixlib=rb-4.1.0&q=80&w=1080",
        isRelevantMoney: false,
        isRelevantPolicy: true,
        isRelevantOpportunity: true,
        isRelevantGrowth: true,
    },
    {
        title: "Investment in Agri-Tech to Boost Cocoa Production",
        originalUrl: "https://example.com/ghana-agritech",
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        summary: "- The government has partnered with private firms to invest in agricultural technology.\n- Drones and IoT sensors will be used to monitor cocoa farms.\n- The aim is to increase yield and combat diseases.\n- This will strengthen Ghana's position as a top cocoa producer.\n- Farmers will receive training on using new technologies.",
        whyThisMattersExplanation: "This investment is crucial for the backbone of Ghana's economy. Modernizing agriculture boosts productivity and growth, enhances food security, and improves livelihoods for millions of farmers, directly impacting national revenue and opportunity.",
        imageThumbnailUrl: "https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxidXNpbmVzcyUyMGludmVzdG1lbnR8ZW58MHx8fHwxNzcxMzE1MDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        isRelevantMoney: true,
        isRelevantPolicy: false,
        isRelevantOpportunity: true,
        isRelevantGrowth: true,
    },
];
