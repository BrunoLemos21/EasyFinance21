/* ==========================================================
   dados.js - busca de dados (usado por várias páginas)
   Precisa ser carregado DEPOIS do config.js.
   ========================================================== */

// Minutos que cada dado fica guardado no navegador antes de buscar de novo
const CACHE_MIN = { cambio: 5, acoes: 30, indicadores: 360, noticias: 30 };

// Moedas e cripto (AwesomeAPI), preço em reais
const CAMBIO = [
  { chave: 'USDBRL', titulo: 'Dólar',    codigo: 'USD/BRL', tipo: 'moeda',  icone: '💵', casas: 4 },
  { chave: 'EURBRL', titulo: 'Euro',     codigo: 'EUR/BRL', tipo: 'moeda',  icone: '💶', casas: 4 },
  { chave: 'BTCBRL', titulo: 'Bitcoin',  codigo: 'BTC/BRL', tipo: 'cripto', icone: '🪙', casas: 2 },
  { chave: 'ETHBRL', titulo: 'Ethereum', codigo: 'ETH/BRL', tipo: 'cripto', icone: '💎', casas: 2 }
];

// Séries oficiais do Banco Central (SGS)
const INDICADORES = [
  { serie: 432,   titulo: 'Selic (meta)',    detalhe: 'Taxa básica de juros, ao ano' },
  { serie: 4389,  titulo: 'CDI',             detalhe: 'Referência da renda fixa, ao ano' },
  { serie: 13522, titulo: 'IPCA (12 meses)', detalhe: 'Inflação acumulada em 12 meses' }
];

function formatar(numero, casas) {
  return Number(numero).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}

function listaTickers() {
  return BRAPI_TOKEN ? ACOES_COM_TOKEN : ACOES_SEM_TOKEN;
}

function lerCache(chave) {
  try {
    const bruto = JSON.parse(localStorage.getItem(chave));
    return bruto && bruto.t ? bruto : null;
  } catch (e) {
    return null;
  }
}

function gravarCache(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify({ t: Date.now(), d: dados }));
  } catch (e) { /* tudo bem se não der para guardar */ }
}

// Busca um endereço esperando no máximo 10 segundos
async function buscarJSON(url, opcoes) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 10000);
  try {
    const resposta = await fetch(url, Object.assign({ signal: controle.signal }, opcoes || {}));
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
    return await resposta.json();
  } finally {
    clearTimeout(timer);
  }
}

// Usa o dado guardado se ainda estiver "fresco". Se a API falhar, devolve o
// último dado guardado (antigo: true) em vez de ficar sem nada.
async function comCache(chave, validadeMin, buscar) {
  const guardado = lerCache(chave);
  if (guardado && Date.now() - guardado.t < validadeMin * 60000) {
    return { dados: guardado.d, antigo: false, quando: guardado.t };
  }
  try {
    const novo = await buscar();
    gravarCache(chave, novo);
    return { dados: novo, antigo: false, quando: Date.now() };
  } catch (erro) {
    if (guardado) return { dados: guardado.d, antigo: true, quando: guardado.t };
    throw erro;
  }
}

function buscarCambio() {
  return comCache('ef_cambio', CACHE_MIN.cambio, () =>
    buscarJSON('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL')
  );
}

function buscarAcao(ticker) {
  return comCache('ef_acao_' + ticker, CACHE_MIN.acoes, async () => {
    const opcoes = BRAPI_TOKEN ? { headers: { Authorization: 'Bearer ' + BRAPI_TOKEN } } : {};
    const json = await buscarJSON('https://brapi.dev/api/quote/' + ticker, opcoes);
    const r = json.results && json.results[0];
    if (!r || typeof r.regularMarketPrice !== 'number') throw new Error('sem dados');
    return { preco: r.regularMarketPrice, variacao: r.regularMarketChangePercent };
  });
}

function buscarIndicador(serie) {
  return comCache('ef_bcb_' + serie, CACHE_MIN.indicadores, async () => {
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + serie + '/dados/ultimos/1?formato=json';
    const json = await buscarJSON(url);
    return { valor: parseFloat(json[0].valor), data: json[0].data };
  });
}
