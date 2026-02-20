'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import { Input } from '@/components/ui/input';
import type { Article } from '@/app/lib/types';

type HomeClientProps = {
  articles: Article[];
};

export default function HomeClient({ articles }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;

    const search = searchTerm.toLowerCase();
    return articles.filter(
      (article) =>
        article.title?.toLowerCase().includes(search) ||
        article.summary?.toLowerCase().includes(search) ||
        article.whyThisMattersExplanation?.toLowerCase().includes(search)
    );
  }, [articles, searchTerm]);

  return (
    <>
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-2xl">
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

      {searchTerm && (
        <p className="mb-4 text-sm text-muted-foreground">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
        </p>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-lg text-muted-foreground">No articles found matching "{searchTerm}"</p>
            <button onClick={() => setSearchTerm('')} className="mt-4 text-primary hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => <ArticleCard key={article.id} article={article} />)
        )}
      </div>
    </>
  );
}
