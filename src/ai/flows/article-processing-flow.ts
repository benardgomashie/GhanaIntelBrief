'use server';
/**
 * @fileOverview A multi-provider AI flow for processing news articles.
 * Uses rotation strategy: Gemini → OpenAI → Hugging Face → Fallback
 *
 * - processArticle - A function that handles the entire article processing pipeline with provider rotation.
 * - ArticleProcessingInput - The input type for the processArticle function.
 * - ArticleProcessingOutput - The return type for the processArticle function.
 */

import { summarizeWithRotation } from '@/ai/rotation';
import { z } from 'zod';

const ArticleProcessingInputSchema = z.object({
  articleContent: z.string().describe('The full text content of the article to be processed.'),
});
export type ArticleProcessingInput = z.infer<typeof ArticleProcessingInputSchema>;

const ArticleProcessingOutputSchema = z.object({
  summary: z.string().describe('A concise, 5-bullet point summary of the article.'),
  whyThisMattersExplanation: z
    .string()
    .describe(
      "A concise explanation (2-3 sentences) of why the article matters in terms of Ghana's money, policy, opportunity, and growth."
    ),
  isRelevantMoney: z.boolean().describe("True if the article is assessed by AI as relevant to 'money' in Ghana."),
  isRelevantPolicy: z.boolean().describe("True if the article is assessed by AI as relevant to 'policy' in Ghana."),
  isRelevantOpportunity: z.boolean().describe("True if the article is assessed by AI as relevant to 'opportunity' in Ghana."),
  isRelevantGrowth: z.boolean().describe("True if the article is assessed by AI as relevant to 'growth' in Ghana."),
  provider: z.string().optional().describe('The AI provider that successfully processed this article.'),
});
export type ArticleProcessingOutput = z.infer<typeof ArticleProcessingOutputSchema>;

/**
 * Process article with smart AI provider rotation
 * Automatically falls back through multiple providers on quota/errors
 */
export async function processArticle(input: ArticleProcessingInput): Promise<ArticleProcessingOutput> {
  const { articleContent } = input;

  // Validate input
  if (!articleContent || articleContent.trim().length < 50) {
    throw new Error('Article content is too short or empty');
  }

  try {
    // Use rotation strategy with automatic fallback
    const result = await summarizeWithRotation(articleContent);
    
    console.log(`[Article Processing] ✅ Processed with provider: ${result.provider}`);
    
    return {
      summary: result.summary,
      whyThisMattersExplanation: result.whyThisMattersExplanation,
      isRelevantMoney: result.isRelevantMoney,
      isRelevantPolicy: result.isRelevantPolicy,
      isRelevantOpportunity: result.isRelevantOpportunity,
      isRelevantGrowth: result.isRelevantGrowth,
      provider: result.provider,
    };
  } catch (error) {
    console.error('[Article Processing] ❌ Fatal error:', error);
    throw new Error('Failed to process article with any available AI provider');
  }
}
