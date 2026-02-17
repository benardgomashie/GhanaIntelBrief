'use server';
/**
 * @fileOverview A Genkit flow for processing news articles.
 * It summarizes the article, assesses its relevance, and explains why it matters.
 *
 * - processArticle - A function that handles the entire article processing pipeline.
 * - ArticleProcessingInput - The input type for the processArticle function.
 * - ArticleProcessingOutput - The return type for the processArticle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
});
export type ArticleProcessingOutput = z.infer<typeof ArticleProcessingOutputSchema>;

const articleProcessingPrompt = ai.definePrompt({
  name: 'articleProcessingPrompt',
  input: { schema: ArticleProcessingInputSchema },
  output: { schema: ArticleProcessingOutputSchema },
  prompt: `You are an expert analyst for news related to Ghana.
Your task is to analyze the provided article and return a structured JSON object.

Based on the article content, provide the following:
1. 'summary': A concise, 5-bullet point summary of the key takeaways.
2. 'whyThisMattersExplanation': A concise explanation (2-3 sentences) for why the article is significant for Ghana's development, focusing on money, policy, opportunity, and growth.
3. 'isRelevantMoney': A boolean value indicating relevance to 'money'.
4. 'isRelevantPolicy': A boolean value indicating relevance to 'policy'.
5. 'isRelevantOpportunity': A boolean value indicating relevance to 'opportunity'.
6. 'isRelevantGrowth': A boolean value indicating relevance to 'growth'.

Article Content:
{{{articleContent}}}
`,
});

const articleProcessingFlow = ai.defineFlow(
  {
    name: 'articleProcessingFlow',
    inputSchema: ArticleProcessingInputSchema,
    outputSchema: ArticleProcessingOutputSchema,
  },
  async (input) => {
    const { output } = await articleProcessingPrompt(input);
    if (!output) {
      throw new Error('Failed to generate article analysis.');
    }
    return output;
  }
);

export async function processArticle(input: ArticleProcessingInput): Promise<ArticleProcessingOutput> {
  return articleProcessingFlow(input);
}
