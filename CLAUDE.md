# Para me relembrares ocasionalmente

Tive a ideia de, nas salas de aulas de grupo, mostrar por defeito
a sala vazia mas adicionar uma animação que, por onde o cursor passa
mostra partes da sala a ser usada.

# PT Academy

Site do ginásio PT Academy (conteúdo em PT-PT). A fonte da verdade da
identidade visual é a homepage: `moldes/inicio.js` + `styles.css`. O
histórico e o detalhe de cada animação estão no `NOTAS.md`.

O site é gerado: `node construir.js` junta `conteudo/` com `moldes/` e
escreve o site em `dist/` (fora do git). Não há páginas `.html` na raiz.
Ver a secção "Conteúdo editável" mais abaixo.

Alojamento: Cloudflare Workers com ficheiros estáticos (`wrangler.jsonc`:
o site vem da `dist/`). O único código de servidor é o envio do
formulário, em `functions/api/contacto.js`, que o `worker.js` chama em
`POST /api/contacto`. O `servidor.js` é só para testar no computador e
usa essa mesma função. Configuração do painel: `NOTAS.md`.

# Design system

Páginas novas reutilizam o `styles.css` e estas regras; nada de estilos inline.

## Princípios

1. **Escuro, fotográfico, pesado.** Fundo quase preto, fotografias reais
   do ginásio em ecrã inteiro, títulos enormes em maiúsculas.
2. **Vermelho é pontuação, não fundo.** Aparece em CTAs, no `·` do logo,
   em palavras-chave dos títulos e em riscas finas. Só há **uma** faixa
   vermelha por página (`.campaign`).
3. **Nada é redondo.** `border-radius: 0` em tudo, incluindo a scrollbar
   e os ícones (`stroke-linecap="square"`). Marcadores de lista são traços.
   **Exceção única:** os pontos do passeio virtual (`walkthrough.css`) são
   círculos que esticam para pastilhas. Um alvo redondo sobre fotografia
   lê-se como "clica aqui"; um quadrado lê-se como parte da própria foto.
   Decidido pelo Francisco — não alargar a mais lado nenhum.
4. **Destaque = temperatura, não tamanho.** Um elemento em destaque passa
   para bordô + risca vermelha no topo; não cresce nem ganha sombra.
5. **Sem sombras, sem gradientes decorativos.** Os únicos gradientes são
   os scrims por cima das fotografias.

## Cor

| Token | Valor | Uso |
|---|---|---|
| `--color-red` | `#C11D26` | CTAs, `·` do logo, `<em>` nos títulos, riscas, foco, faixa `.campaign` |
| `--color-red-light` | `#FF8A80` | eyebrows, erros de formulário, texto de destaque sobre escuro/bordô |
| `--color-black` | `#0A0A0A` | fundo base |
| `--color-black-alt` | `#070707` | secções alternadas (planos) |
| `--color-card` | `#141414` | cartões, caixa do modal |
| `--color-maroon` | `#1A1112` | blocos em destaque, faixa de fecho |
| `--color-maroon-border` | `#5C2B2E` | borda 1px desses blocos |
| `--color-line` | `rgba(255,255,255,.1)` | separadores, bordas de inputs e pastilhas |

Texto sobre escuro (do mais forte para o mais fraco):
`#fff` títulos · `rgba(255,255,255,.8)` links do rodapé, nome do plano ·
`#ccc` texto de abertura (lead) · `rgba(255,255,255,.7)` corpo em cartões ·
`rgba(255,255,255,.55)` texto de apoio · `#666` legendas, labels, notas ·
`#4a4a4a` placeholders.

Bordas: cartão `rgba(255,255,255,.08)`, hover `rgba(193,29,38,.55)`.

Scrims: hero `linear-gradient(rgba(10,10,10,.65) 0%, rgba(10,10,10,.4) 45%,
rgba(10,10,10,.95) 100%)`; tiles de modalidade `rgba(0,0,0,.4)` liso; fundo
do modal `rgba(5,5,5,.82)`.

Ritmo das superfícies na homepage: preto → **vermelho** (campanha) → preto
→ fotos → galeria → preto-alt → **bordô** (fecho) → preto (rodapé).

## Tipografia

Duas famílias, via Google Fonts:
`Anton` (`--font-display`) e `Libre Franklin` 400/600 (`--font-body`).
Exceção única: a assinatura da NK no rodapé, em `Caveat`
(`--font-assinatura`) e creme (`--color-assinatura`). Não usar em mais lado nenhum.

