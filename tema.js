/* tema.js
   Cuida do tema claro/escuro em TODAS as páginas e do ano no rodapé.
   Este arquivo é carregado dentro do <head> de cada página, para o tema
   ser aplicado antes da página aparecer (sem "piscar" de branco). */
(function () {
  var salvo = null;
  try { salvo = localStorage.getItem('theme'); } catch (e) {}

  var prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var tema = salvo || (prefereEscuro ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', tema);

  document.addEventListener('DOMContentLoaded', function () {
    var botao = document.getElementById('toggle-theme');
    if (botao) {
      botao.addEventListener('click', function () {
        var atual = document.documentElement.getAttribute('data-theme');
        var novo = atual === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', novo);
        try { localStorage.setItem('theme', novo); } catch (e) {}
        // Avisa outros scripts (o gráfico do simulador usa isso para trocar de cor)
        document.dispatchEvent(new CustomEvent('tema-mudou', { detail: novo }));
      });
    }


    // Botão "Compartilhar": usa o compartilhamento do celular ou copia o link
    var compartilhar = document.querySelectorAll('[data-compartilhar]');
    for (var k = 0; k < compartilhar.length; k++) {
      (function (btn) {
        var textoOriginal = btn.textContent;
        btn.addEventListener('click', function () {
          var dados = {
            title: document.title,
            text: 'Conheça o Easy Finance: simuladores e educação financeira gratuitos.',
            url: location.href
          };
          if (navigator.share) { navigator.share(dados).catch(function () {}); return; }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(location.href).then(function () {
              btn.textContent = '✅ Link copiado!';
              setTimeout(function () { btn.textContent = textoOriginal; }, 2000);
            }).catch(function () { window.prompt('Copie o link:', location.href); });
          } else {
            window.prompt('Copie o link:', location.href);
          }
        });
      })(compartilhar[k]);
    }

    // Preenche o ano automaticamente: <span data-ano></span>
    var anos = document.querySelectorAll('[data-ano]');
    for (var i = 0; i < anos.length; i++) {
      anos[i].textContent = new Date().getFullYear();
    }
  });
})();
