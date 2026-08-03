const CACHE = 'dxy-workbench-v24';
const ASSETS = ['./', './index.html', './daily-topics.js', './manifest.webmanifest', './icon.svg', './德馨远二维码.png', './三伏天宣传-01.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const path = url.pathname;
  // HTML / daily-topics.js 用 network-first，确保实时内容最新
  if (path.endsWith('.html') || path === '/' || path.endsWith('/') || path.endsWith('/daily-topics.js')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return resp;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./')))
    );
    return;
  }
  // 其他资源 cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const cp = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return resp;
    }).catch(() => caches.match('./')))
  );
});
