document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formSimulador');
  const tabela = document.getElementById('tabelaResultado');
  const graficoCanvas = document.getElementById('graficoSimulador');
  let grafico;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const inicial = parseFloat(document.getElementById('inicial').value) || 0;
    const aporte = parseFloat(document.getElementById('aporte').value) || 0;
    const taxa = (parseFloat(document.getElementById('taxa').value) || 0) / 100;
    const periodo = parseInt(document.getElementById('periodo').value) || 0;
    const inflacao = (parseFloat(document.getElementById('inflacao').value) || 0) / 100;

    let saldoCom = inicial;
    let saldoSem = inicial;

    const dadosCom = [], dadosSem = [], dadosReais = [];

    tabela.innerHTML = '';

    const formatar = valor => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);

    for (let i = 1; i <= periodo; i++) {
      saldoCom = (saldoCom + aporte) * (1 + taxa);
      saldoSem *= (1 + taxa);

      // Corrige o saldo com inflação acumulada
      const fatorInflacao = Math.pow(1 + inflacao, i);
      const saldoCorrigido = saldoCom / fatorInflacao;

      dadosCom.push(saldoCom);
      dadosSem.push(saldoSem);
      dadosReais.push(saldoCorrigido);

      tabela.innerHTML += `
        <tr>
          <td>${i}</td>
          <td>${formatar(saldoCom)}</td>
          <td>${formatar(saldoSem)}</td>
          <td>${formatar(saldoCorrigido)}</td>
        </tr>`;
    }

    gerarGrafico(dadosCom, dadosSem, dadosReais);
  });

  function gerarGrafico(dadosCom, dadosSem, dadosReais) {
    const ctx = graficoCanvas.getContext('2d');
    if (grafico) grafico.destroy();

    grafico = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dadosCom.map((_, i) => `Mês ${i + 1}`),
        datasets: [
          {
            label: 'Com Aportes (nominal)',
            data: dadosCom,
            borderColor: 'green',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Sem Aportes (nominal)',
            data: dadosSem,
            borderColor: 'blue',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Com Aportes (valor real)',
            data: dadosReais,
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
            beginAtZero: true,
            ticks: {
              callback: value => `R$ ${value.toFixed(0)}`
            }
          }
        }
      }
    });
  }
});
