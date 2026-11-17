/* ==========================================================
   Easy Finance - página inicial
   Mostra: indicadores do Banco Central, moedas, cripto, ações e notícias.
   Tudo usa serviços gratuitos que NÃO exigem chave secreta.
   ========================================================== */

/* ---------- CONFIGURAÇÕES (você pode mexer aqui) ---------- */

// OPCIONAL. Sem token, a brapi.dev libera só estes 4 papéis de teste.
// Com um token gratuito (crie conta em brapi.dev), o site passa a mostrar
// a lista maior logo abaixo. Atenção: o token fica visível para quem abrir
// o código do site, então use apenas um token gratuito.
const BRAPI_TOKEN = '';

const ACOES_SEM_TOKEN = ['PETR4', 'VALE3', 'ITUB4', 'MGLU3'];
const ACOES_COM_TOKEN = ['BBAS3', 'CMIG4', 'CASH3', 'SOJA3', 'MXRF11', 'XPML11', 'RZTR11', 'HCTR11', 'BTHF11'];

// Quanto tempo (em minutos) guardamos cada dado no navegador antes de buscar de novo.
// Isso economiza o limite gratuito das APIs.
const CACHE_MIN = { cambio: 5, acoes: 30, indicadores: 360, noticias: 30 };

/* ---------- LISTAS DE ITENS ---------- */

// Moedas e cripto vêm numa única chamada da AwesomeAPI (preço em reais).
const CAMBIO = [
  { chave: 'USDBRL', titulo: 'Dólar',     codigo: 'USD/BRL', tipo: 'moeda', icone: '💵', casas: 4 },
  { chave: 'EURBRL', titulo: 'Euro',      codigo: 'EUR/BRL', tipo: 'moeda', icone: '💶', casas: 4 },
  { chave: 'BTCBRL', titulo: 'Bitcoin',   codigo: 'BTC/BRL', tipo: 'cripto', icone: '🪙', casas: 2 },
  { chave: 'ETHBRL', titulo: 'Ethereum',  codigo: 'ETH/BRL', tipo: 'cripto', icone: '💎', casas: 2 }
];

// Séries oficiais do Banco Central (SGS).
const INDICADORES = [
  { serie: 432,   titulo: 'Selic (meta)',     detalhe: 'Taxa básica de juros, ao ano' },
  { serie: 4389,  titulo: 'CDI',              detalhe: 'Referência da renda fixa, ao ano' },
  { serie: 13522, titulo: 'IPCA (12 meses)',  detalhe: 'Inflação acumulada em 12 meses' }
];

/* ---------- FUNÇÕES AUXILIARES ---------- */

function formatar(numero, casas) {
  return Number(numero).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  });
}

// Guarda e lê dados no navegador (localStorage) com data de gravação.
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
  } catch (e) { /* se não der para guardar, tudo bem */ }
}

// Busca um endereço com limite de 10 segundos de espera.
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

// Usa o dado guardado se ainda estiver "fresco". Se a internet/API falhar,
// mostra o último dado guardado (marcado como antigo) em vez de ficar vazio.
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

/* ---------- CARTÕES ---------- */

function criarCartao(item) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.tipo = item.tipo;

  const titulo = document.createElement('h3');
  titulo.textContent = item.icone + ' ' + item.titulo;

  const codigo = document.createElement('p');
  codigo.className = 'codigo';
  codigo.textContent = item.codigo;

  const preco = document.createElement('p');
  preco.className = 'preco';
  preco.textContent = 'Carregando...';

  const variacao = document.createElement('p');
  variacao.className = 'variacao';

  const detalhe = document.createElement('p');
  detalhe.className = 'detalhe';

  el.append(titulo, codigo, preco, variacao, detalhe);
  return { el, preco, variacao, detalhe };
}

function preencherCartao(cartao, preco, variacao, aviso) {
  cartao.preco.textContent = preco;
  if (variacao === null || variacao === undefined || isNaN(variacao)) {
    cartao.variacao.textContent = '';
    cartao.variacao.className = 'variacao';
  } else {
    const positivo = variacao >= 0;
    cartao.variacao.textContent = (positivo ? '▲ ' : '▼ ') + formatar(variacao, 2) + '%';
    cartao.variacao.className = 'variacao ' + (positivo ? 'positivo' : 'negativo');
  }
  cartao.detalhe.textContent = aviso || '';
}

function cartaoIndisponivel(cartao) {
  cartao.preco.textContent = 'Indisponível agora';
  cartao.variacao.textContent = '';
  cartao.variacao.className = 'variacao';
  cartao.detalhe.textContent = 'Tente novamente em alguns minutos.';
}

/* ---------- 1) INDICADORES DO BANCO CENTRAL ---------- */

async function carregarIndicadores() {
  const area = document.getElementById('indicadores');
  if (!area) return;
  area.textContent = '';

  for (const ind of INDICADORES) {
    const cartao = criarCartao({ icone: '🏦', titulo: ind.titulo, codigo: 'Banco Central', tipo: 'indicador' });
    area.appendChild(cartao.el);

    try {
      const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + ind.serie + '/dados/ultimos/1?formato=json';
      const r = await comCache('ef_bcb_' + ind.serie, CACHE_MIN.indicadores, async () => {
        const json = await buscarJSON(url);
        return { valor: parseFloat(json[0].valor), data: json[0].data };
      });
      preencherCartao(cartao, formatar(r.dados.valor, 2) + '% a.a.', null, ind.detalhe + ' • ' + r.dados.data);
    } catch (e) {
      cartaoIndisponivel(cartao);
    }
  }
}

