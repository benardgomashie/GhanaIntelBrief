'use client';

import Image from 'next/image';
import type { Article } from '@/app/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link, ExternalLink, ScrollText } from 'lucide-react';
import { Separator } from './ui/separator';

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  console.log('[ArticleCard] Rendering article:', {
    id: article.id,
    title: article.title,
    whyThisMatters: article.whyThisMattersExplanation,
    aiProvider: article.aiProvider,
    summaryLength: article.summary?.length
  });

  const summaryPoints = article.summary
    .split('\n')
    .map((point) => point.replace(/^-/, '').trim())
    .filter((p) => p.length > 0);

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {article.imageThumbnailUrl ? (
            <Image
              src={article.imageThumbnailUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-secondary" />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-6">
        <p className="mb-2 text-sm text-muted-foreground">
          {new Date(article.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <CardTitle className="mb-4 font-headline text-2xl leading-tight">
          {article.title}
        </CardTitle>
        <ul className="space-y-2 text-foreground/90">
          {summaryPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex-col items-start bg-muted/50 p-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-accent" />
                Why This Matters
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-base text-muted-foreground">
                {article.whyThisMattersExplanation}
              </p>
            </AccordionContent>
          </AccordionItem>
          <Separator />
          <AccordionItem value="item-2" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Link className="h-5 w-5 text-accent" />
                Original Source
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-base text-muted-foreground transition-colors hover:text-primary"
              >
                Read full article
                <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
