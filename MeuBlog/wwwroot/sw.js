"use strict";
importScripts("lib/localforage/localforage.min.js");

const cacheName = "v2Cache";
const blogCacheFiles = [
  "/",
  "/sw.js",
  "/lib/bootstrap/dist/css/bootstrap.css",
  "/css/site.css",
  "/lib/jquery/dist/jquery.js",
  "/lib/bootstrap/dist/js/bootstrap.min.js",
  "/lib/es6-promise/es6-promise.js",
  "/lib/fetch/fetch.js",
  "/lib/systemjs/system.js",
  "/lib/localforage/localforage.min.js",
  "/lib/localforage/localforage-getitems.js",
  "/lib/localforage/localforage-setitems.js",
  "/js/site.js",
  "/js/app.js",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/js/blogService.js",
  "/js/swRegister.js",
  "/js/template.js",
  "/lib/showdown/showdown.js",
  "/js/clientStorage.js",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-256x256.png",
  "/images/icons/icon-384x384.png",
  "/images/icons/icon-512x512.png",
];

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(), ms);
    promise.then(resolve, reject);
  });
}

self.addEventListener("install", (event) => {
  console.log("SW: Evento de Instalacao");
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(blogCacheFiles);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("SW: Evento de Ativacao");
  self.clients.claim();

  event.waitUntil(
    caches.keys().then((cacheKeys) => {
      const deletePromises = [];
      for (let i = 0; i < cacheKeys.length; i++) {
        if (cacheKeys[i] != cacheName) {
          deletePromises.push(caches.delete(cacheKeys[i]));
        }
      }
      return Promise.all(deletePromises);
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("SW: Evento de fetch " + event.request.url);

  if (event.request.url.toLowerCase().includes("/home")) {
    console.log("[ServiceWorker] online - get online " + event.request.url);
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      timeout(1000, fetch(event.request)).catch(() => {
        console.log(
          "[ServiceWorker] offline - get from cache: " + event.request.url
        );
        return caches.match(event.request);
      })
    );
  }
});

self.addEventListener("backgroundfetchsuccess", (event) => {
  const bgFetch = event.registration;
  event.waitUntil(
    (async () => {
      const blogInstance = localforage.createInstance({
        name: "blog",
      });

      const records = await bgFetch.matchAll();

      const promises = records.map(async (record) => {
        const response = await record.responseReady;
        response.text().then((text) => {
          console.log(`text retrieved - storing in indexedDB ${text}`);
          blogInstance.setItem(`#${bgFetch.id}`, text);
        });
      });
      await Promise.all(promises);
      event.updateUI({ title: "Done!" });
    })()
  );
});
