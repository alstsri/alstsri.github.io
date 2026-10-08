const CACHE = 'marcy-launch-v1';
const ROOT = new URL('./', self.location.href);
const FILES = ['index.html', 'launch.css', 'export.js', 'icon.svg', 'jbm-400.ttf'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES.map(file => new Request(new URL(file, ROOT), {cache:'reload'})));
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  // Retire only Marcy's app caches. Never alter browser history or localStorage.
  for (const key of await caches.keys()) {
    if (key === 'marcy-v5' || key === 'marcy-browser-v6') await caches.delete(key);
  }
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const isPage = url.pathname === ROOT.pathname || url.pathname === ROOT.pathname + 'index.html';
  const key = isPage ? new URL('index.html', ROOT).href : url.origin + url.pathname;
  if (!FILES.some(file => new URL(file, ROOT).href === key)) return;
  event.respondWith((async () => {
    try { const response = await fetch(event.request); if (response.ok) return response; } catch {}
    return await (await caches.open(CACHE)).match(key) || new Response('Reconnect to load Marcy’s export page.', {status:503});
  })());
});
