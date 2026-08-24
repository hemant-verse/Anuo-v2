'use client';

import { useEffect, useState } from 'react';

export default function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!promptEvent) return;

    promptEvent.prompt();
    const choiceResult = await promptEvent.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setVisible(false);
      setPromptEvent(null);
    }
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="fixed bottom-6 right-6 z-50 animate-shake sm:animate-none sm:static sm:bottom-auto sm:right-auto sm:z-auto inline-flex items-center justify-center rounded-full border border-emerald-700 bg-emerald-700 text-white shadow-2xl sm:shadow-sm transition hover:bg-emerald-800 hover:scale-105 active:scale-95 px-3.5 py-3.5 sm:px-4 sm:py-2 text-xs font-bold gap-1.5"
      aria-label="Install App"
    >
      <svg className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
}
