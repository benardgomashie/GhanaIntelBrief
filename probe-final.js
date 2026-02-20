/**
 * Final probe - GNA raw format + Asaase finance feed only
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
  } catch (e) { console.log(`❌ ${e.message}`); return null; }
}

function extractImageFromRss(item) {
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) return item.enclosure.url;
  if (Array.isArray(item['media:content'])) {
    const m = item['media:content'].find(m => m.$.medium === 'image' || m.$.type?.startsWith('image/'))
      ?? item['media:content'].find(m => m.$.url);
    if (m?.$.url) return m.$.url;
  }
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url;
  const c = item['content:encoded'] || item.content || '';
  return c.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
}

(async () => {
  // Asaase finance feed
  console.log('═'.repeat(65));
  console.log('Asaase /category/finance feed - titles + images');
  console.log('═'.repeat(65));
  const fin = await tryFeed('https://asaaseradio.com/category/finance/feed/');
  if (fin) {
    fin.items.slice(0, 8).forEach(item => {
      const img = extractImageFromRss(item);
      const cats = (item.categories || []).slice(0, 3).join(', ');
      console.log(`  ${img ? '✅' : '⚠️ '} "${(item.title||'').substring(0, 60)}"`);
      console.log(`     Cats: ${cats}`);
    });
  }

  // GNA raw HTTP check
  console.log('\n' + '═'.repeat(65));
  console.log('GHANA NEWS AGENCY — Raw HTTP response');
  console.log('═'.repeat(65));
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://www.ghananewsagency.org/feed/', {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    console.log(`Status: ${res.status} | Content-Type: ${res.headers.get('content-type')}`);
    const text = await res.text();
    console.log('First 800 chars:\n' + text.substring(0, 800));
  } catch (e) { console.log(`Error: ${e.message}`); }

  console.log('\nDone.');
  process.exit(0);
})();
