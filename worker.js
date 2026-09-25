/* Porta de entrada do site na Cloudflare (Workers com ficheiros estáticos).

   A configuração está no wrangler.jsonc: os ficheiros vêm da dist/
   (gerada pelo construir.js) e a Cloudflare serve-os sozinha, sem passar
   por aqui, sempre que o endereço corresponde a um ficheiro. Este script
   só corre para o resto:

   - POST /api/contacto vai para a função do formulário
     (functions/api/contacto.js), a mesma que o servidor.js usa no
     computador;
   - tudo o que sobra volta aos ficheiros estáticos, que respondem com a
     404.html (not_found_handling no wrangler.jsonc). */
import { onRequestPost } from './functions/api/contacto.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contacto' && request.method === 'POST') {
      return onRequestPost({ request, env, ctx });
    }

    return env.ASSETS.fetch(request);
  }
};
