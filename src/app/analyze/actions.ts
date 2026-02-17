'use server';

import { z } from 'zod';
import { processArticle } from '@/ai/flows/article-processing-flow';

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
    const result = await processArticle({ articleContent });

    if (!result.summary || !result.whyThisMattersExplanation) {
      throw new Error('AI generation failed to produce complete results.');
    }

    return {
      message: 'Analysis successful.',
      summary: result.summary,
      relevance: result.whyThisMattersExplanation,
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      message:
        'An unexpected error occurred during analysis. The AI model may be temporarily unavailable. Please try again later.',
    };
  }
}
