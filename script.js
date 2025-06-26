const ativos = [
  { codigo: 'bitcoin', nome: 'Bitcoin/USD', tipo: 'cripto', origem: 'coingecko', vs: 'usd' },
  { codigo: 'ethereum', nome: 'Ethereum/USD', tipo: 'cripto', origem: 'coingecko', vs: 'usd' },
  { codigo: 'BRL', nome: 'BRL/USD', tipo: 'fiat', origem: 'fiat' },
  { codigo: 'EUR', nome: 'EUR/USD', tipo: 'fiat', origem: 'fiat' },
  { codigo: 'BBAS3.SA', nome: 'Banco do Brasil (BBAS3)', tipo: 'acao', origem: 'yahoo' },
  { codigo: 'SOJA3.SA', nome: 'Boa Safra (SOJA3)', tipo: 'acao', origem: 'yahoo' },
  { codigo: 'CASH3.SA', nome: 'Meliuz (CASH3)', tipo: 'acao', origem: 'yahoo' },
  { codigo: 'CMIG4.SA', nome: 'Cemig (CMIG4)', tipo: 'acao', origem: 'yahoo' },
  { codigo: 'MXRF11.SA', nome: 'MXRF11', tipo: 'fii', origem: 'yahoo' },
  { codigo: 'XPML11.SA', nome: 'XPML11', tipo: 'fii', origem: 'yahoo' },
  { codigo: 'RZTR11.SA', nome: 'RZTR11', tipo: 'fii', origem: 'yahoo' },
  { codigo: 'HCTR11.SA', nome: 'HCTR11', tipo: 'fii', origem: 'yahoo' },
  { codigo: 'BTHF11.SA', nome: 'BTHF11', tipo: 'fii', origem: 'yahoo' }
];

const icones = {
  'cripto': '💰',
  'fiat': '💱',
  'acao': '📈',
  'fii': '🏢'
};

async function fetchDadosYahoo(codigo) {
  const url = `https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v7/finance/quote?symbols=${codigo}`;
  const res = await fetch(url);
  const json = await res.json();
  const quote = json.quoteResponse.result[0];
  return {
    preco: quote.regularMarketPrice.toFixed(2),
    variacao: quote.regularMarketChangePercent.toFixed(2)
  };
}

async function fetchDadosCoinGecko(id, vs) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}&include_24hr_change=true`;
  const res = await fetch(url);
  const json = await res.json();
  return {
    preco: json[id][vs].toFixed(2),
    variacao: json[id][`${vs}_24h_change`].toFixed(2)
  };
}

async function fetchDadosFiat(code) {
  const url = `https://api.exchangerate.host/latest?base=USD&symbols=${code}`;
  const res = await fetch(url);
  const json = await res.json();
  const rate = json.rates[code];
  return {
    preco: rate.toFixed(4),
    variacao: 0.00
  };
}

async function exibirAtivos() {
  const container = document.getElementById('ativos-container');
  container.innerHTML = '';

  for (const ativo of ativos) {
    let dados = { preco: '--', variacao: '0.00' };

    try {
      if (ativo.origem === 'coingecko') {
        dados = await fetchDadosCoinGecko(ativo.codigo, ativo.vs);
      } else if (ativo.origem === 'fiat') {
        dados = await fetchDadosFiat(ativo.codigo);
      } else {
        dados = await fetchDadosYahoo(ativo.codigo);
      }
    } catch (e) {
      console.error(`Erro ao buscar dados de ${ativo.nome}:`, e);
    }

    const cor = dados.variacao >= 0 ? 'green' : 'red';
    const simbolo = dados.variacao >= 0 ? '▲' : '▼';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${icones[ativo.tipo] || ''} ${ativo.nome}</h3>
      <p><strong>Código:</strong> ${ativo.codigo}</p>
      <p><strong>Preço:</strong> ${ativo.tipo === 'fiat' ? '$' : 'R$'} ${dados.preco}</p>
      <p><strong>Variação:</strong> <span style="color:${cor}">${simbolo} ${dados.variacao}%</span></p>
      <canvas id="grafico-${ativo.codigo}" height="100"></canvas>
    `;
    container.appendChild(card);

    gerarGraficoSimples(`grafico-${ativo.codigo}`, dados.variacao);
  }
}

function gerarGraficoSimples(id, variacao) {
  const ctx = document.getElementById(id).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ["Ontem", "Hoje"],
      datasets: [{
        label: "% de Variação",
        data: [0, Number(variacao)],
        borderColor: variacao >= 0 ? 'green' : 'red',
        tension: 0.4
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

exibirAtivos();
setInterval(exibirAtivos, 120000);
