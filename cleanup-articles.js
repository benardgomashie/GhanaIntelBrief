// Script to delete irrelevant/fallback articles from Firestore
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: key,
  }),
});

const db = admin.firestore();

async function cleanupArticles() {
  const snap = await db.collection('articles').get();
  
  const toDelete = [];
  
  snap.forEach(doc => {
    const d = doc.data();
    const title = (d.title || '').toLowerCase();
    const summary = (d.summary || '').toLowerCase();
    const whyItMatters = (d.whyThisMattersExplanation || '').toLowerCase();
    
    // Delete if:
    // 1. AI provider is fallback AND no real relevance flags
    const isFallbackWithNoRelevance = d.aiProvider === 'fallback' && 
      !d.isRelevantMoney && !d.isRelevantPolicy && !d.isRelevantOpportunity && !d.isRelevantGrowth;
    
    // 2. Contains gossip/irrelevant keywords in title
    const irrelevantTitleKeywords = ['useless column', 'wifee', 'wife is dangerous', 'how to make your wife'];
    const hasBadTitle = irrelevantTitleKeywords.some(k => title.includes(k));
    
    // 3. Generic fallback "Check back" placeholder message
    const hasPlaceholderAnalysis = whyItMatters.includes('check back for detailed ai analysis');
    
    if (hasBadTitle || (isFallbackWithNoRelevance && hasPlaceholderAnalysis)) {
      toDelete.push({ id: doc.id, title: d.title, reason: hasBadTitle ? 'Bad title' : 'Fallback with no relevance' });
    }
  });
  
  console.log(`\nFound ${toDelete.length} articles to delete:\n`);
  toDelete.forEach(a => console.log(`  [${a.reason}] "${a.title}"`));
  
  if (toDelete.length === 0) {
    console.log('Nothing to delete!');
    process.exit(0);
  }
  
  // Delete them
  const batch = db.batch();
  toDelete.forEach(a => batch.delete(db.collection('articles').doc(a.id)));
  await batch.commit();
  
  console.log(`\n✅ Deleted ${toDelete.length} articles successfully.`);
  process.exit(0);
}

cleanupArticles().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
