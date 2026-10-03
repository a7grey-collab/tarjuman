/* Tarjuman service worker v3: receives voice messages shared from WhatsApp/Telegram (Web Share Target). Developer Alex Grey · https://t.me/a7grey */
const SHARE_CACHE = 'tarjuman-share';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      const stamp = Date.now();
      let n = 0, text = '', err = '', types = [];
      try {
        const form = await e.request.formData();
        const cache = await caches.open(SHARE_CACHE);
        for (const [, v] of form.entries()) {
          if (v && typeof v !== 'string') {
            if (!v.size) continue;
            await cache.put(new URL('shared/' + stamp + '-' + n, self.registration.scope).href,
              new Response(v, { headers: { 'content-type': v.type || 'audio/ogg', 'x-name': encodeURIComponent(v.name || 'voice') } }));
            types.push((v.type || '?') + ':' + (v.name || '')); n++;
          } else if (v) { text += (text ? ' ' : '') + v; }
        }
      } catch (x) { err = String((x && x.message) || x).slice(0, 120); }
      const q = new URLSearchParams({ shared: String(stamp), n: String(n) });
      if (text) q.set('t', text.slice(0, 300));
      if (err) q.set('e', err);
      if (types.length) q.set('ty', types.join(',').slice(0, 200));
      return Response.redirect(new URL('./?' + q.toString(), self.registration.scope).href, 303);
    })());
  }
});
