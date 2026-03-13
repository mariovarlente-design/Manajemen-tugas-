const CACHE_NAME = 'klase-kurir-v1';

self.addEventListener('install', (e) => {
  console.log('📦 SW installed');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('🔄 SW activated');
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first untuk Supabase API (butuh online)
});
