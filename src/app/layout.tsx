import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: {
    default: 'Ghana IntelBrief - AI-Powered Ghana Business News & Insights',
    template: '%s | Ghana IntelBrief'
  },
  description:
    "Stay ahead with AI-curated news on Ghana's business, tech, and policy landscape. Smart briefings on money, growth opportunities, and market intelligence.",
  keywords: [
    'Ghana news',
    'Ghana business news',
    'Ghana economy',
    'Ghana tech news',
    'Ghana policy',
    'Ghana investment',
    'Ghana market intelligence',
    'West Africa business',
    'African business news',
    'Ghana startup news'
  ],
  authors: [{ name: 'Ghana IntelBrief' }],
  creator: 'Ghana IntelBrief',
  publisher: 'Ghana IntelBrief',
  metadataBase: new URL('https://www.ghanaintelbrief.site'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ghana IntelBrief - AI-Powered Ghana Business News & Insights',
    description: "Stay ahead with AI-curated news on Ghana's business, tech, and policy landscape.",
    url: 'https://www.ghanaintelbrief.site',
    siteName: 'Ghana IntelBrief',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ghana IntelBrief - Smart Business News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ghana IntelBrief - AI-Powered Ghana Business News',
    description: "Stay ahead with AI-curated news on Ghana's business, tech, and policy landscape.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    other: {
      'google-adsense-account': 'ca-pub-6905498298815487',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6905498298815487"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="container mx-auto flex-grow px-4 py-12 md:px-6 lg:py-16">
              {children}
            </main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
