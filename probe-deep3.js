/**
 * Check Asaase Radio business/finance category feeds content quality
 * and test their images
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

async function tryFeed(url) {
  try {
    const p = parser.parseURL(url);
    const t = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 8000));
    return await Promise.race([p, t]);
  } catch (e) {
    console.log(`❌ ${url}: ${e.message}`);
    return null;
  }
}

async function scrapeOgImage(articleUrl) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GhanaIntelBrief/1.0)' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m?.[1] ?? null;
  } catch { return null; }
}

function extractImageFromRss(item) {
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) return item.enclosure.url;
  if (Array.isArray(item['media:content'])) {
    const m = item['media:content'].find(m => m.$.medium === 'image' || m.$.type?.startsWith('image/')) 
      ?? item['media:content'].find(m => m.$.url);
    if (m?.$.url) return m.$.url;
  }
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  const content = item['content:encoded'] || item.content || '';
  const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

(async () => {
  const FEEDS = [
    { label: 'Asaase /category/business', url: 'https://asaaseradio.com/category/business/feed/' },
    { label: 'Asaase /category/finance',  url: 'https://asaaseradio.com/category/finance/feed/' },
  ];

  for (const { label, url } of FEEDS) {
    console.log('\n' + '═'.repeat(65));
    console.log(label);
    console.log('═'.repeat(65));
    const feed = await tryFeed(url);
    if (!feed) continue;

    let rssHits = 0, ogHits = 0, misses = 0;
    for (const item of feed.items.slice(0, 8)) {
      const title = (item.title || '').substring(0, 60);
      const cats = (item.categories || []).slice(0, 4).join(', ');
      let imgUrl = extractImageFromRss(item);
      let imgSource = imgUrl ? 'RSS' : null;
      if (!imgUrl) {
        imgUrl = await scrapeOgImage(item.link);
        imgSource = imgUrl ? 'og:image' : null;
      }
      if (imgUrl) {
        imgSource === 'RSS' ? rssHits++ : ogHits++;
        console.log(`  ✅ [${imgSource}] "${title}"`);
        console.log(`     Categories: ${cats}`);
      } else {
        misses++;
        console.log(`  ❌ [NO IMAGE] "${title}"`);
        console.log(`     Categories: ${cats}`);
      }
    }
    console.log(`\n  Summary: ${rssHits} RSS | ${ogHits} scraped | ${misses} no image`);
  }

  // Also fetch GNA as raw HTML to understand what format their "feed" returns
  console.log('\n' + '═'.repeat(65));
  console.log('GHANA NEWS AGENCY — Raw feed format check');
  console.log('═'.repeat(65));
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://www.ghananewsagency.org/feed/', {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    console.log(`HTTP status: ${res.status}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);
    const text = await res.text();
    console.log('First 600 chars of response:');
    console.log(text.substring(0, 600));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  // Check if Citi Business News articles simply have no images on their pages at all
  console.log('\n' + '═'.repeat(65));
  console.log('CITI BUSINESS NEWS — Does their website have images at all?');
  console.log('═'.repeat(65));
  const citi = await tryFeed('https://citibusinessnews.com/feed/');
  if (citi) {
    for (const item of citi.items.slice(0, 3)) {
      const title = (item.title || '').substring(0, 55);
      console.log(`\n  Article: "${title}"`);
      console.log(`  URL: ${item.link}`);
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);
        const res = await fetch(item.link, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const html = await res.text();
        // find ALL meta image tags
        const metas = [...html.matchAll(/<meta[^>]+(og:image|twitter:image)[^>]*>/gi)].map(m => m[0].substring(0, 150));
        if (metas.length) {
          console.log(`  Meta image tags found: ${metas.length}`);
          metas.forEach(m => console.log(`    ${m}`));
        } else {
          console.log(`  ❌ Zero og:image / twitter:image meta tags on this page`);
        }
        // find img tags
        const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]).filter(s => !s.includes('data:')).slice(0, 3);
        console.log(`  <img> tags (first 3): ${imgs.join(' | ') || 'none'}`);
      } catch (e) {
        console.log(`  Fetch error: ${e.message}`);
      }
    }
  }

  console.log('\nDone.');
  process.exit(0);
})();
