/* Modal de contacto: abre pelo botão "Enviar questão" da faixa de fecho,
   valida no cliente e entrega ao endpoint que fala com o Resend.

   O envio está todo isolado em enviarQuestao() — trocar de serviço é
   mexer só nessa função. */

/* Caminho do endpoint. Relativo enquanto o site e a API forem servidos
   pela mesma máquina; se a API passar para outro sítio, meter aqui o URL
   completo (e ver a nota de CORS no servidor.js). */
var ENDPOINT = '/api/contacto';

/* O que cada preferência de contacto torna obrigatório. */
var OBRIGATORIO = {
  telefone: 'telefone',
  mensagem: 'telefone',
  email: 'email'
};

document.addEventListener('DOMContentLoaded', function () {
  var root = document.documentElement;
  var modal = document.getElementById('modal-contacto');
  var form = document.getElementById('form-contacto');
  if (!modal || !form) return;

  var caixa = modal.querySelector('.modal__caixa');
  var sucesso = modal.querySelector('[data-sucesso]');
  var estado = form.querySelector('[data-estado]');
  var botao = form.querySelector('.form__enviar');
  var textoBotao = form.querySelector('.form__enviar-texto');
  var focoAnterior = null;

  /* ---------- Abrir e fechar ---------- */

  function abrir() {
    focoAnterior = document.activeElement;
    modal.hidden = false;
    /* Um frame antes de pôr a classe, senão o browser não anima a
       transição de um elemento que acabou de deixar de estar hidden. */
    requestAnimationFrame(function () {
      root.classList.add('is-modal-open');
      var primeiro = form.querySelector('.campo__input');
      if (primeiro) primeiro.focus();
    });
  }

  function fechar() {
    root.classList.remove('is-modal-open');
    window.setTimeout(function () {
      modal.hidden = true;
      reiniciar();
      if (focoAnterior) focoAnterior.focus();
    }, 350);
  }

  /* Volta ao formulário limpo, para o modal poder reabrir de raiz. */
  function reiniciar() {
    form.reset();
    form.hidden = false;
    sucesso.hidden = true;
    estado.textContent = '';
    limparErros();
  }

  document.addEventListener('click', function (evento) {
    if (evento.target.closest('[data-modal-abrir]')) {
      evento.preventDefault();
      abrir();
    } else if (evento.target.closest('[data-modal-fechar]')) {
      fechar();
    }
  });

  document.addEventListener('keydown', function (evento) {
    if (modal.hidden) return;
    if (evento.key === 'Escape') fechar();
    if (evento.key === 'Tab') prenderFoco(evento);
  });

  /* Enquanto o modal está aberto o Tab não sai da caixa. */
  function prenderFoco(evento) {
    var focaveis = caixa.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select'
    );
    var visiveis = [];
    for (var i = 0; i < focaveis.length; i++) {
      if (focaveis[i].offsetParent !== null) visiveis.push(focaveis[i]);
    }
    if (!visiveis.length) return;

    var primeiro = visiveis[0];
    var ultimo = visiveis[visiveis.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  /* ---------- Validação ---------- */

  function limparErros() {
    var erros = form.querySelectorAll('[data-erro]');
    for (var i = 0; i < erros.length; i++) erros[i].textContent = '';
    var campos = form.querySelectorAll('.campo');
    for (var j = 0; j < campos.length; j++) campos[j].classList.remove('campo--invalido');
  }

  function marcarErro(nome, mensagem) {
    var alvo = form.querySelector('[data-erro="' + nome + '"]');
    if (alvo) alvo.textContent = mensagem;
    var campo = form.querySelector('[name="' + nome + '"]');
    if (campo && campo.closest('.campo')) {
      campo.closest('.campo').classList.add('campo--invalido');
    }
  }

  function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
  }

  /* Nove dígitos, ignorando espaços e um indicativo +351 à frente. */
  function telefoneValido(valor) {
    var limpo = valor.replace(/[\s.-]/g, '').replace(/^\+351/, '');
    return /^\d{9}$/.test(limpo);
  }

  function validar(dados) {
    limparErros();
    var ok = true;

    if (dados.nome.length < 2) {
      marcarErro('nome', 'Diz-nos como te chamas.');
      ok = false;
    }

    if (dados.questao.length < 10) {
      marcarErro('questao', 'Conta-nos um pouco mais — pelo menos 10 caracteres.');
      ok = false;
    }

    /* O canal escolhido manda: só é obrigatório o contacto que vamos usar. */
    var exigido = OBRIGATORIO[dados.contacto];

    if (exigido === 'telefone' && !telefoneValido(dados.telefone)) {
      marcarErro('telefone', dados.telefone
        ? 'Número a mais ou a menos — são 9 dígitos.'
        : 'Escolheste ser contactado por aqui: falta o número.');
      ok = false;
    }

    if (exigido === 'email' && !emailValido(dados.email)) {
      marcarErro('email', dados.email
        ? 'Este email não parece estar bem escrito.'
        : 'Escolheste ser contactado por aqui: falta o email.');
      ok = false;
    }

    /* Os que não são obrigatórios ainda assim têm de estar bem escritos
       se estiverem preenchidos. */
    if (exigido !== 'telefone' && dados.telefone && !telefoneValido(dados.telefone)) {
      marcarErro('telefone', 'Número a mais ou a menos — são 9 dígitos.');
      ok = false;
    }
    if (exigido !== 'email' && dados.email && !emailValido(dados.email)) {
      marcarErro('email', 'Este email não parece estar bem escrito.');
      ok = false;
    }

    if (!dados.consentimento) {
      marcarErro('consentimento', 'Precisamos da tua autorização para te responder.');
      ok = false;
    }

    return ok;
  }

  /* Ao trocar de preferência, tira o erro do campo que deixou de ser
     obrigatório. */
  var radios = form.querySelectorAll('[name="contacto"]');
  for (var r = 0; r < radios.length; r++) {
    radios[r].addEventListener('change', limparErros);
  }

  /* ---------- Envio ---------- */

  /* Único ponto de contacto com o exterior. */
  function enviarQuestao(dados) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    }).then(function (resposta) {
      return resposta.json().catch(function () {
        return {};
      }).then(function (corpo) {
        if (!resposta.ok) throw new Error(corpo.erro || 'Não conseguimos enviar.');
        return corpo;
      });
    });
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var dados = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      telefone: form.telefone.value.trim(),
      contacto: form.contacto.value,
      questao: form.questao.value.trim(),
      consentimento: form.consentimento.checked,
      empresa: form.empresa.value /* pote de mel: só bots o preenchem */
    };

    if (!validar(dados)) {
      var invalido = form.querySelector('.campo--invalido .campo__input');
      if (invalido) invalido.focus();
      return;
    }

    estado.textContent = '';
    botao.disabled = true;
    textoBotao.textContent = 'A enviar…';

    enviarQuestao(dados).then(function () {
      form.hidden = true;
      sucesso.hidden = false;
      var fechaSucesso = sucesso.querySelector('.button');
      if (fechaSucesso) fechaSucesso.focus();
    }).catch(function (erro) {
      estado.textContent = erro.message + ' Se preferires, liga para 259 322 108.';
      botao.disabled = false;
      textoBotao.textContent = 'Tentar outra vez';
    });
  });
});
