const CACHE_NAME = 'homecentre-cache-v1';
const ASSETS = [
  '/', '/index.html', '/catalogue.html', '/2.jpeg',
  '/images/Abstract Wall Art.jpg',
  '/images/Ceramic Planter Pot.jpg',
  '/images/Contemporary Table Lamp.jpg',
  '/images/Contemporary Wall Clock.jpg',
  '/images/Floor Lamps.jpg',
  '/images/Glass Vase Planter.jpg',
  '/images/Hanging Lights.jpg',
  '/images/Hanging Metal Planter.jpg',
  '/images/Metal Flower Plant Pots.jpg',
  '/images/Minimalist Frame.jpg',
  '/images/Modern Table Clock.jpg',
  '/images/Modern Wall Art.jpg',
  '/images/Pendant Ceiling Light.jpg',
  '/images/Vintage Wall Clock.jpg',
  '/images/Vintage Wall Lamp.jpg',
  'https://raw.githubusercontent.com/akhilasuresh02/homecentre-api/refs/heads/main/products.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.url.includes('products.json')) {
    // Network first for product data
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    // Cache first for other assets
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        return res;
      }).catch(() => caches.match('/')))
    );
  }
});
