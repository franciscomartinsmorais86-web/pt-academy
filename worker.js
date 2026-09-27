/* Porta de entrada do site na Cloudflare (Workers com ficheiros estáticos).

   A configuração está no wrangler.jsonc: os ficheiros vêm da dist/
   (gerada pelo construir.js). Com run_worker_first, todos os pedidos
   passam primeiro por aqui:

   - POST /api/contacto vai para a função do formulário
     (functions/api/contacto.js), a mesma que o servidor.js usa no
     computador;
   - tudo o resto vai aos ficheiros estáticos, que respondem com a
     404.html quando o endereço não existe (not_found_handling);
   - em *.workers.dev — o endereço da Cloudflare e as pré-visualizações do
     gestor de conteúdos (ramo cms-rascunho) — a resposta leva
     "X-Robots-Tag: noindex", para o Google não indexar cópias do site. */
import { onRequestPost } from './functions/api/contacto.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const resposta = url.pathname === '/api/contacto' && request.method === 'POST'
      ? await onRequestPost({ request, env, ctx })
      : await env.ASSETS.fetch(request);

    if (!url.hostname.endsWith('.workers.dev')) return resposta;

    const copia = new Response(resposta.body, resposta);
    copia.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return copia;
  }
};
