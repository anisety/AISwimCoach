const CACHE_NAME = 'strokesync-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Sync any offline data when connection is restored
  try {
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      for (const data of offlineData) {
        await fetch('/api/stroke-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }
      // Clear offline data after successful sync
      await clearOfflineData();
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineData() {
  // Get offline data from IndexedDB
  return new Promise((resolve) => {
    const request = indexedDB.open('strokesync-offline', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offline-data'], 'readonly');
      const store = transaction.objectStore('offline-data');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        resolve([]);
      };
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

async function clearOfflineData() {
  // Clear offline data from IndexedDB
  return new Promise((resolve) => {
    const request = indexedDB.open('strokesync-offline', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offline-data'], 'readwrite');
      const store = transaction.objectStore('offline-data');
      store.clear();
      resolve();
    };
    
    request.onerror = () => {
      resolve();
    };
  });
}

// Handle push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
