/**
 * Deep probe of 4 problematic/skipped sources
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

async function scrapeOgImage(articleUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
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
    return { error: 'No og:image or twitter:image found' };
  } catch (e) {
    return { error: e.message };
  }
}

async function tryFeed(label, url) {
  process.stdout.write(`  Trying ${label} ... `);
  try {
    const p = parser.parseURL(url);
    const t = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 10000));
    const feed = await Promise.race([p, t]);
    console.log(`✅ OK  (${feed.items.length} items)`);
    return feed;
  } catch (e) {
    console.log(`❌ FAIL: ${e.message}`);
    return null;
  }
}

// ── 1. Asaase Radio ─────────────────────────────────────────────────────────
async function probeAsaase() {
  console.log('\n' + '═'.repeat(65));
  console.log('ASAASE RADIO — Content quality check');
  console.log('═'.repeat(65));
  const feed = await tryFeed('https://asaaseradio.com/feed/', 'https://asaaseradio.com/feed/');
  if (!feed) return;
  console.log('\nFirst 8 article titles:');
  feed.items.slice(0, 8).forEach((item, i) => {
    const cats = (item.categories || []).join(', ') || 'no categories';
    console.log(`  ${i+1}. "${item.title}"`);
    console.log(`     Categories: ${cats}`);
  });
  // Check for a business/economy category feed
  console.log('\nChecking category-specific feeds...');
  for (const slug of ['business', 'economy', 'finance', 'money']) {
    await tryFeed(`/category/${slug}`, `https://asaaseradio.com/category/${slug}/feed/`);
  }
}

// ── 2. Citi Business News ────────────────────────────────────────────────────
async function probeCiti() {
  console.log('\n' + '═'.repeat(65));
  console.log('CITI BUSINESS NEWS — Image investigation');
  console.log('═'.repeat(65));
  const feed = await tryFeed('https://citibusinessnews.com/feed/', 'https://citibusinessnews.com/feed/');
  if (!feed) return;

  const item = feed.items[0];
  console.log(`\nFirst item: "${item.title}"`);
  console.log('\nAll item keys:', Object.keys(item).join(', '));
  console.log('\nRaw image-related values:');
  for (const k of Object.keys(item)) {
    if (/image|media|enclosure|thumb|photo|picture/i.test(k)) {
      console.log(`  ${k}:`, JSON.stringify(item[k]).substring(0, 200));
    }
  }
  // Try scraping og:image directly
  console.log(`\nScraping og:image from article page: ${item.link}`);
  const og = await scrapeOgImage(item.link);
  console.log('  Result:', og);

  // Also check citinewsroom (different from citibusinessnews)
  console.log('\nAlso checking citinewsroom.com alternatives...');
  for (const u of [
    'https://citinewsroom.com/feed/',
    'https://citibusinessnews.com/feed/rss/',
    'https://citibusinessnews.com/rss/',
  ]) {
    await tryFeed(u, u);
  }
}

// ── 3. GhanaWeb ──────────────────────────────────────────────────────────────
async function probeGhanaWeb() {
  console.log('\n' + '═'.repeat(65));
  console.log('GHANAWEB — Searching for working feed URL');
  console.log('═'.repeat(65));
  const candidates = [
    'https://www.ghanaweb.com/rss/news.xml',
    'https://www.ghanaweb.com/GhanaHomePage/NewsArchive/rss.xml',
    'https://www.ghanaweb.com/feed/',
    'https://www.ghanaweb.com/rss/business.xml',
    'https://www.ghanaweb.com/GhanaHomePage/business/rss.xml',
  ];
  for (const u of candidates) await tryFeed(u, u);
}

// ── 4. Ghana News Agency ─────────────────────────────────────────────────────
async function probeGNA() {
  console.log('\n' + '═'.repeat(65));
  console.log('GHANA NEWS AGENCY — Searching for working feed URL');
  console.log('═'.repeat(65));
  const candidates = [
    'https://www.ghananewsagency.org/feed/',
    'https://www.ghananewsagency.org/rss.xml',
    'https://www.ghananewsagency.org/feeds/rss.xml',
    'https://www.ghananewsagency.org/rss/economics',
    'https://www.ghananewsagency.org/rss/business',
    'https://ghananewsagency.org/rss/',
  ];
  for (const u of candidates) await tryFeed(u, u);
}

(async () => {
  await probeAsaase();
  await probeCiti();
  await probeGhanaWeb();
  await probeGNA();
  console.log('\n\nDone.');
  process.exit(0);
})();
