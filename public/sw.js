// Files to cache
var cacheName = "wrtc-v2";
var cacheFiles = [
  "/utils/adapter.js",
  "/utils/autolink.js",
  "/utils/snackbar.min.js",
  "/utils/common.js",
  "/fontawesome/css/font-face.min.css",
  "/fontawesome/css/free.min.css",
  "/fontawesome/css/v4-shims.min.css",
  "/fontawesome/webfonts/fa-solid-900.woff2",
  "/fontawesome/webfonts/fa-solid-900.woff",
  "/icons/icon-256x256.png",
  "/images/logo.png",
  "/css/call.css",
  "/css/index.css",
  "/css/snackbar.min.css",
];

// Installing Service Worker
self.addEventListener("install", function (e) {
  console.log("[Service Worker] Install");
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log("[Service Worker] Caching all: app shell and content");
      return cache.addAll(cacheFiles);
    })
  );
});

// Fetching content using Service Worker
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (r) {
      console.log("[Service Worker] Fetching resource: " + e.request.url);
      return (
        r ||
        fetch(e.request).then(function (response) {
          return caches.open(cacheName).then(function (cache) {
            // console.log(
            //   "[Service Worker] Caching new resource: " + e.request.url
            // );
            // cache.put(e.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = ["wrtc-v2"];

  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (cacheWhitelist.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
