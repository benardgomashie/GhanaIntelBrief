/**
 * Deep probe - Part 2: Citi Business News image investigation (with aggressive timeout)
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

async function tryFeed(label, url) {
  process.stdout.write(`  Trying ${label} ... `);
  try {
    const p = parser.parseURL(url);
    const t = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 8000));
    const feed = await Promise.race([p, t]);
    console.log(`✅ OK  (${feed.items.length} items)`);
    return feed;
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
    return null;
  }
}

async function scrapeOgImageFast(articleUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GhanaIntelBrief/1.0)' },
    });
    clearTimeout(timeout);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const html = await res.text();
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) return { url: ogMatch[1], source: 'og:image' };
    const twMatch =
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch?.[1]) return { url: twMatch[1], source: 'twitter:image' };
    return { error: 'No og/twitter image found' };
  } catch (e) {
    return { error: e.message };
  }
}

(async () => {
  // ── Citi Business News ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(65));
  console.log('CITI BUSINESS NEWS — Image investigation');
  console.log('═'.repeat(65));

  const feed = await tryFeed('main feed', 'https://citibusinessnews.com/feed/');
  if (feed) {
    const item = feed.items[0];
    console.log(`\nFirst item: "${item.title}"`);
    console.log('All item keys:', Object.keys(item).join(', '));
    console.log('\nRaw image-related fields:');
    for (const k of Object.keys(item)) {
      if (/image|media|enclosure|thumb|photo|picture/i.test(k)) {
        console.log(`  ${k}:`, JSON.stringify(item[k]).substring(0, 300));
      }
    }
    // content:encoded snippet
    const ce = item['content:encoded'] || '';
    console.log('\ncontent:encoded snippet (first 500 chars):');
    console.log(ce.substring(0, 500));

    console.log(`\nScraping og:image from: ${item.link}`);
    const og = await scrapeOgImageFast(item.link);
    console.log('  Result:', og);
  }

  // Alternative URLs for Citi
  console.log('\nAlternative Citi feed URLs:');
  await tryFeed('citibusinessnews.com/feed/rss', 'https://citibusinessnews.com/feed/rss/');
  await tryFeed('citinewsroom.com/feed', 'https://citinewsroom.com/feed/');

  // ── GhanaWeb ─────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(65));
  console.log('GHANAWEB — Searching for working feed URL');
  console.log('═'.repeat(65));
  for (const u of [
    'https://www.ghanaweb.com/rss/news.xml',
    'https://www.ghanaweb.com/GhanaHomePage/NewsArchive/rss.xml',
    'https://www.ghanaweb.com/feed/',
    'https://www.ghanaweb.com/rss/business.xml',
    'https://www.ghanaweb.com/GhanaHomePage/business/rss.xml',
    'https://www.ghanaweb.com/GhanaHomePage/rss.xml',
  ]) {
    await tryFeed(u, u);
  }

  // ── Ghana News Agency ─────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(65));
  console.log('GHANA NEWS AGENCY — Searching for working feed URL');
  console.log('═'.repeat(65));
  for (const u of [
    'https://www.ghananewsagency.org/feed/',
    'https://www.ghananewsagency.org/rss.xml',
    'https://www.ghananewsagency.org/feeds/rss.xml',
    'https://ghananewsagency.org/rss/',
    'https://www.ghananewsagency.org/economics?format=rss',
    'https://www.ghananewsagency.org/business?format=rss',
  ]) {
    await tryFeed(u, u);
  }

  console.log('\nDone.');
  process.exit(0);
})();
