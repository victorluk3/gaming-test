// sw.js - Service Worker básico para permitir la instalación
const CACHE_NAME = 'sudoku-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sudoku192.png',
  './sudoku512.png'
];

// Instalar el Service Worker y guardar archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activar y responder desde el caché cuando no hay conexión
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});