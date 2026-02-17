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

async function deleteAllArticles() {
  console.log('🗑️  Deleting ALL articles from Firebase...\n');
  
  try {
    const articlesRef = db.collection('articles');
    const snapshot = await articlesRef.get();
    
    console.log(`Found ${snapshot.size} total articles`);
    
    if (snapshot.size === 0) {
      console.log('✅ No articles to delete!');
      process.exit(0);
    }
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - Deleting: ${data.title} (provider: ${data.aiProvider || 'unknown'})`);
      deletePromises.push(articlesRef.doc(doc.id).delete());
    });
    
    await Promise.all(deletePromises);
    
    console.log(`\n✅ Deleted ${snapshot.size} articles!`);
    console.log('🔄 Now fetch fresh articles with working Gemini API');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

deleteAllArticles();
