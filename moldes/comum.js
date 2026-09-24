/* Peças partilhadas pelos moldes das páginas.

   Cada molde é uma função que recebe os dados (conteudo/ já lido e com
   os valores derivados, ver construir.js) e devolve o HTML da página.
   Tudo o que vem do conteúdo passa por esc() ou por marcas(): o cliente
   nunca injeta HTML. */

/* ---------- Texto ---------- */

function esc(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Converte as marcas do conteudo/LEIAME.md, depois de escapar:
   **forte**, *destaque*, | quebra de linha, {telefone}. */
function marcas(texto, d) {
  var html = esc(texto)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\s*\|\s*/g, '<br>');
  if (d && html.indexOf('{telefone}') !== -1) {
    html = html.replace(/\{telefone\}/g,
      `<a href="${d.tel}">${esc(d.contactos.telefone)}</a>`);
  }
  return html;
}

/* ---------- Links e botões ---------- */

/* O endereço de uma ação (ver comum.json#/$defs/acao). */
function destino(acao, d) {
  if (acao === 'ligar') return d.tel;
  if (acao === 'campanha') return '/' + d.campanha.endereco;
  return acao;
}

/* Um botão do design system. 'modal' é um <button> que abre o
   formulário; o resto é um <a>. */
function botao(b, variante, d, classeExtra) {
  var classe = `button button--${variante}${classeExtra ? ' ' + classeExtra : ''}`;
  if (b.acao === 'modal') {
    return `<button type="button" class="${classe}" data-modal-abrir>${esc(b.texto)}</button>`;
  }
  return `<a class="${classe}" href="${esc(destino(b.acao, d))}">${esc(b.texto)}</a>`;
}

/* Grupo de dois: o primeiro vermelho, o segundo em contorno. */
function botoes(lista, d, indent) {
  return lista
    .map(function (b, i) { return botao(b, i === 0 ? 'red' : 'outline', d); })
    .join('\n' + (indent || ''));
}

/* Caminhos absolutos em todo o site: a página 404 é servida em qualquer
   endereço (/a/b/c), e um caminho relativo partia-lhe o CSS e as fotos. */
function src(ficheiro) {
  return '/assets/' + ficheiro;
}

/* 01, 02… */
function dois(n) {
  return String(n).padStart(2, '0');
}

/* ---------- Cabeça e esqueleto ---------- */

var FONTES = 'https://fonts.googleapis.com/css2?family=Anton&family=Libre+Franklin:wght@400;600&family=Caveat&display=swap';

function cabeca(o, d) {
  var titulo = o.seo.titulo === d.geral.nome
    ? d.geral.nome
    : `${o.seo.titulo} · ${d.geral.nome}`;
  var css = ['styles.css'].concat(o.css || []);
  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(o.seo.descricao)}">
<link href="${FONTES}" rel="stylesheet">
${css.map(function (f) { return `<link rel="stylesheet" href="/${f}">`; }).join('\n')}
${o.extraCabeca ? o.extraCabeca + '\n' : ''}<script>document.documentElement.classList.add('js');</script>
</head>`;
}

/* ---------- Nav ---------- */

var NAV_ITENS = [
  { texto: 'Início',      href: '/' },
  { texto: 'Sobre nós',   href: '/sobre.html' },
  { texto: 'Modalidades', href: '/modalidades.html' },
  { texto: 'Instalações', href: '/instalacoes.html' },
  { texto: 'Equipa',      href: '/equipa.html' },
  { texto: 'Contactos',   href: '/contactos.html' }
];

/* Com a campanha ativa, o link dela entra em primeiro lugar, a vermelho
   (--campanha). A página em que se está leva aria-current e fica
   sublinhada (styles.css). */
function navItens(pagina, d, classeItem, classeLink) {
  var itens = NAV_ITENS.slice();
  if (d.campanha.ativa) {
    itens.unshift({ texto: d.campanha.nav, href: '/' + d.campanha.endereco, campanha: true });
  }
  return itens.map(function (item) {
    var atual = item.href === pagina ? ' aria-current="page"' : '';
    var li = classeItem ? ` class="${classeItem}"` : '';
    var classe = item.campanha ? `${classeLink} ${classeLink}--campanha` : classeLink;
    return `<li${li}><a class="${classe}" href="${esc(item.href)}"${atual}>${esc(item.texto)}</a></li>`;
  }).join('\n    ');
}

/* O comportamento (scroll, hamburger) continua no nav.js. */
function nav(pagina, d) {
  return `<!-- Nav e menu: gerados pelo construir.js; o comportamento está no nav.js -->
<nav class="nav">
  <a href="/" class="nav__logo">PT<span class="nav__logo-dot">·</span>ACADEMY</a>

  <ul class="nav__links">
    ${navItens(pagina, d, '', 'nav__link')}
  </ul>

  <button type="button" class="nav__toggle" id="nav-toggle"
          aria-label="Abrir menu" aria-expanded="false" aria-controls="menu">
    <span class="nav__toggle-bar"></span>
    <span class="nav__toggle-bar"></span>
    <span class="nav__toggle-bar"></span>
  </button>
