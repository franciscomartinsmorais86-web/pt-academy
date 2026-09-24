# Conteúdo do site

Esta pasta guarda o que o cliente pode mudar no site: textos, preços,
horários, equipa, contactos e campanha. O gestor de conteúdos só escreve
aqui e em `assets/`. Nunca toca em HTML, CSS ou JS.

O site é gerado a partir daqui:

```
node construir.js
```

junta estes ficheiros com os moldes de `moldes/` e escreve o site em
`dist/`. A Cloudflare Pages corre o mesmo comando a cada push. Se o
conteúdo partir uma regra da estrutura (uma contagem fixa, um ficheiro
que não existe, uma hora mal escrita), o build pára e diz o quê e onde.

O inventário completo, com o porquê de cada decisão, está em
`docs/PT_Academy_Inventario_Conteudo_Editavel.html`.

## Ficheiros

| Ficheiro | O que tem | Onde aparece |
|---|---|---|
| `geral.json` | nome, tagline, data de fundação, redes sociais, links legais | rodapé, títulos das páginas, contador de anos no Sobre |
| `contactos.json` | telefone, email, morada, horário de abertura | rodapé, Contactos, botões "ligar", nota e lead do horário nas Modalidades |
| `campanha.json` | a campanha: interruptor, link do nav, faixa, página própria | nav, faixa vermelha da homepage, `/<endereco>` |
| `planos.json` | os cartões de preços | homepage, secção "planos" da campanha |
| `modalidades.json` | os 4 capítulos, textos do horário, extras | Modalidades, tiles da homepage, letreiro e contador do Sobre |
| `horario.json` | as aulas da semana, uma por linha | tabela do horário nas Modalidades |
| `equipa.json` | grupos e pessoas | Equipa |
| `instalacoes.json` | textos da página e quadro de espaços | Instalações |
| `paginas.json` | SEO, heros, fechos e blocos próprios de cada página | todas |

Cada ficheiro tem um esquema com o mesmo nome em `esquemas/`, em JSON
Schema 2020-12. O esquema é a documentação de cada campo: tipo,
limites, descrição e marcas permitidas. As peças partilhadas (botão,
foto, título, fecho, SEO) estão em `esquemas/comum.json`.

Chaves próprias nos esquemas, que o gestor lê:

- `x-marcas`: marcas de texto que o campo aceita (ver abaixo).
- `x-ficheiro`: o campo é um caminho dentro de `assets/`, e o gestor mostra um carregador de ficheiros.
- `x-bloqueado-apos-criar`: o campo só se edita ao criar; depois fica bloqueado com um aviso.
- `x-ultima`: tipo obrigatório na última posição de uma lista (a campanha acaba sempre com um fecho).

## Marcas de texto

O cliente nunca escreve HTML. O build escapa tudo e só converte isto:

| Escreve | Sai | Nome em `x-marcas` |
|---|---|---|
| `começa *aqui*` | a palavra a vermelho (`<em>`) | `destaque` |
| `A tua jornada \| começa *aqui*` | mudança de linha (`<br>`) | `quebra` |
| `nos planos **Power** e **Premium**` | negrito (`<strong>`) | `forte` |
| `Confirma pelo {telefone}.` | o telefone de `contactos.json`, com link | `telefone` |

Regras: no máximo um destaque por título (o esquema recusa dois). A
quebra só existe em títulos de hero e de faixa (`tituloGrande`).

## Botões

Todos os botões são `{ "texto": "…", "acao": "…" }`. A `acao` aceita:

- `ligar`: link `tel:` para o telefone de `contactos.json`.
- `modal`: abre o formulário "Enviar questão".
- `campanha`: abre a página da campanha ativa.
- qualquer outra coisa é um endereço: `/equipa.html`, `/#planos`, `https://…`.

Numa lista de dois botões, o primeiro sai a vermelho e o segundo em
contorno.

## Media

Os caminhos são relativos a `assets/`, sem o `assets/` à frente:
`"pessoal/majo.webp"`. Nomes em minúsculas e kebab-case. Fotografias
em `.webp`, vídeos em `.mp4`.

As fotos com `{ "ficheiro", "alt" }` têm texto alternativo. As que são
só um caminho são decorativas (heros por trás do título, tiles, fotos
do Sobre na homepage) e saem com `alt=""`.

## O que o build gera sozinho

Não se escreve à mão, calcula-se a partir dos dados:

- o `tel:+351…` a partir do telefone;
- os anos em Vila Real (Sobre) a partir de `geral.fundacao`;
- o número de modalidades (Sobre) e a primeira linha do letreiro;
- o índice do hero das Modalidades e os quatro tiles da homepage;
- a frase do horário de abertura nas Modalidades, a partir de `contactos.horario` (`leadAbertura` + "segunda a sexta das 07h às 22h, …");
- o horário formatado no rodapé (`curto`) e em Contactos (`dias`);
- "N pessoas" em cada grupo da Equipa;
- as numerações 01, 02… (capítulos, valores, espaços, passos);
- o lado da foto em cada capítulo (alterna);
- o título de cada página: `seo.titulo` + " · " + `geral.nome` (a homepage fica só com o nome);
- a faixa da campanha, o link vermelho no nav (em primeiro lugar) e a página da campanha em `/<endereco>`, só quando `campanha.ativa` é `true`. Com a campanha desligada, o build recusa botões com a ação `campanha`.

## O que não está aqui

É estrutura, e muda-se no código, pela NK:

- layout, cores, tipografia, animações;
- os campos, etiquetas e mensagens do formulário de contacto;
- os itens do nav e as colunas de links do rodapé;
- o passeio virtual (`assets/walkthrough/walkthrough.json`);
- textos de sistema: "Fechar", "Voltar ao início", "O passeio não abriu…", legendas para leitores de ecrã, a assinatura da NK;
- a página 404 (texto e foto, no `moldes/erro404.js`);
- o email para onde vão as mensagens do formulário (variável de ambiente na Cloudflare).

## Página nova

Uma página nova põe os seus textos aqui desde o primeiro dia: um bloco
em `paginas.json` (ou um ficheiro novo, se for um tema com dados
próprios) e o esquema correspondente. O molde vai para `moldes/` e
entra na lista `MOLDES` do `construir.js`. Nada de texto de conteúdo
escrito diretamente no molde.
