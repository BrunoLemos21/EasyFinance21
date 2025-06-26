const ativos = [
  { codigo: 'BTC', nome: 'Bitcoin/USD', tipo: 'cripto', cgId: 'bitcoin', vs: 'usd' },
  { codigo: 'ETH', nome: 'Ethereum/USD', tipo: 'cripto', cgId: 'ethereum', vs: 'usd' },
  { codigo: 'BRL', nome: 'BRL/USD', tipo: 'fiat', cgId: null, vs: 'usd' },
  { codigo: 'EUR', nome: 'EUR/USD', tipo: 'fiat', cgId: null, vs: 'usd' },
  { codigo: 'BBAS3.SA', nome: 'Banco do Brasil PN', tipo: 'acao' },
  { codigo: 'SOJA3.SA', nome: 'Boa Safra SOJA3', tipo: 'acao' },
  { codigo: 'CASH3.SA', nome: 'Cosan', tipo: 'acao' },
  { codigo: 'CMIG4.SA', nome: 'Cemig', tipo: 'acao' },
  { codigo: 'MXRF11.SA', nome: 'MXRF11', tipo: 'fii' },
  { codigo: 'XPML11.SA', nome: 'XPML11', tipo: 'fii' },
  { codigo: 'RZTR11.SA', nome: 'RZTR11', tipo: 'fii' },
  { codigo: 'HCTR11.SA', nome: 'HCTR11', tipo: 'fii' },
  { codigo: 'BTHF11.SA', nome: 'BTHF11', tipo: 'fii' }
];

async function fetchAtivo(ativo) {
  if (ativo.tipo === 'cripto' || ativo.tipo === 'fiat') {
    const id = ativo.tipo === 'fiat'
      ? ativo.nome.split('/')[0].toLowerCase()
      : ativo.cgId;
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${ativo.vs}&include_24hr_change=true`);
    const json = await res.json();
    const price = json[id][ativo.vs].toFixed(2);
    const change = json[id][`${ativo.vs}_24h_change`].toFixed(2);
    return { price, change };
  } else {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ativo.codigo}`;
    const res = await fetch(url);
    const json = await res.json();
    const quote = json.quoteResponse.result[0];
    const price = parseFloat(quote.regularMarketPrice).toFixed(2);
    const change = parseFloat(quote.regularMarketChangePercent).toFixed(2);
    return { price, change };
  }
}

async function exibirAtivos() {
  const container = document.getElementById('ativos-container');
  container.innerHTML = '';
  for (const ativo of ativos) {
    const { price, change } = await fetchAtivo(ativo);
    const cor = change >= 0 ? 'green' : 'red';
    const simbolo = change >= 0 ? '▲' : '▼';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${ativo.tipo==='cripto'? '💰' : ativo.tipo==='acao'? '📈' : '🏢'} ${ativo.nome}</h3>
      <p><strong>Código:</strong> ${ativo.codigo}</p>
      <p><strong>Preço:</strong> ${(ativo.tipo==='fiat'? '$' : 'R$')} ${price}</p>
      <p><strong>Variação:</strong> <span style="color:${cor}">${simbolo} ${change}%</span></p>
    `;
    container.appendChild(card);
  }
}

document.addEventListener('DOMContentLoaded', exibirAtivos);
