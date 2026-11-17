/* ==========================================================
   Easy Finance - comparador: Poupança x CDB x Tesouro Selic
   ========================================================== */
(function () {
  const $ = id => document.getElementById(id);
  const dinheiro = v => 'R$ ' + formatar(v, 2);

  let grafico = null;
  let ultimo = null;

  // 12% ao ano  ->  taxa mensal equivalente
  function mensal(percentualAnual) {
    return Math.pow(1 + percentualAnual / 100, 1 / 12) - 1;
  }

  // Imposto de Renda regressivo da renda fixa (pelo tempo que o dinheiro ficou aplicado)
  function aliquotaIR(dias) {
    if (dias <= 180) return 0.225;
    if (dias <= 360) return 0.20;
    if (dias <= 720) return 0.175;
    return 0.15;
  }

  // Simula um produto. O aporte entra no início de cada mês (como no simulador).
  // Cada depósito é um "lote" com o seu próprio tempo, e o IR incide sobre o ganho de cada lote.
  function simularProduto(taxaMensal, comIR, meses, inicial, aporte) {
    const potencia = [1];
    for (let k = 1; k <= meses; k++) potencia.push(potencia[k - 1] * (1 + taxaMensal));

    const liquido = [];
    let irFinal = 0;
    let brutoFinal = 0;

    for (let t = 1; t <= meses; t++) {
      let bruto = 0;
      let ir = 0;
      for (let j = 1; j <= t; j++) {
        const valor = j === 1 ? inicial + aporte : aporte;
        if (valor <= 0) continue;
        const meses_aplicado = t - j + 1;
        const montante = valor * potencia[meses_aplicado];
        bruto += montante;
        if (comIR) ir += Math.max(0, montante - valor) * aliquotaIR(meses_aplicado * 30);
      }
      liquido.push(bruto - ir);
      if (t === meses) { irFinal = ir; brutoFinal = bruto; }
    }
    return { liquido, ir: irFinal, bruto: brutoFinal };
  }

  function lerFormulario() {
    let meses = parseInt($('periodo').value, 10) || 0;
    if ($('prazoTipo').value === 'anos') meses *= 12;
    return {
      inicial: Math.max(0, parseFloat($('inicial').value) || 0),
      aporte: Math.max(0, parseFloat($('aporte').value) || 0),
      meses,
      selic: parseFloat($('selic').value) || 0,
      cdi: parseFloat($('cdi').value) || 0,
      cdbPct: Math.max(0, parseFloat($('cdbPct').value) || 0),
      inflacao: parseFloat($('inflacao').value) || 0
    };
  }

  function calcular() {
    const f = lerFormulario();
    if (f.meses < 1) { $('mensagem').textContent = 'Informe um prazo de pelo menos 1 mês.'; return null; }
    if (f.meses > 360) { $('mensagem').textContent = 'O prazo máximo aqui é de 360 meses (30 anos).'; return null; }
    $('mensagem').textContent = '';

    // Poupança: com Selic acima de 8,5% ao ano rende 0,5% ao mês. Abaixo disso, 70% da Selic.
    const taxaPoupanca = f.selic > 8.5 ? 0.005 : mensal(f.selic * 0.7);
    const taxaCDB = mensal(f.cdi * f.cdbPct / 100);
    const taxaTesouro = mensal(f.selic);

    const produtos = [
      { nome: 'Poupança', icone: '🐷', cor: '#fb8c00', ...simularProduto(taxaPoupanca, false, f.meses, f.inicial, f.aporte) },
      { nome: 'CDB', icone: '🏦', cor: '#4a90e2', ...simularProduto(taxaCDB, true, f.meses, f.inicial, f.aporte) },
      { nome: 'Tesouro Selic', icone: '🇧🇷', cor: '#2e9e4f', ...simularProduto(taxaTesouro, true, f.meses, f.inicial, f.aporte) }
    ];
    return { f, produtos };
  }

  function mostrarResumo(r) {
    const { f, produtos } = r;
    const investido = f.inicial + f.aporte * f.meses;
    const deflator = Math.pow(1 + mensal(f.inflacao), f.meses);
    const melhor = produtos.reduce((a, b) => (b.liquido[f.meses - 1] > a.liquido[f.meses - 1] ? b : a));

    const area = $('resumo');
    area.textContent = '';

    produtos.forEach(p => {
      const final = p.liquido[f.meses - 1];
      const card = document.createElement('div');
      card.className = 'card' + (p === melhor ? ' destaque' : '');

      const h = document.createElement('h3');
      h.textContent = p.icone + ' ' + p.nome + (p === melhor ? ' • maior valor líquido' : '');
      const v = document.createElement('p');
      v.className = 'preco';
      v.textContent = dinheiro(final);

      const linhas = [
        'Rendimento líquido: ' + dinheiro(final - investido),
        'Imposto de Renda: ' + dinheiro(p.ir),
        'Poder de compra de hoje: ' + dinheiro(final / deflator)
      ];
      card.append(h, v);
      linhas.forEach(t => {
        const d = document.createElement('p');
        d.className = 'detalhe';
        d.textContent = t;
        card.appendChild(d);
      });
      area.appendChild(card);
    });

    const aviso = document.createElement('p');
    aviso.className = 'nota';
    aviso.style.gridColumn = '1 / -1';
    aviso.textContent = 'Total investido no período: ' + dinheiro(investido) + '. Valores líquidos, já descontado o Imposto de Renda.';
    area.appendChild(aviso);
  }

  function mostrarTabela(r) {
    const corpo = $('tabelaResultado');
    corpo.textContent = '';
    for (let i = 0; i < r.f.meses; i++) {
      const tr = document.createElement('tr');
      [String(i + 1), ...r.produtos.map(p => dinheiro(p.liquido[i]))].forEach(txt => {
        const td = document.createElement('td');
        td.textContent = txt;
        tr.appendChild(td);
      });
      corpo.appendChild(tr);
    }
  }

  function cssVar(nome) {
    return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  }

  function desenharGrafico(r) {
    if (typeof Chart === 'undefined') return;
    const corTexto = cssVar('--texto');
    const corGrade = cssVar('--borda');
    const poucos = r.f.meses <= 36;

    if (grafico) grafico.destroy();
    grafico = new Chart($('graficoComparar').getContext('2d'), {
      type: 'line',
      data: {
        labels: Array.from({ length: r.f.meses }, (_, i) => i + 1),
        datasets: r.produtos.map(p => ({
          label: p.nome + ' (líquido)',
          data: p.liquido,
          borderColor: p.cor,
          pointRadius: poucos ? 3 : 0
        }))
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { color: corTexto } },
          title: { display: true, text: 'Valor líquido ao longo do tempo', color: corTexto },
          tooltip: { callbacks: { label: c => c.dataset.label + ': ' + dinheiro(c.parsed.y) } }
        },
        scales: {
          x: { title: { display: true, text: 'Mês', color: corTexto }, ticks: { color: corTexto }, grid: { color: corGrade } },
          y: {
            ticks: { color: corTexto, callback: v => 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) },
            grid: { color: corGrade }
          }
        }
      }
    });
  }

  function comparar() {
    const r = calcular();
    if (!r) return;
    ultimo = r;
    mostrarResumo(r);
    desenharGrafico(r);
    mostrarTabela(r);
  }

  async function buscarTaxas() {
    const status = $('statusTaxas');
    status.textContent = 'Buscando no Banco Central...';
    try {
      const [selic, cdi, ipca] = await Promise.all([
        buscarIndicador(432), buscarIndicador(4389), buscarIndicador(13522)
      ]);
      $('selic').value = selic.dados.valor;
      $('cdi').value = cdi.dados.valor;
      $('inflacao').value = ipca.dados.valor;
      status.textContent = 'Taxas atualizadas (Selic ' + formatar(selic.dados.valor, 2) + '%, CDI ' +
        formatar(cdi.dados.valor, 2) + '%, IPCA 12m ' + formatar(ipca.dados.valor, 2) + '%).';
    } catch (e) {
      status.textContent = 'Não consegui buscar agora. Usando os valores de exemplo; ajuste à mão se quiser.';
    }
    comparar();
  }

  $('formComparar').addEventListener('submit', e => { e.preventDefault(); comparar(); });
  $('buscarTaxas').addEventListener('click', buscarTaxas);
  document.addEventListener('tema-mudou', () => { if (ultimo) desenharGrafico(ultimo); });

  buscarTaxas(); // já abre com as taxas do dia
})();
