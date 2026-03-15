/* PT Klase Auto Graha - Service Worker 
   File: sw.js
*/

// Import SDK OneSignal untuk menangani Push Notifications di background
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'klase-kurir-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './user_dashboard.html',
  './manifest.json'
];

// 1. Install Event: Menyimpan aset statis ke Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Caching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Membersihkan cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Strategi "Stale-While-Revalidate"
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan simpan request ke Supabase (API) di dalam cache statis
  if (url.hostname.includes('supabase.co')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Berikan versi cache, tapi update di background (jika ada internet)
        fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
        }).catch(() => {}); 
        
        return cachedResponse;
      }

      // Jika tidak ada di cache, ambil dari network
      return fetch(event.request).then((networkResponse) => {
        // Secara dinamis simpan file baru (seperti gambar logo atau font) ke cache
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Jika offline total dan navigasi ke halaman yang tidak ada di cache, arahkan ke login
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
