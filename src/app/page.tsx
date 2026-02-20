import { adminFirestore } from '@/lib/firebase-admin';
import type { Article } from '@/app/lib/types';
import HomeClient from './home-client';

export const revalidate = 300;

export default async function Home() {
  let articles: Article[] = [];

  try {
    const snapshot = await adminFirestore
      .collection('articles')
      .orderBy('aggregatedAt', 'desc')
      .limit(100)
      .get();

    articles = snapshot.docs.map((doc) => doc.data() as Article);
  } catch (error) {
    console.error('[HomePage] Failed to load articles server-side:', error);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ghana IntelBrief',
    description: "AI-curated news on Ghana's business, tech, and policy landscape",
    url: 'https://www.ghanaintelbrief.site',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.ghanaintelbrief.site/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HomeClient articles={articles} />
    </>
  );
}
