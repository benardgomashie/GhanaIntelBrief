# 🚨 Why No New Articles Are Showing

Your app is showing **dummy/seed data** because the article curation system needs **Firebase Admin SDK credentials** to work.

## Current Status

✅ **Client-Side Firebase**: Working (can read dummy articles)  
❌ **Server-Side Firebase Admin**: Not configured (can't fetch RSS feeds or save new articles)  
❌ **Cron Job**: Can't run without admin credentials

---

## 📝 Solution: Add Firebase Admin Credentials

### Step 1: Get Service Account Key

1. Go to Firebase Console:  
   https://console.firebase.google.com/project/studio-5727160516-10668/settings/serviceaccounts/adminsdk

2. Click **"Generate new private key"**

3. Download the JSON file

### Step 2: Add Credentials to `.env`

Open the downloaded JSON file and copy these values to your `.env`:

```bash
# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=studio-5727160516-10668
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studio-5727160516-10668.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important**: Keep the quotes around `FIREBASE_PRIVATE_KEY` and the `\n` characters!

### Step 3: Add to Vercel (for production)

Same variables needed in Vercel → Settings → Environment Variables

### Step 4: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing Article Curation

Once credentials are added, test manually:

### Option 1: Test Script
```bash
node test-curation.mjs
```

### Option 2: PowerShell
```powershell
$headers = @{ "Authorization" = "Bearer a_very_secret_and_random_string_for_cron" }
Invoke-WebRequest -Uri "http://localhost:9002/api/curate" -Headers $headers
```

### Option 3: curl
```bash
curl -H "Authorization: Bearer a_very_secret_and_random_string_for_cron" http://localhost:9002/api/curate
```

---

## ℹ️ How RSS Curation Works

1. **Cron Job** triggers `/api/curate` every 10 minutes (on Vercel)
2. **Fetches RSS feeds** from sources in Firebase
3. **Checks for new articles** (not already in database)
4. **Extracts article content** from RSS feed
5. **AI processes** article with rotation:
   - Primary: Gemini Flash
   - Secondary: OpenAI
   - Tertiary: Hugging Face
6. **Saves to Firebase** with summary and relevance scores

---

## 📋 What's Already Set Up

✅ RSS feed sources configured in seed data:
- GhanaWeb
- Joy Online  
- Graphic Online
- Business Ghana

✅ AI rotation system (Gemini → OpenAI → Hugging Face)  
✅ Cron job configured (runs every 10 minutes on Vercel)  
✅ Article processing flow  

---

## 🎯 Meanwhile: Test AI Processing

While setting up credentials, you can test the AI processing:

1. Go to: http://localhost:9002/analyze
2. Paste any article text
3. Click "Analyze Article"
4. See AI-generated summary and relevance scores

This works because it only uses AI (doesn't need Firebase Admin).

---

## ✅ Fixes Applied

1. ✅ Updated `firebase-admin.ts` to support local credentials
2. ✅ Fixed Image `sizes` prop warnings
3. ✅ Created test script for manual curation

---

## 🚀 After Adding Credentials

New articles will automatically appear when:
- ✨ Cron job runs (every 10 minutes on Vercel)
- 🧪 You manually trigger: `node test-curation.mjs`
- 🌐 Anyone visits: `https://your-app.vercel.app/api/curate` (with auth header)

Each run processes **1 new article** to save on API costs!
