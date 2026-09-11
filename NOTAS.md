# Notas — animações e histórico

Registo do que já foi feito no site e de todo o movimento que lá está.
Atualizar sempre que uma animação for acrescentada, afinada ou retirada.

## Histórico de commits

| Commit | O quê |
|---|---|
| `d9345c0` | Estado inicial do repositório (homepage estática completa) + o primeiro efeito de revelação do hero. `gallery/` ficou fora do controlo de versões — 517 MB de originais e RAW. |
| `d0574d6` | Retira o efeito de revelação do hero: sai o `<canvas class="hero__reveal">`, o CSS da camada e o `hero-reveal.js`. Fica o `pointer-events: none` no título e no eyebrow do hero, que foi pedido à parte. |
| `7488625` | Remove `assets/pt-academy-fachada.jpg`, sem uso depois da remoção acima. O original continua em `gallery/PT Academy-42.jpg`. |
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

O rodapé passou de três colunas anónimas de links para um grid de quatro
blocos — marca (logo + tagline + redes), "Navegação", "A academia" e
"Contactos" (morada com link para o mapa, `tel:`, `mailto:` e horário em
`<dl>`) — cada um com um `.footer__title` no mesmo tratamento dos eyebrows
do resto do site. Em baixo, barra legal com © e Livro de Reclamações.

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
- As âncoras `#inicio`, `#sobre`, `#modalidades`, `#equipa`, `#inscricao`
  **ainda não existem** no HTML (já era assim na nav). Só `#instalacoes` e
  `#planos` têm `id`.

Links das redes são reais (Instagram, Facebook, TikTok da PT Academy).

## Modal de contacto — `modal.js` + `servidor.js`

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
- O envio está isolado em `enviarQuestao()`, no fim do `modal.js`. Trocar de
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
  do rodapé. Confirmar o email real da academia.
- Se a API passar a viver noutra máquina que não a do site: pôr o URL
  completo no `ENDPOINT` do `modal.js` e o `Access-Control-Allow-Origin` no
  `servidor.js` (com o domínio do site, nunca `*`).
