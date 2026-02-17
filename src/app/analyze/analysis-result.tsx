'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, Sparkles } from 'lucide-react';

type AnalysisResultProps = {
  summary: string;
  relevance: string;
};

export function AnalysisResult({ summary, relevance }: AnalysisResultProps) {
  const summaryPoints = summary
    .split('\n')
    .map((point) => point.replace(/^-/, '').trim())
    .filter((p) => p.length > 0);

  return (
    <div className="space-y-8">
      <Card className="bg-card/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <ScrollText className="h-6 w-6 text-primary" />
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-base text-foreground/90">
            {summaryPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <Sparkles className="h-6 w-6 text-accent" />
            Why This Matters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed text-muted-foreground">{relevance}</p>
        </CardContent>
      </Card>
    </div>
  );
}
