import admin from 'firebase-admin';
import { config } from 'dotenv';

config();

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function listArticles() {
  console.log('📚 Articles in Firebase:\n');
  
  try {
    const articlesRef = db.collection('articles');
    const snapshot = await articlesRef.orderBy('aggregatedAt', 'desc').get();
    
    if (snapshot.size === 0) {
      console.log('⚠️  No articles found!');
      process.exit(0);
    }
    
    console.log(`Found ${snapshot.size} article(s):\n`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.title}`);
      console.log(`   Provider: ${data.aiProvider || 'unknown'}`);
      console.log(`   Why This Matters: ${data.whyThisMattersExplanation?.substring(0, 80)}...`);
      console.log(`   Summary Length: ${data.summary?.length || 0} chars`);
      console.log(`   Time: ${new Date(data.aggregatedAt).toLocaleString()}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

listArticles();
