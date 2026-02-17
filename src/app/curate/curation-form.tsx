'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2, Rss } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore } from '@/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';
import Parser from 'rss-parser';
import type { Article, Source } from '@/app/lib/types';
import { assessArticleRelevance } from '@/ai/flows/relevance-assessment-flow';
import { summarizeArticle } from '@/ai/flows/article-summarization-flow';

// State interface for the curation process
export interface CurationState {
  logs: string[];
  processedCount: number;
  message?: string;
  error?: boolean;
  isRunning: boolean;
}

const initialState: CurationState = {
  logs: [],
  processedCount: 0,
  isRunning: false,
};

// Helper to extract clean text from HTML content
function extractTextFromHtml(html: string): string {
  // This is a simplified parser. For production, a more robust library might be better.
  // Replace block-level tags with a space
  let cleanHtml = html.replace(/<\/(p|div|li|h[1-6])>/gi, ' ');
  // Remove all other HTML tags
  cleanHtml = cleanHtml.replace(/<[^>]+>/g, '');
  // Replace multiple whitespace characters with a single space
  cleanHtml = cleanHtml.replace(/\s+/g, ' ').trim();
  return cleanHtml;
}

export function CurationForm() {
  const [state, setState] = useState(initialState);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  useEffect(() => {
    // Auto-scroll the log area
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
    }
  }, [state.logs]);

  const handleCuration = async () => {
    if (!firestore) {
      setState((s) => ({
        ...s,
        message: 'Firestore is not initialized. Please wait and try again.',
        error: true,
      }));
      return;
    }

    setState({ ...initialState, isRunning: true, logs: [`[${new Date().toLocaleTimeString()}] Curation process started...`] });

    const updateLog = (message: string) => {
      setState((s) => ({ ...s, logs: [...s.logs, `[${new Date().toLocaleTimeString()}] ${message}`] }));
    };

    const parser = new Parser();
    let totalNewArticles = 0;
    const ARTICLES_PER_SOURCE = 2;

    try {
      const sourcesRef = collection(firestore, 'sources');
      const sourcesSnapshot = await getDocs(sourcesRef);
      const sources = sourcesSnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Source)
      );
      updateLog(`Found ${sources.length} sources to process.`);

      const articlesCollectionRef = collection(firestore, 'articles');

      for (const source of sources) {
        if (!source.feedUrl) {
          updateLog(`Skipping source "${source.name}" - no feed URL.`);
          continue;
        }

        updateLog(`Fetching feed for "${source.name}" via proxy from ${source.feedUrl}`);
        
        try {
          const proxyUrl = `/api/cors-proxy?url=${encodeURIComponent(source.feedUrl)}`;
          const feed = await parser.parseURL(proxyUrl);
          updateLog(`Found ${feed.items.length} items in "${source.name}" feed.`);

          const batch = writeBatch(firestore);
          let articlesInBatch = 0;

          for (const item of feed.items) {
            if (articlesInBatch >= ARTICLES_PER_SOURCE) {
              updateLog(`Reached article limit for "${source.name}" for this run.`);
              break;
            }

            const originalUrl = item.link;
            if (!originalUrl) {
              updateLog(`Skipping item with no link: "${item.title}"`);
              continue;
            }

            const q = query(
              articlesCollectionRef,
              where('originalUrl', '==', originalUrl)
            );
            const existingArticleSnapshot = await getDocs(q);

            if (!existingArticleSnapshot.empty) {
              continue; // Silently skip duplicates
            }

            updateLog(`Processing new article: "${item.title?.substring(0, 50)}..."`);

            const articleContent = extractTextFromHtml(item['content:encoded'] || item.content || '');

            if (articleContent.length < 200) {
              updateLog(`Skipping article with insufficient content: "${item.title?.substring(0, 50)}..."`);
              continue;
            }

            const summaryResult = await summarizeArticle({ articleContent: articleContent.substring(0, 15000) });
            const relevanceResult = await assessArticleRelevance({ articleContent: articleContent.substring(0, 15000) });

            const newArticleRef = doc(articlesCollectionRef);
            const newArticle: Article = {
              id: newArticleRef.id,
              title: item.title || 'No Title',
              originalUrl: originalUrl,
              publishedAt: item.isoDate || new Date().toISOString(),
              aggregatedAt: new Date().toISOString(),
              summary: summaryResult.summary,
              whyThisMattersExplanation: relevanceResult.whyThisMattersExplanation,
              isRelevantMoney: relevanceResult.isRelevantMoney,
              isRelevantPolicy: relevanceResult.isRelevantPolicy,
              isRelevantOpportunity: relevanceResult.isRelevantOpportunity,
              isRelevantGrowth: relevanceResult.isRelevantGrowth,
              sourceIds: [source.id],
              categoryIds: [],
            };

            batch.set(newArticleRef, newArticle);
            articlesInBatch++;
          }

          if (articlesInBatch > 0) {
            await batch.commit();
            totalNewArticles += articlesInBatch;
            updateLog(`Added ${articlesInBatch} new articles from "${source.name}".`);
          } else {
            updateLog(`No new articles to add from "${source.name}".`);
          }
        } catch (feedError) {
          const errorMessage = (feedError as Error).message;
          updateLog(`Error for source "${source.name}": ${errorMessage}`);
        }
      }

      const finalMessage = `Curation complete. Added a total of ${totalNewArticles} new articles.`;
      updateLog(finalMessage);
      setState((s) => ({
        ...s,
        isRunning: false,
        message: finalMessage,
        error: totalNewArticles === 0 && s.logs.some(l => l.includes('Error')),
        processedCount: totalNewArticles,
      }));

    } catch (error) {
      const errorMessage = `An unexpected error occurred during curation: ${(error as Error).message}`;
      updateLog(errorMessage);
      console.error('Curation Error:', error);
      setState((s) => ({
        ...s,
        isRunning: false,
        message: errorMessage,
        error: true,
        processedCount: totalNewArticles,
      }));
    }
  };

  return (
    <>
      <Button
        onClick={handleCuration}
        disabled={state.isRunning || !firestore}
        size="lg"
        className="w-full font-bold"
      >
        {state.isRunning ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Curating...
          </>
        ) : (
          <>
            <Rss className="mr-2 h-5 w-5" /> Start Curation
          </>
        )}
      </Button>

      <div className="mt-12 scroll-mt-24">
        {state.message && (
          <Alert variant={state.error ? 'destructive' : 'default'} className="mb-8">
            {state.error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertTitle>{state.error ? 'Curation Finished with Errors' : (state.processedCount > 0 ? 'Curation Complete' : 'Curation Finished')}</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {state.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Curation Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72 w-full rounded-md border">
                <div className="p-4" ref={scrollAreaRef}>
                  {state.logs.map((log, index) => (
                    <p key={index} className="text-sm text-muted-foreground font-mono">
                      {log}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
