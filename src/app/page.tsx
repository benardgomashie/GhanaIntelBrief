'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { ArticleCard } from '@/components/article-card';
import type { Article } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  
  const articlesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'articles'), orderBy('aggregatedAt', 'desc')) : null),
    [firestore]
  );
  const { data: articles, isLoading } = useCollection<Article>(articlesQuery);

  // Filter articles based on search term
  const filteredArticles = useMemo(() => {
    if (!articles || !searchTerm.trim()) return articles;
    
    const search = searchTerm.toLowerCase();
    return articles.filter(article => 
      article.title?.toLowerCase().includes(search) ||
      article.summary?.toLowerCase().includes(search) ||
      article.whyThisMattersExplanation?.toLowerCase().includes(search)
    );
  }, [articles, searchTerm]);

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
      
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Latest Briefings
        </h2>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Results Count */}
      {searchTerm && (
        <p className="mb-4 text-sm text-muted-foreground">
          {filteredArticles?.length || 0} article{filteredArticles?.length !== 1 ? 's' : ''} found
        </p>
      )}
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <>
            <ArticleSkeleton />
            <ArticleSkeleton />
            <ArticleSkeleton />
          </>
        )}
        {!isLoading && filteredArticles && filteredArticles.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-lg text-muted-foreground">No articles found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
        {filteredArticles?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
  );
}
