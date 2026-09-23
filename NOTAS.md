# Notas — animações e histórico

Registo do que já foi feito no site e de todo o movimento que lá está.
Atualizar sempre que uma animação for acrescentada, afinada ou retirada.

## Histórico de commits

| Commit | O quê |
|---|---|
| `d9345c0` | Estado inicial do repositório (homepage estática completa) + o primeiro efeito de revelação do hero. `gallery/` ficou fora do controlo de versões — 517 MB de originais e RAW. |
| `d0574d6` | Retira o efeito de revelação do hero: sai o `<canvas class="hero__reveal">`, o CSS da camada e o `hero-reveal.js`. Fica o `pointer-events: none` no título e no eyebrow do hero, que foi pedido à parte. |
| `7488625` | Remove `assets/pt-academy-fachada.webp`, sem uso depois da remoção acima. O original continua em `gallery/PT Academy-42.webp`. |
| `5f430a9` | Tela de entrada: ecrã preto com o logo grande que viaja para a posição do logo no nav. |

Por commitar à data desta nota: a saída da tela de entrada passou de fade
a deslizar para cima, e o afinamento da curva dessa subida.

## Animações no site

### Tela de entrada — `intro.js` + `.intro` no `styles.css`

O único movimento com script dedicado. Ecrã preto por cima de tudo
(`z-index: 200`) com o logo em texto ao centro; passado `INTRO_ESPERA` o
preto sai a deslizar para cima e o logo viaja até ao logo do nav, que
esteve `visibility: hidden` a reservar o lugar.

- **Medição FLIP**: mede-se o retângulo do logo grande e o do logo do
  nav e anima-se a diferença num `transform` (translate + scale). Só
  depois de `document.fonts.ready` — medir em fonte de fallback dá uma
  aterragem ao lado. Timeout de 2s como rede de segurança.
- **Caminho curvo**: Bézier quadrática amostrada em `INTRO_PASSOS` (30)
  quadros e animada com a Web Animations API. O easing global trata do
  tempo, as amostras tratam da forma. Sem `element.animate` cai numa
  transição em linha reta.
- **Saída do preto**: camada `::before` à parte, para poder sair sem
  levar o logo atrás. `translateY(-100%)` com ease-in.
- Constantes todas no topo do `intro.js`: `INTRO_ESPERA` (1000ms parado
  ao centro), `INTRO_VIAGEM` (1200ms), `INTRO_FUNDO` (900ms de subida),
  `INTRO_FUNDO_ATRASO` (300ms), `INTRO_CURVA` (quase linear, ease-in-out
  ténue), `INTRO_ARCO` (0.16 — negativo inverte o lado da curva).
- O overlay só existe com `.js` no `<html>`: sem JS nunca seria retirado
  e a página ficava preta. Com `prefers-reduced-motion` não há viagem,
  só o preto a sair.

### Galeria pregada — `galeria.js` + `.galeria` no `styles.css`

Secção "Instalações", entre as modalidades e os planos. Tem duas fases:

1. **Revelação, sem JS.** O wrapper `.galeria` é alto (`400dvh`) e tem
   `margin-top: -100dvh`, portanto arranca por baixo das modalidades; o palco
   lá dentro é `sticky` e cola-se ao topo enquanto ainda está tapado. A
   `.modalities` leva `position: relative; z-index: 1` e faz de cortina: ao
   subir, vai descobrindo o palco imóvel. Dura exatamente uma altura de ecrã.
2. **Mosaico, ao scroll.** A tela do mosaico (`.galeria__mosaico`) é
   `ALTURA_MOSAICO` vezes mais alta do que a viewport (2.6) e **desliza através
   dela** enquanto os cortes se mexem — é por isso que as peças são grandes:
   só se vê uma parte de cada vez. O deslize segue o scroll a direito, para se
   ler colado à página; só os cortes levam o smoothstep.

**A regra do encaixe perfeito** é estrutural, não é afinada à mão: o mosaico
sai de uma partição por cortes sucessivos (guilhotina) — o palco parte-se em
dois, cada metade volta a partir-se, até uma folha por peça. Animar só os
pontos de corte muda as proporções e obriga as peças a reajustarem-se, mas
cobrir tudo sem frestas nem sobreposições é garantido por construção. Cada
aresta é arredondada **uma só vez**, no corte, e o mesmo inteiro vai para as
duas peças vizinhas — é isso que evita a fresta de 1px que aparece quando cada
peça arredonda por sua conta.

Como a tela é alta e estreita em proporção, a árvore de desktop é uma banda
panorâmica no topo, três colunas verticais a meio (é aqui que as fotos de
pessoas ficam bem) e três bandas largas em baixo. Duas das dez peças são de
texto (fundo preto); entram na árvore como qualquer outra folha. Em mobile há uma árvore diferente, de 7
peças, com cortes sobretudo horizontais — as peças que lá não entram ficam em
`display: none`.

A paralaxe acontece **dentro** de cada peça (a foto é 118% da altura e
translada em Y, com fator diferente por peça), logo as arestas não se mexem.
Com `prefers-reduced-motion` fica o estado final, sem paralaxe.

Nota de manutenção: `html, body` levam `overflow-x: clip` e **não** `hidden` —
`hidden` transforma o `html` em contentor de scroll e parte o `sticky` do palco.

### Nav ao scroll — `nav.js`

**O nav e o menu em ecrã inteiro são gerados no build** (`nav()` em
`moldes/comum.js`), já com o link da página em que se está marcado com
`aria-current="page"` (fica vermelho). Até 23 set. 2026 eram injetados
pelo `nav.js`; agora o `nav.js` só tem o comportamento. Os links estão
em `NAV_ITENS`, no `comum.js`.

O fundo preto, o padding e a troca do hamburger pela lista são todos
**interpolados** ao longo do scroll através da custom property
`--nav-progress` (0 → 1), escrita a cada frame. Não há `transition`
nenhuma a disparar num ponto: a transição corre entre 0.55 e 1.05 da
altura do ecrã (acaba à saída do hero) e passa por um smoothstep para
tirar as pontas secas.

### Entradas ao scroll — `reveal.js` + `@keyframes reveal-*`

`IntersectionObserver` a 20% de visibilidade acrescenta `.is-revealed`.
Elementos dentro de um `[data-reveal-group]` entram escalonados a 100ms
(`--reveal-delay`). Três variantes, todas em
`cubic-bezier(.22, .61, .36, 1)`:

- `reveal-in` — fotos: fade + `scale(1.12) → 1`, 1.1s.
- `reveal-slide-in` — texto: fade + entrada de 32px pela esquerda, .8s.
- `reveal-rise-in` — cartões de plano: fade + subida de 28px, .8s.

Bloco `prefers-reduced-motion` no fim do `styles.css` desliga estas
animações e transições.

### Menu em ecrã inteiro

Overlay em fade (`opacity` + `visibility`, .35s); cada item entra em
`opacity`/`translateY(18px)` com delays escalonados de 60ms por
`:nth-child`; as barras do hamburger rodam para X com `transform .3s`.

### Hovers

