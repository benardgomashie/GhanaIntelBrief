'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

import { analyzeArticleAction, type AnalysisState } from './actions';
import { AnalysisResult } from './analysis-result';

const initialState: AnalysisState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full font-bold">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
        </>
      ) : (
        'Analyze Article'
      )}
    </Button>
  );
}

export function AnalysisForm() {
  const [state, formAction] = useFormState(analyzeArticleAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.summary) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.summary]);
  
  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="articleContent" className="text-lg font-semibold">
            Article Content
          </Label>
          <Textarea
            id="articleContent"
            name="articleContent"
            placeholder="Paste the full text of the news article here..."
            rows={15}
            className="text-base"
            required
            aria-describedby="content-error"
          />
          {state?.errors?.articleContent && (
            <p id="content-error" className="text-sm font-medium text-destructive">
              {state.errors.articleContent.join(', ')}
            </p>
          )}
        </div>
        <SubmitButton />
      </form>

      <div ref={resultRef} className="mt-12 scroll-mt-24">
        {state?.message && !state.summary && !state.errors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {state?.summary && state?.relevance && (
          <AnalysisResult summary={state.summary} relevance={state.relevance} />
        )}
      </div>
    </>
  );
}
