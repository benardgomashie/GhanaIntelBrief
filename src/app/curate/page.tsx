import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function CuratePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Automated News Curation
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          This system is now fully automated. There is no need to manually start the curation process.
        </p>
      </div>

      <Card className="bg-card/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-headline text-2xl">
            <Bot className="h-6 w-6 text-primary" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-foreground/90">
          <p>
            A background process automatically runs every 10 minutes to check for new articles from the configured news sources.
          </p>
          <p>
            When a new article is found, it is fetched, analyzed by our AI for a summary and relevance assessment, and then saved to the database.
          </p>
          <p>
            This ensures a slow, steady, and reliable stream of new content without overwhelming the system or hitting API rate limits. The latest briefings will appear on the home page as they are processed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
