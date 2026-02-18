'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-5 md:px-6">
        <div className="text-center">
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
      </div>
    </header>
  );
}
