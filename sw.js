const CACHE_NAME = 'klase-kurir-v2'; // Naikkan versi jika ada perubahan besar
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './user_dashboard.html'
  // Jangan masukkan link CDN eksternal di sini untuk mencegah kegagalan instalasi
];

// 1. Install - Simpan aset inti
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate - Hapus cache lama
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

// 3. Fetch - Strategi Pintar
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // ABAIKAN request ke Supabase (API & Auth) - Biarkan langsung ke internet
  if (url.hostname.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Berikan yang ada di cache, tapi update cache-nya secara background (Stale-while-revalidate)
        fetch(e.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
        }).catch(() => {}); // Abaikan jika offline
        
        return cachedResponse;
      }

      // Jika tidak ada di cache, ambil dari network
      return fetch(e.request).then((networkResponse) => {
        // Simpan aset baru (seperti gambar logo atau CDN) ke cache secara otomatis
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Jika benar-benar offline dan navigasi ke halaman lain, lempar ke login
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
