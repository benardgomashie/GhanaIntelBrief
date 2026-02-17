import Link from 'next/link';
import { TestTube2 } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 md:flex-row md:px-6">
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl font-bold tracking-tighter">
            <Link
              href="/"
              className="text-primary transition-colors hover:text-primary/80"
            >
              Ghana IntelBrief
            </Link>
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            AI-powered insights for Ghana's decision-makers.
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <NewsletterForm />
          <Link href="/analyze" passHref>
            <Button
              variant="outline"
              className="w-full justify-center font-semibold sm:w-auto"
            >
              <TestTube2 className="mr-2 h-4 w-4" />
              Analyze Article
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
