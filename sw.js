self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercepta o envio do botão Compartilhar do celular
  if (event.request.method === 'POST' && url.pathname.endsWith('index.html')) {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const file = formData.get('shared_files');
      const text = formData.get('share_text') || formData.get('share_title') || '';
      const shareUrl = formData.get('share_url') || '';

      // Redireciona de volta para o painel com os dados na URL
      let redirectUrl = './index.html?shared=true';
      if (text) redirectUrl += '&text=' + encodeURIComponent(text);
      if (shareUrl) redirectUrl += '&link=' + encodeURIComponent(shareUrl);

      // Se houver arquivo, salva em cache temporário para o painel resgatar
      if (file) {
        const cache = await caches.open('share-cache');
        await cache.put('shared-file', new Response(file));
        redirectUrl += '&hasFile=true&fileName=' + encodeURIComponent(file.name);
      }

      return Response.redirect(redirectUrl, 303);
    })());
  }
});
