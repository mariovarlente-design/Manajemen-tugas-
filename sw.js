// Service Worker untuk PWA Kurir
const CACHE_NAME = 'klase-kurir-v1';

// Gunakan path relatif agar aman di GitHub Pages
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html', // SUDAH DIPERBAIKI (sebelumnya user_dashboard.html)
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install: Simpan aset ke dalam cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching assets...');
        // Menggunakan addAll, jika satu file gagal, semua gagal. 
        // Pastikan nama file di atas benar-benar ada.
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((err) => console.error('⚠️ Cache failed (Cek apakah nama file sudah benar):', err))
  );
  self.skipWaiting();
});

// Activate: Hapus cache lama jika ada update versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategi Cache First, Fallback to Network
self.addEventListener('fetch', (event) => {
  // Hanya proses permintaan GET
  if (event.request.method !== 'GET') return;
  
  // Jangan cache data dari Supabase (supaya data tugas selalu terbaru)
  if (event.request.url.includes('supabase.co')) {
    return; 
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        // Balas dengan cache jika ada, jika tidak ambil dari internet
        return cached || fetch(event.request).then((response) => {
          // Opsional: Simpan file baru yang ditemukan ke cache
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => {
        // Jika offline dan tidak ada di cache, bisa arahkan ke halaman offline (opsional)
        console.warn('🌐 App is offline and resource not cached.');
      })
  );
});