</nav>

<!-- Menu em ecrã inteiro -->
<div class="menu" id="menu">
  <ul class="menu__list">
    ${navItens(pagina, d, 'menu__item', 'menu__link')}
  </ul>
</div>
<script src="/nav.js"></script>`;
}

/* ---------- Rodapé ---------- */

var ICONES = {
  instagram: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>
            </svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.46-4 4.14V9.9H7.6V13h2.7v8z"/>
            </svg>`,
  tiktok: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M16.6 2h-2.9v13.1a2.55 2.55 0 1 1-2.1-2.5V9.6a5.6 5.6 0 1 0 5 5.57V8.9a6.4 6.4 0 0 0 3.7 1.18V7.2a3.63 3.63 0 0 1-3.7-3.6z"/>
            </svg>`
};
var REDES = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };

function rodape(pagina, d) {
  var base = pagina === '/' ? '' : '/';
  var c = d.contactos;
  var redes = d.geral.redes.map(function (r) {
    return `        <li>
          <a href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${REDES[r.rede]} da ${esc(d.geral.nome)}">
            ${ICONES[r.rede]}
          </a>
        </li>`;
  }).join('\n');
  var horario = c.horario.map(function (h) {
    return `        <dt>${esc(h.curto)}</dt><dd>${esc(h.horas)}</dd>`;
  }).join('\n');

  return `<!-- Rodapé: gerado pelo construir.js -->
<footer class="footer" aria-labelledby="footer-titulo">
  <h2 class="visually-hidden" id="footer-titulo">Rodapé</h2>

  <div class="footer__grid">
    <div class="footer__brand">
      <p class="footer__logo">PT<span class="nav__logo-dot">·</span>ACADEMY</p>
      <p class="footer__tagline">${esc(d.geral.tagline)}</p>
      <ul class="footer__social">
${redes}
      </ul>
    </div>

    <nav class="footer__col" aria-labelledby="footer-nav">
      <p class="footer__title" id="footer-nav">Navegação</p>
      <ul>
        <li><a href="/">Início</a></li>
        <li><a href="/sobre.html">Sobre nós</a></li>
        <li><a href="/modalidades.html">Modalidades</a></li>
        <li><a href="/contactos.html">Contactos</a></li>
      </ul>
    </nav>

    <nav class="footer__col" aria-labelledby="footer-academia">
      <p class="footer__title" id="footer-academia">A academia</p>
      <ul>
        <li><a href="/instalacoes.html">Instalações</a></li>
        <li><a href="/equipa.html">Equipa</a></li>
        <li><a href="${base}#planos">Planos</a></li>
      </ul>
    </nav>

    <div class="footer__contact">
      <p class="footer__title">Contactos</p>
      <ul>
        <li>
          <a href="${esc(c.mapa)}" target="_blank" rel="noopener">
            ${c.morada.map(esc).join('<br>')}
          </a>
        </li>
        <li><a href="${d.tel}">${esc(c.telefone)}</a></li>
        <li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
      </ul>
      <p class="footer__title footer__title--horario">Horário</p>
      <dl class="footer__horario">
${horario}
      </dl>
    </div>
  </div>

  <div class="footer__watermark" aria-hidden="true">
    <span>PT·ACADEMY</span>
  </div>

  <div class="footer__legal">
    <p>© <span data-ano>${d.ano}</span> ${esc(d.geral.nome)}</p>
    <p class="assinatura">
      <span class="assinatura__mao">Designed by <a class="assinatura__mao-a" href="https://nkwebdesign.pt" target="_blank" rel="noopener">NK Web Design</a></span>
    </p>
    <ul>
      <li><a href="${esc(d.geral.privacidade)}">Política de privacidade</a></li>
      <li><a href="${esc(d.geral.livroReclamacoes)}" target="_blank" rel="noopener">Livro de Reclamações</a></li>
    </ul>
  </div>
</footer>`;
}

/* ---------- Blocos repetidos ---------- */

function fecho(f, d) {
  return `<!-- Faixa de fecho -->
<section class="closer">
  <p class="closer__eyebrow">${esc(f.eyebrow)}</p>
  <h2 class="closer__title">${marcas(f.titulo)}</h2>
  <div class="closer__actions">
    ${botoes(f.botoes, d, '    ')}
  </div>
