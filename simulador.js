document.getElementById('formSimulador').addEventListener('submit', function (e) {
  e.preventDefault();

  const inicial = parseFloat(document.getElementById('inicial').value) || 0;
  const aporte = parseFloat(document.getElementById('aporte').value) || 0;
  const taxa = parseFloat(document.getElementById('taxa').value) / 100 || 0;
  const periodo = parseInt(document.getElementById('periodo').value) || 0;
  const inflacao = parseFloat(document.getElementById('inflacao').value) / 100 || 0;

  let apenasInicial = [];
  let comAportes = [];
  let apenasInicialReal = [];
  let comAportesReal = [];

  let montanteInicial = inicial;
  let montanteComAportes = inicial;

  for (let i = 1; i <= periodo; i++) {
    // Apenas inicial (sem aportes)
    montanteInicial *= (1 + taxa);
    apenasInicial.push(montanteInicial);

    // Com aportes mensais
    montanteComAportes = (montanteComAportes + aporte) * (1 + taxa);
    comAportes.push(montanteComAportes);

    // Inflação acumulada até o mês atual
    const inflacaoAcumulada = Math.pow(1 + inflacao, i);

    // Ajuste para valor real
    apenasInicialReal.push(montanteInicial / inflacaoAcumulada);
    comAportesReal.push(montanteComAportes / inflacaoAcumulada);
  }

  // Tabela
  const tabela = document.getElementById('tabelaResultado');
  tabela.innerHTML = "";

  for (let i = 0; i < periodo; i++) {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${i + 1}</td>
      <td>R$ ${apenasInicial[i].toFixed(2)}</td>
      <td>R$ ${comAportes[i].toFixed(2)}</td>
      <td>R$ ${apenasInicialReal[i].toFixed(2)}</td>
      <td>R$ ${comAportesReal[i].toFixed(2)}</td>
    `;
    tabela.appendChild(linha);
  }

  // Gráfico
  const ctx = document.getElementById('graficoSimulador').getContext('2d');
  if (window.grafico) window.grafico.destroy();

  window.grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: periodo }, (_, i) => i + 1),
      datasets: [
        {
          label: 'Apenas Inicial (Bruto)',
          data: apenasInicial,
          borderColor: 'red',
          fill: false,
        },
        {
          label: 'Inicial + Aportes (Bruto)',
          data: comAportes,
          borderColor: 'green',
          fill: false,
        },
        {
          label: 'Apenas Inicial (Real)',
          data: apenasInicialReal,
          borderColor: 'orange',
          borderDash: [5, 5],
          fill: false,
        },
        {
          label: 'Inicial + Aportes (Real)',
          data: comAportesReal,
          borderColor: 'blue',
          borderDash: [5, 5],
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Simulação de Investimento' }
      },
    },
  });
});
