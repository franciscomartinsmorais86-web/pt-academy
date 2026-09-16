/* Página "Instalações": fotos do quadro de espaços, a pedido.

   Cada linha do quadro abre no hover e mostra as fotos do espaço, listadas
   no data-fotos. Com mais de uma, passam em sequência na mesma moldura
   enquanto o cursor lá estiver, com uma risca por foto por baixo.

   Pôr as fotos no CSS obrigava o browser a descarregá-las todas ao abrir a
   página, mesmo sem ninguém lhes chegar. Aqui cada foto só é pedida quando
   é precisa: a primeira no primeiro hover da linha (os 120ms de atraso da
   abertura já dão avanço ao pedido), cada seguinte quando a anterior
   aparece. E só entra depois de descodificada — nunca se vê a meio.

   Markup: <li class="quadro__espaco" data-fotos="a.webp b.webp">, com a
   .quadro__foto e a .quadro__foto-moldura lá dentro. O script cria uma
   .quadro__foto-camada por foto (com --foto) e as riscas.

   Onde não há hover (ecrãs táteis) as linhas não abrem, portanto não se
   pede nada. Com prefers-reduced-motion fica só a primeira foto. */
var QUADRO_INTERVALO = 1500;   /* ms que cada foto fica à vista */
var QUADRO_ABERTURA = 670;     /* atraso + abertura da linha no CSS (.12s + .55s) */

document.addEventListener('DOMContentLoaded', function () {
  if (!window.matchMedia('(hover: hover)').matches) return;
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.quadro__espaco[data-fotos]').forEach(function (linha) {
    var fila = linha.querySelector('.quadro__foto');
    var moldura = linha.querySelector('.quadro__foto-moldura');
    if (!fila || !moldura) return;

    var urls = linha.dataset.fotos.trim().split(/\s+/);
    if (semMovimento) urls = urls.slice(0, 1);

    var pedidos = [];      /* promessa da camada de cada foto */
    var falhou = [];
    var marcas = [];
    var ativa = null;      /* camada à vista */
    var visivel = -1;      /* índice da foto à vista */
    var indice = 0;        /* índice da foto que se quer à vista */
    var relogio = null;

    if (urls.length > 1) {
      var riscas = document.createElement('div');
      riscas.className = 'quadro__foto-marcas';
      urls.forEach(function () {
        var marca = document.createElement('span');
        marca.className = 'quadro__foto-marca';
        riscas.appendChild(marca);
        marcas.push(marca);
      });
      fila.appendChild(riscas);
    }

    /* Pede a foto i uma única vez e cria a camada quando a imagem estiver
       descodificada. decode() resolve quando está pronta a pintar; onde
       não existe, o load faz o mesmo papel. */
    function preparar(i) {
      if (!pedidos[i]) {
        var imagem = new Image();
        imagem.src = urls[i];
        var pronta = imagem.decode
          ? imagem.decode()
          : new Promise(function (resolve, reject) {
              imagem.onload = resolve;
              imagem.onerror = reject;
            });
        pedidos[i] = pronta.then(function () {
          var camada = document.createElement('span');
          camada.className = 'quadro__foto-camada';
          camada.style.setProperty('--foto', 'url("' + imagem.src + '")');
          moldura.appendChild(camada);
          return camada;
        });
        /* Sem isto, uma foto adiantada que falhe deixava um aviso de
           promessa rejeitada na consola. */
        pedidos[i].catch(function () {});
      }
      return pedidos[i];
    }

    function mostrar(i) {
      preparar(i).then(function (camada) {
        if (i !== indice) return;   /* entretanto já se quer outra */

        /* Ler o layout faz a camada acabada de criar partir de opacity 0,
           e o fade corre; sem isto aparecia de golpe. */
        void camada.offsetWidth;
        if (ativa && ativa !== camada) ativa.classList.remove('quadro__foto-camada--ativa');
        camada.classList.add('quadro__foto-camada--ativa');
        ativa = camada;
        visivel = i;

        marcas.forEach(function (marca, j) {
          marca.classList.toggle('quadro__foto-marca--ativa', j === i);
        });

        /* Adianta a seguinte, para estar pronta quando chegar a vez dela. */
        if (urls.length > 1) preparar((i + 1) % urls.length);
      }, function () {
        falhou[i] = true;
      });
    }

    /* Só avança quando a foto atual já apareceu (ou falhou): numa rede
       lenta a sequência espera, em vez de saltar fotos por mostrar. */
    function avancar() {
      if (visivel !== indice && !falhou[indice]) return;
      indice = (indice + 1) % urls.length;
      mostrar(indice);
    }

    linha.addEventListener('pointerenter', function () {
      indice = 0;
      mostrar(0);
      if (urls.length < 2) return;

      /* A primeira troca espera pela linha aberta, para a primeira foto
         ficar à vista o mesmo tempo que as outras. */
      relogio = setTimeout(function passo() {
        avancar();
        relogio = setTimeout(passo, QUADRO_INTERVALO);
      }, QUADRO_ABERTURA + QUADRO_INTERVALO);
    });

    linha.addEventListener('pointerleave', function () {
      clearTimeout(relogio);
      relogio = null;
    });
  });
});
