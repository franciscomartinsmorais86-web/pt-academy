/* Servidor do site da PT Academy.
 *
 * Serve os ficheiros estáticos e expõe POST /api/contacto, que pega no
 * formulário do modal e manda a questão para o email da academia através
 * do Resend.
 *
 * Sem dependências: o fetch global do Node 18+ chega para falar com a API
 * do Resend, portanto não há npm install neste projeto.
 *
 *   node construir.js && node servidor.js
 *
 * Serve o site gerado em dist/ (ver construir.js), não a raiz: o que se
 * vê aqui é o mesmo que a Cloudflare publica. Depois de mudar conteúdo,
 * moldes, CSS ou JS, volta a correr o construir.js.
 *
 * Variáveis de ambiente (ver .env.exemplo):
 *   RESEND_API_KEY   obrigatória — a chave secreta, nunca no frontend
 *   EMAIL_DESTINO    para onde vão as questões
 *   EMAIL_REMETENTE  remetente verificado no Resend
 *   PORTA            por omissão 3000
 */

var http = require('http');
var fs = require('fs');
var path = require('path');

var PORTA = process.env.PORTA || 3000;
var SITE = path.join(__dirname, 'dist');
var RESEND_API_KEY = process.env.RESEND_API_KEY;
/* TODO (confirmar com a academia): geral@ptacademy.pt é o endereço que
   estamos a convencionar, ainda por confirmar. O email público do site
   está à parte, em conteudo/contactos.json. */
var EMAIL_DESTINO = process.env.EMAIL_DESTINO || 'geral@ptacademy.pt';
var EMAIL_REMETENTE = process.env.EMAIL_REMETENTE || 'Site PT Academy <site@ptacademy.pt>';

/* Corpo do pedido a partir do qual não vale a pena ler: o formulário mais
   folgado não chega perto disto. */
var TAMANHO_MAXIMO = 16 * 1024;

/* Travão simples por IP, em memória: quantos envios em quanto tempo.
   Chega para o que isto é — reinicia com o processo, e é um site só. */
var LIMITE_ENVIOS = 5;
var LIMITE_JANELA = 10 * 60 * 1000;
var historico = new Map();

var TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

var CANAIS = {
  telefone: 'Telefone',
  email: 'Email',
  mensagem: 'Mensagem'
};

/* ---------- Utilitários ---------- */

function json(resposta, codigo, corpo) {
  var texto = JSON.stringify(corpo);
  resposta.writeHead(codigo, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(texto)
  });
  resposta.end(texto);
}

/* O conteúdo do formulário vai para dentro de HTML — sem isto, um < do
   utilizador partia o email (ou pior). */
