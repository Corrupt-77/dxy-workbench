const CACHE = 'dxy-workbench-v9';
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
  // HTML 文件用 network-first，确保每次拿到最新版本
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
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
