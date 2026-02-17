'use client';

import Link from 'next/link';
import { Database, TestTube2 } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';
import { Button } from './ui/button';
import { useFirestore } from '@/firebase';
import { seedDatabase } from '@/app/lib/seed';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!firestore) return;
    try {
      await seedDatabase(firestore);
      toast({
        title: 'Database Seeded',
        description: 'Sample articles have been added to Firestore.',
      });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description:
          e.message ||
          'Could not seed database. It may have already been seeded.',
      });
    }
  };

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
          <Button
            variant="outline"
            className="w-full justify-center font-semibold sm:w-auto"
            onClick={handleSeed}
          >
            <Database className="mr-2 h-4 w-4" />
            Seed Database
          </Button>
        </div>
      </div>
    </header>
  );
}