| Papel | Especificação |
|---|---|
| Hero | Anton `clamp(56px, 10vw, 220px)/.9`, tracking `.01em` |
| Título de secção | Anton `clamp(38px, 6vw, 96–110px)/.95–1.05`, `.01em` |
| Título de faixa | Anton `clamp(34–38px, 6–7vw, 88–110px)/.95`, máx. 830px |
| Título de tile/cartão | Anton `clamp(28px, 3.4–4.5vw, 60–72px)` |
| Título de modal | Anton `clamp(28px, 4vw, 44px)/1` |
| Preço | Anton `clamp(44px, 4vw, 62px)/1`; `€` a `.48em` |
| Logo | Anton 26px (nav) / até 32px (rodapé), tracking `.06em` |
| Eyebrow | Franklin 600 12–13px, tracking `.3em`, cor `--color-red-light` |
| Nav / botão / pastilha | Franklin 600 12–13px, tracking `.16em` |
| Label de campo | Franklin 600 11px, tracking `.28em`, `#666` |
| Lead | Franklin 400 17px/1.6, `#ccc`, largura máx. 480–560px |
| Corpo | Franklin 400 14–16px/1.5 |

Regras:
- Títulos, eyebrows, nav, botões e labels levam **sempre**
  `text-transform: uppercase` no CSS. O HTML fica em caixa normal.
- Títulos grandes levam `text-wrap: balance`.
- A palavra-chave de um título vai num `<em>`: vermelho e sem itálico
  ("começa *aqui*", "Onde a *magia* acontece"). No máximo uma por título.
- Números em tabela (horários): `font-variant-numeric: tabular-nums`.

## Espaçamento e layout

- Margem lateral universal: `clamp(24px, 4vw, 48px)`.
- Padding vertical de secção/faixa: `clamp(64px, 10vw, 120px)`,
  planos `clamp(72px, 10vw, 130px)`.
- Pilha título-texto-ações: `gap` 28–32px. Grupos de botões: `gap: 16px`,
  `flex-wrap: wrap`.
- Grelha de cartões: `gap: clamp(12px, 1.4vw, 20px)`.
- Secções-vitrine ocupam o ecrã: `height/min-height: 100dvh`, mínimo 640px.
- Usar `dvh`, nunca `vh`, em alturas de ecrã inteiro. `100%` e não `100dvw`
  em larguras.
- Breakpoints: **1150px** (4→2 colunas), **900px** (nav vira hamburger,
  grelhas de 2 viram 1), **620px** (tudo numa coluna).

## Componentes

**Logo**: `PT<span class="nav__logo-dot">·</span>ACADEMY`, sempre com o
ponto do meio a vermelho. Nunca como imagem.

**Eyebrow**: linha curta acima do título. Sobre fundo vermelho passa a preto.
**Não colocar linhas vermelhas antes das eyebrows.**

**Botões** (`.button`): padding 18px 40px, sem raio, sem sombra. Servem
tanto para `<a>` como para `<button>`.
- `--red`: fundo vermelho; hover muda só o texto para preto.
- `--dark`: fundo preto, para usar sobre a faixa vermelha.
- `--outline`: texto branco, fundo transparente, borda `2px solid #fff`,
  padding reduzido em 2px (16px 38px) para ficar com a mesma altura dos
  cheios; hover passa a fundo branco com texto vermelho.
- Um CTA primário vermelho por bloco; o secundário ao lado é outline.

**Cartão** (`.plan`): `--color-card`, borda 1px `rgba(255,255,255,.08)`,
hover acende a borda a vermelho esbatido. Destaque: `--color-maroon` +
`--color-maroon-border` + risca vermelha de 4px no topo + flag em eyebrow.
CTAs alinhados em baixo com `margin-top: auto`.

**Lista com traço**: sem bolas. `::before` de 9×1px vermelho, `padding-left: 20px`.

**Faixa** (`.campaign` / `.closer`): bloco centrado com eyebrow, título e
ações. Vermelho = campanha (uma por página); bordô com `border-top` bordô = fecho.

**Tile fotográfico** (`.modality`): foto `cover` + scrim + título Anton
centrado; hover `scale(1.08)` na foto, dentro de `overflow: hidden`.

**Caixa em destaque** (modal): `--color-card`, borda bordô, risca vermelha
de 3px no topo.

**Formulário**: inputs só com `border-bottom` em `--color-line`, que acende
a vermelho no foco e no erro; erros em `--color-red-light` 12px; escolhas
em pastilhas (vermelho cheio quando marcadas), não radios do sistema;
checkbox com `accent-color: var(--color-red)`.

**Marca-de-água**: `PT·ACADEMY` em contorno (`-webkit-text-stroke: 1px
rgba(255,255,255,.07)`), nunca preenchida.

