// Files to cache
var cacheName = "wrtc-v6";
var cacheFiles = [
  "/lib/adapter.js",
  "/lib/autolink.js",
  "/lib/snackbar.min.js",
  "/fontawesome/css/font-face.min.css",
  "/fontawesome/css/free.min.css",
  "/fontawesome/css/v4-shims.min.css",
  "/fontawesome/webfonts/fa-solid-900.woff2",
  "/fontawesome/webfonts/fa-solid-900.woff",
  "/icons/icon-256x256.png",
  "/images/logo.png",
  "/css/snackbar.min.css",
  "/js/call.js",
  "/js/common.js",
  "/js/rtc.js",
  "/js/WRTC.js",
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
  var cacheWhitelist = [cacheName];

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