/* ---------- 2) ATIVOS (moedas, cripto, ações e FIIs) ---------- */

let ultimaAtualizacao = 0;

function marcarAtualizacao(quando) {
  if (quando > ultimaAtualizacao) ultimaAtualizacao = quando;
  const aviso = document.getElementById('atualizacao');
  if (aviso && ultimaAtualizacao) {
    const hora = new Date(ultimaAtualizacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    aviso.textContent = 'Última atualização: ' + hora;
  }
}

async function carregarCambioECripto(cartoes) {
  try {
    const pares = 'USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL';
    const r = await comCache('ef_cambio', CACHE_MIN.cambio, () =>
      buscarJSON('https://economia.awesomeapi.com.br/json/last/' + pares)
    );
    for (const item of CAMBIO) {
      const dado = r.dados[item.chave];
      const cartao = cartoes[item.chave];
      if (dado && dado.bid) {
        preencherCartao(cartao, 'R$ ' + formatar(dado.bid, item.casas), parseFloat(dado.pctChange), r.antigo ? 'Dado salvo (pode estar antigo)' : '');
      } else {
        cartaoIndisponivel(cartao);
      }
    }
    marcarAtualizacao(r.quando);
  } catch (e) {
    for (const item of CAMBIO) cartaoIndisponivel(cartoes[item.chave]);
  }
}

async function buscarAcao(ticker) {
  const opcoes = BRAPI_TOKEN ? { headers: { Authorization: 'Bearer ' + BRAPI_TOKEN } } : {};
  const json = await buscarJSON('https://brapi.dev/api/quote/' + ticker, opcoes);
  const r = json.results && json.results[0];
  if (!r || typeof r.regularMarketPrice !== 'number') throw new Error('sem dados');
  return { preco: r.regularMarketPrice, variacao: r.regularMarketChangePercent };
}

async function carregarAcao(ticker, cartao) {
  try {
    const r = await comCache('ef_acao_' + ticker, CACHE_MIN.acoes, () => buscarAcao(ticker));
    preencherCartao(cartao, 'R$ ' + formatar(r.dados.preco, 2), r.dados.variacao, 'Atraso de ~30 min' + (r.antigo ? ' • dado salvo' : ''));
    marcarAtualizacao(r.quando);
  } catch (e) {
    cartaoIndisponivel(cartao);
  }
}

// Filtros (Todos / Moedas / Cripto / Ações / FIIs)
let filtroAtual = 'todos';

function aplicarFiltro() {
  const cartoes = document.querySelectorAll('#ativos-container .card');
  cartoes.forEach(c => {
    c.hidden = !(filtroAtual === 'todos' || c.dataset.tipo === filtroAtual);
  });
}

function ligarFiltros() {
  const botoes = document.querySelectorAll('[data-filtro]');
  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      filtroAtual = botao.dataset.filtro;
      botoes.forEach(b => b.classList.toggle('ativo', b === botao));
      aplicarFiltro();
    });
  });
}

async function carregarAtivos() {
  const area = document.getElementById('ativos-container');
  if (!area) return;
  area.textContent = '';

  // Cria todos os cartões primeiro (aparecem como "Carregando...")
  const cartoesCambio = {};
  for (const item of CAMBIO) {
    const cartao = criarCartao(item);
    cartoesCambio[item.chave] = cartao;
    area.appendChild(cartao.el);
  }

  const tickers = BRAPI_TOKEN ? ACOES_COM_TOKEN : ACOES_SEM_TOKEN;
  const cartoesAcoes = tickers.map(ticker => {
    const ehFii = /11$/.test(ticker);
    const cartao = criarCartao({
      icone: ehFii ? '🏢' : '📈',
      titulo: ticker,
      codigo: ehFii ? 'Fundo imobiliário' : 'Ação',
      tipo: ehFii ? 'fii' : 'acao'
    });
    area.appendChild(cartao.el);
    return { ticker, cartao };
  });

  aplicarFiltro();

  // Busca tudo ao mesmo tempo (bem mais rápido do que um por vez)
  await Promise.all([
    carregarCambioECripto(cartoesCambio),
    ...cartoesAcoes.map(a => carregarAcao(a.ticker, a.cartao))
  ]);
}

/* ---------- 3) NOTÍCIAS ---------- */

async function carregarNoticias() {
  const lista = document.getElementById('feedNoticias');
  if (!lista) return;

  try {
    const r = await comCache('ef_noticias', CACHE_MIN.noticias, async () => {
      const feed = encodeURIComponent('https://www.infomoney.com.br/feed/');
      const json = await buscarJSON('https://api.rss2json.com/v1/api.json?rss_url=' + feed);
      if (json.status !== 'ok') throw new Error('feed indisponível');
      return json.items.slice(0, 6).map(i => ({ titulo: i.title, link: i.link }));
    });

    lista.textContent = '';
    r.dados.forEach(n => {
      if (!/^https?:\/\//.test(n.link)) return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = n.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = n.titulo;
      li.appendChild(a);
      lista.appendChild(li);
    });
  } catch (e) {
    lista.textContent = '';
    const li = document.createElement('li');
    li.textContent = 'Não foi possível carregar as notícias agora. ';
    const a = document.createElement('a');
    a.href = 'https://www.infomoney.com.br/';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Ver no InfoMoney';
    li.appendChild(a);
    lista.appendChild(li);
  }
}

/* ---------- INÍCIO ---------- */

ligarFiltros();
carregarIndicadores();
carregarAtivos();
carregarNoticias();

// A cada 10 minutos confere de novo (o cache evita chamadas desnecessárias)
setInterval(carregarAtivos, 10 * 60 * 1000);
