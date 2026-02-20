'use server';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminFirestore } from '@/lib/firebase-admin';
import Parser from 'rss-parser';
import type { Article, Source } from '@/app/lib/types';
import { slugify } from '@/lib/slugify';
import { processArticle } from '@/ai/flows/article-processing-flow';

function extractTextFromHtml(html: string): string {
  let cleanHtml = html.replace(/<\/(p|div|li|h[1-6])>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<[^>]+>/g, '');
  cleanHtml = cleanHtml.replace(/\s+/g, ' ').trim();
  return cleanHtml;
}

// Quality filter to reject irrelevant or low-quality articles
function isArticleRelevant(title: string, content: string, analysisResult: any): boolean {
  // Hard reject: title contains clear gossip/entertainment keywords
  const irrelevantTitleKeywords = [
    'useless column', 'wifee', 'wife is dangerous', 'how to make your wife',
    'bedroom secrets', 'hot gossip', 'celebrity drama'
  ];
  const titleLower = title.toLowerCase();
  for (const keyword of irrelevantTitleKeywords) {
    if (titleLower.includes(keyword)) {
      console.log(`[FILTER] Rejected by title keyword "${keyword}": "${title}"`);
      return false;
    }
  }

  // Hard reject: fallback provider with ZERO relevance flags AND generic placeholder text
  const isGenericFallback = 
    analysisResult.provider === 'fallback' &&
    !analysisResult.isRelevantMoney &&
    !analysisResult.isRelevantPolicy &&
    !analysisResult.isRelevantOpportunity &&
    !analysisResult.isRelevantGrowth &&
    analysisResult.whyThisMattersExplanation?.includes('Check back for detailed');
  
  if (isGenericFallback) {
    console.log(`[FILTER] Rejected: Generic fallback with no relevance flags`);
    return false;
  }

  // Accept everything else — let Gemini's relevance flags be the main gate
  return true;
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

  // 7. description field sometimes contains an <img>
  const desc = item.description || '';
  const descImgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (descImgMatch?.[1]) {
    return descImgMatch[1];
  }
  
  return undefined;
}

// Last-resort: fetch the article page and pull the og:image / twitter:image meta tag
async function scrapeOgImage(articleUrl: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GhanaIntelBrief/1.0)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return undefined;
    const html = await res.text();
    // og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) return ogMatch[1];
    // twitter:image
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch?.[1]) return twMatch[1];
    return undefined;
  } catch {
    return undefined;
  }
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

  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'media:content', { keepArray: true }],
        ['media:thumbnail', 'media:thumbnail'],
        ['content:encoded', 'content:encoded'],
      ],
    },
  });

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
          
          // Extract image from RSS feed, fall back to scraping og:image from article page
          let imageUrl = extractImageUrl(item);
          if (!imageUrl && originalUrl) {
            console.log(`[CRON] No RSS image found, scraping og:image from article page...`);
            imageUrl = await scrapeOgImage(originalUrl);
            if (imageUrl) {
              console.log(`[CRON] og:image found: ${imageUrl.substring(0, 80)}`);
            } else {
              console.log(`[CRON] No og:image found either, will use placeholder on frontend.`);
            }
          }
          
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

          // QUALITY FILTER: Check if article is relevant before saving
          if (!isArticleRelevant(item.title || '', articleContent, analysisResult)) {
            console.log(`[CRON] Skipping irrelevant article: "${item.title?.substring(0, 50)}..."`);
            continue;
          }
          
          const newArticleRef = articlesCollectionRef.doc();
          const newArticle: Article = {
            id: newArticleRef.id,
            slug: slugify(item.title || 'article'),
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

          // Immediately bust the homepage and sitemap ISR caches so the new
          // article is discoverable by crawlers without waiting for TTL expiry.
          revalidatePath('/');
          revalidatePath('/sitemap.xml');

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
