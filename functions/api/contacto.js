/* POST /api/contacto — o envio do formulário.

   Recebe o formulário de questão (modal da homepage e página de
   Contactos, ver formulario.js), valida-o e manda-o por email através
   do Resend. É o único código do site que corre num servidor: a chave do
   Resend não pode ir para o browser.

   Na Cloudflare, o worker.js chama-a em POST /api/contacto. No teu
   computador, o servidor.js importa-a e chama-a da mesma maneira.

   Variáveis de ambiente (painel da Cloudflare em Settings > Variables
   and Secrets, ou .env localmente):
     RESEND_API_KEY   obrigatória — a chave secreta
     EMAIL_DESTINO    para onde vão as questões
     EMAIL_REMETENTE  remetente verificado no Resend

   O travão de envios por IP não está aqui: uma função não guarda memória
   entre pedidos. É uma regra de rate limiting no painel da Cloudflare
   (ver NOTAS.md). */

/* TODO (confirmar com a academia): geral@ptacademy.pt é o endereço que
   estamos a convencionar. O email público do site está à parte, em
   conteudo/contactos.json. */
const DESTINO = 'geral@ptacademy.pt';
const REMETENTE = 'Site PT Academy <site@ptacademy.pt>';

/* Corpo a partir do qual não vale a pena ler: o formulário mais folgado
   não chega perto disto. */
const TAMANHO_MAXIMO = 16 * 1024;

const CANAIS = {
  telefone: 'Telefone',
  email: 'Email',
  mensagem: 'Mensagem'
};

/* ---------- Utilitários ---------- */

function json(codigo, corpo) {
  return new Response(JSON.stringify(corpo), {
    status: codigo,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
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

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

function telefoneValido(valor) {
  return /^\d{9}$/.test(String(valor).replace(/[\s.-]/g, '').replace(/^\+351/, ''));
}

/* As mesmas regras do formulario.js. Repetidas de propósito: a validação
   do browser é conforto, esta é a que conta — o pedido pode vir de
   qualquer lado, não só do formulário. */
function validar(dados) {
  if (!dados || typeof dados !== 'object') return 'Pedido mal formado.';
  if (!dados.consentimento) return 'Falta a autorização de contacto.';

  const nome = String(dados.nome || '').trim();
  const questao = String(dados.questao || '').trim();

  if (nome.length < 2 || nome.length > 120) return 'Nome inválido.';
  if (questao.length < 10 || questao.length > 4000) return 'Questão inválida.';
  if (!Object.prototype.hasOwnProperty.call(CANAIS, dados.contacto)) return 'Meio de contacto inválido.';

  const telefone = String(dados.telefone || '').trim();
  const email = String(dados.email || '').trim();

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
  const linhas = [
    ['Nome', dados.nome],
    ['Prefere ser contactado por', CANAIS[dados.contacto]],
    ['Telefone', dados.telefone || '—'],
    ['Email', dados.email || '—']
  ];

  const celulas = linhas.map(function (linha) {
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

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY não está definida.');
    return json(500, { erro: 'O envio não está configurado.' });
  }

  const texto = await request.text();
  if (texto.length > TAMANHO_MAXIMO) {
    return json(413, { erro: 'Questão demasiado longa.' });
  }

  let dados;
  try {
    dados = JSON.parse(texto);
  } catch (erro) {
    return json(400, { erro: 'Pedido mal formado.' });
  }

  /* Pote de mel: só um bot preenche um campo que ninguém vê. Responde
     200 na mesma para não lhe dar a dica. */
  if (dados && dados.empresa) {
    console.log('Envio ignorado (pote de mel).');
    return json(200, { ok: true });
  }

  const problema = validar(dados);
  if (problema) return json(400, { erro: problema });

  const limpo = {
    nome: String(dados.nome).trim(),
    email: String(dados.email || '').trim(),
    telefone: String(dados.telefone || '').trim(),
    contacto: dados.contacto,
    questao: String(dados.questao).trim()
  };

  const corpo = {
    from: env.EMAIL_REMETENTE || REMETENTE,
    to: [env.EMAIL_DESTINO || DESTINO],
    subject: 'Questão do site — ' + limpo.nome,
    html: montarEmail(limpo)
  };

  /* Responder ao email vai direto ao sócio, quando ele deu email. */
  if (limpo.email) corpo.reply_to = limpo.email;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(corpo)
    });
    if (!r.ok) {
      console.error('Resend recusou:', await r.text());
      return json(502, { erro: 'Não conseguimos enviar agora.' });
    }
  } catch (erro) {
    console.error('Resend inacessível:', erro.message);
    return json(502, { erro: 'Não conseguimos enviar agora.' });
  }

  console.log('Questão enviada de', limpo.nome);
  return json(200, { ok: true });
}

/* Só existe o onRequestPost: um GET a /api/contacto passa para os
   ficheiros estáticos (worker.js) e acaba na página 404. */
