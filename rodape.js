/* Rodapé partilhado: qualquer página põe um <div data-rodape></div> onde
   o quer e carrega este script. É síncrono de propósito — corre assim
   que o parser chega ao <script>, antes do DOMContentLoaded, portanto o
   rodapé já lá está quando os outros scripts arrancam.

   Os estilos continuam no styles.css (.footer, .assinatura) e a Caveat da
   assinatura vem no <link> do Google Fonts do <head> de cada página. */

/* Nas outras páginas as âncoras têm de apontar para a homepage. */
var RODAPE_NA_HOMEPAGE = /\/(index\.html)?$/.test(location.pathname);
var RODAPE_BASE = RODAPE_NA_HOMEPAGE ? '' : '/';

var RODAPE_HTML = `
<footer class="footer" aria-labelledby="footer-titulo">
  <h2 class="visually-hidden" id="footer-titulo">Rodapé</h2>

  <div class="footer__grid">

    <div class="footer__brand">
      <p class="footer__logo">PT<span class="nav__logo-dot">·</span>ACADEMY</p>
      <p class="footer__tagline">Vila Real · desde 2010</p>
      <ul class="footer__social">
        <li>
          <a href="https://www.instagram.com/pt.academy.dfcm/" target="_blank" rel="noopener" aria-label="Instagram da PT Academy">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
        </li>
        <li>
          <a href="https://www.facebook.com/ptacdm/?locale=pt_PT" target="_blank" rel="noopener" aria-label="Facebook da PT Academy">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.46-4 4.14V9.9H7.6V13h2.7v8z"/>
            </svg>
          </a>
        </li>
        <li>
          <a href="https://www.tiktok.com/@ptacademy.dfcm" target="_blank" rel="noopener" aria-label="TikTok da PT Academy">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M16.6 2h-2.9v13.1a2.55 2.55 0 1 1-2.1-2.5V9.6a5.6 5.6 0 1 0 5 5.57V8.9a6.4 6.4 0 0 0 3.7 1.18V7.2a3.63 3.63 0 0 1-3.7-3.6z"/>
            </svg>
          </a>
        </li>
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
        <li><a href="${RODAPE_BASE}#planos">Planos</a></li>
      </ul>
    </nav>

    <div class="footer__contact">
      <p class="footer__title">Contactos</p>
      <ul>
        <li>
          <a href="https://maps.google.com/?q=Travessa+da+Rua+Nova+56,+5000-651+Vila+Real" target="_blank" rel="noopener">
            Tv. da Rua Nova nº56<br>5000-651 Vila Real
          </a>
        </li>
        <li><a href="tel:+351259322108">259 322 108</a></li>
        <!-- TODO (confirmar com a academia): geral@ptacademy.pt é o
             endereço que estamos a convencionar, ainda por confirmar.
             Aparece também no contactos.html e no servidor.js. -->
        <li><a href="mailto:geral@ptacademy.pt">geral@ptacademy.pt</a></li>
      </ul>

      <p class="footer__title footer__title--horario">Horário</p>
      <dl class="footer__horario">
        <dt>Seg – Sex</dt><dd>07h – 22h</dd>
        <dt>Sábado</dt><dd>09h – 13h / 15h - 19h</dd>
        <dt>Domingo</dt><dd>Encerrado</dd>
      </dl>
    </div>

  </div>

  <div class="footer__watermark" aria-hidden="true">
    <span>PT·ACADEMY</span>
  </div>

  <div class="footer__legal">
    <p>© ${new Date().getFullYear()} PT Academy</p>
    <p class="assinatura">
      <span class="assinatura__mao">Designed by <a class="assinatura__mao-a" href="https://nkwebdesign.pt" target="_blank" rel="noopener">NK Web Design</a></span>
    </p>
    <ul>
      <li><a href="#">Política de privacidade</a></li>
      <li><a href="https://www.livroreclamacoes.pt/inicio" target="_blank" rel="noopener">Livro de Reclamações</a></li>
    </ul>
  </div>
</footer>`;

document.querySelectorAll('[data-rodape]').forEach(function (lugar) {
  lugar.outerHTML = RODAPE_HTML;
});
