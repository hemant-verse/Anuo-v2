
const CACHE_NAME = 'auno-pwa-cache-v4';
const HOME_SHELL = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/my-logo-192.png',
  '/icons/my-logo-512.png',
  '/offline.html',
];

const isShellAsset = (pathname) => {
  return (
    HOME_SHELL.includes(pathname) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/apple-touch-icon.png')
  );
};

const isDataRoute = (pathname) => pathname.startsWith('/_next/data/');

const fetchAndCache = (request) =>
  fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.ok) {
      const responseClone = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
    }
    return networkResponse;
  });

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(HOME_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Ignore cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Bypass API routes
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Do NOT cache navigation responses here. Caching navigations can
          // store user-specific pages (eg. redirected login pages) under a
          // protected route like `/sell` and later serve them to authenticated
          // users, causing incorrect redirects. Return the fresh network
          // response directly and fall back to the offline shell on failure.
          return networkResponse;
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // For static assets (JS, CSS, images, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => null);
    })
  );
});