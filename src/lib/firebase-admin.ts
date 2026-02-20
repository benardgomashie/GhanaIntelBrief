import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let firestore: Firestore;

// Initialize Firebase Admin SDK
const existingApps = getApps();
if (existingApps.length === 0) {
  // Check if we have explicit credentials (for local development)
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    app = initializeApp({
      projectId: projectId,
      credential: cert({
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \n with actual newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Fall back to default credentials (works in Vercel/Firebase App Hosting)
    app = initializeApp();
  }

  // Only call settings() on a freshly initialised instance — calling it again
  // on an existing instance (e.g. after a hot-reload in dev) throws an error.
  firestore = getFirestore(app);
  firestore.settings({ ignoreUndefinedProperties: true });
} else {
  app = existingApps[0];
  firestore = getFirestore(app);
}

export { app as adminApp, firestore as adminFirestore };
