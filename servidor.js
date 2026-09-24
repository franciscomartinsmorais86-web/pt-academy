/* Servidor local do site da PT Academy — só para testar no computador.
 *
 * Faz o que a Cloudflare Pages faz em produção:
 *   - serve o site gerado em dist/ (ver construir.js);
 *   - responde a endereços sem extensão (/3-meses-gratis) com o .html do
 *     mesmo nome, e ao que não existe com a 404.html;
 *   - entrega POST /api/contacto à MESMA função que corre na Cloudflare
 *     (functions/api/contacto.js), para o formulário se testar igual.
 *
 * Sem dependências (Node 20.6 ou mais recente):
 *
 *   node construir.js
 *   node --env-file=.env servidor.js
 *
 * Variáveis de ambiente (ver .env.exemplo): RESEND_API_KEY,
 * EMAIL_DESTINO, EMAIL_REMETENTE e PORTA (por omissão 3000). Sem o .env
 * o site abre na mesma; só o formulário responde que o envio não está
 * configurado. */

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var PORTA = process.env.PORTA || 3000;
var SITE = path.join(__dirname, 'dist');
var FUNCAO = path.join(__dirname, 'functions', 'api', 'contacto.js');

var TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

/* ---------- POST /api/contacto ---------- */

/* Converte o pedido do Node num Request, chama a função da Cloudflare e
   devolve a Response dela ao browser. */
function tratarContacto(pedido, resposta) {
  var pedacos = [];
  pedido.on('data', function (pedaco) { pedacos.push(pedaco); });
  pedido.on('end', function () {
    var request = new Request('http://localhost:' + PORTA + pedido.url, {
      method: 'POST',
      headers: { 'Content-Type': pedido.headers['content-type'] || 'application/json' },
      body: Buffer.concat(pedacos)
    });

    import(url.pathToFileURL(FUNCAO).href)
      .then(function (funcao) {
        return funcao.onRequestPost({ request: request, env: process.env });
      })
      .then(function (r) {
        return r.text().then(function (texto) {
          resposta.writeHead(r.status, { 'Content-Type': r.headers.get('Content-Type') || 'text/plain' });
          resposta.end(texto);
        });
      })
      .catch(function (erro) {
        console.error('Erro na função de contacto:', erro);
        resposta.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        resposta.end(JSON.stringify({ erro: 'Erro no servidor.' }));
      });
  });
}

/* ---------- Ficheiros estáticos ---------- */

function servirFicheiro(pedido, resposta) {
  var caminho = decodeURIComponent(pedido.url.split('?')[0]);
  if (caminho === '/') caminho = '/index.html';

  /* path.normalize antes do join: sem isto, um ../../ no URL saía da
     pasta do site. */
  var alvo = path.join(SITE, path.normalize(caminho).replace(/^(\.\.[/\\])+/, ''));
  if (!alvo.startsWith(SITE)) {
    resposta.writeHead(403);
    return resposta.end('Proibido');
  }

  /* Endereços sem extensão (a página da campanha, /3-meses-gratis)
     servem o .html com o mesmo nome, como a Cloudflare Pages faz. */
  if (!path.extname(alvo)) alvo += '.html';

  fs.readFile(alvo, function (erro, conteudo) {
    /* Como a Cloudflare: o que não existe recebe a 404.html do site. */
    if (erro) {
      return fs.readFile(path.join(SITE, '404.html'), function (erro404, pagina) {
        resposta.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        resposta.end(erro404 ? 'Não encontrado' : pagina);
      });
    }
    resposta.writeHead(200, {
      'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream'
    });
    resposta.end(conteudo);
  });
}

/* ---------- Servidor ---------- */

if (!fs.existsSync(SITE)) {
  console.error('Não há dist/. Corre primeiro: node construir.js');
  process.exit(1);
}

http.createServer(function (pedido, resposta) {
  if (pedido.url.split('?')[0] === '/api/contacto' && pedido.method === 'POST') {
    return tratarContacto(pedido, resposta);
  }

  if (pedido.method !== 'GET' && pedido.method !== 'HEAD') {
    resposta.writeHead(405);
    return resposta.end();
  }

  servirFicheiro(pedido, resposta);
}).listen(PORTA, function () {
  console.log('PT Academy em http://localhost:' + PORTA);
  if (!process.env.RESEND_API_KEY) {
    console.warn('Aviso: RESEND_API_KEY por definir — o formulário devolve erro.');
  }
});
