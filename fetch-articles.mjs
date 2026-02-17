const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-key-12345';
const BASE_URL = 'http://localhost:9002';
const NUM_ARTICLES = 10;

async function fetchMultipleArticles() {
  console.log(`🔍 Fetching ${NUM_ARTICLES} articles with AI analysis...\n`);
  
  for (let i = 1; i <= NUM_ARTICLES; i++) {
    console.log(`📰 Article ${i}/${NUM_ARTICLES}...`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/curate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ ${data.message}\n`);
      } else {
        console.log(`⚠️  ${data.message || 'No new articles found'}\n`);
        // If no new articles, stop trying
        if (data.message?.includes('No new articles')) {
          console.log('🛑 No more articles available at this time.');
          break;
        }
      }
      
      // Wait 2 seconds between requests
      if (i < NUM_ARTICLES) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error fetching article ${i}:`, error.message);
    }
  }
  
  console.log('\n✨ Done! Refresh your browser to see the articles.');
}

fetchMultipleArticles();
