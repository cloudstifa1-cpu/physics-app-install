// Offline cache. The build fills in VERSION and FILES; a new version
// replaces the old cache so updates show up on the next launch.
const CACHE = 'physics-842778de28';
const FILES = ["./","index.html","app.adc606b7.js","style.271b9b1f.css","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // The page itself: try the internet first (so updates show on next open),
  // fall back to the saved copy when offline or slow (3 s).
  if (e.request.mode === 'navigate') {
    const net = fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put('index.html', copy));
      return r;
    });
    const slow = new Promise(res => setTimeout(res, 3000)).then(() => caches.match('index.html'));
    e.respondWith(Promise.race([net.catch(() => caches.match('index.html')), slow.then(hit => hit || net)]));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
