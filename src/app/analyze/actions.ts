'use server';

import { z } from 'zod';
import { summarizeArticle } from '@/ai/flows/article-summarization-flow';
import { assessArticleRelevance } from '@/ai/flows/relevance-assessment-flow';

const FormSchema = z.object({
  articleContent: z.string().min(100, {
    message: 'Article content must be at least 100 characters.',
  }),
});

export type AnalysisState = {
  message?: string | null;
  summary?: string;
  relevance?: string;
  errors?: {
    articleContent?: string[];
  };
};

export async function analyzeArticleAction(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const validatedFields = FormSchema.safeParse({
    articleContent: formData.get('articleContent'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid article content. Please check your submission.',
    };
  }

  const { articleContent } = validatedFields.data;

  try {
    const [summaryResult, relevanceResult] = await Promise.all([
      summarizeArticle({ articleContent }),
      assessArticleRelevance({ articleContent }),
    ]);

    if (!summaryResult.summary || !relevanceResult.whyThisMattersExplanation) {
      throw new Error('AI generation failed to produce complete results.');
    }

    return {
      message: 'Analysis successful.',
      summary: summaryResult.summary,
      relevance: relevanceResult.whyThisMattersExplanation,
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      message:
        'An unexpected error occurred during analysis. The AI model may be temporarily unavailable. Please try again later.',
    };
  }
}
