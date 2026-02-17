import { AnalysisForm } from './analysis-form';

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          AI-Powered Article Analysis
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          Paste the content of any news article below to receive an instant
          AI-generated summary and relevance assessment for Ghana.
        </p>
      </div>
      <AnalysisForm />
    </div>
  );
}
