import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let firestore: Firestore;

// This relies on the hosting environment (like Vercel or Firebase App Hosting)
// to provide the necessary Google Cloud credentials via environment variables.
if (getApps().length === 0) {
  app = initializeApp();
} else {
  app = getApps()[0];
}

firestore = getFirestore(app);

export { app as adminApp, firestore as adminFirestore };
