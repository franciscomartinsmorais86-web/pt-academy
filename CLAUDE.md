# PT Academy

Site do ginásio PT Academy (conteúdo em PT-PT). A página de referência é
`PT-Academy Homepage.html` — é daí que sai toda a identidade visual abaixo.

## Paleta

| Papel | Valor | Onde se usa |
|---|---|---|
| Vermelho de marca | `#C11D26` | CTAs, sublinhados, o `·` do logo, badges, destaques |
| Preto de fundo | `#0A0A0A` | fundo principal da página |
| Preto mais escuro | `#070707` | secções alternadas |
| Cinzento escuro (cards) | `#141414` | cartões de preços e de aulas |
| Riscas decorativas | `#232323` / `#2B2B2B` | `repeating-linear-gradient(45deg, …)` |
| Bordô escuro | `#1A1112` | fundos de blocos com tom avermelhado |
| Bordô escuro 2 | `#2A1215` | variante mais quente do anterior |
| Borda bordô | `#5C2B2E` | `1px solid` em blocos destacados |
| Vermelho claro | `#FF8A80` | texto de destaque sobre fundo bordô |
| Branco | `#FFFFFF` | texto principal, botões outline (`2px solid #fff`) |
| Cinzento de texto | `#999999` | texto secundário |
| Cinzento de texto 2 | `#666666` | texto terciário / legendas |

Transparências sobre fundo escuro (texto e bordas):
`rgba(255,255,255,.85 / .8 / .75 / .7 / .6 / .55 / .5 / .4)` para texto,
`rgba(255,255,255,.15 / .12 / .1 / .07)` para bordas e separadores,
`rgba(193,29,38,.35)` para vermelho esbatido.

Overlay do hero:
`linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,.25) 45%, rgba(10,10,10,1) 100%)`

### CSS custom properties

A homepage original não usa variáveis (os hex estão literais no style inline).
Em páginas novas usar este bloco:

```css
:root {
  --brand-red:     #C11D26;
  --red-light:     #FF8A80;
  --bg:            #0A0A0A;
  --bg-alt:        #070707;
  --card:          #141414;
  --stripe-a:      #232323;
  --stripe-b:      #2B2B2B;
  --maroon:        #1A1112;
  --maroon-2:      #2A1215;
  --maroon-border: #5C2B2E;
  --text:          #FFFFFF;
  --text-muted:    #999999;
  --text-dim:      #666666;
  --line:          rgba(255,255,255,.12);
}
```

## Tipografia

- **Archivo Black** — títulos e headings (o site usa maiúsculas em quase tudo).
- **Archivo** — texto corrido e botões.
- **Barlow Condensed** — labels, navegação, números (preços, horários).

## Nota

Fonte da verdade da identidade visual: `PT-Academy Homepage.html`.
Fotografias reais do ginásio em `gallery/` (15 ficheiros, nomes `PTAcademy_<cena>_<data>.jpg`).

## Media

- `gallery/` é o arquivo em bruto; `assets/` é o que o site consome.
- Sempre que o Francisco passar uma imagem/vídeo para usar no site, **copiar o
  ficheiro para `assets/`** (com um nome descritivo em kebab-case) e referenciar
  a cópia — nunca apontar o site diretamente para `gallery/`.
- Media que deixe de ser usada deve ser removida de `assets/` — mas **só com
  autorização explícita do Francisco**, nunca por iniciativa própria.
