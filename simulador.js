document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formSimulador');
  const tabela = document.getElementById('tabelaResultado');
  const graficoCanvas = document.getElementById('graficoSimulador');
  let grafico;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Captura e normaliza os dados
    const inicial = parseFloat(document.getElementById('inicial').value) || 0;
    const aporte = parseFloat(document.getElementById('aporte').value) || 0;
    const taxa = (parseFloat(document.getElementById('taxa').value) || 0) / 100;
    const periodo = parseInt(document.getElementById('periodo').value) || 0;
    const inflacao = (parseFloat(document.getElementById('inflacao').value) || 0) / 100;

    let saldoCom = inicial;
    let saldoSem = inicial;
    let saldoInflacao = inicial;

    const dadosCom = [], dadosSem = [], dadosInflacao = [];

    tabela.innerHTML = '';

    // Formato de moeda brasileira
    const formatar = valor => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);

    // Simulação mês a mês
    for (let i = 1; i <= periodo; i++) {
      saldoCom = (saldoCom + aporte) * (1 + taxa);
      saldoSem *= (1 + taxa);
      saldoInflacao *= (1 + inflacao);

      dadosCom.push(saldoCom);
      dadosSem.push(saldoSem);
      dadosInflacao.push(saldoInflacao);

      tabela.innerHTML += `
        <tr>
          <td>${i}</td>
          <td>${formatar(saldoCom)}</td>
          <td>${formatar(saldoSem)}</td>
          <td>${formatar(saldoInflacao)}</td>
        </tr>`;
    }

    gerarGrafico(dadosCom, dadosSem, dadosInflacao);
  });

  function gerarGrafico(dadosCom, dadosSem, dadosInflacao) {
    const ctx = graficoCanvas.getContext('2d');
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
            backgroundColor: 'transparent',
            tension: 0.3
          },
          {
            label: 'Sem Aportes',
            data: dadosSem,
            borderColor: 'blue',
            backgroundColor: 'transparent',
            tension: 0.3
          },
          {
            label: 'Inflação',
            data: dadosInflacao,
            borderColor: 'orange',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.3
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
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return `R$ ${value.toFixed(0)}`;
              }
            }
          }
        }
      }
    });
  }
});
