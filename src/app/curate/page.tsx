import { CurationForm } from './curation-form';

export default function CuratePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Curate News Feeds
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          Fetch, analyze, and store the latest articles from your configured RSS feeds. This process may take several minutes depending on the number of articles.
        </p>
      </div>
      <CurationForm />
    </div>
  );
}
