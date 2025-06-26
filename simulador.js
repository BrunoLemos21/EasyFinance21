document.getElementById('formSimulador').addEventListener('submit', function (e) {
  e.preventDefault();

  const inicial = parseFloat(document.getElementById('inicial').value) || 0;
  const aporte = parseFloat(document.getElementById('aporte').value) || 0;
  const taxa = parseFloat(document.getElementById('taxa').value) / 100;
  const periodo = parseInt(document.getElementById('periodo').value);
  const inflacao = parseFloat(document.getElementById('inflacao').value) / 100;

  let saldoCom = inicial;
  let saldoSem = inicial;
  let dadosCom = [], dadosSem = [], dadosInflacao = [];

  const tabela = document.getElementById('tabelaResultado');
  tabela.innerHTML = '';

  for (let i = 1; i <= periodo; i++) {
    saldoCom = (saldoCom + aporte) * (1 + taxa);
    saldoSem = saldoSem * (1 + taxa);

    // Corrige os valores pela inflação acumulada
    const saldoComCorrigido = saldoCom / Math.pow(1 + inflacao, i);
    const saldoSemCorrigido = saldoSem / Math.pow(1 + inflacao, i);
    const referenciaInflacao = inicial / Math.pow(1 + inflacao, i); // valor inicial depreciado pela inflação

    dadosCom.push(saldoComCorrigido.toFixed(2));
    dadosSem.push(saldoSemCorrigido.toFixed(2));
    dadosInflacao.push(referenciaInflacao.toFixed(2));

    const linha = `
      <tr>
        <td>${i}</td>
        <td>R$ ${saldoComCorrigido.toFixed(2)}</td>
        <td>R$ ${saldoSemCorrigido.toFixed(2)}</td>
        <td>R$ ${referenciaInflacao.toFixed(2)}</td>
      </tr>`;
    tabela.innerHTML += linha;
  }

  gerarGrafico(dadosCom, dadosSem, dadosInflacao);
});

let grafico;
function gerarGrafico(dadosCom, dadosSem, dadosInflacao) {
  const ctx = document.getElementById('graficoSimulador').getContext('2d');
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dadosCom.map((_, i) => `Mês ${i + 1}`),
      datasets: [
        {
          label: 'Com Aportes (ajustado)',
          data: dadosCom,
          borderColor: '#0b515a',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Sem Aportes (ajustado)',
          data: dadosSem,
          borderColor: '#aaa',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Inflação (poder de compra)',
          data: dadosInflacao,
          borderColor: 'orange',
          borderDash: [5, 5],
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
