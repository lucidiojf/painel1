const CACHE_NAME = 'painel-share-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercepta qualquer POST do menu Compartilhar e transforma em GET antes de bater no GitHub
  if (event.request.method === 'POST') {
    event.respondWith((async () => {
      let redirectUrl = './index.html?shared=true';
      try {
        const formData = await event.request.formData();
        const text = formData.get('share_text') || formData.get('share_title') || '';
        const link = formData.get('share_url') || '';

        if (text) redirectUrl += '&text=' + encodeURIComponent(text);
        if (link) redirectUrl += '&link=' + encodeURIComponent(link);
      } catch (err) {}

      // Responde com Redirecionamento 303 (converte POST em GET puro)
      return Response.redirect(redirectUrl, 303);
    })());
    return;
  }

  event.respondWith(fetch(event.request));
});
