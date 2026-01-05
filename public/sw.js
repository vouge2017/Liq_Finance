// Service Worker for FinEthio Planner PWA
<<<<<<< HEAD
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
=======
const CACHE_NAME = 'finethio-v1'
const RUNTIME_CACHE = 'finethio-runtime-v1'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/apple-icon.png',
  '/icon.svg'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
>>>>>>> d990df020acf2dbd0fd0e3232e7fc73bebed2318
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
<<<<<<< HEAD
            // Keep only current cache versions
            return cacheName !== CACHE_NAME && 
                   cacheName !== RUNTIME_CACHE && 
                   cacheName !== STATIC_CACHE
=======
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
>>>>>>> d990df020acf2dbd0fd0e3232e7fc73bebed2318
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

<<<<<<< HEAD
// Fetch event - enhanced caching strategy
=======
// Fetch event - serve from cache, fallback to network
>>>>>>> d990df020acf2dbd0fd0e3232e7fc73bebed2318
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

<<<<<<< HEAD
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
=======
  // Skip API routes and external requests
  if (
    event.request.url.includes('/api/') ||
    event.request.url.startsWith('http://') ||
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('aistudiocdn.com')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response (skip chrome-extension and other unsupported schemes)
            const url = new URL(event.request.url)
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache)
                })
                .catch((err) => {
                  // Silently ignore cache errors
                  console.debug('Cache put failed:', err)
                })
            }

            return response
          })
          .catch(() => {
            // Return offline page if available
            if (event.request.destination === 'document') {
              return caches.match('/index.html')
            }
          })
      })
>>>>>>> d990df020acf2dbd0fd0e3232e7fc73bebed2318
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

