'use server';

import { initializeFirebase } from '@/firebase/init';
import { assessArticleRelevance } from '@/ai/flows/relevance-assessment-flow';
import { summarizeArticle } from '@/ai/flows/article-summarization-flow';
import type { Article, Source } from '@/app/lib/types';
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';
import Parser from 'rss-parser';

function extractTextFromHtml(html: string): string {
    // Replace block-level tags with a space
    let cleanHtml = html.replace(/<\/(p|div|li|h[1-6])>/gi, ' ');
    // Remove all other HTML tags
    cleanHtml = cleanHtml.replace(/<[^>]+>/g, '');
    // Replace multiple whitespace characters with a single space
    cleanHtml = cleanHtml.replace(/\s+/g, ' ').trim();
    return cleanHtml;
}


export interface CurationState {
  logs: string[];
  processedCount: number;
  message?: string;
  error?: boolean;
}

export async function curateFeedsAction(
  prevState: CurationState,
  formData: FormData
): Promise<CurationState> {
  const { firestore } = initializeFirebase();
  const parser = new Parser();
  const logs: string[] = [];
  let totalNewArticles = 0;

  const updateLog = (message: string) => {
    // In a real streaming scenario, this would send updates.
    // For a single-return server action, we just accumulate logs.
    logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
  };

  updateLog('Curation process started...');

  try {
    const sourcesRef = collection(firestore, 'sources');
    const sourcesSnapshot = await getDocs(sourcesRef);
    const sources = sourcesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Source));
    updateLog(`Found ${sources.length} sources to process.`);

    const articlesCollectionRef = collection(firestore, 'articles');
    
    for (const source of sources) {
        if (!source.feedUrl) {
            updateLog(`Skipping source "${source.name}" - no feed URL.`);
            continue;
        }

        updateLog(`Fetching feed for "${source.name}" from ${source.feedUrl}`);
        let sourceNewArticles = 0;

        try {
            const feed = await parser.parseURL(source.feedUrl);
            updateLog(`Found ${feed.items.length} items in "${source.name}" feed.`);
            
            const batch = writeBatch(firestore);

            for (const item of feed.items) {
                const originalUrl = item.link;
                if (!originalUrl) {
                    updateLog(`Skipping item with no link: "${item.title}"`);
                    continue;
                }

                const q = query(articlesCollectionRef, where('originalUrl', '==', originalUrl));
                const existingArticleSnapshot = await getDocs(q);

                if (!existingArticleSnapshot.empty) {
                    continue; // Silently skip duplicates to keep log clean
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
                sourceNewArticles++;
                totalNewArticles++;
            }

            if (sourceNewArticles > 0) {
                await batch.commit();
                updateLog(`Added ${sourceNewArticles} new articles from "${source.name}".`);
            } else {
                updateLog(`No new articles to add from "${source.name}".`);
            }
        } catch (feedError) {
            updateLog(`Error for source "${source.name}": ${(feedError as Error).message}`);
        }
    }

    const finalMessage = `Curation complete. Added a total of ${totalNewArticles} new articles.`;
    updateLog(finalMessage);
    return {
        logs,
        processedCount: totalNewArticles,
        message: finalMessage,
        error: false,
    };

  } catch (error) {
    const errorMessage = `An unexpected error occurred during curation: ${(error as Error).message}`;
    updateLog(errorMessage);
    console.error("Curation Error:", error);
    return {
      logs,
      processedCount: totalNewArticles,
      message: errorMessage,
      error: true,
    };
  }
}
