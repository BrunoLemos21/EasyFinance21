const ativos = [
  { codigo: 'bitcoin', nome: 'Bitcoin/USD', tipo: 'cripto', origem: 'coingecko', vs: 'usd' },
  { codigo: 'ethereum', nome: 'Ethereum/USD', tipo: 'cripto', origem: 'coingecko', vs: 'usd' },
  { codigo: 'BRL', nome: 'BRL/USD', tipo: 'fiat', origem: 'fiat' },
  { codigo: 'EUR', nome: 'EUR/USD', tipo: 'fiat', origem: 'fiat' },
  { codigo: 'BBAS3.SA', nome: 'Banco do Brasil (BBAS3)', tipo: 'acao', origem: 'fmp' },
  { codigo: 'SOJA3.SA', nome: 'Boa Safra (SOJA3)', tipo: 'acao', origem: 'fmp' },
  { codigo: 'CASH3.SA', nome: 'Meliuz (CASH3)', tipo: 'acao', origem: 'fmp' },
  { codigo: 'CMIG4.SA', nome: 'Cemig (CMIG4)', tipo: 'acao', origem: 'fmp' },
  { codigo: 'MXRF11.SA', nome: 'MXRF11', tipo: 'fii', origem: 'fmp' },
  { codigo: 'XPML11.SA', nome: 'XPML11', tipo: 'fii', origem: 'fmp' },
  { codigo: 'RZTR11.SA', nome: 'RZTR11', tipo: 'fii', origem: 'fmp' },
  { codigo: 'HCTR11.SA', nome: 'HCTR11', tipo: 'fii', origem: 'fmp' },
  { codigo: 'BTHF11.SA', nome: 'BTHF11', tipo: 'fii', origem: 'fmp' }
];

const icones = {
  'cripto': '💰',
  'fiat': '💱',
  'acao': '📈',
  'fii': '🏢'
};

const API_KEY_FMP = '2jQp09ts8rYRQfpJRSMbl2rYWe3cmrNj';

async function fetchDadosFMP(codigo) {
  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${codigo}?apikey=${API_KEY_FMP}`;
    const res = await fetch(url);
    const json = await res.json();
    const data = json[0] || {};
    return {
      preco: data.price ? data.price.toFixed(2) : '--',
      variacao: data.changesPercentage ? data.changesPercentage.toFixed(2) : '0.00'
    };
  } catch (e) {
    console.error(`Erro fetch FMP para ${codigo}`, e);
    return { preco: '--', variacao: '0.00' };
  }
}

async function fetchDadosCoinGecko(id, vs) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}&include_24hr_change=true`;
    const res = await fetch(url);
    const json = await res.json();
    return {
      preco: json[id][vs].toFixed(2),
      variacao: json[id][`${vs}_24h_change`].toFixed(2)
    };
  } catch (e) {
    console.error(`Erro fetch CoinGecko para ${id}`, e);
    return { preco: '--', variacao: '0.00' };
  }
}

async function fetchDadosFiat(code) {
  try {
    const res = await fetch(`https://api.exchangerate.host/convert?from=USD&to=${code}`);
    const json = await res.json();
    return {
      preco: json.result?.toFixed(4) || '--',
      variacao: 0.00
    };
  } catch (e) {
    console.error(`Erro fetch Fiat para ${code}`, e);
    return { preco: '--', variacao: '0.00' };
  }
}

async function exibirAtivos() {
  const container = document.getElementById('ativos-container');
  container.innerHTML = '';

  for (const ativo of ativos) {
    let dados = { preco: '--', variacao: '0.00' };

    if (ativo.origem === 'coingecko') {
      dados = await fetchDadosCoinGecko(ativo.codigo, ativo.vs);
    } else if (ativo.origem === 'fiat') {
      dados = await fetchDadosFiat(ativo.codigo);
    } else if (ativo.origem === 'fmp') {
      dados = await fetchDadosFMP(ativo.codigo);
    }

    const cor = parseFloat(dados.variacao) >= 0 ? 'green' : 'red';
    const simbolo = parseFloat(dados.variacao) >= 0 ? '▲' : '▼';

    // Remove ".SA" do código para exibir limpo
    const codigoExibicao = ativo.codigo.replace('.SA', '');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${icones[ativo.tipo] || ''} ${ativo.nome}</h3>
      <p><strong>Código:</strong> ${codigoExibicao}</p>
      <p><strong>Preço:</strong> ${ativo.tipo === 'fiat' ? '$' : 'R$'} ${dados.preco}</p>
      <p><strong>Variação:</strong> <span style="color:${cor}">${simbolo} ${dados.variacao}%</span></p>
    `;
    container.appendChild(card);
  }
}

exibirAtivos();
setInterval(exibirAtivos, 120000);
