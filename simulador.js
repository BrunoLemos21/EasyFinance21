/* ==========================================================
   Easy Finance - simulador de investimentos
   Calcula juros compostos com aportes mensais e desconta a inflação.
   ========================================================== */
(function () {
  const $ = id => document.getElementById(id);

  const dinheiro = v =>
    'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let ultimoResultado = null;
  let grafico = null;

  // Converte uma taxa em % (ao ano ou ao mês) para taxa mensal em decimal.
  // Ex.: 12% ao ano  ->  (1,12)^(1/12) - 1  ≈ 0,949% ao mês
  function paraMensal(percentual, base) {
    const taxa = percentual / 100;
    return base === 'ano' ? Math.pow(1 + taxa, 1 / 12) - 1 : taxa;
  }

  function mostrarMensagem(texto) {
    $('mensagem').textContent = texto || '';
  }

  function calcular() {
    const inicial = Math.max(0, parseFloat($('inicial').value) || 0);
    const aporte = Math.max(0, parseFloat($('aporte').value) || 0);
    const base = $('base').value;
    const taxa = paraMensal(parseFloat($('taxa').value) || 0, base);
    const inflacao = paraMensal(parseFloat($('inflacao').value) || 0, base);

    let meses = parseInt($('periodo').value, 10) || 0;
    if ($('prazoTipo').value === 'anos') meses *= 12;

    if (meses < 1) {
      mostrarMensagem('Informe um prazo de pelo menos 1 mês.');
      return null;
    }
    if (meses > 600) {
      mostrarMensagem('O prazo máximo é de 600 meses (50 anos).');
      return null;
    }
    mostrarMensagem('');

    const r = { meses, inicial, aporte, apenasInicial: [], comAportes: [], apenasInicialReal: [], comAportesReal: [] };

    let montanteInicial = inicial;
    let montanteComAportes = inicial;

    for (let i = 1; i <= meses; i++) {
      montanteInicial *= (1 + taxa);
      montanteComAportes = (montanteComAportes + aporte) * (1 + taxa);

      const inflacaoAcumulada = Math.pow(1 + inflacao, i);

      r.apenasInicial.push(montanteInicial);
      r.comAportes.push(montanteComAportes);
      r.apenasInicialReal.push(montanteInicial / inflacaoAcumulada);
      r.comAportesReal.push(montanteComAportes / inflacaoAcumulada);
    }
    return r;
  }

  function mostrarResumo(r) {
    const investido = r.inicial + r.aporte * r.meses;
    const final = r.comAportes[r.meses - 1];
    const finalReal = r.comAportesReal[r.meses - 1];

    const itens = [
      { titulo: '💼 Total investido', valor: dinheiro(investido), nota: 'Inicial + todos os aportes' },
      { titulo: '📈 Valor final (bruto)', valor: dinheiro(final), nota: 'Sem descontar a inflação' },
      { titulo: '💰 Rendimento (bruto)', valor: dinheiro(final - investido), nota: 'Quanto o dinheiro rendeu' },
      { titulo: '🛒 Valor final (real)', valor: dinheiro(finalReal), nota: 'Em poder de compra de hoje' }
    ];

    const area = $('resumo');
    area.textContent = '';
    itens.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const h = document.createElement('h3');
      h.textContent = item.titulo;
      const p = document.createElement('p');
      p.className = 'preco';
      p.textContent = item.valor;
      const d = document.createElement('p');
      d.className = 'detalhe';
      d.textContent = item.nota;
      card.append(h, p, d);
      area.appendChild(card);
    });
  }

  function mostrarTabela(r) {
    const corpo = $('tabelaResultado');
    corpo.textContent = '';
    for (let i = 0; i < r.meses; i++) {
      const linha = document.createElement('tr');
      const celulas = [
        String(i + 1),
        dinheiro(r.apenasInicial[i]),
        dinheiro(r.comAportes[i]),
        dinheiro(r.apenasInicialReal[i]),
        dinheiro(r.comAportesReal[i])
      ];
      celulas.forEach(texto => {
        const td = document.createElement('td');
        td.textContent = texto;
        linha.appendChild(td);
      });
      corpo.appendChild(linha);
    }
  }

  function cssVar(nome) {
    return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  }

  function desenharGrafico(r) {
    if (typeof Chart === 'undefined') return; // biblioteca do gráfico não carregou

    const corTexto = cssVar('--texto');
    const corGrade = cssVar('--borda');
    const poucosPontos = r.meses <= 36;

    if (grafico) grafico.destroy();

    grafico = new Chart($('graficoSimulador').getContext('2d'), {
      type: 'line',
      data: {
        labels: Array.from({ length: r.meses }, (_, i) => i + 1),
        datasets: [
          { label: 'Apenas inicial (bruto)', data: r.apenasInicial, borderColor: '#e53935', pointRadius: poucosPontos ? 3 : 0 },
          { label: 'Inicial + aportes (bruto)', data: r.comAportes, borderColor: '#2e9e4f', pointRadius: poucosPontos ? 3 : 0 },
          { label: 'Apenas inicial (real)', data: r.apenasInicialReal, borderColor: '#fb8c00', borderDash: [5, 5], pointRadius: poucosPontos ? 3 : 0 },
          { label: 'Inicial + aportes (real)', data: r.comAportesReal, borderColor: '#4a90e2', borderDash: [5, 5], pointRadius: poucosPontos ? 3 : 0 }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { color: corTexto } },
          title: { display: true, text: 'Evolução do investimento (por mês)', color: corTexto },
          tooltip: {
            callbacks: {
              label: ctx => ctx.dataset.label + ': ' + dinheiro(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Mês', color: corTexto }, ticks: { color: corTexto }, grid: { color: corGrade } },
          y: {
            beginAtZero: true,
            ticks: {
              color: corTexto,
              callback: v => 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
            },
            grid: { color: corGrade }
          }
        }
      }
    });
  }

  function simular() {
    const r = calcular();
    if (!r) return;
    ultimoResultado = r;
    mostrarResumo(r);
    desenharGrafico(r);
    mostrarTabela(r);
  }

  /* ---------- Atalhos com dados oficiais do Banco Central ---------- */
  async function usarIndicador(serie, campo, rotulo) {
    const status = $('statusBCB');
    status.textContent = 'Buscando no Banco Central...';
    try {
      const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + serie + '/dados/ultimos/1?formato=json';
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
      const json = await resposta.json();
      const valor = parseFloat(json[0].valor);
      if (isNaN(valor)) throw new Error('valor inválido');

      $(campo).value = valor;
      $('base').value = 'ano'; // essas duas taxas são anuais
      status.textContent = rotulo + ': ' + valor.toLocaleString('pt-BR') + '% ao ano (referência de ' + json[0].data + ')';
      simular();
    } catch (e) {
      status.textContent = 'Não consegui buscar agora. Digite o valor manualmente.';
    }
  }

  $('formSimulador').addEventListener('submit', function (e) {
    e.preventDefault();
    simular();
  });

  $('usarCDI').addEventListener('click', () => usarIndicador(4389, 'taxa', 'CDI'));
  $('usarIPCA').addEventListener('click', () => usarIndicador(13522, 'inflacao', 'IPCA em 12 meses'));

  // Se o usuário trocar o tema, redesenha o gráfico com as cores certas
  document.addEventListener('tema-mudou', () => {
    if (ultimoResultado) desenharGrafico(ultimoResultado);
  });

  // Já mostra uma simulação ao abrir a página
  simular();
})();
