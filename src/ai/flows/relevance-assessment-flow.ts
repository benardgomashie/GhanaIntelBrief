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
  whyThisMattersExplanation: z
    .string()
    .describe(
      "A concise explanation (2-3 sentences) of why the article matters in terms of Ghana's money, policy, opportunity, and growth."
    ),
  isRelevantMoney: z.boolean().describe("True if the article is assessed by AI as relevant to 'money' in Ghana."),
  isRelevantPolicy: z.boolean().describe("True if the article is assessed by AI as relevant to 'policy' in Ghana."),
  isRelevantOpportunity: z.boolean().describe("True if the article is assessed by AI as relevant to 'opportunity' in Ghana."),
  isRelevantGrowth: z.boolean().describe("True if the article is assessed by AI as relevant to 'growth' in Ghana."),
});
export type RelevanceAssessmentOutput = z.infer<typeof RelevanceAssessmentOutputSchema>;

export async function assessArticleRelevance(input: RelevanceAssessmentInput): Promise<RelevanceAssessmentOutput> {
  return relevanceAssessmentFlow(input);
}

const relevanceAssessmentPrompt = ai.definePrompt({
  name: 'relevanceAssessmentPrompt',
  input: {schema: RelevanceAssessmentInputSchema},
  output: {schema: RelevanceAssessmentOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing news articles related to Ghana. Your task is to analyze the article and determine its relevance to Ghana's key development pillars: Money, Policy, Opportunity, and Growth.

Based on the article content, provide the following in JSON format:
1.  A concise explanation (2-3 sentences) for 'whyThisMattersExplanation', explaining the article's significance.
2.  A boolean value for 'isRelevantMoney'.
3.  A boolean value for 'isRelevantPolicy'.
4.  A boolean value for 'isRelevantOpportunity'.
5.  A boolean value for 'isRelevantGrowth'.

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
