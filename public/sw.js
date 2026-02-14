const CACHE_NAME = 'hockeyhub-v1';
const urlsToCache = [
  '/',
  '/games',
  '/rinks',
  '/clubs'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Never serve from cache: auth and dashboard (avoid stale login/state)
const NO_CACHE_PATHS = ['/login', '/register', '/dashboard', '/bookings', '/manage-rink', '/notifications'];
function shouldBypassCache(url) {
  try {
    const path = new URL(url).pathname;
    return NO_CACHE_PATHS.some((p) => path.includes(p));
  } catch {
    return false;
  }
}

self.addEventListener('fetch', event => {
  if (shouldBypassCache(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});