**Nav e rodapé**: gerados no build por `nav()` e `rodape()` em
`moldes/comum.js`, nunca copiados à mão. Um molde novo usa `c.nav(pagina)`
no início do `<body>` e `c.fim(...)` no fim, que põe o rodapé, o modal
(se a página tiver um botão `modal`) e os scripts. O `nav.js` só tem o
comportamento. Links novos no nav entram em `NAV_ITENS`, no `comum.js`.
A página em que se está fica branca e sublinhada; o vermelho no nav é só
do link da campanha, que entra em primeiro lugar quando ela está ativa.

**Caminhos absolutos**: todos os `href`/`src` gerados começam por `/`
(`/styles.css`, `/assets/…`). A 404 é servida em qualquer endereço e um
caminho relativo partia-lhe o CSS.

**Ícones**: SVG inline, `currentColor`, cantos retos. Sem bibliotecas.

**Passeio virtual** (`walkthrough.js` + `walkthrough.css`, cenas em
`assets/walkthrough/walkthrough.json`): classes prefixadas `.wt`, não BEM,
porque o componente foi feito para funcionar isolado. As coordenadas dos
pontos são percentagens de uma caixa **exatamente 4:3** e ancoram o canto
superior esquerdo — nunca `object-fit: cover`, nunca `translate(-50%, -50%)`.
Formato dos dados e API no `NOTAS.md`.

## Movimento

- Easing de marca: `cubic-bezier(.22, .61, .36, 1)`.
- Hovers: `.2–.35s ease`. Entradas ao scroll: `.8s` (texto/cartões), `1.1s` (fotos).
- Escalonamento: 100ms entre irmãos (`data-reveal-group`), 60ms no menu.
- Três entradas apenas: `reveal` (foto, scale 1.12→1), `reveal--slide`
  (texto, −32px em X), `reveal--rise` (cartões, +28px em Y).
- Transições ligadas ao scroll são **interpoladas** via custom property
  (`--nav-progress`), não disparadas num limiar.
- Tudo tem uma alternativa em `prefers-reduced-motion: reduce`.
- Detalhe de cada animação: `NOTAS.md`.

## Camadas (z-index)

`0` galeria · `1` secções-cortina · `2` conteúdo do hero · `90` menu ·
`100` nav · `150` modal · `200` tela de entrada.

## Código

- BEM: `.bloco__elemento--modificador`, **em português** (`.galeria__peca`,
  `.modal__caixa`, `.campo--invalido`). As classes antigas em inglês
  (`.hero`, `.plans`, `.about`…) ficam como estão até haver ordem para as
  renomear.
- Cores e fontes só por `var(--…)`. Hex literal novo → primeiro vira token.
- Fotografias como `background-image` numa camada interna quando animam,
  com a moldura a fazer `overflow: hidden`.

## Voz (texto)

PT-PT, tratamento por **tu** ("A tua jornada", "Escolhe o teu ritmo").
Frases curtas e imperativas nos CTAs ("Começar hoje", "Marcar visita").
Títulos com três a cinco palavras.

# Conteúdo editável (gestor de conteúdos)

O conteúdo que o cliente pode mudar vive em `conteudo/` (JSON, um
ficheiro por tema) com um esquema por ficheiro em `conteudo/esquemas/`.
O gestor, que vive no site da NK e usa o design system da NK, só escreve
em `conteudo/` e `assets/`. Formato, marcas de texto e o que é gerado:
`conteudo/LEIAME.md`. Decisões: `docs/PT_Academy_Inventario_Conteudo_Editavel.html`.

- **Build:** `node construir.js` lê `conteudo/`, verifica as regras que
  partiriam a página (contagens fixas, ficheiros em falta, endereços) e
  escreve `dist/`. A Cloudflare corre o mesmo comando a cada push,
  com `dist` como pasta de saída. Localmente, `node servidor.js` serve a
  `dist/`.
- **Moldes** (`moldes/`): um módulo por página, que devolve o HTML com
  template literals. Tudo o que vem do conteúdo passa por `esc()` ou
  `marcas()` do `comum.js`: o cliente nunca injeta HTML.
- Texto de conteúdo nunca fica escrito à mão num molde: vai para
  `conteudo/` e ganha campo no esquema, desde o primeiro dia. Página
  nova = molde novo em `moldes/` + entrada em `MOLDES` no `construir.js`.
- Dados partilhados (telefone, horário, planos, modalidades) existem
  numa só chave; o build espalha-os.

# Media

- `gallery/` é o arquivo em bruto completo (originais e RAW, fora do repo —
  está no `.gitignore`); `assets/` é o que o site consome e vai para o repo.
- Sempre que o Francisco passar uma imagem/vídeo para usar no site, **copiar o
  ficheiro para `assets/`** (com um nome descritivo em kebab-case) e referenciar
  a cópia — nunca apontar o site diretamente para `gallery/`.
- Media que deixe de ser usada deve ser removida de `assets/` — mas **só com
  autorização explícita do Francisco**, nunca por iniciativa própria.
