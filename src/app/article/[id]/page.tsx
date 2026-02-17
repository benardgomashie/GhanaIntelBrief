import { Metadata } from 'next';
import { adminFirestore } from '@/lib/firebase-admin';
import type { Article } from '@/app/lib/types';
import ClientPage from './client-page';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const articleId = resolvedParams.id;

  try {
    const articleDoc = await adminFirestore.collection('articles').doc(articleId).get();

    if (!articleDoc.exists) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.',
      };
    }

    const article = articleDoc.data() as Article;
    const description = article.whyThisMattersExplanation || article.summary.slice(0, 160);
    const imageUrl = article.imageThumbnailUrl || 'https://www.ghanaintelbrief.site/og-image.png';

    return {
      title: article.title,
      description,
      keywords: [
        'Ghana news',
        'Ghana business',
        article.isRelevantMoney && 'investment',
        article.isRelevantPolicy && 'policy',
        article.isRelevantOpportunity && 'business opportunity',
        article.isRelevantGrowth && 'economic growth',
      ].filter(Boolean) as string[],
      openGraph: {
        title: article.title,
        description,
        url: `https://www.ghanaintelbrief.site/article/${articleId}`,
        siteName: 'Ghana IntelBrief',
        type: 'article',
        publishedTime: article.publishedAt,
        modifiedTime: article.aggregatedAt,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/article/${articleId}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Ghana IntelBrief',
      description: 'AI-powered Ghana business news and insights',
    };
  }
}

export default ClientPage;