- `.modality__photo` — `scale(1.08)` em .5s ao passar na modalidade.
- `.button--outline` — passa a fundo branco com texto vermelho em .25s.
  Em repouso o texto é branco sobre transparente (antes estava preto e o
  "Ver equipa" ficava invisível; o `.button--outline2` dos planos, que
  remendava isso com fundo `#ddd`, foi fundido neste).
- `.button--red` — só a cor do texto, .2s (o `a:hover` global punha
  vermelho sobre vermelho).
- `.plan` — a borda acende a vermelho esbatido em .25s.

## Página "Sobre nós" — `sobre.html` + `sobre.css` + `sobre.js`

Primeira página desenhada só a partir do design system. Reaproveita o
`styles.css` (nav, menu, `.hero`, `.closer`, botões) e o `reveal.js`; o
rodapé vem do `rodape.js`. Não tem tela de entrada, galeria nem modal.

**Um só mecanismo de scroll.** Cada elemento com `[data-scroll]` recebe
`--p` (0 → 1) a cada frame e o CSS faz o resto. Quatro modos: `saida`
(hero a sair pelo topo), `pregado` (secção alta com palco sticky),
`entrada` (até o topo chegar a 40% do ecrã) e `atravessar` (de baixo a
cima). `entrada` e `saida` levam smoothstep; os outros são lineares. Os
valores por omissão de `--p` no CSS são o estado final — sem JS ou com
`prefers-reduced-motion` a página fica parada e completa.

- **Hero** (`saida`) — a foto aproxima até `scale(1.12)` e o título sobe
  90px e apaga-se.
- **Manifesto** (`pregado`) — secção de 240dvh com o texto pregado; o
  `sobre.js` parte-o em palavras (`--i`, `--n`) e cada uma acende de .15 a
  1, com a luz espalhada por 4 palavras para ser em degradê.
- **História** (`entrada`) — risca vermelha à esquerda do texto em
  `scaleY(--p)`; o texto entra com `reveal--slide`. Duas fotos sobrepostas
  com paralaxe interna a velocidades diferentes (`--forca` 8% e 16%).
- **Números** (`entrada`) — contam de 0 ao alvo com o scroll, e descontam
  se se voltar para cima. Os anos saem de `data-desde="2010-06"` e só
  sobem no aniversário (1 de junho), não a 1 de janeiro.
- **Letreiro** (`atravessar`) — modalidades e valores em contorno, duas
  linhas em sentidos opostos.
- **Valores** — cartões com `reveal--rise`.

**Placeholders de foto**: `.foto` > `.foto__camada` > `.foto__vazia`
(riscas + legenda do que lá deve ir + tracejado). Para pôr a foto, trocar
o `<span class="foto__vazia">` por um `<img>`; a paralaxe continua.

### Por confirmar

- **As três fotos** — ambiente (hero), equipa (4:5) e treino acompanhado
  (4:3). A escolher pelo Francisco.
- **Data de abertura** — junho de 2010 é uma escolha conservadora, não um
  facto. Online só há a "Associação Versátil – PT Academy, Escola de
  Dança" (NIF 516263170), constituída a 08/01/2021; nada confirma 2010.
  Perguntar à academia o dia e o ano certos.
- **Texto** — escrito a partir do que o site já diz (desde 2010, espaço
  familiar, os quatro espaços, avaliação física, planos revistos,
  escalonamento). Validar com a academia.
- O "Sobre nós" do nav e do rodapé aponta para `/sobre.html` em todas as
  páginas (antes era `#sobre`, âncora que nunca existiu na homepage).

## Página "Contactos" — `contactos.html` + `contactos.css` + `contactos.js`

**A página curta do site.** Sem fotografias, sem faixa de fecho e sem
movimento próprio — nem sequer carrega o `reveal.js`. Espaçamentos,
tipografia e cores são os do resto do site; o que muda é só a densidade.

Uma secção só (`<main class="contactos">`), com o cabeçalho por cima de
uma grelha de duas colunas: dados e horário à esquerda, formulário à
direita. Toda a informação cabe num ecrã de desktop, com o rodapé logo a
seguir.

- **Título em escala de secção**, não de hero (`clamp(38px, 6vw, 88px)`).
  Um título de hero empurrava a informação para fora do ecrã.
- **Padding de topo `clamp(118px, 15vh, 168px)`** — só a folga de que o
  nav precisa, porque é fixo e no topo da página está transparente.
- **Dados em linhas com fio, não em cartões.** Rótulo à esquerda em label
  (11px, `.28em`, `#666`), valor à direita em Anton. É o que mantém a
  página compacta. A morada é a exceção: fica em corpo, porque um
  endereço de duas linhas lê-se pior em Anton.
- **`overflow-wrap: anywhere` no valor** — o endereço de email é mais
  largo do que a coluna em ecrãs estreitos e sem isto empurrava a grelha.
- **Horário** no mesmo desenho de linhas, com `tabular-nums` para as
  horas alinharem. O domingo leva a sua modificação (`--fechado`):
  vermelho claro e em caixa alta.
- **Sem mapa embebido.** A morada é um link para o Google Maps, que abre
  na app de quem visita. Um `<iframe>` da Google traria scripts e cookies
  de terceiros para a página e um mapa que não combina com a paleta.
- **Um só CTA vermelho**: o botão de enviar. O telefone e o email são
  links, não botões.
- A caixa do formulário é a mesma do modal (`--color-card`, borda bordô,
  risca vermelha de 3px no topo) e usa o `formulario.js` partilhado.
- Grelha de duas colunas → uma a 900px; a 620px o rótulo passa para cima
  do valor, porque 120px de coluna não sobram num telemóvel.

**Primeira versão, abandonada:** página longa com hero sem foto, três
canais em cartões, secção de morada, secção de formulário e faixa de
fecho — cinco ecrãs de scroll para dar um número de telefone. Trocada por
esta a pedido do Francisco.

### Peças que subiram para o `styles.css`

- **`.eyebrow` / `.eyebrow--traco`** — estavam no `sobre.css` e são do
  site, não de uma página. O `.eyebrow--traco` foi retirado depois (ver
  "Eyebrows sem linha vermelha").
- **`.modal__sucesso` → `.sucesso`** (e `.modal__visto` →
  `.sucesso__visto`). O bloco de confirmação deixou de viver só dentro de
  um modal, portanto deixou de ser um elemento dele. `.sucesso__titulo` e
  `.sucesso__lead` estão agrupados no CSS com os `.modal__` equivalentes.

## Página "Instalações" — `instalacoes.html` + `instalacoes.css`

Página curta: o peso todo está no passeio virtual. Hero curto → passeio →
quadro de espaços → faixa de fecho. Reaproveita `.hero`, `.closer`,
`.eyebrow` e o `reveal.js`.

- **Hero a 72dvh** (mínimo 460px) com a `rua.webp`: a página começa à
  porta e o passeio aparece sem muito scroll.
- **Passeio** — ver secção a seguir. A moldura (`.passeio__tela`) leva a
  borda, a risca vermelha de 3px e quatro cantos de visor em L; o 4:3 é do
  `.passeio__palco`, que não tem borda.
