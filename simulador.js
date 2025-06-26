document.getElementById('formSimulador').addEventListener('submit', function (e) {
  e.preventDefault();

  const inicial = parseFloat(document.getElementById('inicial').value) || 0;
  const aporte = parseFloat(document.getElementById('aporte').value) || 0;
  const taxa = parseFloat(document.getElementById('taxa').value) / 100;
  const periodo = parseInt(document.getElementById('periodo').value);
  const inflacao = parseFloat(document.getElementById('inflacao').value) / 100;

  let saldoCom = inicial;
  let saldoSem = inicial;
  let saldoInflacao = inicial;
  let dadosCom = [], dadosSem = [], dadosInflacao = [];

  const tabela = document.getElementById('tabelaResultado');
  tabela.innerHTML = '';

  for (let i = 1; i <= periodo; i++) {
    saldoCom = (saldoCom + aporte) * (1 + taxa);
    saldoSem = saldoSem * (1 + taxa);
    saldoInflacao = saldoInflacao * (1 + inflacao);

    dadosCom.push(saldoCom.toFixed(2));
    dadosSem.push(saldoSem.toFixed(2));
    dadosInflacao.push(saldoInflacao.toFixed(2));

    const linha = `
      <tr>
        <td>${i}</td>
        <td>R$ ${saldoCom.toFixed(2)}</td>
        <td>R$ ${saldoSem.toFixed(2)}</td>
        <td>R$ ${saldoInflacao.toFixed(2)}</td>
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
          label: 'Com Aportes',
          data: dadosCom,
          borderColor: 'green',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Sem Aportes',
          data: dadosSem,
          borderColor: 'blue',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Inflação',
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
      }
    }
  });
}
