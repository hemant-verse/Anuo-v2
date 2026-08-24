'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function OfflineGuard() {
  const isInitialMount = useRef(true);

  useEffect(() => {
    const triggerOfflineToast = () => {
      toast.error('No network connection.', {
        id: 'offline-toast',
        duration: 4000,
        position: 'bottom-center',
      });
    };

    const triggerOnlineToast = () => {
      toast.success('Internet connection restored!', {
        id: 'offline-toast',
        duration: 3000,
        position: 'bottom-center',
      });
    };

    // 1. Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service worker registered:', registration.scope);
        })
        .catch((err) => {
          console.error('Service worker registration failed:', err);
          toast.error('PWA registration failed. Offline support may not work.', {
            id: 'pwa-error-toast',
            duration: 4000,
          });
        });
    }

    // 2. Initial check on mount
    if (!navigator.onLine) {
      triggerOfflineToast();
    }
    isInitialMount.current = false;

    // 3. Status Change Listeners
    const handleOffline = () => {
      triggerOfflineToast();
    };

    const handleOnline = () => {
      if (!isInitialMount.current) {
        triggerOnlineToast();
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}