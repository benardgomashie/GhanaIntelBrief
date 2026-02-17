'use server';

import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import Parser from 'rss-parser';
import type { Article, Source } from '@/app/lib/types';
import { processArticle } from '@/ai/flows/article-processing-flow';

function extractTextFromHtml(html: string): string {
  let cleanHtml = html.replace(/<\/(p|div|li|h[1-6])>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<[^>]+>/g, '');
  cleanHtml = cleanHtml.replace(/\s+/g, ' ').trim();
  return cleanHtml;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  const parser = new Parser();

  try {
    const sourcesRef = adminFirestore.collection('sources');
    const sourcesSnapshot = await sourcesRef.get();
    const sources = sourcesSnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Source)
    );

    const articlesCollectionRef = adminFirestore.collection('articles');

    for (const source of sources) {
      if (!source.feedUrl) continue;

      try {
        const feed = await parser.parseURL(source.feedUrl);

        for (const item of feed.items) {
          const originalUrl = item.link;
          if (!originalUrl) {
            continue;
          }

          const q = articlesCollectionRef.where(
            'originalUrl',
            '==',
            originalUrl
          );
          const existingArticleSnapshot = await q.get();

          if (!existingArticleSnapshot.empty) {
            continue; // Article already exists, skip to the next one
          }

          // Found a new article, process it and then finish.
          console.log(`[CRON] Processing new article: "${item.title?.substring(0, 50)}..."`);
          
          const articleContent = extractTextFromHtml(item['content:encoded'] || item.content || '');
          if (articleContent.length < 200) {
            console.log(`[CRON] Skipping article with insufficient content: "${item.title?.substring(0, 50)}..."`);
            continue; // Skip this one and check the next
          }

          const analysisResult = await processArticle({ articleContent: articleContent.substring(0, 15000) });
          
          const newArticleRef = articlesCollectionRef.doc();
          const newArticle: Article = {
            id: newArticleRef.id,
            title: item.title || 'No Title',
            originalUrl: originalUrl,
            publishedAt: item.isoDate || new Date().toISOString(),
            aggregatedAt: new Date().toISOString(),
            summary: analysisResult.summary,
            whyThisMattersExplanation: analysisResult.whyThisMattersExplanation,
            isRelevantMoney: analysisResult.isRelevantMoney,
            isRelevantPolicy: analysisResult.isRelevantPolicy,
            isRelevantOpportunity: analysisResult.isRelevantOpportunity,
            isRelevantGrowth: analysisResult.isRelevantGrowth,
            sourceIds: [source.id],
            categoryIds: [],
          };

          await newArticleRef.set(newArticle);
          
          console.log(`[CRON] Successfully added one new article: "${newArticle.title}"`);
          
          // Return immediately after processing one article
          return NextResponse.json({
            success: true,
            message: `Successfully curated 1 new article: ${newArticle.title}`,
          });
        }
      } catch (feedError) {
        const errorMessage = (feedError as Error).message;
        console.error(`[CRON] Error for source "${source.name}": ${errorMessage}`);
        // Continue to the next source even if one fails
      }
    }
    
    // If we get here, no new articles were found in any feed
    console.log('[CRON] No new articles to process in any feed.');
    return NextResponse.json({
      success: true,
      message: 'No new articles found.',
    });

  } catch (error) {
    const errorMessage = `An unexpected error occurred during curation: ${(error as Error).message}`;
    console.error('[CRON] Curation Error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
