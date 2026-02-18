'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-80">
            <Image
              src="/logo.svg"
              alt="Ghana IntelBrief"
              width={220}
              height={44}
              priority
              className="h-11 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
