'use server';

import {
  callGemini,
  callOpenAI,
  callHuggingFace,
  createFallbackResponse,
} from './providers';
import { QuotaExceededError, AIResponse, AIProvider } from './types';

/**
 * Smart AI rotation strategy with fallback chain:
 * 1. Primary: Gemini 2.5 Flash (best quality, free 20/day)
 * 2. Fallback: Store raw text only (when quota exceeded)
 * 
 * Note: OpenAI and Hugging Face removed due to quota/API issues
 */
export async function summarizeWithRotation(articleContent: string): Promise<AIResponse> {
  const providers: Array<{
    name: AIProvider;
    fn: () => Promise<AIResponse>;
  }> = [
    {
      name: 'gemini',
      fn: () => callGemini(articleContent),
    },
    // OpenAI: Quota exceeded ($5 free credits exhausted)
    // Hugging Face: Free API deprecated (410 error)
  ];

  const errors: Array<{ provider: AIProvider; error: Error }> = [];

  // Try each provider in sequence
  for (const provider of providers) {
    try {
      console.log(`[AI Rotation] Attempting provider: ${provider.name}`);
      const result = await provider.fn();
      console.log(`[AI Rotation] ✅ Success with provider: ${provider.name}`);
      return result;
    } catch (error: any) {
      console.error(`[AI Rotation] ❌ Failed with provider: ${provider.name}`, error.message);
      
      // Store error for logging
      errors.push({
        provider: provider.name,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // If it's a quota error, continue to next provider
      if (error instanceof QuotaExceededError) {
        console.log(`[AI Rotation] Quota exceeded for ${provider.name}, trying next provider...`);
        continue;
      }

      // If it's a configuration error (API key missing), skip to next
      if (error.message?.includes('not configured')) {
        console.log(`[AI Rotation] Provider ${provider.name} not configured, trying next...`);
        continue;
      }

      // For other errors, still try next provider but log the issue
      console.log(`[AI Rotation] Unexpected error with ${provider.name}, trying next provider...`);
      continue;
    }
  }

  // All providers failed, use fallback
  console.warn('[AI Rotation] ⚠️ All AI providers failed, using fallback mode');
  console.warn('[AI Rotation] Errors:', errors);
  
  return createFallbackResponse(articleContent);
}

/**
 * Get current provider status (for monitoring/debugging)
 */
export async function getProviderStatus() {
  return {
    gemini: {
      configured: !!process.env.GEMINI_API_KEY,
      status: 'Primary provider',
    },
    openai: {
      configured: !!(
        process.env.OPENAI_API_KEY && 
        process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
      ),
      status: 'Secondary fallback',
    },
    huggingface: {
      configured: !!(
        process.env.HUGGINGFACE_API_KEY && 
        process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_api_key_here'
      ),
      status: 'Tertiary fallback',
    },
  };
}
