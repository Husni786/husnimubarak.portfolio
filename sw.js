/* ═══════════════════════════════════════════════════════════════
   Service Worker — Husni Mubarak Portfolio
   Strategy:
     • HTML (index.html)       → Network First  (always fresh on new deploy)
     • Hashed JS/CSS assets    → Cache First    (immutable — safe to cache forever)
     • Images / SVG / fonts    → Stale-While-Revalidate (fast + auto-updates)
     • Everything else         → Stale-While-Revalidate
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'portfolio-v2';

// ── Install: skip waiting so SW activates immediately ─────────
self.addEventListener('install', () => self.skipWaiting());

// ── Activate: purge stale caches from previous versions ───────
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: route requests to correct caching strategy ─────────
self.addEventListener('fetch', evt => {
  const req = evt.request;

  // Only intercept GET over http/https
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.protocol.startsWith('http')) return;

  // Determine strategy by URL pattern
  const isHTML        = req.headers.get('accept')?.includes('text/html');
  const isHashedAsset = /\/assets\/[^/]+-[A-Za-z0-9]+\.(js|css)$/.test(url.pathname);
  const isBinary      = /\.(png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|ttf|eot)(\?.*)?$/.test(url.pathname);

  if (isHTML) {
    evt.respondWith(networkFirst(req));
  } else if (isHashedAsset) {
    evt.respondWith(cacheFirst(req));
  } else {
    // images, fonts, external CDN, everything else
    evt.respondWith(staleWhileRevalidate(req));
  }
});

// ─── Network First ────────────────────────────────────────────
// Try network → cache on success → fall back to cache if offline
async function networkFirst(req) {
  try {
    const resp = await fetch(req);
    if (resp.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, resp.clone()); // async, doesn't block response
    }
    return resp;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response('Offline — page not cached', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// ─── Cache First ──────────────────────────────────────────────
// Return cache instantly → if miss, fetch and cache
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const resp = await fetch(req);
    if (resp.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, resp.clone());
    }
    return resp;
  } catch {
    return new Response('Asset unavailable offline', { status: 503 });
  }
}

// ─── Stale While Revalidate ───────────────────────────────────
// Return cache immediately (fast!) AND fetch fresh copy in background
async function staleWhileRevalidate(req) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);

  // Fire network request in background regardless
  const fetchPromise = fetch(req).then(resp => {
    if (resp && resp.ok) cache.put(req, resp.clone());
    return resp;
  }).catch(() => null);

  // Serve cached version instantly; if no cache, wait for network
  return cached || await fetchPromise
    || new Response('Resource unavailable', { status: 503 });
}
