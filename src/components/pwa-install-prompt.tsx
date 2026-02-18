'use client';

import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      sessionStorage.getItem(DISMISSED_KEY)
    ) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a 4-second delay — non-disruptive
      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-live="polite"
      className="
        fixed bottom-20 left-1/2 -translate-x-1/2 z-50
        w-[calc(100%-2rem)] max-w-sm
        flex items-center gap-3
        rounded-xl border border-yellow-500/30
        bg-zinc-900/95 backdrop-blur-sm
        px-4 py-3 shadow-2xl
        animate-in slide-in-from-bottom-4 duration-300
      "
    >
      {/* Icon */}
      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/15">
        <Download className="h-4 w-4 text-yellow-400" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">Add to Home Screen</p>
        <p className="text-xs text-zinc-400 mt-0.5">Get instant access to Ghana IntelBrief</p>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        className="
          shrink-0 rounded-lg bg-yellow-500 px-3 py-1.5
          text-xs font-bold text-black
          hover:bg-yellow-400 active:scale-95
          transition-all duration-150
        "
      >
        Install
      </button>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
