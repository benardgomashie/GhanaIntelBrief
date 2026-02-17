# 🔄 AI Provider Rotation Strategy

This project implements a smart multi-provider AI rotation system to handle quota limitations and ensure continuous service.

## 📋 Provider Chain

The system automatically falls through providers in this order:

1. **🥇 Primary: Gemini Flash** (Google)
   - Best quality for structured output
   - Free tier available
   - Cheap for production

2. **🥈 Secondary: OpenAI GPT-3.5**
   - Falls back when Gemini quota exceeded
   - Uses free credits (if available)
   - Good quality backup

3. **🥉 Tertiary: Hugging Face LLaMA**
   - Community-hosted free models
   - Slower but functional
   - Works when others fail

4. **🛟 Last Resort: Fallback Mode**
   - Stores raw article text
   - Marks for later processing
   - Ensures no data loss

## 🚀 Setup Instructions

### 1. Get API Keys

**Gemini (Primary)**
- Already configured: `GEMINI_API_KEY=AIzaSyC...`
- Get more at: https://aistudio.google.com/apikey

**OpenAI (Secondary)**
```bash
# Get free credits at: https://platform.openai.com/
OPENAI_API_KEY=sk-proj-...
```

**Hugging Face (Tertiary)**
```bash
# Free at: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf_...
```

### 2. Add to Environment Variables

**Local (.env)**
```bash
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_openai_key_here
HUGGINGFACE_API_KEY=your_hf_key_here
```

**Vercel Dashboard**
- Go to Project Settings → Environment Variables
- Add same variables for Production/Preview/Development

### 3. Test the Rotation

```bash
npm run dev
```

Navigate to `/analyze` and test article processing.

## 📊 How It Works

```typescript
async function summarizeWithRotation(text) {
  try {
    // Try Gemini first
    return await callGemini(text);
  } catch (e) {
    if (isQuotaError(e)) {
      try {
        // Fall back to OpenAI
        return await callOpenAI(text);
      } catch (e2) {
        try {
          // Fall back to Hugging Face
          return await callHuggingFace(text);
        } catch (e3) {
          // Last resort: store raw text
          return createFallbackResponse(text);
        }
      }
    }
  }
}
```

## ✅ Benefits

- **No downtime**: Automatic failover
- **Cost optimization**: Uses free tiers first
- **Quality first**: Best provider prioritized
- **Data safety**: Never lose articles
- **Quota management**: Smart error detection

## 🔍 Monitoring

Check provider status in logs:

```
[AI Rotation] Attempting provider: gemini
[AI Rotation] ✅ Success with provider: gemini
```

Or when quota exceeded:

```
[AI Rotation] ❌ Failed with provider: gemini
[AI Rotation] Quota exceeded for gemini, trying next provider...
[AI Rotation] Attempting provider: openai
[AI Rotation] ✅ Success with provider: openai
```

## 📝 Provider Configuration Status

You can check which providers are configured:

```typescript
import { getProviderStatus } from '@/ai/rotation';

const status = await getProviderStatus();
// {
//   gemini: { configured: true, status: 'Primary provider' },
//   openai: { configured: true, status: 'Secondary fallback' },
//   huggingface: { configured: false, status: 'Tertiary fallback' }
// }
```

## 🎯 Best Practices

1. **Configure all providers** for maximum reliability
2. **Monitor quota usage** via provider dashboards
3. **Start with Gemini** (best free tier for your use case)
4. **Add OpenAI credits** for backup ($5-10 goes a long way)
5. **Keep Hugging Face** as safety net (free but slow)

## 💡 Cost Optimization Tips

- Gemini Flash: ~$0.15/1M tokens (very cheap)
- OpenAI GPT-3.5: ~$0.50/1M tokens (reasonable)
- Hugging Face: Free (community tier)
- Average article: ~1000 tokens = $0.0002 with Gemini

**For 1000 articles/month**: ~$0.20 with Gemini primary! 🎉

## 🔧 Troubleshooting

**"OpenAI API key not configured"**
- Add `OPENAI_API_KEY` to `.env` and Vercel
- Remove placeholder: `your_openai_api_key_here`

**"All AI providers failed"**
- Check API keys are valid
- Verify quota limits on provider dashboards
- Articles will still be saved (fallback mode)

**Slow processing**
- Normal if using Hugging Face fallback
- Consider adding OpenAI credits for faster backup

## 📚 Files Modified

- `src/ai/providers.ts` - Individual provider implementations
- `src/ai/rotation.ts` - Rotation logic and fallback chain
- `src/ai/flows/article-processing-flow.ts` - Updated to use rotation
- `.env` - Added new API key placeholders

## 🚢 Deployment

Push changes to trigger Vercel deployment:

```bash
git add .
git commit -m "Add multi-provider AI rotation system"
git push
```

**Don't forget**: Add API keys to Vercel environment variables!
