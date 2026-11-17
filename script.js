const ativos = [
  { codigo: 'BTC-USD', nome: 'Bitcoin/USD', tipo: 'cripto', origem: 'awesome' },
  { codigo: 'ETH-USD', nome: 'Ethereum/USD', tipo: 'cripto', origem: 'awesome' },
  { codigo: 'USD-BRL', nome: 'Dólar / Real', tipo: 'fiat', origem: 'awesome' },
  { codigo: 'EUR-BRL', nome: 'Euro / Real', tipo: 'fiat', origem: 'awesome' },
  { codigo: 'BBAS3', nome: 'Banco do Brasil (BBAS3)', tipo: 'acao', origem: 'brapi' },
  { codigo: 'SOJA3', nome: 'Boa Safra (SOJA3)', tipo: 'acao', origem: 'brapi' },
  { codigo: 'CASH3', nome: 'Meliuz (CASH3)', tipo: 'acao', origem: 'brapi' },
  { codigo: 'CMIG4', nome: 'Cemig (CMIG4)', tipo: 'acao', origem: 'brapi' },
  { codigo: 'MXRF11', nome: 'MXRF11', tipo: 'fii', origem: 'brapi' },
  { codigo: 'XPML11', nome: 'XPML11', tipo: 'fii', origem: 'brapi' },
  { codigo: 'RZTR11', nome: 'RZTR11', tipo: 'fii', origem: 'brapi' },
  { codigo: 'HCTR11', nome: 'HCTR11', tipo: 'fii', origem: 'brapi' },
  { codigo: 'BTHF11', nome: 'BTHF11', tipo: 'fii', origem: 'brapi' }
];

const icones = {
  'cripto': '💰',
  'fiat': '💱',
  'acao': '📈',
  'fii': '🏢'
};

// Busca dados de Cripto e Moedas via AwesomeAPI (Gratuita e sem chave)
async function fetchDadosAwesome(par) {
  try {
    // Exemplo: BTC-USD ou USD-BRL
    const res = await fetch(`https://economia.awesomeapi.com.br/json/last/${par}`);
    const json = await res.json();
    const chave = par.replace('-', '');
    const data = json[chave];
    
    if (!data) return { preco: '--', variacao: '0.00' };

    return {
      preco: parseFloat(data.bid).toFixed(2),
      variacao: parseFloat(data.pctChange).toFixed(2)
    };
  } catch (e) {
    console.error(`Erro AwesomeAPI para ${par}`, e);
    return { preco: '--', variacao: '0.00' };
  }
}

// Busca dados de Ações e FIIs via Brapi (Gratuita para o mercado brasileiro)
async function fetchDadosBrapi(ticker) {
  try {
    const res = await fetch(`https://brapi.dev/api/quote/${ticker}`);
    const json = await res.json();
    const data = json.results && json.results[0] ? json.results[0] : {};

    return {
      preco: data.regularMarketPrice ? data.regularMarketPrice.toFixed(2) : '--',
      variacao: data.regularMarketChangePercent ? data.regularMarketChangePercent.toFixed(2) : '0.00'
    };
  } catch (e) {
    console.error(`Erro Brapi para ${ticker}`, e);
    return { preco: '--', variacao: '0.00' };
  }
}

async function exibirAtivos() {
  const container = document.getElementById('ativos-container');
  container.innerHTML = '';

  for (const ativo of ativos) {
    let dados = { preco: '--', variacao: '0.00' };

    if (ativo.origem === 'awesome') {
      dados = await fetchDadosAwesome(ativo.codigo);
    } else if (ativo.origem === 'brapi') {
      dados = await fetchDadosBrapi(ativo.codigo);
    }

    const variacaoNum = parseFloat(dados.variacao) || 0;
    const cor = variacaoNum >= 0 ? 'green' : 'red';
    const simbolo = variacaoNum >= 0 ? '▲' : '▼';
    const codigoExibicao = ativo.codigo.replace('-USD', '').replace('-BRL', '');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${icones[ativo.tipo] || ''} ${ativo.nome}</h3>
      <p><strong>Código:</strong> ${codigoExibicao}</p>
      <p><strong>Preço:</strong> R$ ${dados.preco}</p>
      <p><strong>Variação:</strong> <span style="color:${cor}">${simbolo} ${dados.variacao}%</span></p>
    `;
    container.appendChild(card);
  }
}

// Executa ao carregar a página
exibirAtivos();
// Atualiza a cada 2 minutos
setInterval(exibirAtivos, 120000);
