// service-worker.js - Place this in your public folder

// Cache name for offline support
const CACHE_NAME = 'calmify-v1';

// Files to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/logo192.png',
  // Add other assets as needed
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Claim clients immediately
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/badge.png',
    tag: data.tag,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
// Replace the existing push event listener
self.addEventListener('push', event => {
    console.log('Push event received in service worker');
    
    let data;
    try {
      data = event.data.json();
      console.log('Push data received:', data);
    } catch (error) {
      console.error('Error parsing push data:', error);
      // Use default data if parsing fails
      data = {
        title: 'Calmify Notification',
        body: 'You have an upcoming event',
        icon: '/logo192.png',
        tag: 'default'
      };
    }
    
    const options = {
      body: data.body,
      icon: data.icon || '/logo192.png',
      badge: '/badge.png',
      tag: data.tag || 'default',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
        }
      ]
    };
  
    console.log('Showing notification with options:', options);
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
        .then(() => console.log('Notification shown successfully'))
        .catch(error => console.error('Error showing notification:', error))
    );
  });


// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === 'calendar-notifications') {
    event.waitUntil(checkScheduledNotifications());
  }
});

// Replace the entire checkScheduledNotifications function in service-worker.js
async function checkScheduledNotifications() {
    console.log('Checking scheduled notifications in service worker');
    
    try {
      // Open IndexedDB to get notifications
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('calendarEvents', 2);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          console.log('Upgrading database in service worker');
          
          // Create notifications store if it doesn't exist
          if (!db.objectStoreNames.contains('notifications')) {
            console.log('Creating notifications store in service worker');
            db.createObjectStore('notifications', { keyPath: 'id' });
          }
        };
        
        request.onerror = (event) => {
          console.error('Error opening IndexedDB in service worker:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
          console.log('Successfully opened IndexedDB in service worker');
          resolve(event.target.result);
        };
      });
  
      // Check if the notifications store exists
      if (!db.objectStoreNames.contains('notifications')) {
        console.error("The 'notifications' object store doesn't exist in service worker");
        return Promise.resolve();
      }
  
      // Get all notifications
      const notifications = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['notifications'], 'readonly');
        const store = transaction.objectStore('notifications');
        const request = store.getAll();
        
        request.onerror = (event) => {
          console.error('Error getting notifications from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
          console.log('Retrieved notifications from IndexedDB:', event.target.result);
          resolve(event.target.result);
        };
      });
  
      const now = new Date().getTime();
      console.log('Current time in service worker:', now);
      
      // Find notifications that should be sent now (due in the next minute)
      const notificationsToSend = notifications.filter(notification => {
        return notification.scheduledFor <= now + 60000; // Include notifications due in the next minute
      });
      
      console.log('Notifications to send:', notificationsToSend);
  
      // Send each notification
      for (const notification of notificationsToSend) {
        console.log('Sending notification for:', notification);
        
        const minutesUntilEvent = Math.round((new Date(notification.eventDate + 'T' + notification.eventTime).getTime() - now) / 60000);
        const message = minutesUntilEvent <= 0 
          ? `Your event "${notification.eventName}" is starting now!`
          : `Your event "${notification.eventName}" is starting in ${minutesUntilEvent} minutes at "${notification.eventTime}"`;
        
        // Modify in the service-worker.js file
        await self.registration.showNotification('Calmify Event Reminder', {
            body: `Your event "${notification.eventName}" is starting in 2 minutes at "${notification.eventTime}"`,
            icon: '/logo192.png',
            tag: notification.eventId,
            requireInteraction: true
        });
        
        console.log('Notification sent, now removing from database');
        
        // Remove from notifications store
        await new Promise((resolve, reject) => {
          const transaction = db.transaction(['notifications'], 'readwrite');
          const store = transaction.objectStore('notifications');
          const request = store.delete(notification.id);
          
          request.onerror = (event) => {
            console.error('Error deleting notification:', event.target.error);
            reject(event.target.error);
          };
          
          request.onsuccess = () => {
            console.log('Successfully deleted notification from IndexedDB');
            resolve();
          };
        });
      }
  
      return Promise.resolve();
    } catch (error) {
      console.error('Error in background sync:', error);
      return Promise.reject(error);
    }
  }


  // Add this at the end of your service-worker.js file
self.addEventListener('message', event => {
    console.log('Message received in service worker:', event.data);
    
    if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
      console.log('Checking notifications from message event');
      event.waitUntil(checkScheduledNotifications());
    }
  });