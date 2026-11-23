// Phase 0 service worker: offline shell only.
// Phase 5+ will replace this with Serwist precaching + offline shortlist.

const CACHE = 'glo-art-shell-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([OFFLINE_URL, '/manifest.webmanifest']).catch(() => undefined),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Skip auth and Next internals.
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return;
  if (req.mode !== 'navigate') return;

  event.respondWith(
    fetch(req).catch(() => caches.match(OFFLINE_URL)),
  );
});
