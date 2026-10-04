/* Tarjuman service worker v4 (text edition): text shared from WhatsApp opens in the translator. Developer Alex Grey · https://t.me/a7grey */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      let text = '';
      try { const form = await e.request.formData(); for (const [, v] of form.entries()) if (typeof v === 'string' && v) text += (text ? '\n' : '') + v; } catch (x) {}
      const q = new URLSearchParams({ shared: '1' }); if (text) q.set('text', text.slice(0, 4000));
      return Response.redirect(new URL('./?' + q.toString(), self.registration.scope).href, 303);
    })());
  }
});
