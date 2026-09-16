/* Walkthrough PT Academy — componente.
 *
 *   import { montarWalkthrough } from "./walkthrough.js";
 *   const wt = montarWalkthrough(document.querySelector("#wt"), dados, {
 *     base: "/assets/walkthrough/",
 *   });
 *
 * Sem dependências. Formato dos dados, API e regras: NOTAS.md, secção
 * "Passeio virtual".
 */

const POSICOES = {
  "canto-inferior-esquerdo": { classe: "ci-esq", lado: "esq" },
  "canto-superior-esquerdo": { classe: "cs-esq", lado: "esq" },
  "canto-inferior-direito":  { classe: "ci-dir", lado: "dir" },
  "canto-superior-direito":  { classe: "cs-dir", lado: "dir" },
  "margem-esquerda":         { classe: "m-esq",  lado: "esq" },
  "margem-direita":          { classe: "m-dir",  lado: "dir" },
  "margem-superior":         { classe: "m-sup",  lado: "cima" },
  "margem-inferior":         { classe: "m-inf",  lado: "baixo" },
};

const POSICAO_OMISSAO = "canto-inferior-esquerdo";
const ROTULO_OMISSAO = "Ver mais";
const AR = 4 / 3;

const SVG_SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>';

const CLASSE_SETA = { esq: "", dir: " para-dir", cima: " para-cima", baixo: " para-baixo" };

const escapar = s => String(s).replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const seta = lado => `<span class="wt-seta${CLASSE_SETA[lado] || ""}">${SVG_SETA}</span>`;

function lerPosicao(spec){
  const nome = (spec && typeof spec === "object") ? spec.pos : spec;
  return POSICOES[nome] || POSICOES[POSICAO_OMISSAO];
}

