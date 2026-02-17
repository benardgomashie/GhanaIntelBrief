/**
 * AI Provider types and utilities
 * This file does NOT have 'use server' so it can export classes and sync functions
 */

export type AIProvider = 'gemini' | 'openai' | 'huggingface' | 'fallback';

export interface AIResponse {
  summary: string;
  whyThisMattersExplanation: string;
  isRelevantMoney: boolean;
  isRelevantPolicy: boolean;
  isRelevantOpportunity: boolean;
  isRelevantGrowth: boolean;
  provider: AIProvider;
}

export class QuotaExceededError extends Error {
  constructor(provider: AIProvider, originalError?: Error) {
    super(`Quota exceeded for provider: ${provider}`);
    this.name = 'QuotaExceededError';
    this.cause = originalError;
  }
}

// Check if error is quota-related
export function isQuotaError(error: any): boolean {
  const errorMessage = error?.message?.toLowerCase() || '';
  const quotaIndicators = [
    'quota',
    'rate limit',
    'too many requests',
    '429',
    'resource_exhausted',
    'insufficient_quota',
  ];
  return quotaIndicators.some((indicator) => errorMessage.includes(indicator));
}
