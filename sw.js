const CACHE = "track-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (!/\/track\/(index\.html)?$/.test(u.pathname) && !/\/track\.json$/.test(u.pathname)) return;
  const key = u.origin + u.pathname;                     // without ?t=...: the one latest copy
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const c = r.clone(); e.waitUntil(caches.open(CACHE).then(k => k.put(key, c))); }
    return r;
  }).catch(() => caches.open(CACHE).then(k => k.match(key)).then(r => r || Response.error())));
});
