import { MetadataRoute } from 'next';
import { adminFirestore } from '@/lib/firebase-admin';
import type { Article } from '@/app/lib/types';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ghanaintelbrief.site';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/analyze`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/curate`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ];

  try {
    // Fetch all articles from Firestore
    const articlesSnapshot = await adminFirestore
      .collection('articles')
      .orderBy('aggregatedAt', 'desc')
      .limit(1000) // Limit to prevent sitemap from being too large
      .get();

    const articlePages: MetadataRoute.Sitemap = articlesSnapshot.docs.map((doc) => {
      const article = doc.data() as Article;
      return {
        url: `${baseUrl}/article/${article.id}`,
        lastModified: new Date(article.aggregatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    });

    return [...staticPages, ...articlePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least the static pages if there's an error
    return staticPages;
  }
}
