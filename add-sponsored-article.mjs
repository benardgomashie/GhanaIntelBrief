/**
 * One-time script to insert a sponsored article into Firestore.
 * Run: node add-sponsored-article.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load env
const dotenvPath = '.env.local';
let env = {};
try {
  const raw = readFileSync(dotenvPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const [k, ...rest] = line.split('=');
    if (k && rest.length) env[k.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
} catch {}

const projectId =
  env.FIREBASE_PROJECT_ID ||
  env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!getApps().length) {
  if (clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } else {
    initializeApp({ projectId });
  }
}

const db = getFirestore();

// Slugify helper
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const title = 'Use Yom Health Without Paying for a Subscription Through Referrals';
const id = 'sponsored-yomhealth-referral-2026';
const slug = slugify(title);
const now = new Date().toISOString();

const article = {
  id,
  slug,
  title,
  originalUrl: 'https://yomhealth.com/blog/referral-program-free-access',
  publishedAt: now,
  aggregatedAt: now,
  summary:
    '- Share your referral code with friends, family, or colleagues to earn +3 extra free days on Yom Health.\n' +
    '- New users must sign up with your code and verify their phone via OTP to trigger the reward.\n' +
    '- The referral program is open to both patients and healthcare professionals.\n' +
    '- Available on the latest Yom Health app (Play Store) and the Yom Health web app.\n' +
    '- Every successful referral strengthens the healthcare network connecting Ghanaians with care.',
  whyThisMattersExplanation:
    'Yom Health is building accessible, real-time medical care in Ghana. ' +
    'Their referral program lets users extend free access simply by inviting others — ' +
    'no payment required. As Ghana\'s digital health ecosystem grows, platforms like Yom Health ' +
    'that lower the barrier to care are critical for communities across the country.',
  imageThumbnailUrl: 'https://yomhealth.com/og-image.png',
  isRelevantMoney: false,
  isRelevantPolicy: false,
  isRelevantOpportunity: true,
  isRelevantGrowth: true,
  sponsored: true,
  sourceIds: [],
  categoryIds: [],
};

const ref = db.collection('articles').doc(id);
await ref.set(article);
console.log(`✅ Sponsored article inserted: /article/${id}/${slug}`);
process.exit(0);