function escapar(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function limitar(ip) {
  var agora = Date.now();
  var envios = (historico.get(ip) || []).filter(function (t) {
    return agora - t < LIMITE_JANELA;
  });

  if (envios.length >= LIMITE_ENVIOS) return false;

  envios.push(agora);
  historico.set(ip, envios);
  return true;
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

function telefoneValido(valor) {
  return /^\d{9}$/.test(String(valor).replace(/[\s.-]/g, '').replace(/^\+351/, ''));
}

/* As mesmas regras do modal.js. Repetidas de propósito: a validação do
   cliente é conforto, esta é a que conta — o pedido pode vir de qualquer
   lado, não só do formulário. */
function validar(dados) {
  if (!dados || typeof dados !== 'object') return 'Pedido mal formado.';
  if (!dados.consentimento) return 'Falta a autorização de contacto.';

  var nome = String(dados.nome || '').trim();
  var questao = String(dados.questao || '').trim();

  if (nome.length < 2 || nome.length > 120) return 'Nome inválido.';
  if (questao.length < 10 || questao.length > 4000) return 'Questão inválida.';
  if (!CANAIS[dados.contacto]) return 'Meio de contacto inválido.';

  var telefone = String(dados.telefone || '').trim();
  var email = String(dados.email || '').trim();

  if (dados.contacto === 'email') {
    if (!emailValido(email)) return 'Email inválido.';
  } else if (!telefoneValido(telefone)) {
    return 'Telefone inválido.';
  }

  if (email && !emailValido(email)) return 'Email inválido.';
  if (telefone && !telefoneValido(telefone)) return 'Telefone inválido.';

  return null;
}

function montarEmail(dados) {
  var linhas = [
    ['Nome', dados.nome],
    ['Prefere ser contactado por', CANAIS[dados.contacto]],
    ['Telefone', dados.telefone || '—'],
    ['Email', dados.email || '—']
  ];

  var celulas = linhas.map(function (linha) {
    return '<tr>'
      + '<td style="padding:6px 16px 6px 0;color:#666;font-size:13px;'
      + 'text-transform:uppercase;letter-spacing:.1em;white-space:nowrap">'
      + escapar(linha[0]) + '</td>'
      + '<td style="padding:6px 0;color:#111;font-size:15px">'
      + escapar(linha[1]) + '</td>'
      + '</tr>';
  }).join('');

  return '<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px">'
    + '<p style="margin:0 0 4px;color:#C11D26;font-size:12px;letter-spacing:.3em;'
    + 'text-transform:uppercase">Site PT Academy</p>'
    + '<h1 style="margin:0 0 24px;font-size:22px;color:#111">Nova questão</h1>'
    + '<table style="border-collapse:collapse;margin-bottom:24px">' + celulas + '</table>'
    + '<div style="padding:16px 20px;background:#f5f5f5;border-left:3px solid #C11D26">'
    + '<p style="margin:0;color:#111;font-size:15px;line-height:1.6;white-space:pre-wrap">'
    + escapar(dados.questao) + '</p>'
    + '</div>'
    + '</div>';
}

/* ---------- POST /api/contacto ---------- */

function tratarContacto(pedido, resposta) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY não está definida — ver .env.exemplo.');
    return json(resposta, 500, { erro: 'O envio não está configurado.' });
  }

  var ip = pedido.headers['x-forwarded-for'] || pedido.socket.remoteAddress || 'desconhecido';
  if (!limitar(String(ip).split(',')[0].trim())) {
    return json(resposta, 429, { erro: 'Demasiados envios. Tenta daqui a pouco.' });
  }

  var pedacos = [];
  var tamanho = 0;
  var abortado = false;

  pedido.on('data', function (pedaco) {
    tamanho += pedaco.length;
    if (tamanho > TAMANHO_MAXIMO) {
      abortado = true;
      json(resposta, 413, { erro: 'Questão demasiado longa.' });
      pedido.destroy();
      return;
    }
    pedacos.push(pedaco);
  });

  pedido.on('end', function () {
    if (abortado) return;

    var dados;
    try {
      dados = JSON.parse(Buffer.concat(pedacos).toString('utf8'));
    } catch (erro) {
      return json(resposta, 400, { erro: 'Pedido mal formado.' });
    }

    /* Pote de mel: só um bot preenche um campo que ninguém vê. Responde
       200 na mesma para não lhe dar a dica. */
    if (dados.empresa) {
      console.log('Envio ignorado (pote de mel).');
      return json(resposta, 200, { ok: true });
    }

    var problema = validar(dados);
    if (problema) return json(resposta, 400, { erro: problema });

    var limpo = {
      nome: String(dados.nome).trim(),
      email: String(dados.email || '').trim(),
      telefone: String(dados.telefone || '').trim(),
      contacto: dados.contacto,
      questao: String(dados.questao).trim()
    };

    var corpo = {
      from: EMAIL_REMETENTE,
      to: [EMAIL_DESTINO],
      subject: 'Questão do site — ' + limpo.nome,
      html: montarEmail(limpo)
    };

    /* Responder ao email vai direto ao sócio, quando ele deu email. */
    if (limpo.email) corpo.reply_to = limpo.email;

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(corpo)
    }).then(function (r) {
      return r.json().then(function (c) {
        return { ok: r.ok, corpo: c };
      });
    }).then(function (r) {
      if (!r.ok) {
        console.error('Resend recusou:', r.corpo);
        return json(resposta, 502, { erro: 'Não conseguimos enviar agora.' });
      }
      console.log('Questão enviada de', limpo.nome);
      json(resposta, 200, { ok: true });
    }).catch(function (erro) {
      console.error('Resend inacessível:', erro.message);
      json(resposta, 502, { erro: 'Não conseguimos enviar agora.' });
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
    if (erro) {
      resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return resposta.end('Não encontrado');
    }
    resposta.writeHead(200, {
      'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream'
    });
    resposta.end(conteudo);
  });
}

/* ---------- Servidor ---------- */

http.createServer(function (pedido, resposta) {
  /* O site e a API são servidos daqui, portanto o pedido é da mesma
     origem e não precisa de CORS. Se a API passar a viver noutro sítio,
     é aqui que entra o Access-Control-Allow-Origin — com o domínio do
     site, nunca com *. */
  if (pedido.url.split('?')[0] === '/api/contacto') {
    if (pedido.method !== 'POST') {
      resposta.writeHead(405, { 'Allow': 'POST' });
      return resposta.end();
    }
    return tratarContacto(pedido, resposta);
  }

  if (pedido.method !== 'GET' && pedido.method !== 'HEAD') {
    resposta.writeHead(405);
    return resposta.end();
  }

  servirFicheiro(pedido, resposta);
}).listen(PORTA, function () {
  console.log('PT Academy em http://localhost:' + PORTA);
  if (!RESEND_API_KEY) {
    console.warn('Aviso: RESEND_API_KEY por definir — o formulário devolve erro.');
  }
});