export function montarWalkthrough(alvo, dados, opcoes = {}){
  const base = opcoes.base || "";
  const cenas = dados.cenas;
  const inicio = opcoes.inicio || dados.inicio;
  const aoMudar = opcoes.aoMudar || null;   // callback(id, cena) a cada cena

  let pilha = [];
  let atual = null;

  alvo.classList.add("wt");
  const caixa = document.createElement("div");
  caixa.className = "wt-caixa";
  alvo.appendChild(caixa);

  const url = c => base + c.ficheiro;
  // um ecrã dividido não tem ficheiro próprio: as fotos são as das partes
  const existe = c => !!c && (c.tipo === "split" || (!!c.ficheiro && !c.falta));

  /* A caixa tem de ser exactamente 4:3 em pixels: é dela que dependem as
     percentagens de cada ponto. Medir e atribuir é determinístico; deixar
     ao CSS dá resultados diferentes conforme o conteúdo. */
  function dimensionar(){
    const r = alvo.getBoundingClientRect();
    if(!r.width) return;
    const limite = opcoes.alturaMaxima || Infinity;
    let cw = r.width, ch = cw / AR;
    const maxAltura = Math.min(r.height || Infinity, limite);
    if(ch > maxAltura){ ch = maxAltura; cw = ch * AR; }
    caixa.style.width = Math.floor(cw) + "px";
    caixa.style.height = Math.floor(ch) + "px";
  }

  /* A pastilha não pode animar até width:auto: mede-se o rótulo e guarda-se
     a largura final em --w (e a altura em --h nas margens verticais). */
  function medir(){
    caixa.querySelectorAll(".wt-alvo").forEach(a => {
      const t = a.querySelector(".wt-txt");
      if(!t) return;
      const d = parseFloat(getComputedStyle(alvo).getPropertyValue("--wt-alvo")) || 34;
      const pai = a.closest(".wt-volta");
      if(pai && (pai.classList.contains("m-inf") || pai.classList.contains("m-sup"))){
        a.style.setProperty("--w", Math.max(d, Math.ceil(t.offsetWidth)) + "px");
        a.style.setProperty("--h", (d + Math.ceil(t.offsetHeight)) + "px");
        return;
      }
      a.style.setProperty("--w", (d + Math.ceil(t.offsetWidth)) + "px");
    });
  }

  function botaoVoltar(c){
    if(!pilha.length || c.voltar === false) return null;
    const spec = c.voltar;
    const b = document.createElement("div");

    if(spec && typeof spec === "object" && spec.left !== undefined){
      const lado = spec.seta || (spec.left > 55 ? "dir" : "esq");
      b.className = "wt-volta livre" + (spec.left > 55 ? " abre-esq" : "");
      b.style.left = spec.left + "%";
      b.style.top = (spec.top !== undefined ? spec.top : 50) + "%";
      b.innerHTML = `<button class="wt-alvo" aria-label="Voltar">${seta(lado)}` +
        `<span class="wt-txt">Voltar</span></button>`;
    } else {
      const pos = lerPosicao(spec);
      b.className = "wt-volta " + pos.classe + (pos.lado === "dir" ? " dir" : "");
      b.innerHTML = `<button class="wt-alvo" aria-label="Voltar">${seta(pos.lado)}` +
        `<span class="wt-txt">Voltar</span></button>`;
      if(spec && typeof spec === "object"){
        if(spec.y !== undefined) b.style.top = spec.y + "%";
        if(spec.x !== undefined) b.style.left = spec.x + "%";
      }
    }
    b.querySelector(".wt-alvo").onclick = e => { e.stopPropagation(); voltar(); };
    return b;
  }

  function botaoMargem(m){
    const pos = lerPosicao(m.pos !== undefined ? m : m.pos);
    const b = document.createElement("div");
    // wt-avanca e não "nav": o .nav do site é a barra fixa e dava a este
    // botão left:0, right:0 e padding — esticava-o e encostava-o à esquerda.
    b.className = "wt-volta wt-avanca " + pos.classe + (pos.lado === "dir" ? " dir" : "");
    const semSeta = m.seta === false;
    const bico = semSeta ? '<span class="wt-seta"></span>' : seta(pos.lado);
    const rotulo = semSeta ? (m.texto || ROTULO_OMISSAO) : m.texto;
    const nome = rotulo || (cenas[m.para] && cenas[m.para].titulo) || "Seguir";
    b.innerHTML = `<button class="wt-alvo" aria-label="${escapar(nome)}">${bico}` +
      (rotulo ? `<span class="wt-txt">${escapar(rotulo)}</span>` : "") + `</button>`;
    b.querySelector(".wt-alvo").onclick = e => { e.stopPropagation(); ir(m.para); };
    if(m.y !== undefined) b.style.top = m.y + "%";
    if(m.x !== undefined) b.style.left = m.x + "%";
    return b;
  }

  function desenhar(){
    const c = cenas[atual];
    caixa.innerHTML = "";
    const el = document.createElement("div");
    el.className = "wt-cena";

    if(c.tipo === "split"){
      const d = document.createElement("div");
      d.className = "wt-dividido";
      c.partes.forEach(parte => {
        const meia = document.createElement("div");
        meia.className = "wt-metade";
        meia.innerHTML = `<img src="${url(cenas[parte.id])}" alt="${escapar(parte.titulo)}">` +
          `<div class="wt-rotulo">${escapar(parte.titulo)}</div>`;
        meia.onclick = () => {
          if(d.classList.contains("a-expandir")) return;
          d.classList.add("a-expandir");
          meia.classList.add("escolhida");
          setTimeout(() => ir(parte.id), 560);
        };
        d.appendChild(meia);
      });
      el.appendChild(d);
    } else if(!existe(c)){
      el.innerHTML = `<div class="wt-falta"><b>Foto por tirar</b>` +
        `<code>${escapar(c.ficheiro || atual)}</code></div>`;
    } else {
      const img = document.createElement("img");
      img.className = "wt-fundo";
      img.src = url(c);
      img.alt = c.titulo || "";
      img.onerror = () => {
        const aviso = document.createElement("div");
        aviso.className = "wt-falta";
        aviso.innerHTML = `<b>Foto por carregar</b><code>${escapar(url(c))}</code>`;
        img.replaceWith(aviso);
      };
      el.appendChild(img);

      (c.pontos || []).forEach(p => {
        const destino = cenas[p.para];
        const b = document.createElement("div");
        b.className = "wt-ponto" + (existe(destino) ? "" : " falta") +
                      (p.left > 55 ? " abre-esq" : "") +
                      (p.destaque ? " wt-destaque" : "");
        b.style.left = p.left + "%";
        b.style.top = p.top + "%";
        const rotulo = p.texto || ROTULO_OMISSAO;
        const dentro = p.seta
          ? seta("cima")
          : `<span class="wt-seta"></span><span class="wt-txt">${escapar(rotulo)}</span>`;
        b.innerHTML = `<button class="wt-alvo" aria-label="${escapar(rotulo)}">${dentro}</button>`;
        b.querySelector(".wt-alvo").onclick = () => ir(p.para);
        el.appendChild(b);
      });
    }

    (c.margens || []).forEach(m => el.appendChild(botaoMargem(m)));
    const bv = botaoVoltar(c);
    if(bv) el.appendChild(bv);

    caixa.appendChild(el);
    requestAnimationFrame(() => el.classList.add("on"));
    medir();
    precarregar(c);
    if(aoMudar) aoMudar(atual, c);
  }

  function precarregar(c){
    const juntar = d => {
      if(!d) return;
      if(d.tipo === "split") return (d.partes || []).forEach(x => juntar(cenas[x.id]));
      if(d.ficheiro && !d.falta){ const i = new Image(); i.src = url(d); }
    };
    (c.pontos || []).forEach(p => juntar(cenas[p.para]));
    (c.margens || []).forEach(m => juntar(cenas[m.para]));
    (c.partes || []).forEach(x => juntar(cenas[x.id]));
  }

  function ir(id, empilhar = true){
    if(!cenas[id]) return;
    if(empilhar && atual) pilha.push(atual);
    atual = id;
    desenhar();
  }

  function voltar(){
    if(!pilha.length) return;
    atual = pilha.pop();
    desenhar();
  }

  function aoTeclado(e){
    if(e.key === "Escape" && pilha.length){ e.preventDefault(); voltar(); }
  }

  const aoRedimensionar = () => dimensionar();
  window.addEventListener("resize", aoRedimensionar);
  window.addEventListener("keydown", aoTeclado);
  if(window.ResizeObserver){
    const ro = new ResizeObserver(dimensionar);
    ro.observe(alvo);
  }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

  dimensionar();
  ir(inicio, false);

  return {
    ir,
    voltar,
    reiniciar(){ pilha = []; atual = null; ir(inicio, false); },
    get cena(){ return atual; },
    get profundidade(){ return pilha.length; },
    destruir(){
      window.removeEventListener("resize", aoRedimensionar);
      window.removeEventListener("keydown", aoTeclado);
      caixa.remove();
      alvo.classList.remove("wt");
    },
  };
}

export default montarWalkthrough;
