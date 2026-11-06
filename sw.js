const CACHE = "track-v2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
// a kept copy says when it was kept: the page shows its age ("לא התעדכן מאז ...") instead of passing it off as current
const kept = r => r.blob().then(b => { const h = new Headers(r.headers); h.set("x-lc-at", new Date().toISOString());
  return new Response(b, { status: r.status, statusText: r.statusText, headers: h }); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (!/\/track\/(index\.html)?$/.test(u.pathname) && !/\/track\.json$/.test(u.pathname)) return;
  const key = u.origin + u.pathname;                     // without ?t=...: the one latest copy
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) e.waitUntil(kept(r.clone()).then(c => caches.open(CACHE).then(k => k.put(key, c))));
    return r;
  }).catch(() => caches.open(CACHE).then(k => k.match(key)).then(r => r || Response.error())));
});
