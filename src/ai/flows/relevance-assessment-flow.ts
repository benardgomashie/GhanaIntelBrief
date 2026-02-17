'use server';
/**
 * @fileOverview This file implements a Genkit flow for assessing the relevance of an article to Ghana's money, policy, opportunity, and growth.
 *
 * - assessArticleRelevance - A function that handles the article relevance assessment process.
 * - RelevanceAssessmentInput - The input type for the assessArticleRelevance function.
 * - RelevanceAssessmentOutput - The return type for the assessArticleRelevance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RelevanceAssessmentInputSchema = z.object({
  articleContent: z.string().describe('The full content of the news article to be assessed.'),
});
export type RelevanceAssessmentInput = z.infer<typeof RelevanceAssessmentInputSchema>;

const RelevanceAssessmentOutputSchema = z.object({
  relevanceExplanation: z
    .string()
    .describe(
      "A concise explanation (2-3 sentences) of why the article matters in terms of Ghana's money, policy, opportunity, and growth."
    ),
});
export type RelevanceAssessmentOutput = z.infer<typeof RelevanceAssessmentOutputSchema>;

export async function assessArticleRelevance(input: RelevanceAssessmentInput): Promise<RelevanceAssessmentOutput> {
  return relevanceAssessmentFlow(input);
}

const relevanceAssessmentPrompt = ai.definePrompt({
  name: 'relevanceAssessmentPrompt',
  input: {schema: RelevanceAssessmentInputSchema},
  output: {schema: RelevanceAssessmentOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing news articles related to Ghana. Your task is to provide a concise explanation (2-3 sentences) of why a given article matters in terms of Ghana's money, policy, opportunity, and growth.

Here is the article content:

Article: {{{articleContent}}} `,
});

const relevanceAssessmentFlow = ai.defineFlow(
  {
    name: 'relevanceAssessmentFlow',
    inputSchema: RelevanceAssessmentInputSchema,
    outputSchema: RelevanceAssessmentOutputSchema,
  },
  async input => {
    const {output} = await relevanceAssessmentPrompt(input);
    if (!output) {
      throw new Error('Failed to generate relevance explanation.');
    }
    return output;
  }
);
