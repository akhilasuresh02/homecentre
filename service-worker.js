// Define a cache name (you can version it)
const CACHE_NAME = "homecentre-cache-v1";

// Add all essential files that should be cached
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/catalogue.html",
  "/products.json",
  "/images/logo.png",
  "/2.jpeg",
  "/service-worker.js"
];

// Install event — caches files on first load
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event — clears old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event — serves from cache if offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // If resource found in cache, return it
        return cachedResponse;
      }

      // Otherwise, fetch it from network and cache it for later
      return fetch(event.request)
        .then((response) => {
          // Only cache valid responses (status 200)
          if (!response || response.status !== 200) return response;

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Optional: fallback page or image if offline
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
