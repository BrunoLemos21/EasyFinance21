/* ==========================================================
   Easy Finance - página inicial
   (as funções de busca de dados ficam em dados.js)
   ========================================================== */

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

/* ---------- Indicadores do Banco Central ---------- */
async function carregarIndicadores() {
  const area = document.getElementById('indicadores');
  if (!area) return;
  area.textContent = '';

  for (const ind of INDICADORES) {
    const cartao = criarCartao({ icone: '🏦', titulo: ind.titulo, codigo: 'Banco Central', tipo: 'indicador' });
    area.appendChild(cartao.el);
    try {
      const r = await buscarIndicador(ind.serie);
      preencherCartao(cartao, formatar(r.dados.valor, 2) + '% a.a.', null, ind.detalhe + ' • ' + r.dados.data);
    } catch (e) {
      cartaoIndisponivel(cartao);
    }
  }
}

/* ---------- Ativos ---------- */
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
    const r = await buscarCambio();
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

async function carregarAcao(ticker, cartao) {
  try {
    const r = await buscarAcao(ticker);
    preencherCartao(cartao, 'R$ ' + formatar(r.dados.preco, 2), r.dados.variacao, 'Atraso de ~30 min' + (r.antigo ? ' • dado salvo' : ''));
    marcarAtualizacao(r.quando);
  } catch (e) {
    cartaoIndisponivel(cartao);
  }
}

let filtroAtual = 'todos';

function aplicarFiltro() {
  document.querySelectorAll('#ativos-container .card').forEach(c => {
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

  const cartoesCambio = {};
  for (const item of CAMBIO) {
    const cartao = criarCartao(item);
    cartoesCambio[item.chave] = cartao;
    area.appendChild(cartao.el);
  }

  const cartoesAcoes = listaTickers().map(ticker => {
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

  await Promise.all([
    carregarCambioECripto(cartoesCambio),
    ...cartoesAcoes.map(a => carregarAcao(a.ticker, a.cartao))
  ]);
}

/* ---------- Notícias ---------- */
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

ligarFiltros();
carregarIndicadores();
carregarAtivos();
carregarNoticias();
setInterval(carregarAtivos, 10 * 60 * 1000);
