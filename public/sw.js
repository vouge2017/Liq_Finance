// Service Worker for FinEthio Planner PWA
const CACHE_NAME = 'finethio-v2' // Increment version for new caching strategy
const RUNTIME_CACHE = 'finethio-runtime-v2'
const STATIC_CACHE = 'finethio-static-v2'

// Critical assets to cache on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Static assets to cache (icons, images)
const STATIC_ASSETS = [
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/apple-icon.png',
  '/icon.svg',
  '/placeholder-logo.png',
  '/placeholder-logo.svg'
]

// Route chunks to precache in background (lazy-loaded pages)
// These will be cached after initial page load
const ROUTE_CHUNKS = [
  // These will be populated dynamically from build output
  // Pattern: /assets/AccountsPage-*.js, /assets/BudgetPage-*.js, etc.
]

// Install event - cache critical app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache critical app shell
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching app shell')
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Failed to cache some assets:', err)
        })
      }),
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Failed to cache some static assets:', err)
        })
      })
    ]).then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Keep only current cache versions
            return cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== STATIC_CACHE
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
      .then(() => self.clients.claim())
  )
})

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)

  // Skip API routes and external requests (no caching)
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('aistudiocdn.com') ||
    url.protocol === 'chrome-extension:'
  ) {
    return // Let browser handle these
  }

  // Strategy 1: Static assets (icons, images) - Cache First
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/i) ||
    url.pathname.startsWith('/icon') ||
    url.pathname.startsWith('/placeholder')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, response.clone())
            })
          }
          return response
        }).catch(() => {
          // Return placeholder if offline
          if (url.pathname.includes('icon')) {
            return caches.match('/icon.svg')
          }
          return new Response('', { status: 404 })
        })
      })
    )
    return
  }

  // Strategy 2: JavaScript/CSS chunks - Network First, Cache Fallback
  if (url.pathname.match(/\.(js|css)$/i) || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Offline: try cache
          return caches.match(event.request)
        })
    )
    return
  }

  // Strategy 3: HTML pages - Cache First with Network Fallback
  if (event.request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached
          return fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone()
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache)
                })
              }
              return response
            })
            .catch(() => {
              // Offline fallback: return index.html
              return caches.match('/index.html')
            })
        })
    )
    return
  }

  // Strategy 4: Other requests - Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Background sync for offline transactions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  // This would sync pending transactions when back online
  console.log('[SW] Syncing transactions...')
}
