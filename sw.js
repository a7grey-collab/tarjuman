/* Tarjuman service worker: receives voice messages shared from WhatsApp/Telegram (Web Share Target). Developer Alex Grey · https://t.me/a7grey */
const SHARE_CACHE = 'tarjuman-share';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      const stamp = Date.now();
      try {
        const form = await e.request.formData();
        const files = [];
        for (const [, v] of form.entries()) if (v && typeof v !== 'string') files.push(v);
        const cache = await caches.open(SHARE_CACHE);
        let i = 0;
        for (const f of files) {
          await cache.put(new URL('shared/' + stamp + '-' + (i++), self.registration.scope).href,
            new Response(f, { headers: { 'content-type': f.type || 'audio/ogg', 'x-name': encodeURIComponent(f.name || 'voice') } }));
        }
      } catch (err) { /* fall through to the app */ }
      return Response.redirect(new URL('./?shared=' + stamp, self.registration.scope).href, 303);
    })());
  }
});
