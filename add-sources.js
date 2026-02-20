const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const newSources = [
  {
    name: 'Ghana Business News',
    feedUrl: 'https://www.ghanabusinessnews.com/feed/',
    websiteUrl: 'https://www.ghanabusinessnews.com',
    description: 'Business and economic news focused on Ghana',
  },
  {
    name: 'Starrfm Online',
    feedUrl: 'https://starrfm.com.gh/feed/',
    websiteUrl: 'https://starrfm.com.gh',
    description: 'News and current affairs from Starr FM Ghana',
  },
  {
    name: 'The Business & Financial Times',
    feedUrl: 'https://thebftonline.com/feed/',
    websiteUrl: 'https://thebftonline.com',
    description: 'Ghana\'s leading business and financial newspaper',
  },
];

(async () => {
  const sourcesRef = db.collection('sources');

  for (const source of newSources) {
    // Check if a source with this feedUrl already exists
    const existing = await sourcesRef.where('feedUrl', '==', source.feedUrl).get();
    if (!existing.empty) {
      console.log(`⏭  Already exists: ${source.name}`);
      continue;
    }
    const docRef = sourcesRef.doc();
    await docRef.set({ ...source, id: docRef.id, createdAt: new Date().toISOString() });
    console.log(`✅ Added: ${source.name} (${docRef.id})`);
  }

  // Print all sources
  console.log('\n--- All sources now in Firestore ---');
  const all = await sourcesRef.get();
  all.docs.forEach(d => {
    const s = d.data();
    console.log(`  ${s.name} -> ${s.feedUrl}`);
  });

  process.exit(0);
})();
