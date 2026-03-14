const CACHE_NAME = 'klase-kurir-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './user_dashboard.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Menggunakan cache.addAll dengan hati-hati
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Jika request ke Supabase (API), langsung ambil dari internet (Network Only)
  if (url.hostname.includes('supabase.co')) {
    return; 
  }

  // Untuk aset lainnya, gunakan Cache First
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Jika ada di cache, kembalikan. Jika tidak, ambil dari network.
      return response || fetch(e.request).catch(() => {
        // Opsi tambahan: Jika benar-benar offline dan akses halaman yang tidak ada di cache
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
