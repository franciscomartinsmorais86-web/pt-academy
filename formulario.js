/* Formulário de contacto, partilhado por quem o quiser mostrar: a página
   de contactos tem-no aberto na página, a homepage tem-no dentro do
   modal. A lógica é a mesma nos dois sítios — validação no cliente,
   entrega ao endpoint que fala com o Resend — e vive só aqui.

   Uso:
     var f = ligarFormulario(form, sucesso);
     f.reiniciar();   // volta ao formulário limpo (o modal usa ao fechar)

   O `sucesso` é o bloco que substitui o formulário depois do envio. Se a
   página não tiver nenhum, o formulário fica no sítio com uma mensagem.

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

/* Número da academia, para o recado de erro mandar para algum lado. */
var TELEFONE = '259 322 108';

function ligarFormulario(form, sucesso) {
  var estado = form.querySelector('[data-estado]');
  var botao = form.querySelector('.form__enviar');
  var textoBotao = form.querySelector('.form__enviar-texto');

  /* ---------- Validação ---------- */

  function limparErros() {
    form.querySelectorAll('[data-erro]').forEach(function (el) {
      el.textContent = '';
    });
    form.querySelectorAll('.campo').forEach(function (campo) {
      campo.classList.remove('campo--invalido');
    });
  }

  function marcarErro(nome, mensagem) {
    var alvo = form.querySelector('[data-erro="' + nome + '"]');
    if (alvo) alvo.textContent = mensagem;
    var campo = form.querySelector('[name="' + nome + '"]');
    if (campo && campo.closest('.campo')) {
      campo.closest('.campo').classList.add('campo--invalido');
    }
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
  form.querySelectorAll('[name="contacto"]').forEach(function (radio) {
    radio.addEventListener('change', limparErros);
  });

  /* ---------- Envio ---------- */

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
      if (!sucesso) {
        estado.textContent = 'Recebemos. Damos notícias em breve.';
        botao.disabled = false;
        textoBotao.textContent = 'Enviar questão';
        form.reset();
        return;
      }
      form.hidden = true;
      sucesso.hidden = false;
      /* O foco tem de seguir o conteúdo, senão fica num <form hidden>. */
      var seguinte = sucesso.querySelector('.button') || sucesso;
      if (seguinte === sucesso) sucesso.setAttribute('tabindex', '-1');
      seguinte.focus();
    }).catch(function (erro) {
      estado.textContent = erro.message + ' Se preferires, liga para ' + TELEFONE + '.';
      botao.disabled = false;
      textoBotao.textContent = 'Tentar outra vez';
    });
  });

  /* Volta ao formulário limpo, para o modal poder reabrir de raiz. */
  function reiniciar() {
    form.reset();
    form.hidden = false;
    if (sucesso) sucesso.hidden = true;
    estado.textContent = '';
    botao.disabled = false;
    textoBotao.textContent = 'Enviar questão';
    limparErros();
  }

  return { reiniciar: reiniciar };
}

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

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

/* Nove dígitos, ignorando espaços e um indicativo +351 à frente. */
function telefoneValido(valor) {
  return /^\d{9}$/.test(String(valor).replace(/[\s.-]/g, '').replace(/^\+351/, ''));
}