- **Quadro de espaços** — linhas corridas (número esbatido, nome em Anton,
  localização à direita), não cartões. Hover: linha a bordô, número a
  vermelho, risca de 3px a abrir à esquerda em `scaleY`. A 900px a
  localização passa para baixo do nome.
- **Fotos no hover do quadro** — cada linha é uma grelha com uma segunda
  fila fechada a `0fr` (`.quadro__foto`, com `min-height: 0` e
  `overflow: hidden`). No hover passa a `1fr` em .55s com o easing de
  marca, e a linha abre espaço para baixo. As fotos entram numa
  `.quadro__foto-moldura` em 4:3 — o rácio das fotos, portanto sem corte —
  com 280 a 460px de largura, alinhada com o nome e não com o número. No
  hover passam de `scale(1.12)` para 1 em 1.1s. Abre com 120ms de atraso,
  para um cursor a atravessar a lista não abrir todas as linhas; fecha
  logo. Só em `(hover: hover)` — num ecrã tátil um toque a abrir 300px
  empurrava a lista. **O átrio não tem**: a `atrio.webp` ainda é o marcador
  de lugar; quando chegar a foto, basta o `data-fotos` e a `.quadro__foto`.
- **Espaços com várias fotos** — as fotos vêm do passeio: musculação 6
  (`musculacao`, `musculacao2`, `musculacao3`, `polias`, `smith`,
  `halteres`), cross 4, sala roxa 2; os outros têm uma. O cardio sai da
  musculação no passeio, mas no quadro é um espaço à parte. Passam em
  sequência na mesma moldura, 1.5s cada, enquanto o cursor lá estiver; a
  primeira troca espera pela linha aberta (+670ms). Lado a lado não dava:
  6 fotos na linha ficavam com ~186px e as linhas abriam a alturas
  diferentes.
  - Uma `.quadro__foto-camada` por foto, empilhadas. A ativa sobe
    (`z-index: 1`) e entra em .5s; a que sai fica inteira por baixo e só
    apaga depois de coberta (.5s de atraso) — sem isso as duas ficavam a
    meio ao mesmo tempo e via-se o bordô.
  - Riscas de 2px por baixo da moldura, uma por foto e da largura dela;
    a atual a vermelho. Só nos espaços com mais de uma.
  - Sai do hover: a sequência pára. Volta: recomeça na primeira.
  - `prefers-reduced-motion`: só a primeira foto, sem sequência nem riscas.
- **Fotos do quadro a pedido** (`instalacoes.js`) — com as urls no CSS, as
  fotos eram descarregadas ao abrir a página (~1,9 MB na altura): um
  `background-image` é pedido logo que o elemento existe, mesmo numa fila
  fechada a 0px, e não há lazy loading nativo para fundos. Agora as urls
  vivem num `data-fotos` na linha. A primeira foto é pedida no primeiro
  `pointerenter`; cada seguinte é adiantada quando a anterior aparece. Uma
  foto só entra depois do `decode()` — o script só cria a camada (com
  `--foto`) nessa altura — e a sequência só avança quando a atual já
  apareceu, portanto numa rede lenta espera em vez de saltar fotos. Cada
  foto pede-se uma vez; uma que falhe é saltada. Sem `(hover: hover)` não
  se pede nada. Sem JS as linhas abrem sem foto.
- **`preload` da `rua.webp`** com `fetchpriority="high"` — é a primeira
  coisa que se vê (fundo do hero e primeira cena do passeio), mas num
  `background-image` o browser só a descobria depois de ler o CSS. Ao abrir,
  a página passa de ~2,35 MB em fotos para ~0,45 MB.
- **9 espaços**: átrio, musculação, cross, cardio e as cinco salas — a rua
  e os corredores não contam. (Houve uma legenda por baixo do passeio,
  "21 vistas · 9 espaços"; foi retirada.)

## Página "Modalidades" — `modalidades.html` + `modalidades.css` + `modalidades.js`

Quatro capítulos pregados, um por modalidade, pela ordem da homepage:
Musculação → Crossfit → Fitness → Dança. Hero curto (72dvh, a box) com um
índice que salta para cada capítulo → os quatro capítulos → horário de aulas
semanal → faixa "Também na PT Academy" (Personal Trainer e Nutrição). Sem
faixa de fecho própria — a página acaba na faixa dos extras e no rodapé.
Reaproveita `.hero`, `.eyebrow`, os botões e o `reveal.js`; os tiles das
modalidades na homepage passaram a `<a>` para `/modalidades.html#…`.

Decisões do Francisco nesta ronda: capítulos pregados (não secções corridas),
composição meio a meio (foto numa metade, texto na outra, a alternar de lado),
hero curto com índice, "Crossfit" e não "Cross Training", só o nome do plano
(sem preços), horário inventado, PT e Nutrição numa faixa curta, fotos
escolhidas por mim da `gallery/`.

**Ajustes de uma segunda ronda, já com a página publicada:** sem faixa de
fecho no fim (o CTA da página foi removido); sem o "01 / 04" por cima do
eyebrow em cada capítulo; o CTA de cada capítulo passou a um botão só, "Ver
planos" (`button--outline`, para `/#planos`) — saiu o "Marcar aula
experimental" (`button--red`), que assumia sem confirmação que há aula
experimental; sem a risca vermelha (`.eyebrow--traco`) antes dos eyebrows —
só nesta página, o resto do site mantém-na; e o mapa de aulas em lista por
dia virou uma agenda semanal em grelha (dias × horas, como o Google
Calendar), com o título "Horário de Aulas semanal".

**Terceira ronda:** o Francisco mandou os cartazes reais da academia
(Cross Training e Aulas de Grupo). A agenda da ronda 2 (grelha CSS Grid,
dados inventados, abas Fitness/Dança) saiu inteira; entrou uma tabela HTML
com os dados verdadeiros, abas Cross Training/Aulas de Grupo. Ver `###
Agenda semanal` mais abaixo.

### Capítulos pregados

**A mecânica é a da galeria da homepage.** Cada `.capitulo` é uma secção de
`200dvh + --folga` (70dvh) com um palco sticky de 100dvh. O palco fica preso
durante a folga e depois durante 100dvh enquanto o capítulo seguinte — que
arranca 100dvh mais cedo (`margin-top: -100dvh`) e tem `z-index` acima —
sobe por cima como cortina. Quando a secção acaba, o palco já está tapado.
O `.mapa` leva a mesma margem negativa e `z-index: 5`, para fazer de cortina
ao último capítulo; e `min-height: 100dvh`, senão a caixa do capítulo 4
(positioned, com z-index) tapava o topo da secção seguinte.

**Duas custom properties por capítulo**, escritas pelo `modalidades.js` a
cada frame, como no `sobre.js`:

- `--p` — a entrada. Arranca com o topo da secção a `MOD_ENTRADA_INICIO`
  (0.6) da altura do ecrã, ainda com o capítulo a subir como cortina, e
  acaba `MOD_ENTRADA_FIM` (0.4) da folga depois de o palco prender. Leva
  smoothstep. A folga não se lê do CSS — deduz-se da altura da secção
  (`altura − 2 × vh`).
