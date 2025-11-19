const CACHE_NAME = 'scopum-v1';
const RUNTIME_CACHE = 'scopum-runtime-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
];

// Evento de instalação - cachear ativos estáticos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando ativos estáticos');
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.warn('[Service Worker] Alguns ativos não puderam ser cacheados');
      });
    })
  );
  self.skipWaiting();
});

// Evento de ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

// Evento de busca - implementar estratégia cache-first com fallback de rede
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pular requisições cross-origin
  if (url.origin !== self.location.origin) {
    return;
  }

  // Lidar com requisições de API com estratégia network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar resposta antes de cachear
          const clonedResponse = response.clone();

          // Cachear respostas de API bem-sucedidas
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }

          return response;
        })
        .catch(() => {
          // Retornar versão em cache se a rede falhar
          return caches
            .match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Usando resposta de API em cache:', request.url);
                return cachedResponse;
              }

              // Retornar fallback offline para requisições falhadas
              return new Response(
                JSON.stringify({
                  sucesso: false,
                  mensagem: 'Você está offline. Tente novamente quando a conexão for restaurada.',
                  offline: true,
                }),
                {
                  status: 503,
                  statusText: 'Serviço Indisponível',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
        })
    );
    return;
  }

  // Lidar com ativos estáticos com estratégia cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Cachear respostas bem-sucedidas para ativos estáticos
          if (response.ok && request.method === 'GET') {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }

          return response;
        })
        .catch(() => {
          // Retornar página offline para requisições falhadas de ativos estáticos
          return caches.match('/index.html').then((cachedResponse) => {
            return (
              cachedResponse ||
              new Response('Você está offline', {
                status: 503,
                statusText: 'Serviço Indisponível',
              })
            );
          });
        });
    })
  );
});

// Lidar com sincronização em segundo plano para registro de ponto offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ponto-registros') {
    event.waitUntil(sincronizarRegistrosPonto());
  }
});

// Sincronizar registros de ponto pendentes quando voltar online
async function sincronizarRegistrosPonto() {
  try {
    const db = await abrirBancoDados();
    const registrosPendentes = await obterRegistrosPendentes(db);

    if (registrosPendentes.length === 0) {
      console.log('[Service Worker] Nenhum registro pendente para sincronizar');
      return;
    }

    console.log('[Service Worker] Sincronizando', registrosPendentes.length, 'registros pendentes');

    for (const registro of registrosPendentes) {
      try {
        const response = await fetch('/api/ponto/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registro),
        });

        if (response.ok) {
          await marcarRegistroComoSincronizado(db, registro.id);
          console.log('[Service Worker] Registro sincronizado:', registro.id);
        }
      } catch (error) {
        console.error('[Service Worker] Falha ao sincronizar registro:', registro.id, error);
      }
    }

    // Notificar o app que a sincronização foi concluída
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        sincronizados: registrosPendentes.length,
      });
    });
  } catch (error) {
    console.error('[Service Worker] Sincronização falhou:', error);
    throw error;
  }
}

// Operações simples de IndexedDB para sincronização offline
function abrirBancoDados() {
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

function obterRegistrosPendentes(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-registros'], 'readonly');
    const store = transaction.objectStore('pending-registros');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function marcarRegistroComoSincronizado(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-registros'], 'readwrite');
    const store = transaction.objectStore('pending-registros');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Service Worker pronto
console.log('[Service Worker] Script do Service Worker carregado');
