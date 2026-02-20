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

admin.firestore().collection('articles').orderBy('aggregatedAt', 'desc').limit(3).get().then(snap => {
  let i = 1;
  snap.forEach(doc => {
    const d = doc.data();
    console.log(`\n========== ARTICLE ${i++} ==========`);
    console.log('TITLE:      ', d.title);
    console.log('AI PROVIDER:', d.aiProvider);
    console.log('SAVED AT:   ', d.aggregatedAt);
    console.log('HAS SUMMARY:', !!d.summary, '| LENGTH:', d.summary?.length || 0);
    console.log('\nSUMMARY:');
    console.log(d.summary || '(none)');
    console.log('\nWHY IT MATTERS:');
    console.log(d.whyThisMattersExplanation || '(none)');
    console.log('\nRELEVANCE TAGS:');
    console.log('  Money:', d.isRelevantMoney, '| Policy:', d.isRelevantPolicy, '| Opportunity:', d.isRelevantOpportunity, '| Growth:', d.isRelevantGrowth);
  });
  process.exit(0);
}).catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
