/**
 * Tests image extraction against live RSS feeds.
 * Mirrors the exact logic in src/app/api/curate/route.ts
 */
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: true }],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
});

// ── Mirror of extractImageUrl from curate/route.ts ──────────────────────────
function extractImageUrl(item) {
  // 1. Media enclosures
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return { url: item.enclosure.url, source: 'enclosure' };
  }
  // 2. media:content (single object)
  if (item['media:content']?.$?.url && !Array.isArray(item['media:content'])) {
    return { url: item['media:content'].$.url, source: 'media:content (object)' };
  }
  // 3. media:content (array)
  if (Array.isArray(item['media:content'])) {
    const imageMedia = item['media:content'].find(
      m => m.$.medium === 'image' || m.$.type?.startsWith('image/')
    );
    if (imageMedia?.$.url) return { url: imageMedia.$.url, source: 'media:content (array)' };
    // fallback: first entry with a url
    const anyMedia = item['media:content'].find(m => m.$.url);
    if (anyMedia?.$.url) return { url: anyMedia.$.url, source: 'media:content (array, first)' };
  }
  // 4. media:thumbnail
  if (item['media:thumbnail']?.$?.url) {
    return { url: item['media:thumbnail'].$.url, source: 'media:thumbnail' };
  }
  // 5. iTunes image
  if (item.itunes?.image) {
    return { url: item.itunes.image, source: 'itunes' };
  }
  // 6. <img> in content:encoded
  const content = item['content:encoded'] || item.content || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return { url: imgMatch[1], source: 'content:encoded <img>' };
  // 7. Standard image field
  if (item.image?.url) return { url: item.image.url, source: 'image.url' };
  if (typeof item.image === 'string') return { url: item.image, source: 'image (string)' };
  // 8. <img> in description
  const desc = item.description || '';
  const descMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (descMatch?.[1]) return { url: descMatch[1], source: 'description <img>' };

  return null;
}

// ── Mirror of scrapeOgImage from curate/route.ts ────────────────────────────
async function scrapeOgImage(articleUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GhanaIntelBrief/1.0)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) return { url: ogMatch[1], source: 'og:image (scraped)' };
    const twMatch =
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch?.[1]) return { url: twMatch[1], source: 'twitter:image (scraped)' };
    return null;
  } catch (e) {
    return null;
  }
}

// ── Test runner ──────────────────────────────────────────────────────────────
const FEEDS = [
  { name: 'Ghana Business News', url: 'https://www.ghanabusinessnews.com/feed/' },
  { name: 'Starrfm Online',      url: 'https://starrfm.com.gh/feed/' },
  { name: 'Ghana News Agency',   url: 'https://www.ghananewsagency.org/feed/' },
  { name: 'Asaase Radio',        url: 'https://asaaseradio.com/feed/' },
  { name: 'The Business & Financial Times', url: 'https://thebftonline.com/feed/' },
  { name: 'Citi Business News',  url: 'https://citibusinessnews.com/feed/' },
];
const ITEMS_TO_TEST = 5; // test first N articles per feed

async function testFeed(name, url) {
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`SOURCE: ${name}`);
  console.log(`URL   : ${url}`);
  console.log('═'.repeat(65));

  let feed;
  try {
    const feedPromise = parser.parseURL(url);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Feed fetch timed out after 10s')), 10000)
    );
    feed = await Promise.race([feedPromise, timeoutPromise]);
  } catch (e) {
    console.log(`  ❌ Feed fetch failed: ${e.message}`);
    return;
  }

  const items = feed.items.slice(0, ITEMS_TO_TEST);
  let rssHits = 0, ogHits = 0, misses = 0;

  for (const item of items) {
    const title = (item.title || 'Untitled').substring(0, 55);
    let result = extractImageUrl(item);

    if (result) {
      rssHits++;
      console.log(`  ✅ [RSS / ${result.source.padEnd(26)}] "${title}"`);
      console.log(`     ${result.url.substring(0, 90)}`);
    } else {
      // try og:image scrape
      process.stdout.write(`  ⏳ [no RSS image — scraping page...] "${title}"\r`);
      result = await scrapeOgImage(item.link);
      if (result) {
        ogHits++;
        console.log(`  ✅ [${result.source.padEnd(30)}] "${title}"`);
        console.log(`     ${result.url.substring(0, 90)}`);
      } else {
        misses++;
        console.log(`  ❌ [NO IMAGE — placeholder will show  ] "${title}"`);
      }
    }
  }

  console.log(`\n  Summary: ${rssHits} from RSS | ${ogHits} scraped from page | ${misses} no image (placeholder)`);
}

(async () => {
  console.log('Testing image extraction against live feeds...\n');
  for (const feed of FEEDS) {
    await testFeed(feed.name, feed.url);
  }
  console.log('\n\nDone.');
  process.exit(0);
})();
