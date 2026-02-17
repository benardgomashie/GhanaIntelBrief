'use server';
/**
 * @fileOverview A Genkit flow for summarizing news articles into 5 bullet points.
 *
 * - summarizeArticle - A function that handles the article summarization process.
 * - ArticleSummarizationInput - The input type for the summarizeArticle function.
 * - ArticleSummarizationOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArticleSummarizationInputSchema = z.object({
  articleContent: z.string().describe('The full text content of the article to be summarized.'),
});
export type ArticleSummarizationInput = z.infer<typeof ArticleSummarizationInputSchema>;

const ArticleSummarizationOutputSchema = z.object({
  summary: z.string().describe('A concise, 5-bullet point summary of the article.'),
});
export type ArticleSummarizationOutput = z.infer<typeof ArticleSummarizationOutputSchema>;

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {schema: ArticleSummarizationInputSchema},
  output: {schema: ArticleSummarizationOutputSchema},
  prompt: `You are an expert summarizer. Your task is to read the provided news article about Ghana, focusing on business, technology, and policy.
Generate a concise, 5-bullet point summary of the article. Each bullet point should be a key takeaway.

Article Content:
{{{articleContent}}}

Summary:
-`,
});

const articleSummarizationFlow = ai.defineFlow(
  {
    name: 'articleSummarizationFlow',
    inputSchema: ArticleSummarizationInputSchema,
    outputSchema: ArticleSummarizationOutputSchema,
  },
  async input => {
    const {output} = await summarizeArticlePrompt(input);
    return output!;
  }
);

export async function summarizeArticle(
  input: ArticleSummarizationInput
): Promise<ArticleSummarizationOutput> {
  return articleSummarizationFlow(input);
}