</section>`;
}

/* O formulário de questão. É estrutura (nível C): os textos dos campos
   estão acoplados à validação no formulario.js. 'linhas' é a altura da
   caixa da questão, que é menor na página de Contactos. */
function formulario(linhas, indent) {
  var html = `<form class="form" id="form-contacto" novalidate>

  <div class="form__linha">
    <div class="campo">
      <label class="campo__label" for="campo-nome">Nome</label>
      <input class="campo__input" id="campo-nome" name="nome" type="text"
             autocomplete="name" required>
      <p class="campo__erro" data-erro="nome"></p>
    </div>
  </div>

  <fieldset class="form__grupo">
    <legend class="campo__label">Como preferes ser contactado?</legend>
    <div class="opcoes">
      <label class="opcao">
        <input type="radio" name="contacto" value="telefone" checked>
        <span>Telefone</span>
      </label>
      <label class="opcao">
        <input type="radio" name="contacto" value="email">
        <span>Email</span>
      </label>
      <label class="opcao">
        <input type="radio" name="contacto" value="mensagem">
        <span>Mensagem</span>
      </label>
    </div>
  </fieldset>

  <div class="form__linha">
    <div class="campo">
      <label class="campo__label" for="campo-telefone">Telemóvel</label>
      <input class="campo__input" id="campo-telefone" name="telefone" type="tel"
             autocomplete="tel" inputmode="tel" placeholder="9xx xxx xxx">
      <p class="campo__erro" data-erro="telefone"></p>
    </div>
    <div class="campo">
      <label class="campo__label" for="campo-email">Email</label>
      <input class="campo__input" id="campo-email" name="email" type="email"
             autocomplete="email" placeholder="nome@exemplo.pt">
      <p class="campo__erro" data-erro="email"></p>
    </div>
  </div>

  <div class="campo">
    <label class="campo__label" for="campo-questao">A tua questão</label>
    <textarea class="campo__input campo__input--area" id="campo-questao"
              name="questao" rows="${linhas}" required
              placeholder="Horários, planos, aulas experimentais…"></textarea>
    <p class="campo__erro" data-erro="questao"></p>
  </div>

  <label class="consentimento">
    <input type="checkbox" name="consentimento" required>
    <span>Autorizo a PT Academy a usar os meus contactos para responder a esta questão.</span>
  </label>
  <p class="campo__erro" data-erro="consentimento"></p>

  <!-- Armadilha para bots: invisível e fora da ordem de tabulação. -->
  <div class="pote-de-mel" aria-hidden="true">
    <label for="campo-empresa">Empresa</label>
    <input id="campo-empresa" name="empresa" type="text" tabindex="-1" autocomplete="off">
  </div>

  <button type="submit" class="button button--red form__enviar">
    <span class="form__enviar-texto">Enviar questão</span>
  </button>

  <p class="form__estado" data-estado role="status" aria-live="polite"></p>
</form>`;
  return html.replace(/\n/g, '\n' + (indent || ''));
}

var VISTO = `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="square">
          <path d="M4 12.5l5.5 5.5L20 7"/>
        </svg>`;

/* Modal de contacto. Só entra nas páginas que têm um botão 'modal'
   (o construir.js decide), com o formulario.js e o modal.js. */
function modal(d) {
  var m = d.paginas.modal;
  var s = d.paginas.sucesso;
  return `<!-- Modal de contacto -->
<div class="modal" id="modal-contacto" role="dialog" aria-modal="true"
     aria-labelledby="modal-titulo" hidden>
  <div class="modal__fundo" data-modal-fechar></div>

  <div class="modal__caixa" role="document">
    <button type="button" class="modal__fechar" data-modal-fechar aria-label="Fechar">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="square" aria-hidden="true">
        <path d="M5 5l14 14M19 5L5 19"/>
      </svg>
    </button>

    <p class="modal__eyebrow">${esc(m.eyebrow)}</p>
    <h2 class="modal__titulo" id="modal-titulo">${marcas(m.titulo)}</h2>
    <p class="modal__lead">${esc(m.lead)}</p>

    ${formulario(4, '    ')}

    <div class="sucesso" data-sucesso hidden>
      <div class="sucesso__visto" aria-hidden="true">
        ${VISTO}
      </div>
      <h3 class="sucesso__titulo">${esc(s.titulo)}</h3>
      <p class="sucesso__lead">${esc(s.lead)}</p>
      <button type="button" class="button button--outline" data-modal-fechar>Fechar</button>
    </div>
  </div>
</div>`;
}

/* Fecha a página: rodapé, modal se for preciso, scripts. */
function fim(pagina, corpo, scripts, d) {
  var comModal = corpo.indexOf('data-modal-abrir') !== -1;
  var lista = scripts.slice();
  if (comModal) {
    if (corpo.indexOf('id="form-contacto"') !== -1) {
      throw new Error(`${pagina}: um botão 'modal' numa página que já tem o formulário.`);
    }
    ['formulario.js', 'modal.js'].forEach(function (s) {
      if (lista.indexOf(s) === -1) lista.push(s);
    });
  }
  return `${rodape(pagina, d)}
${comModal ? modal(d) + '\n' : ''}
${lista.map(function (s) { return `<script src="/${s}"></script>`; }).join('\n')}
`;
}

module.exports = {
  esc, marcas, destino, botao, botoes, src, dois,
  cabeca, nav, rodape, fecho, formulario, VISTO, fim
};