- `--q` — o avanço na secção inteira, linear, para a paralaxe.

Os valores por omissão (`--p: 1`, `--q: .5`) são o estado final: sem JS ou
com `prefers-reduced-motion` as secções perdem a altura extra e o sticky e
a página fica parada e completa.

**O texto entra da margem mais próxima**, peça a peça. Cada filho de
`.capitulo__texto` tem um `--i` por `:nth-child` e o seu próprio progresso,
`--pe = clamp(0, (--p − --i × .09) / .46, 1)`: arranca escalonado e demora
46% da entrada. Opacidade `--pe` e `translateX(--dx × (1 − --pe))`, com
`--dx` = 56px no capítulo normal (foto à esquerda, texto à direita, entra
da direita) e −56px no `.capitulo--invertido`. O escalonamento é todo CSS;
o JS só escreve `--p`.

- **Foto** — camada interna com `scale(1.1 → 1)` na entrada (a ideia do
  `reveal` das fotos) e `translateY` de 10% com `--q` (paralaxe; as arestas
  não se mexem).
- **Foto de detalhe** — 4:5, encostada à costura entre as duas metades, no
  canto de baixo, a transbordar 40px para o lado do texto (menos do que o
  padding interior da coluna, por isso nunca lhe toca). Contorno de 10px
  em preto como as fotos da História. Entra na segunda metade de `--p`, a
  subir 40px.
- **Número em marca-de-água** — "01" a "04" em contorno atrás do texto,
  como a marca-de-água do rodapé. Viaja o dobro do texto (`--dx × 2`) para
  se ler como uma camada mais funda.
- **Índice do hero** — os quatro nomes em Anton com o número em label,
  separados por fios, no lugar do CTA. `html { scroll-padding-top: 0 }`
  nesta página, senão os capítulos aterravam 96px abaixo do topo e
  via-se uma tira do capítulo anterior; e `scroll-behavior: smooth`.
- **Mobile (≤ 900px)** — não há meio a meio: a foto passa a fundo do palco
  com scrim (como o hero) e o texto assenta em baixo; a foto de detalhe
  sai; o número encolhe para o canto de cima. A ≤ 620px sai a lista com
  traços (ficam o lead e as etiquetas).

### Agenda semanal (horário de aulas)

