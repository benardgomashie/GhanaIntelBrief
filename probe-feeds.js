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

async function probeFeed(name, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`FEED: ${name} (${url})`);
  console.log('='.repeat(60));
  try {
    const feed = await parser.parseURL(url);
    const item = feed.items[0];
    if (!item) { console.log('  No items found'); return; }

    console.log(`\nFirst item: "${item.title}"`);
    console.log('\n--- Image-related fields ---');

    const imageFields = [
      'enclosure', 'image', 'itunes',
      'media:content', 'media:thumbnail',
      'content:encoded',
    ];
    for (const f of imageFields) {
      if (item[f] !== undefined) {
        const val = typeof item[f] === 'string'
          ? item[f].substring(0, 200)
          : JSON.stringify(item[f]).substring(0, 300);
        console.log(`  ${f}: ${val}`);
      }
    }

    // Show all keys on the item so we don't miss anything
    console.log('\n--- All item keys ---');
    console.log(' ', Object.keys(item).join(', '));
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }
}

(async () => {
  await probeFeed('Joy Online', 'https://www.myjoyonline.com/feed/');
  await probeFeed('GhanaWeb', 'https://www.ghanaweb.com/feed/category/general');
  process.exit(0);
})();
