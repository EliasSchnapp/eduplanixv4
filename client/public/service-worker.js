const CACHE_NAME = 'eduplanix-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event with offline-first strategy
self.addEventListener('fetch', (event) => {
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      handleApiRequest(event.request)
    );
  } else {
    // Cache-first strategy for assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Handle API requests with offline storage
async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // If successful, sync any pending offline data
    if (response.ok && navigator.onLine) {
      syncOfflineData();
    }
    
    return response;
  } catch (error) {
    // If network fails, handle offline
    return handleOfflineRequest(request);
  }
}

// Handle offline API requests
async function handleOfflineRequest(request) {
  const method = request.method;
  const url = new URL(request.url);
  
  if (method === 'GET') {
    // Return cached data for GET requests
    const cachedData = await getCachedData(url.pathname);
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } else if (method === 'POST') {
    // Store POST requests for later sync
    const body = await request.json();
    await storeOfflineRequest(url.pathname, body);
    
    // Return success response
    return new Response(JSON.stringify({ success: true, offline: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return offline message
  return new Response(JSON.stringify({ error: 'Offline', message: 'Keine Internetverbindung' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Store offline requests in IndexedDB
async function storeOfflineRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EduPlanixOffline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offline_requests'], 'readwrite');
      const store = transaction.objectStore('offline_requests');
      
      store.add({
        endpoint,
        data,
        timestamp: Date.now(),
        synced: false
      });
      
      transaction.oncomplete = () => resolve();
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offline_requests')) {
        const store = db.createObjectStore('offline_requests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('endpoint', 'endpoint', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
      if (!db.objectStoreNames.contains('cached_data')) {
        db.createObjectStore('cached_data', { keyPath: 'endpoint' });
      }
    };
  });
}

// Get cached data from IndexedDB
async function getCachedData(endpoint) {
  return new Promise((resolve) => {
    const request = indexedDB.open('EduPlanixOffline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      
      // Check if the object store exists
      if (!db.objectStoreNames.contains('cached_data')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['cached_data'], 'readonly');
      const store = transaction.objectStore('cached_data');
      
      const getRequest = store.get(endpoint);
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || null);
      };
      getRequest.onerror = () => {
        resolve(null);
      };
    };
    
    request.onerror = () => {
      resolve(null);
    };
  });
}

// Sync offline data when online
async function syncOfflineData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('EduPlanixOffline', 1);
    
    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction(['offline_requests'], 'readwrite');
      const store = transaction.objectStore('offline_requests');
      
      const index = store.index('synced');
      const getRequest = index.getAll(false);
      
      getRequest.onsuccess = async () => {
        const unsynced = getRequest.result;
        
        for (const item of unsynced) {
          try {
            const response = await fetch(item.endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            });
            
            if (response.ok) {
              // Mark as synced
              item.synced = true;
              store.put(item);
              
              // Show notification
              self.registration.showNotification('EduPlanix Sync', {
                body: 'Offline-Daten wurden synchronisiert',
                icon: '/icon-192x192.png'
              });
            }
          } catch (error) {
            console.error('Sync failed:', error);
          }
        }
        
        resolve();
      };
    };
  });
}

// Listen for online event
self.addEventListener('online', () => {
  syncOfflineData();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});