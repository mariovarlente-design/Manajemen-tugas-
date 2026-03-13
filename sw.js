const CACHE_NAME = 'klase-kurir-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/user_dashboard.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// 1. Install: Simpan aset statis ke cache
self.addEventListener('install', (e) => {
  console.log('📦 SW installed');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Hapus cache lama jika ada update
self.addEventListener('activate', (e) => {
  console.log('🔄 SW activated');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Strategy
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Strategi Khusus untuk API Supabase: NETWORK ONLY
  // Jangan simpan hasil query database ke cache agar data riwayat selalu terbaru (Real-time)
  if (url.hostname.includes('supabase.co')) {
    return; // Biarkan browser mengambil langsung dari internet
  }

  // Strategi untuk Aset Statis: Cache First, then Network
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
