/* ==========================================================
   Easy Finance - gráfico histórico (últimos 30 dias)
   Só busca os dados quando a seção aparece na tela, para não pesar
   na abertura do site. Cada moeda escolhida é guardada por 1 hora.
   ========================================================== */
(function () {
  const secao = document.getElementById('historico');
  if (!secao) return;

  const OPCOES = [
    { par: 'USD-BRL', nome: 'Dólar',    casas: 4 },
    { par: 'EUR-BRL', nome: 'Euro',     casas: 4 },
    { par: 'BTC-BRL', nome: 'Bitcoin',  casas: 0 },
    { par: 'ETH-BRL', nome: 'Ethereum', casas: 0 }
  ];

  const botoes = document.getElementById('histOpcoes');
  const resumo = document.getElementById('histResumo');
  const nota = document.getElementById('histNota');
  const canvas = document.getElementById('graficoHist');

  let grafico = null;
  let atual = OPCOES[0];
  let dadosAtuais = null;
  let carregou = false;

  const cssVar = nome => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const real = (v, casas) => 'R$ ' + formatar(v, casas);
  const dia = t => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  function criarBotoes() {
    OPCOES.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = o.nome;
      if (o === atual) b.className = 'ativo';
      b.addEventListener('click', () => {
        atual = o;
        botoes.querySelectorAll('button').forEach(x => x.classList.toggle('ativo', x === b));
        carregar();
      });
      botoes.appendChild(b);
    });
  }

  function mostrarResumo(pontos) {
    const valores = pontos.map(p => p.v);
    const primeiro = valores[0];
    const ultimo = valores[valores.length - 1];
    const variacao = ((ultimo - primeiro) / primeiro) * 100;

    const itens = [
      { r: 'Último valor', v: real(ultimo, atual.casas), c: '' },
      { r: 'Variação no período', v: (variacao >= 0 ? '▲ ' : '▼ ') + formatar(variacao, 2) + '%', c: variacao >= 0 ? 'positivo' : 'negativo' },
      { r: 'Mínima', v: real(Math.min(...valores), atual.casas), c: '' },
      { r: 'Máxima', v: real(Math.max(...valores), atual.casas), c: '' }
    ];

    resumo.textContent = '';
    itens.forEach(i => {
      const caixa = document.createElement('div');
      caixa.className = 'hist-item';
      const r = document.createElement('span');
      r.className = 'hist-rotulo';
      r.textContent = i.r;
      const v = document.createElement('strong');
      v.className = i.c;
      v.textContent = i.v;
      caixa.append(r, v);
      resumo.appendChild(caixa);
    });
  }

  function desenhar(pontos) {
    if (typeof Chart === 'undefined') {
      nota.textContent = 'Não foi possível carregar a biblioteca do gráfico agora.';
      return;
    }

    const subiu = pontos[pontos.length - 1].v >= pontos[0].v;
    const cor = subiu ? cssVar('--positivo') : cssVar('--negativo');
    const corTexto = cssVar('--texto-suave');
    const corGrade = cssVar('--borda');

    if (grafico) grafico.destroy();

    grafico = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: pontos.map(p => dia(p.t)),
        datasets: [{
          label: atual.nome,
          data: pontos.map(p => p.v),
          borderColor: cor,
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          fill: true,
          backgroundColor: ctx => {
            const area = ctx.chart.chartArea;
            if (!area) return 'transparent';
            const g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            g.addColorStop(0, cor + '55'); // mesma cor, com transparência
            g.addColorStop(1, cor + '00');
            return g;
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => real(c.parsed.y, atual.casas) } }
        },
        scales: {
          x: { ticks: { color: corTexto, maxTicksLimit: 6, maxRotation: 0 }, grid: { display: false } },
          y: {
            ticks: { color: corTexto, maxTicksLimit: 5, callback: v => formatar(v, atual.casas > 2 ? 2 : atual.casas === 0 ? 0 : 2) },
            grid: { color: corGrade }
          }
        }
      }
    });
  }

  async function carregar() {
    nota.textContent = 'Carregando ' + atual.nome + '...';
    try {
      const r = await buscarHistorico(atual.par);
      if (!r.dados.length) throw new Error('sem dados');
      dadosAtuais = r.dados;
      mostrarResumo(dadosAtuais);
      desenhar(dadosAtuais);
      nota.textContent = 'Cotação diária em reais, últimos ' + dadosAtuais.length + ' registros. Fonte: AwesomeAPI.' + (r.antigo ? ' (dado salvo, pode estar antigo)' : '');
    } catch (e) {
      resumo.textContent = '';
      if (grafico) { grafico.destroy(); grafico = null; }
      nota.textContent = 'Histórico indisponível agora. Tente outra moeda ou volte em alguns minutos.';
    }
  }

  function iniciar() {
    if (carregou) return;
    carregou = true;
    carregar();
  }

  criarBotoes();

  // Só começa a buscar quando a seção chega perto da tela
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entradas => {
      if (entradas.some(e => e.isIntersecting)) { iniciar(); obs.disconnect(); }
    }, { rootMargin: '200px' });
    obs.observe(secao);
  } else {
    iniciar();
  }

  document.addEventListener('tema-mudou', () => { if (dadosAtuais) desenhar(dadosAtuais); });
})();
