'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2, Rss } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { curateFeedsAction, type CurationState } from './actions';
import { useEffect, useRef } from 'react';

const initialState: CurationState = {
    logs: [],
    processedCount: 0,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full font-bold">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Curating...
        </>
      ) : (
        <>
          <Rss className="mr-2 h-5 w-5" /> Start Curation
        </>
      )}
    </Button>
  );
}

export function CurationForm() {
  const [state, formAction] = useFormState(curateFeedsAction, initialState);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
    }
  }, [state.logs]);


  return (
    <>
      <form action={formAction} className="space-y-6">
        <SubmitButton />
      </form>

      <div className="mt-12 scroll-mt-24">
        {state.message && (
            <Alert variant={state.error ? "destructive" : "default"} className="mb-8">
              {state.error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{state.error ? 'Curation Failed' : (state.processedCount > 0 ? 'Curation Complete' : 'Curation Finished')}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}

        {state.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Curation Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72 w-full rounded-md border" >
                <div className="p-4" ref={scrollAreaRef}>
                    {state.logs.map((log, index) => (
                        <p key={index} className="text-sm text-muted-foreground font-mono">
                            {log}
                        </p>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
