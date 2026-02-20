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
db.collection('sources').get().then(snap => {
  console.log(`Found ${snap.docs.length} sources:\n`);
  snap.docs.forEach(d => {
    const s = d.data();
    console.log(`  ${s.name} -> ${s.feedUrl}`);
  });
  process.exit(0);
});
