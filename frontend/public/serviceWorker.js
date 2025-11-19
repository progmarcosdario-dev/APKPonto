const CACHE_NAME = 'scopum-v1';
const RUNTIME_CACHE = 'scopum-runtime-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.warn('[Service Worker] Some assets could not be cached');
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const clonedResponse = response.clone();

          // Cache successful API responses
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches
            .match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Using cached API response:', request.url);
                return cachedResponse;
              }

              // Return offline fallback for failed requests
              return new Response(
                JSON.stringify({
                  sucesso: false,
                  mensagem: 'Você está offline. Tente novamente quando a conexão for restaurada.',
                  offline: true,
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Cache successful responses for static assets
          if (response.ok && request.method === 'GET') {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }

          return response;
        })
        .catch(() => {
          // Return offline page for failed static asset requests
          return caches.match('/index.html').then((cachedResponse) => {
            return (
              cachedResponse ||
              new Response('Você está offline', {
                status: 503,
                statusText: 'Service Unavailable',
              })
            );
          });
        });
    })
  );
});

// Handle background sync for offline ponto registration
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ponto-registros') {
    event.waitUntil(syncPontoRegistros());
  }
});

// Sync pending ponto registrations when back online
async function syncPontoRegistros() {
  try {
    const db = await openDatabase();
    const pendingRecords = await getPendingRecords(db);

    if (pendingRecords.length === 0) {
      console.log('[Service Worker] No pending records to sync');
      return;
    }

    console.log('[Service Worker] Syncing', pendingRecords.length, 'pending records');

    for (const record of pendingRecords) {
      try {
        const response = await fetch('/api/ponto/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });

        if (response.ok) {
          await markRecordAsSynced(db, record.id);
          console.log('[Service Worker] Synced record:', record.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync record:', record.id, error);
      }
    }

    // Notify the app that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        synced: pendingRecords.length,
      });
    });
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error;
  }
}

// Simple IndexedDB operations for offline sync
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scopum-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-registros')) {
        db.createObjectStore('pending-registros', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingRecords(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-registros'], 'readonly');
    const store = transaction.objectStore('pending-registros');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markRecordAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-registros'], 'readwrite');
    const store = transaction.objectStore('pending-registros');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Service Worker is ready
console.log('[Service Worker] Service Worker script loaded');
