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

function extractImageUrl(item: any): string | undefined {
  // Try various RSS image fields in order of preference
  
  // 1. Media enclosures (common in RSS 2.0)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // 2. Media:content (common in news feeds)
  if (item['media:content']?.$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (Array.isArray(item['media:content'])) {
    const imageMedia = item['media:content'].find((media: any) => 
      media.$.medium === 'image' || media.$.type?.startsWith('image/')
    );
    if (imageMedia?.$.url) return imageMedia.$.url;
  }
  
  // 3. Media:thumbnail
  if (item['media:thumbnail']?.$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  
  // 4. iTunes image
  if (item.itunes?.image) {
    return item.itunes.image;
  }
  
  // 5. Extract from content HTML
  const content = item['content:encoded'] || item.content || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  // 6. Standard image field
  if (item.image?.url) {
    return item.image.url;
  }
  if (typeof item.image === 'string') {
    return item.image;
  }
  
  return undefined;
}

async function handleCuration(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  console.log('[CRON] Auth check:', {
    received: authHeader,
    expected: expectedAuth,
    secretLength: process.env.CRON_SECRET?.length,
    match: authHeader === expectedAuth
  });
  
  if (authHeader !== expectedAuth) {
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
    const newArticlesTitles: string[] = [];
    const maxArticlesPerRun = 5; // Process up to 5 new articles per run

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

          // Check if we've reached the limit for this run
          if (newArticlesTitles.length >= maxArticlesPerRun) {
            console.log(`[CRON] Reached limit of ${maxArticlesPerRun} articles for this run, stopping.`);
            break;
          }

          // Found a new article, process it
          console.log(`[CRON] Processing new article: "${item.title?.substring(0, 50)}..."`);
          
          const articleContent = extractTextFromHtml(item['content:encoded'] || item.content || '');
          if (articleContent.length < 200) {
            console.log(`[CRON] Skipping article with insufficient content: "${item.title?.substring(0, 50)}..."`);
            continue; // Skip this one and check the next
          }

          const analysisResult = await processArticle({ articleContent: articleContent.substring(0, 15000) });
          
          // Extract image from RSS feed
          const imageUrl = extractImageUrl(item);
          
          console.log('[CRON] Analysis result:', {
            provider: analysisResult.provider,
            summaryLength: analysisResult.summary?.length,
            whyThisMatters: analysisResult.whyThisMattersExplanation?.substring(0, 100),
            imageUrl,
            relevance: {
              money: analysisResult.isRelevantMoney,
              policy: analysisResult.isRelevantPolicy,
              opportunity: analysisResult.isRelevantOpportunity,
              growth: analysisResult.isRelevantGrowth
            }
          });
          
          const newArticleRef = articlesCollectionRef.doc();
          const newArticle: Article = {
            id: newArticleRef.id,
            title: item.title || 'No Title',
            originalUrl: originalUrl,
            publishedAt: item.isoDate || new Date().toISOString(),
            aggregatedAt: new Date().toISOString(),
            summary: analysisResult.summary,
            whyThisMattersExplanation: analysisResult.whyThisMattersExplanation,
            imageThumbnailUrl: imageUrl,
            isRelevantMoney: analysisResult.isRelevantMoney,
            isRelevantPolicy: analysisResult.isRelevantPolicy,
            isRelevantOpportunity: analysisResult.isRelevantOpportunity,
            isRelevantGrowth: analysisResult.isRelevantGrowth,
            aiProvider: analysisResult.provider || 'unknown',
            sourceIds: [source.id],
            categoryIds: [],
          };

          console.log('[CRON] Saving article to Firebase:', {
            id: newArticle.id,
            title: newArticle.title,
            aiProvider: newArticle.aiProvider,
            hasImage: !!newArticle.imageThumbnailUrl,
            imageUrl: newArticle.imageThumbnailUrl?.substring(0, 60),
            whyThisMattersExplanation: newArticle.whyThisMattersExplanation?.substring(0, 100)
          });

          await newArticleRef.set(newArticle);
          
          console.log(`[CRON] Successfully added one new article: "${newArticle.title}"`);
          newArticlesTitles.push(newArticle.title);
          
          // Continue to the next article (instead of returning immediately)
        }
        
        // Check if we've reached the limit after processing this source
        if (newArticlesTitles.length >= maxArticlesPerRun) {
          console.log(`[CRON] Reached limit of ${maxArticlesPerRun} articles, stopping source iteration.`);
          break;
        }
      } catch (feedError) {
        const errorMessage = (feedError as Error).message;
        console.error(`[CRON] Error for source "${source.name}": ${errorMessage}`);
        // Continue to the next source even if one fails
      }
    }
    
    // Return results based on how many articles were processed
    if (newArticlesTitles.length > 0) {
      const message = newArticlesTitles.length === 1
        ? `Successfully curated 1 new article: ${newArticlesTitles[0]}`
        : `Successfully curated ${newArticlesTitles.length} new articles`;
      
      return NextResponse.json({
        success: true,
        message,
        count: newArticlesTitles.length,
        titles: newArticlesTitles
      });
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

// Export both GET and POST handlers (cron services may use either)
export async function GET(request: NextRequest) {
  return handleCuration(request);
}

export async function POST(request: NextRequest) {
  return handleCuration(request);
}
