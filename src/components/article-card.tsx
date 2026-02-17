'use client';

import Image from 'next/image';
import type { Article } from '@/app/lib/types';
import placeholderData from '@/lib/placeholder-images.json';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link, ExternalLink, ScrollText } from 'lucide-react';
import { categoryIcons } from './icons';
import { Separator } from './ui/separator';

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  const { placeholderImages } = placeholderData;
  const imageInfo = placeholderImages.find((img) => img.id === article.imageUrlId);

  const summaryPoints = article.summary
    .split('\n')
    .map((point) => point.replace(/^-/, '').trim());

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {imageInfo && (
            <Image
              src={imageInfo.imageUrl}
              alt={imageInfo.description}
              data-ai-hint={imageInfo.imageHint}
              fill
              className="object-cover"
            />
          )}
          <Badge
            variant="secondary"
            className="absolute left-4 top-4 flex items-center gap-2 border-primary/50 text-sm"
          >
            {categoryIcons[article.category]}
            {article.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-6">
        <p className="mb-2 text-sm text-muted-foreground">
          {new Date(article.date).toLocaleDateString('en-US', {
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
              <p className="text-base text-muted-foreground">{article.relevance}</p>
            </AccordionContent>
          </AccordionItem>
          <Separator />
          <AccordionItem value="item-2" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Link className="h-5 w-5 text-accent" />
                Original Sources
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <ul className="space-y-2">
                {article.sources.map((source) => (
                  <li key={source.name}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-base text-muted-foreground transition-colors hover:text-primary"
                    >
                      {source.name}
                      <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
