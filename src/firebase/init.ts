import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // This is the standard initialization pattern for Next.js
    const firebaseApp = initializeApp(firebaseConfig);
    
    // Initialize Firestore with modern persistent cache settings
    // This replaces the deprecated enableIndexedDbPersistence()
    if (typeof window !== 'undefined') {
      try {
        initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
      } catch (err) {
        // Firestore may already be initialized, which is fine
        console.debug('Firestore already initialized');
      }
    }
    
    return getSdks(firebaseApp);
  }
  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export async function getFirebaseAnalytics(firebaseApp: FirebaseApp): Promise<Analytics | null> {
  try {
    const supported = await isSupported();
    if (supported) return getAnalytics(firebaseApp);
    return null;
  } catch {
    return null;
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
