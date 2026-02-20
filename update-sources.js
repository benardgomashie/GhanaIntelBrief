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

(async () => {
  const ref = db.collection('sources');

  // 1. Remove GhanaWeb
  const ghanawebSnap = await ref.where('feedUrl', '==', 'https://www.ghanaweb.com/feed/category/general').get();
  if (!ghanawebSnap.empty) {
    await ghanawebSnap.docs[0].ref.delete();
    console.log('🗑  Removed: GhanaWeb (broken DNS)');
  } else {
    console.log('⏭  GhanaWeb not found (already removed?)');
  }

  // 2. Add Asaase Radio business category
  const asaaseUrl = 'https://asaaseradio.com/category/business/feed/';
  const existingSnap = await ref.where('feedUrl', '==', asaaseUrl).get();
  if (!existingSnap.empty) {
    console.log('⏭  Already exists: Asaase Radio Business');
  } else {
    const docRef = ref.doc();
    await docRef.set({
      id: docRef.id,
      name: 'Asaase Radio',
      feedUrl: asaaseUrl,
      websiteUrl: 'https://asaaseradio.com',
      description: 'Business and economy coverage from Asaase Radio Ghana',
      createdAt: new Date().toISOString(),
    });
    console.log(`✅ Added: Asaase Radio Business (${docRef.id})`);
  }

  // Print final source list
  console.log('\n--- Final sources in Firestore ---');
  const all = await ref.get();
  all.docs.forEach(d => {
    const s = d.data();
    console.log(`  ${s.name} -> ${s.feedUrl}`);
  });

  process.exit(0);
})();
