import admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Firebase Admin
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

async function cleanupFallbackArticles() {
  console.log('🔍 Searching for fallback articles...');
  
  try {
    const articlesRef = db.collection('articles');
    const snapshot = await articlesRef.get();
    
    const fallbackArticles = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Identify fallback articles by checking if aiProvider is 'fallback'
      // or if summary contains fallback text
      const summaryText = Array.isArray(data.summary) 
        ? data.summary.join(' ') 
        : (data.summary || '');
        
      if (
        data.aiProvider === 'fallback' ||
        summaryText.includes('AI analysis temporarily unavailable') ||
        summaryText.includes('Please check back later')
      ) {
        fallbackArticles.push({
          id: doc.id,
          title: data.title,
          aiProvider: data.aiProvider,
        });
      }
    });
    
    if (fallbackArticles.length === 0) {
      console.log('✅ No fallback articles found!');
      return;
    }
    
    console.log(`\n📋 Found ${fallbackArticles.length} fallback article(s):`);
    fallbackArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   ID: ${article.id}`);
      console.log(`   Provider: ${article.aiProvider || 'unknown'}\n`);
    });
    
    console.log('🗑️  Deleting fallback articles...');
    
    const deletePromises = fallbackArticles.map((article) =>
      articlesRef.doc(article.id).delete()
    );
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${fallbackArticles.length} fallback article(s)!`);
    console.log('🔄 Refresh your browser to see the updated list');
    
  } catch (error) {
    console.error('❌ Error cleaning up articles:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

cleanupFallbackArticles();
