import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminFirestore } from '@/lib/firebase-admin';
import type { Article } from '@/app/lib/types';
import { slugify } from '@/lib/slugify';
import { ArrowLeft, ExternalLink, ScrollText, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArticleCard } from '@/components/article-card';

export const revalidate = 300;

type Params = Promise<{ id: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: articleId } = await params;

  try {
    const articleDoc = await adminFirestore.collection('articles').doc(articleId).get();

    if (!articleDoc.exists) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.',
        robots: { index: false, follow: false },
      };
    }

    const article = articleDoc.data() as Article;
    const slug = article.slug || slugify(article.title);
    const description =
      article.whyThisMattersExplanation || article.summary?.slice(0, 160) || 'Ghana business news and analysis';
    const imageUrl = article.imageThumbnailUrl || 'https://www.ghanaintelbrief.site/og-image.png';
    const canonicalUrl = `https://www.ghanaintelbrief.site/article/${articleId}/${slug}`;

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
        url: canonicalUrl,
        siteName: 'Ghana IntelBrief',
        type: 'article',
        publishedTime: article.publishedAt,
        modifiedTime: article.aggregatedAt,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: canonicalUrl,
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

export default async function ArticlePage({ params }: { params: Params }) {
  const { id: articleId } = await params;

  const articleDoc = await adminFirestore.collection('articles').doc(articleId).get();

  if (!articleDoc.exists) {
    notFound();
  }

  const article = articleDoc.data() as Article;

  const relatedSnapshot = await adminFirestore
    .collection('articles')
    .orderBy('aggregatedAt', 'desc')
    .limit(8)
    .get();

  const filteredRelatedArticles = relatedSnapshot.docs
    .map((doc) => doc.data() as Article)
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const summaryPoints = (article.summary || '')
    .split('\n')
    .map((point) => point.replace(/^[-•]\s*/, '').trim())
    .filter((point) => point.length > 0);

  const relevanceTags = [
    article.isRelevantMoney && { label: 'Money', color: 'bg-green-500/10 text-green-500' },
    article.isRelevantPolicy && { label: 'Policy', color: 'bg-blue-500/10 text-blue-500' },
    article.isRelevantOpportunity && { label: 'Opportunity', color: 'bg-purple-500/10 text-purple-500' },
    article.isRelevantGrowth && { label: 'Growth', color: 'bg-yellow-500/10 text-yellow-500' },
  ].filter(Boolean) as { label: string; color: string }[];

  const slug = article.slug || slugify(article.title);
  const canonicalUrl = `https://www.ghanaintelbrief.site/article/${article.id}/${slug}`;

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-300">
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
            mainEntityOfPage: canonicalUrl,
            author: { '@type': 'Organization', name: 'Ghana IntelBrief' },
            publisher: {
              '@type': 'Organization',
              name: 'Ghana IntelBrief',
              logo: { '@type': 'ImageObject', url: 'https://www.ghanaintelbrief.site/logo.png' },
            },
            description: article.whyThisMattersExplanation || article.summary,
          }),
        }}
      />

      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Latest Briefings
      </Link>

      <Card className="overflow-hidden">
        {article.imageThumbnailUrl ? (
          <div className="relative h-96 w-full">
            <Image
              src={article.imageThumbnailUrl}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              unoptimized={article.imageThumbnailUrl.startsWith('http://')}
            />
          </div>
        ) : (
          <div className="flex h-96 w-full items-center justify-center bg-gradient-to-br from-yellow-600 via-red-600 to-green-700">
            <div className="px-6 text-center">
              <ScrollText className="mx-auto mb-4 h-20 w-20 text-white/90" />
              <p className="text-xl font-semibold text-white/80">Ghana IntelBrief</p>
            </div>
          </div>
        )}

        <CardHeader className="space-y-4 p-8">
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

          <h1 className="font-headline text-4xl font-bold leading-tight tracking-tight">{article.title}</h1>

          {relevanceTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {relevanceTags.map((tag) => (
                <Badge key={tag.label} variant="secondary" className={tag.color}>
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="space-y-8 p-8">
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

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Why This Matters</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{article.whyThisMattersExplanation}</p>
          </div>

          <Separator />

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

      {filteredRelatedArticles.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 font-headline text-2xl font-bold tracking-tight">Related Articles</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {filteredRelatedArticles.map((relatedArticle) => (
              <ArticleCard key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
