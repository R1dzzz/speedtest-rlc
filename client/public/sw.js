// Basic Service Worker for PWA Add-to-Homescreen support
const CACHE_NAME = 'rlc-speedtest-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple network-first strategy, fallback to cache
  // Keep it minimal to just satisfy PWA installability requirements
  // without interfering with API calls.
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
