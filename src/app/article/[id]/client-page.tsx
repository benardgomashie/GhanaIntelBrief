'use client';

import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import type { Article } from '@/app/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ScrollText, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArticlePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const [articleId, setArticleId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Unwrap params since it's a Promise in Next.js 15
    Promise.resolve(params).then((resolvedParams) => {
      setArticleId(resolvedParams.id);
    });
  }, [params]);

  const articleRef = articleId && firestore ? doc(firestore, 'articles', articleId) : null;
  const { data: article, isLoading } = useDoc<Article>(articleRef);

  if (isLoading || !articleId) {
    return (
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-4 h-96 w-full" />
        <Skeleton className="mb-4 h-12 w-3/4" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-3xl font-bold">Article Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Latest Briefings
        </Link>
      </div>
    );
  }

  const summaryPoints = article.summary
    .split('\n')
    .map((point) => point.replace(/^[-•]\s*/, '').trim())
    .filter((p) => p.length > 0);

  const relevanceTags = [
    article.isRelevantMoney && { label: 'Money', color: 'bg-green-500/10 text-green-500' },
    article.isRelevantPolicy && { label: 'Policy', color: 'bg-blue-500/10 text-blue-500' },
    article.isRelevantOpportunity && { label: 'Opportunity', color: 'bg-purple-500/10 text-purple-500' },
    article.isRelevantGrowth && { label: 'Growth', color: 'bg-yellow-500/10 text-yellow-500' },
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            image: article.imageThumbnailUrl || 'https://www.ghanaintelbrief.site/og-image.png',
            datePublished: article.publishedAt,
            dateModified: article.aggregatedAt,
            author: {
              '@type': 'Organization',
              name: 'Ghana IntelBrief',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Ghana IntelBrief',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.ghanaintelbrief.site/logo.png',
              },
            },
            description: article.whyThisMattersExplanation,
          }),
        }}
      />

      {/* Back Navigation */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Latest Briefings
      </Link>

      {/* Main Article Card */}
      <Card className="overflow-hidden">
        {/* Hero Image */}
        {article.imageThumbnailUrl && !imageError ? (
          <div className="relative h-96 w-full">
            <Image
              src={article.imageThumbnailUrl}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized={article.imageThumbnailUrl.includes('http://') || article.imageThumbnailUrl.includes('myjoyonline.com')}
            />
          </div>
        ) : (
          <div className="flex h-96 w-full items-center justify-center bg-gradient-to-br from-yellow-600 via-red-600 to-green-700">
            <div className="text-center px-6">
              <ScrollText className="mx-auto h-20 w-20 text-white/90 mb-4" />
              <p className="text-xl font-semibold text-white/80">Ghana IntelBrief</p>
            </div>
          </div>
        )}

        <CardHeader className="space-y-4 p-8">
          {/* Date and AI Provider */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            {article.aiProvider !== 'fallback' && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI-Enhanced
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="font-headline text-4xl font-bold leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Relevance Tags */}
          {relevanceTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {relevanceTags.map((tag: any) => (
                <Badge key={tag.label} variant="secondary" className={tag.color}>
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="space-y-8 p-8">
          {/* Key Points */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
              <ScrollText className="h-6 w-6 text-primary" />
              Key Points
            </h2>
            <ul className="space-y-3 text-lg">
              {summaryPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span className="text-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Why This Matters */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Why This Matters</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {article.whyThisMattersExplanation}
            </p>
          </div>

          <Separator />

          {/* Original Source */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Read Full Article</h2>
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-lg text-primary transition-colors hover:underline"
            >
              View original source
              <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
