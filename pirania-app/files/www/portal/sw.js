var cacheName = 'hello-pwa'

var filesToCache = ['/', '/index.html', '/css/main.css', '/css/mobile-icons.css', '/css/normalize.css', '/js/main.js', '/js/int.js', '/js/tabs.js', '/js/ubusFetch.js', '/js/voucher.js', '/js/voucher.js']

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(filesToCache)
    })
  )
})

/* Serve cached content when offline */

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request)
    })
  )
})
