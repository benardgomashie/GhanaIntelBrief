/**
 * One-time script to patch the image on an existing Firestore doc.
 * Run: node patch-sponsored-image.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const dotenvPath = '.env.local';
let env = {};
try {
  const raw = readFileSync(dotenvPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const [k, ...rest] = line.split('=');
    if (k && rest.length) env[k.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
} catch {}

const projectId = env.FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey = (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!getApps().length) {
  if (clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } else {
    initializeApp({ projectId });
  }
}

const db = getFirestore();

await db.collection('articles').doc('sponsored-yomhealth-referral-2026').update({
  imageThumbnailUrl: 'https://www.ghanaintelbrief.site/sponsoredfeaturedimage.png',
});

console.log('✅ Image updated.');
process.exit(0);