Duas agendas reais, **Cross Training** e **Aulas de Grupo** — dados que o
Francisco enviou em 16 set. 2026, transcritos por mim dos cartazes da
academia (duas fotos, "Horário Cross Training" e "[Horário] Aulas de
Grupo"). Já não são Fitness/Dança: o cartaz da box mostra que o Crossfit
também corre por horário fixo, não livre trânsito como se assumia antes;
e não há cartaz de Dança — essa aba saiu, marcada como pendente.

Cada agenda é uma **tabela HTML a sério** (`<table class="agenda">`), não
uma grelha CSS Grid como na primeira versão — a densidade real dos dados
(dias com 2-3 aulas encostadas na mesma hora, ex. Aulas de Grupo às
18h30) não cabia em linhas de altura fixa por hora. Uma tabela resolve
isto de graça: cada linha (`<tr>`) é uma hora de início, cada coluna um
dia, e a célula cresce sozinha para caber quantas aulas lá estejam,
empilhadas em `.agenda__aula` com um respiro de 4px entre elas.

- **Cabeçalho e primeira coluna presos** (`position: sticky`), para
  continuarem visíveis ao deslizar a tabela — que tem `min-width: 720px`
  e vive dentro de um `.agenda__scroll` com `overflow-x: auto`, por isso
  em ecrãs estreitos desliza em vez de espremer as colunas.
- **`.agenda__aula`** é o mesmo desenho da primeira versão (cartão
  `--color-card` com risca vermelha à esquerda) — só a disposição em
  torno dele mudou, de grelha para tabela.
- As abas continuam dois radios escondidos com labels em pastilha e a
  troca toda em CSS; os ids mudaram de `mapa-fitness`/`mapa-danca` para
  `mapa-cross`/`mapa-grupo`.
- Musculação continua sem agenda: é em livre trânsito, e o lead diz o
  horário de abertura.

**Por hora, o que está em cada cartaz (transcrito tal e qual, sem
inventar minutos):**

Cross Training — 07h00 (Seg-Sex); 09h00 Cross Kids (só Sáb); 10h00 (todos
os dias, e ao Sáb com Hybrid Training a seguir); 18h30 (Seg-Sex, com
Hybrid Training a seguir à Terça e à Quinta); 19h30 (Seg-Qui).

Aulas de Grupo — 08h00 e 09h00 +Mulher (Ter/Qui de manhã, Seg/Qua/Sex às
9h, Pilates ao Sáb); 10h00 Pilates/Localizada/Cycling; 11h00 só Cycling
ao Sáb; 16h30 GAP/Abs/Pilates; 17h30 e 18h30 com duas a três aulas
encostadas por dia (Cycling+Pilates, HIIT+Mobilidade, BBP+Pilates+Step
Latino, Jump+Pilates+Mobilidade…); 19h30 fecha o dia, também com duas
aulas na maioria dos dias.

Onde uma célula tem mais do que uma aula, as fotos não dizem os minutos
exatos entre elas — só que estão encostadas na mesma hora de início. Se
alguma leitura estiver errada, dizer que corrijo já.

### Fotos (novas em `assets/modalidades/`)

Escolhidas por mim da `gallery/`, convertidas para WebP (qualidade 82, lado
maior a 2048px, como as restantes). A validar pelo Francisco:

| Ficheiro | Origem em `gallery/` | Onde |
|---|---|---|
| `hero-box.webp` | `PT Academy-12.jpg` | hero (a box, larga) |
| `musculacao.webp` | `CM-25.jpg` | 01, remada com barra |
| `musculacao-detalhe.webp` | `PT ACADEMY - AULAS - PT-3.jpg` | 01, treinador com sócia |
| `crossfit.webp` | `CM-12.jpg` | 02, swing frente ao letreiro |
| `crossfit-detalhe.webp` | `HYROX-5.jpg` | 02, coach no rig |
| `fitness.webp` | `step latino-9.jpg` | 03, turma de step |
| `fitness-detalhe.webp` | `Pilates-19.jpg` | 03, pilates com bolas |
| `danca.webp` | `PT - DANÇA - CONTEMPORÂNEO-15.jpg` | 04, bailarina |
| `danca-detalhe.webp` | `PT - DANÇA - CONTEMPORÂNEO-30.jpg` | 04, parede de floresta |

### Por confirmar

O que a pesquisa deu: as quatro modalidades (homepage), as aulas de grupo
"GAP, Abdominais, Pump, Pilates, Jump, Cycling, HIIT, Cross-Training,
Zumba" (anúncio de emprego da PT Academy no net-empregos, jan. 2024), Step
Latino, Jump, Pilates, Abs, HYROX e alongamentos (fotos na `gallery/`), a
"Associação Versátil – PT Academy, Escola de Dança" (2021), o letreiro
"PT·Dance Academy" com barra de ballet numa sala (`gallery/self/…WA0010`),
"fitness e dança para todas as idades" e "vista para o Corgo na zona de
musculação" (reviews em ginasios.fitness), e Personal Trainer e Nutrição
nas listagens online. Tudo o resto está inventado para o Francisco
substituir:

- **Textos dos capítulos** — leads e listas escritos a partir do que se
  sabe. Em especial: "há sempre alguém na sala" (01), "relvado para o
  trenó" e "do primeiro WOD ao HYROX" (02), "onze aulas em cinco estúdios"
  e "turmas pequenas" (03), "turmas por idade e nível", "professoras
  formadas" e "espetáculo de final de ano" (04).
- **Etiquetas** — as de Musculação e Crossfit (WOD, Halterofilismo,
  Ginástica, Metcon) são genéricas. Hip Hop e Ballet na Dança são
  suposições; só o Contemporâneo tem fotos.
- **Plano por modalidade** — deduzido dos planos da homepage (Base =
  musculação; Power/Premium = cross e aulas). A dança está como "inscrição
  própria" porque a escola é uma associação à parte — confirmar se entra
  nos planos.
- **Horário de Dança** — não recebi cartaz nenhum; a agenda da página só
  tem Cross Training e Aulas de Grupo. Se houver um horário de dança,
  mando fazer a terceira aba.
- **PT e Nutrição** — existem nas listagens, mas os termos ("sessões
  individuais", "consultas", "reavaliações") são meus.
- "Pedir horário" e "Marcar consulta" são `tel:`.

## Página "Equipa" — `equipa.html` + `equipa.css` + `equipa.js`

Sem hero: o título sozinho ("As *caras* da casa", à escala de hero mas
sobre preto, por baixo do nav como nos Contactos) → quatro grupos de
cartões 3:4 → rodapé. Sem faixa de fecho nem CTA, por decisão do
Francisco: a página serve só para apresentar as pessoas. Reaproveita o
`reveal.js` e o padrão do plano em destaque; o nav, o rodapé e o "Ver
equipa" da homepage passaram a apontar para `/equipa.html` (antes era a
âncora `#equipa`, que nunca existiu).

Decisões do Francisco (16 set. 2026): hero curto com foto; grelha dividida
por grupos (Direção · Comercial · Personal Trainers · Dança), pela ordem
que ele deu — proprietária, diretor técnico, diretor comercial, comerciais,
PTs e só depois a dança; o vídeo toca **uma vez** no hover e volta à foto;
no telemóvel é o toque que liga e desliga; Mara Fraguito e Majó são duas
pessoas; o cartão da proprietária em destaque (bordô + risca vermelha);
nome + função em cada cartão; título "As *caras* da casa".

**Segunda ronda, já com a página feita:** saiu o hero (72dvh com a foto do
treinador ao lado da sócia, `data-scroll="saida"` com a foto a aproximar e
o título a subir) e saíram o lead e a dica "Passa o rato…". Fica só o
título a abrir a página. A foto convertida para o hero,
`assets/equipa-hero-treino-acompanhado.webp`, deixou de ser usada e fica
lá até o Francisco mandar apagar.

### Cartões com vídeo

Cada `.pessoa` tem a foto (`assets/pessoal/<nome>.webp`, 1200×1600) e, por
cima, o vídeo recortado a 3:4 (`assets/pessoal/<nome>.mp4`, 540×720,
1,5–3,5 s, silenciado; os originais 9:16 já não estão no repo). A moldura é um `<button>` com
`aria-pressed`, para o toque e o teclado. O vídeo está sempre no DOM com
`opacity: 0`; o `equipa.js` chama `play()` e só põe a classe `.is-a-tocar`
(que o funde para 1 em .35s) no evento `playing`, quando já há frames — a
foto fica por baixo o tempo todo, nunca se vê um frame preto. No `ended`,
ou ao sair do cartão, a classe sai, o vídeo pausa e rebobina 400 ms depois
(`EQUIPA_REBOBINAR`, maior do que o fade), para o salto não se ver.

- **Com rato** (`hover: hover` e `pointer: fine`, sem `prefers-reduced-
  motion`): `mouseenter` liga, `mouseleave` desliga. O clique do rato é
  ignorado para não interromper o vídeo; o clique de teclado (Enter/Space,
  `event.detail === 0`) alterna.
- **Sem rato**, ou com movimento reduzido: o clique/toque alterna. Só toca
  um de cada vez — ligar um desliga o anterior.
- **Carregamento**: `preload="none"` em todos. Com rato, um
  `IntersectionObserver` (margem 300px) passa cada vídeo a `preload="auto"`
  quando o cartão se aproxima, para o hover ser imediato (~7 MB no total).
  Sem rato, cada vídeo só se carrega quando é tocado.
- O hover do cartão em si é só a borda a acender (como `.plan`); a foto
  não faz `scale`, porque o vídeo entra por cima sem escala e o salto
  notava-se.

### Grelha

4 colunas → 3 (1150px) → 2 (900px). Aos 620px **fica em duas colunas**, ao
contrário do resto do site: com cartões 3:4 numa coluna só, dezoito
pessoas davam oito metros de scroll. Se o Francisco preferir uma, é uma
linha no `equipa.css`. Os cartões entram com `reveal--rise` escalonado por
grupo; as cinco primeiras fotos carregam já, as restantes com
`loading="lazy"`.

### Por confirmar

- **Nomes e acentos** — escritos a partir dos nomes dos ficheiros:
  Patrícia Teles, Tiago Figueira, Ruben Souza (sem acento, como no
  ficheiro — pode ser Rúben), Bárbara Maltez, Vanessa Ribeiro, Alexandra
  Santos, Fernando Campeã, Filipe Sousa, João Rodrigues, José Guedes,
  Juliana Nogueira, Ricardo Miguel, Simão Marinho, Sónia Filipa, Virgínia
  Delgado, Mara Fraguito, Majó, Luís Reboredo.
- **Majó** — só o nome pelo qual é conhecida; falta o nome completo, se o
  quiserem.
- **Ordem dos PTs** — não foi dada; estão por ordem alfabética.
- **Funções** — "Diretor técnico", "Diretor comercial", "Comercial",
  "Personal trainer", "Professor(a) de dança" são as palavras do
  Francisco; confirmar a grafia oficial da academia.

## Passeio virtual — `walkthrough.js` + `walkthrough.css`

Uma fotografia de cada vez, com pontos clicáveis que levam a outras. Módulo
ES sem dependências; montado no fim do `instalacoes.html`. As cenas vivem
em `assets/walkthrough/walkthrough.json`, ao lado das fotos.

**A regra que não se parte:** as coordenadas são percentagens de uma caixa
exatamente 4:3 e ancoram o **canto superior esquerdo** do botão, sem
`transform`. Todas as fotos são 4:3 e a caixa é forçada a 4:3 em pixels
por JS (`dimensionar()`); a imagem usa `object-fit: fill` de propósito.
`object-fit: cover`, outro rácio ou um `translate(-50%, -50%)` tiram todos
os pontos do sítio. Aumentar `--wt-alvo` (34px) também os desloca: o canto
fica e o círculo cresce para a direita e para baixo.

Porque o palco e a moldura são peças separadas: o componente mede o elemento
onde monta com `getBoundingClientRect()`, que inclui a borda. Montado numa
caixa com borda, deixava de ser 4:3 e aparecia uma barra preta de cada lado.

### Montar

```js
import { montarWalkthrough } from './walkthrough.js';
const dados = await fetch('assets/walkthrough/walkthrough.json').then(r => r.json());
const wt = montarWalkthrough(elemento, dados, {
  base: 'assets/walkthrough/',   // pasta das fotos, com barra no fim
  alturaMaxima: 700,             // opcional, px — no site não se usa (ver abaixo)
  aoMudar: (id, cena) => {},     // opcional
});
```

Sem `alturaMaxima` no site: se cortasse a altura, a caixa encolhia mas o
palco continuava 4:3 à largura toda, e ficavam barras pretas. A altura é
controlada pela **largura** da moldura, calculada a partir do ecrã:
`max-width: min(1180px, max(320px, calc((100dvh - 150px) * 4 / 3)))`. Assim
o passeio cabe inteiro por baixo do nav (96px) e vêem-se todos os botões ao
mesmo tempo. (Os tamanhos medidos no browser — 390×844 → caixa 340×255;
1024×768 → 822×616 — foram com 190px, quando ainda havia legenda; com 150px
a caixa fica uns 50px mais alta nos ecrãs onde é a altura que manda.)

API: `wt.ir(id)` (empilha a atual), `wt.voltar()`, `wt.reiniciar()`,
`wt.cena`, `wt.profundidade`, `wt.destruir()`. Na página fica em
`window.wt`, para saltar entre cenas a partir da consola.

### Formato das cenas

```jsonc
{ "inicio": "rua",
  "cenas": {
    "rua": { "titulo": "Rua", "ficheiro": "rua.webp",
             "pontos": [ { "left": 80.84, "top": 46.76, "texto": "Entrar", "para": "atrio" } ] } } }
```

- **`pontos[]`** — `left`/`top` em %, `para`, `texto` opcional (sem ele:
  "Ver mais"). `"seta": true` mostra uma seta para cima em vez de rótulo.
  `"destaque": true` dá-lhe a animação de chamada (ver abaixo) — hoje só o
  "Entrar" da rua.
- **`margens[]`** — botões presos a uma borda. `pos`:
  `canto-inferior-esquerdo`, `canto-superior-esquerdo`,
  `canto-inferior-direito`, `canto-superior-direito`, `margem-esquerda`,
  `margem-direita`, `margem-superior`, `margem-inferior`. Com seta (por
  omissão) é uma passagem; com `"seta": false` é um ponto normal. `x`/`y`
  em % afinam a posição ao longo da margem (ex.: o voltar da `cross3`).
- **`voltar`** — posição do botão de voltar: um nome de margem (omissão
  `canto-inferior-esquerdo`), `false` para o tirar, ou uma coordenada
  `{ "left", "top", "seta": "cima" }` (ex.: `musculacao2`).
- **`tipo: "split"` + `partes[]`** — ecrã dividido sem foto própria
  (`escolha_mc`). Mostra as fotos das partes lado a lado; a escolhida
  expande e entra nessa cena.

### Comportamento e movimento

- Pontos com `left > 55` abrem a pastilha para a esquerda; margens de cima
  e de baixo crescem na vertical.
- Vermelho com anel a pulsar (`wt-pulso`, 2.4s) = avançar. Preto sem anel =
  voltar. **O anel normal quase não se vê**: é filho do `.wt-alvo`, que tem
  `overflow: hidden`, e fica cortado pela borda do botão.
- **Ponto em destaque** (`.wt-destaque`) — o primeiro botão do passeio
  passava despercebido. Preenchimento vermelho cheio; dois anéis no
  `.wt-ponto` (que não corta) a abrir de 1.1x a 2.6x, com 450ms entre eles;
  depois a pastilha abre sozinha com o rótulo, fica aberta e fecha. Ciclo
  de 4.2s, a começar 0.8s depois de a cena aparecer. A largura aberta vem do
  mesmo `--w` que o `medir()` escreve para o hover. O hover pára a animação.
  Com `prefers-reduced-motion`: sem anéis e pastilha aberta, parada. Abrir
  sozinha também serve os ecrãs táteis, onde o rótulo nunca aparecia.
- Troca de cena em fade de .35s. Ecrã dividido: a metade escolhida expande
  em .55s e só então entra na cena.
- `Esc` volta atrás. As fotos seguintes são pré-carregadas ao entrar numa
  cena.
- Destino sem foto → ponto a tracejado e aviso "Foto por tirar"; foto com
  404 → aviso "Foto por carregar". A navegação nunca parte.
- `prefers-reduced-motion`: sem transições e sem anel.
- Sem JS, o palco mostra a `rua.webp` parada. Se o JSON não carregar, uma
  linha a pedir para recarregar.

### Integração (esta ronda)

- Pontos **redondos**, por decisão do Francisco: registado no `CLAUDE.md`
  como a exceção única ao "nada é redondo".
- Tirado o `@font-face` auto-alojado do `walkthrough.css`: a Anton já vem
  do Google Fonts. O `.woff2` não entrou no projeto.
- Os cantos da moldura encolheram (14px a 8px da borda) para não tocarem
  nos botões de margem do componente, que ficam a 22px.
- A legenda dizia "Arrasta para olhar", mas o passeio não se arrasta —
  passou a "Segue os pontos para mudar de sala". O lead perdeu o "olha em
  volta" pela mesma razão. Depois a legenda saiu de todo, a pedido do
  Francisco.
- A pasta de entrega (`_entrega-walkthrough/`) foi retirada; o que era
  documentação está aqui.
- **Choque de classes com o site.** O componente marcava os botões de
  margem que avançam com a classe `nav`, e o `.nav` do `styles.css` é a
  barra fixa: dava-lhes `left: 0; right: 0` e `padding: 28px`. O botão
  esticava a largura toda e a seta encostava à esquerda — o "Cardio" da
  musculação aparecia do lado contrário, e o embrulho esticado podia tapar
  pontos à mesma altura. Passou a `wt-avanca`. O componente ainda usa
  outras classes de estado sem prefixo (`on`, `dir`, `falta`, `livre`,
  `escolhida`, `a-expandir`, `abre-esq`, `ci-esq`, `m-dir`, `para-cima`…):
  **não criar classes globais do site com estes nomes.**
- **Voltar mais escuro** (`--wt-escuro` de .62 para .85). Na sala cinza, uma
  foto clara e toda cinzenta, o círculo cinzento sobre o espelho passava
  por um objeto da sala e parecia não haver botão.
- Verificado no browser a 390, 1024 e 1920px: as 22 cenas, 44 botões,
  todos dentro da foto e a receber o clique no centro; voltar e `Esc`
  recuam; sem voltar na rua; sem erros de consola nem pedidos falhados.

### Por confirmar

- **`atrio.webp` é um marcador de lugar** (255×191, 692 bytes), não uma
  fotografia — e o átrio é o centro do percurso. **Não publicar sem a foto
  verdadeira.**
- **12 cenas são becos sem saída**, só com voltar: `cardio`, `polias`,
  `smith`, `halteres`, `cross2`, `cross3`, `cross4`, `sala_laranja`,
  `sala_cinza`, `sala_amarela`, `sala_verde`, `sala_roxa2`. Intencional
  por agora (folhas do percurso).
- **Desvios ao design system que ficaram como estavam** (só os pontos
  redondos foram decididos): sombra (`box-shadow`) nos alvos; setas com
  `stroke-linecap="round"`; rótulo do ecrã dividido e aviso de foto em
  falta numa sans do sistema a 700, não em Anton/Franklin; `border-radius:
  6px` no nome do ficheiro do aviso.
- **Em ecrãs táteis os rótulos não aparecem**: a pastilha só abre no
  hover, portanto no telemóvel vêem-se círculos sem nome. E na
  `corredor_cima2` os pontos da Sala Verde e da Sala Roxa ficam a 28px um
  do outro a 390px de largura, com alvos de 34px — quase se tocam.
- **`Esc` com o menu aberto** fecha o menu e recua uma cena ao mesmo tempo
  — os dois ouvem a tecla na `window`. E recua mesmo com o passeio fora do
  ecrã.
- O componente não mexe no URL: não há ligação direta para uma cena.
- `assets/walkthrough/planta.txt` (o rascunho do percurso) ficou fora dos
  commits; o `walkthrough.json` substitui-o.

## Eyebrows sem linha vermelha

**Não colocar linhas vermelhas antes das eyebrows** (regra no `CLAUDE.md`).
Saíram de todo o site:

- `.eyebrow--traco` retirado do `styles.css`. Era usado nas Instalações
  (2), no Sobre (1) e nas Modalidades (4) — nas Modalidades já tinha sido
  tirado noutra frente de trabalho, sem tocar nessa página aqui.
- `.plans__eyebrow::before` retirado — era a linha antes de "Planos", na
  homepage. O `.plans__eyebrow` perdeu também o `display: flex` e o `gap`,
  que só existiam para a linha.
- Continuam os traços de 9px das listas (`.plan__features`,
  `.capitulo__lista`): são marcadores de lista, não linhas de eyebrow.

## Experiências abandonadas

**Revelação do hero com o rato** (`hero-reveal.js`, commits `d9345c0` →
`d0574d6`). A foto da fachada por cima e a foto de treino por baixo,
revelada à volta do cursor: o centro perseguia o rato com mola, deixava
rasto e o raio crescia com a velocidade. Teve duas versões — rasto que
desvanecia, e depois raspagem permanente acumulada num canvas de máscara
fora do ecrã, com a fachada por cima de todo o hero (era preciso raspar
para ver o título). O código está no commit `d9345c0` se algum dia
voltarmos à ideia.

## Rodapé e faixa de fecho

**O rodapé é gerado no build** (`rodape()` em `moldes/comum.js`), com
os contactos, o horário e as redes vindos do `conteudo/`. Até 23 set.
2026 era injetado pelo `rodape.js`, que foi retirado; o rodapé passou a
existir também sem JS. Nas páginas que não sejam a homepage, as âncoras
ganham um `/` à frente (`/#planos`) para voltarem à homepage. O ano do
© é escrito no build e o `nav.js` corrige-o no browser se o site não
tiver sido reconstruído depois da passagem de ano.

O rodapé passou de três colunas anónimas de links para um grid de quatro
blocos — marca (logo + tagline + redes), "Navegação", "A academia" e
"Contactos" (morada com link para o mapa, `tel:`, `mailto:` e horário em
`<dl>`) — cada um com um `.footer__title` no mesmo tratamento dos eyebrows
do resto do site. Em baixo, barra legal com © e Livro de Reclamações.

A barra legal leva ao centro a assinatura "Designed by NK Web Design"
(`.assinatura`), manuscrita em Caveat e em creme a 50%; o link
passa a branco e cresce para `scale(1.05)` em .4s no hover. A barra é uma
grelha `1fr auto 1fr`, para a assinatura ficar no centro exato; abaixo dos
900px empilha à esquerda e a assinatura passa para o fim.

A fonte veio colada como Mrs Saint Delafield, mas no site de origem ela
provavelmente não carregava e o que se via era a Segoe Script do Windows.
Carregada a sério, ficava fina e caligráfica de mais — trocou-se pela
Caveat, que vem do Google Fonts e é igual em todos os dispositivos.

Por cima do rodapé entrou a `.closer`: faixa de fecho em **bordô**, não em
vermelho — a faixa vermelha é a `.campaign`, a meio da página, e repetir a
cor tirava-lhe o peso.

A marca-de-água `PT·ACADEMY` deixou de ser preenchimento quase invisível e
passou a **contorno** (`-webkit-text-stroke`), com `clamp()` no tamanho e
`overflow: hidden` no rodapé — a `20dvw` fixos transbordava em ecrãs
estreitos.

Corrigido de passagem: os `<a>` estavam soltos dentro de `<ul>` sem `<li>`;
os links apontavam todos para `google.com`; `width: 100dvw` no `.footer`
(mais largo que o body quando há scrollbar) passou a `100%`; o `::after`
tinha `inset: 0` e `height` ao mesmo tempo. Ícones das redes são SVG inline,
sem biblioteca.

### Por confirmar (placeholders)

- **Horário** — Seg–Sex 07h–22h, Sáb 09h–13h, Dom encerrado. Inventado.
- **Email** — `geral@ptacademy.pt`. Inventado.
- **Política de privacidade** — `href="#"`, página por fazer.
- As âncoras `#inicio`, `#sobre`, `#inscricao` **ainda não existem** no
  HTML (já era assim na nav). Só `#modalidades`, `#instalacoes` e `#planos`
  têm `id`. O "Modalidades" do nav e do rodapé aponta agora para
  `/modalidades.html`, e o "Equipa" (nav, rodapé e o "Ver equipa" da
  homepage) para `/equipa.html`, não para âncoras.

Links das redes são reais (Instagram, Facebook, TikTok da PT Academy).

## Formulário de contacto — `formulario.js` + `servidor.js`

A validação e o envio vivem no `formulario.js` e são partilhados pelos dois
sítios onde o formulário aparece: dentro do modal da homepage e aberto na
página de contactos. O `modal.js` ficou só com abrir, fechar e prender o
foco; o `contactos.js` só liga o formulário da página.

```
ligarFormulario(form, sucesso) → { reiniciar }
```

O `sucesso` é o bloco que substitui o formulário depois do envio. Quem não
tiver nenhum, recebe a confirmação na linha de estado. O `reiniciar` existe
para o modal poder reabrir de raiz.

**O `formulario.js` tem de vir antes** do `modal.js` e do `contactos.js` nos
`<script>` da página — define a função que os dois chamam.

### Modal — `modal.js`

O botão "Enviar questão" da faixa de fecho abre um modal com o formulário:
nome, preferência de contacto (telefone / email / mensagem, em pastilhas),
telemóvel, email, a questão e o consentimento RGPD. Estética alinhada com o
resto: caixa `--color-card` com borda bordô, risca vermelha de 3px no topo,
inputs só com borda em baixo que acende a vermelho no foco.

- **z-index 150** — por cima do nav (100) e do menu (90), por baixo da tela
  de entrada (200).
- **Foco preso** dentro da caixa enquanto está aberto; Escape e clique no
  fundo fecham; o foco volta ao botão que abriu.
- **`requestAnimationFrame` antes da classe** — o browser não anima a
  transição de um elemento que acabou de deixar de estar `hidden`.
- **Validação condicional**: o canal escolhido manda. Escolher "Telefone" ou
  "Mensagem" torna o telemóvel obrigatório; "Email" torna o email
  obrigatório. O outro campo continua opcional, mas se for preenchido tem de
  estar bem escrito.
- **Pote de mel**: campo "Empresa" fora do ecrã e fora da tabulação. Se vier
  preenchido, o servidor descarta e responde 200 na mesma — não se dá a
  dica ao bot.
- O envio está isolado em `enviarQuestao()`, no fim do `formulario.js`. Trocar de
  serviço é mexer só nessa função.

### Servidor

`servidor.js` serve os ficheiros estáticos **e** expõe `POST /api/contacto`,
que fala com o Resend. **Sem dependências** — o `fetch` global do Node 18+
chega, portanto não há `npm install` neste projeto.

```
node --env-file=.env servidor.js
```

A validação está repetida no servidor de propósito: a do cliente é conforto,
a do servidor é a que conta — o pedido pode vir de qualquer lado. Tem também
travão por IP (5 envios / 10 min, em memória), limite de 16 KB no corpo, e
escapa o conteúdo antes de o meter no HTML do email. O `reply_to` vai com o
email do sócio, quando ele o deu.

**Porque não no frontend:** a chave do Resend é secreta — no JavaScript,
está no código-fonte da página, e com ela manda-se email em nome do domínio
da academia. O Resend nem sequer aceita chamadas do browser (bloqueia por
CORS). Alternativas sem servidor, se algum dia fizer sentido: Web3Forms ou
Formspree (chave pública, feita para ser pública), ou Netlify Forms.

### Por fazer

- **`RESEND_API_KEY`** — copiar `.env.exemplo` para `.env` e pôr a chave
  real. O `.env` está no `.gitignore`.
- **Verificar o domínio no Resend** para poder enviar de `@ptacademy.pt`.
  Sem isso, só `onboarding@resend.dev`, que entrega apenas na conta do
  Resend.
- **`EMAIL_DESTINO`** — está `geral@ptacademy.pt`, que é o mesmo placeholder
  do rodapé e da página de contactos. **Confirmar o email real da academia** —
  está marcado com um TODO no `contactos.html`, no `rodape.js` e no
  `servidor.js`.
- Se a API passar a viver noutra máquina que não a do site: pôr o URL
  completo no `ENDPOINT` do `formulario.js` e o `Access-Control-Allow-Origin` no
  `servidor.js` (com o domínio do site, nunca `*`).

## Conteúdo editável — `conteudo/`

Primeiro passo do gestor de conteúdos (23 set. 2026): todo o conteúdo
editável das seis páginas passou para JSON em `conteudo/`, com esquemas
em `conteudo/esquemas/` e a documentação em `conteudo/LEIAME.md`. O
site passou a ser gerado a partir deles no passo seguinte (ver abaixo).

Verificado por script: todos os textos, fotos e textos alternativos das
páginas, do rodapé e das fotos no CSS estão nos JSON, com exceção do que
é gerado ou de estrutura (listado no LEIAME). O horário de aulas foi
extraído das tabelas por script (72 aulas) e a frase do horário de
abertura gerada a partir do `contactos.json` sai igual à atual.

Mudanças que isto trouxe:
- `assets/HYROX.webp` passou a `assets/hyrox.webp` (nomes em kebab-case).
- O título "UM ESPAÇO FAMILIAR" ficou em caixa normal no JSON; o CSS já
  põe em maiúsculas.
- A homepage e o Sobre ganharam descrição para o Google no JSON.
- O horário no rodapé vai passar a ter a mesma formatação que em
  Contactos (hoje um usa "/" e "-", o outro "·" e "—").
- Três links apontavam para âncoras que não existiam. "Começar hoje"
  passou a ir para os planos, "Ver academia" para as Instalações e
  "Início" (nav e rodapé) para `/`.

### Por confirmar

- A página da campanha em `campanha.json` tem só abertura, planos e fecho,
  feitos com os textos que já existiam. O cliente completa-a no gestor.

## Build — `construir.js` + `moldes/`

Segundo passo do gestor de conteúdos (23 set. 2026). As seis páginas
deixaram de existir como `.html` na raiz: são geradas pelo
`node construir.js`, que junta o `conteudo/` com os moldes em `moldes/`
e escreve o site em `dist/` (fora do git). Sem dependências.

- **Moldes:** um módulo Node por página (`inicio`, `sobre`,
  `modalidades`, `instalacoes`, `equipa`, `contactos`) e as peças
  partilhadas no `comum.js`: cabeça, nav, rodapé, fecho, botões,
  formulário e modal.
- **Modal automático:** o `fim()` só põe o modal, o `formulario.js` e o
  `modal.js` nas páginas que têm um botão com ação `modal`.
- **Verificação:** antes de escrever, o build confirma as contagens fixas
  (4 modalidades, 8 fotos na galeria, 3 valores…), as abas do horário,
  um só plano em destaque, datas e horas bem escritas, ficheiros de
  media que existem e o endereço da campanha. Se falhar, pára com a lista
  de problemas e não escreve nada.
- **Fotos de fundo:** o hero da homepage e o das Modalidades, as três
  fotos do bloco "Sobre" e os quatro tiles passaram de `background-image`
  no CSS para `<img>` dentro da mesma camada, com `object-fit: cover`
  (regra nova no `styles.css`). As animações atuam na camada, por isso
  não mudaram. A rua das Instalações ficou no CSS: é a primeira cena do
  passeio.
- **Equipa:** uma pessoa sem vídeo tem só a foto, sem botão, e o
  `equipa.js` passou a ignorar esses cartões.
- **Servidor local:** o `servidor.js` serve a `dist/` e responde a
  endereços sem extensão com o `.html` do mesmo nome, como a Cloudflare.

Verificado por script: as páginas geradas foram comparadas etiqueta a
etiqueta com as antigas. As únicas diferenças são as previstas: as fotos
em `<img>`, as descrições novas, "Um espaço familiar" em caixa normal, o
horário do rodapé com a formatação de Contactos, o ano num `<span>`,
as legendas das tabelas para leitores de ecrã ("Horário semanal: Cross
Training") e o botão da faixa da campanha a apontar para a página dela.

### Por fazer

- A página da campanha e o link vermelho no nav. Até lá, o "Saber mais"
  da faixa aponta para `/3-meses-gratis`, que ainda não existe.
- A página 404.
- As secções `perguntas` e `condicoes` da campanha, por desenhar.
- Passar o formulário para uma Pages Function.
