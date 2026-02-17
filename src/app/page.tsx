'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { ArticleCard } from '@/components/article-card';
import type { Article } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ArticleSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
       <div className="space-y-2 pt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export default function Home() {
  const firestore = useFirestore();
  const articlesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'articles'), orderBy('aggregatedAt', 'desc')) : null),
    [firestore]
  );
  const { data: articles, isLoading } = useCollection<Article>(articlesQuery);

  console.log('[HomePage] Articles loaded:', {
    count: articles?.length || 0,
    isLoading,
    articles: articles?.map(a => ({
      id: a.id,
      title: a.title,
      whyThisMatters: a.whyThisMattersExplanation?.substring(0, 50) + '...',
      aiProvider: a.aiProvider,
      summary: a.summary?.substring(0, 50) + '...'
    }))
  });

  // Generate structured data for SEO
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <h2 className="mb-8 font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Latest Briefings
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <>
            <ArticleSkeleton />
            <ArticleSkeleton />
            <ArticleSkeleton />
          </>
        )}
        {articles?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
  );
}
