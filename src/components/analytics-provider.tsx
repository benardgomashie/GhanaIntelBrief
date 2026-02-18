'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializeFirebase, getFirebaseAnalytics } from '@/firebase/init';
import { logEvent } from 'firebase/analytics';

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const { firebaseApp } = initializeFirebase();

    getFirebaseAnalytics(firebaseApp).then((analytics) => {
      if (!analytics) return;
      // Log page_view on every route change
      logEvent(analytics, 'page_view', {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
  }, [pathname]);

  return null;
}
