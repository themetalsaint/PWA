const CACHE_NAME = 'my-site-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';
  const STATIC_CACHE = "static-cache-v1"; 
  const DATA_CACHE_TIME = "data-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/index.html",
    "/index.js",
    "/style.css",
    "/db.js",
    "/manifest.webmanifest",
  ];
  
  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          cache.addAll(FILES_TO_CACHE); 
        })
    );
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
      const currentCaches = [STATIC_CACHE, DATA_CACHE_TIME]
      event.waitUntil(
          caches.keys().then(cacheData => {
              return cacheData.filter(
                  cacheData => !currentCaches.includes(cacheData)
              );
          }).then(cachesToDelete => {
              return Promise.all(
                  cachesToDelete.map(deleteThisCache => {
                      return caches.delete(deleteThisCache)
                  })
              )
          }).then(() => self.clients.claim())
      )
  });
  
  self.addEventListener("fetch", (event) => {
      if (event.request.url.includes("/api/")) {
          event.respondWith(
              caches
                  .open(DATA_CACHE_TIME) 
                  .then((cache) => {
                      return fetch(event.request)
                          .then((response) => {
                              if (response.status === 200) {
                                  cache.put(event.request.url, response.clone());
                              }
                              return response;
                          })
                          .catch(() => caches.match(event.request));
                  })
          );
          return;
      }
  
      event.respondWith(
          caches.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                  return cachedResponse;
              }
  
        return caches.open(DATA_CACHE_TIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  });