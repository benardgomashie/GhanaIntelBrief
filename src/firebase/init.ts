import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // This is the standard initialization pattern for Next.js
    const firebaseApp = initializeApp(firebaseConfig);
    const sdks = getSdks(firebaseApp);
    
    // Enable offline persistence with unlimited cache
    // This reduces the number of network requests and connection attempts
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(sdks.firestore, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      }).catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          // The current browser doesn't support persistence
          console.warn('Firestore persistence not available in this browser');
        }
      });
    }
    
    return sdks;
  }
  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
