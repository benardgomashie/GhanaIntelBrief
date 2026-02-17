import Parser from 'rss-parser';
import { config } from 'dotenv';

config();

function extractImageUrl(item) {
  // Try various RSS image fields in order of preference
  
  // 1. Media enclosures (common in RSS 2.0)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return { source: 'enclosure', url: item.enclosure.url };
  }
  
  // 2. Media:content (common in news feeds)
  if (item['media:content']?.$ && item['media:content'].$.url) {
    return { source: 'media:content', url: item['media:content'].$.url };
  }
  if (Array.isArray(item['media:content'])) {
    const imageMedia = item['media:content'].find((media) => 
      media.$.medium === 'image' || media.$.type?.startsWith('image/')
    );
    if (imageMedia?.$.url) return { source: 'media:content[]', url: imageMedia.$.url };
  }
  
  // 3. Media:thumbnail
  if (item['media:thumbnail']?.$ && item['media:thumbnail'].$.url) {
    return { source: 'media:thumbnail', url: item['media:thumbnail'].$.url };
  }
  
  // 4. iTunes image
  if (item.itunes?.image) {
    return { source: 'itunes', url: item.itunes.image };
  }
  
  // 5. Extract from content HTML
  const content = item['content:encoded'] || item.content || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return { source: 'content-html', url: imgMatch[1] };
  }
  
  // 6. Standard image field
  if (item.image?.url) {
    return { source: 'image.url', url: item.image.url };
  }
  if (typeof item.image === 'string') {
    return { source: 'image', url: item.image };
  }
  
  return null;
}

async function testImageExtraction() {
  console.log('🖼️  Testing RSS image extraction...\n');
  
  const parser = new Parser();
  
  // Test with common Ghana news feeds
  const testFeeds = [
    'https://citinewsroom.com/feed/',
    'https://www.myjoyonline.com/feed/',
    'https://www.ghanaweb.com/GhanaHomePage/rss/news.xml'
  ];
  
  for (const feedUrl of testFeeds) {
    try {
      console.log(`\n📡 Testing: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      console.log(`   Found ${feed.items.length} articles`);
      
      // Test first 3 items
      for (let i = 0; i < Math.min(3, feed.items.length); i++) {
        const item = feed.items[i];
        const image = extractImageUrl(item);
        
        console.log(`\n   ${i + 1}. ${item.title?.substring(0, 60)}...`);
        if (image) {
          console.log(`      ✅ Image found via: ${image.source}`);
          console.log(`      URL: ${image.url.substring(0, 80)}...`);
        } else {
          console.log(`      ❌ No image found`);
          console.log(`      Available fields:`, Object.keys(item).join(', '));
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }
  }
}

testImageExtraction();
