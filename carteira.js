/* ==========================================================
   Easy Finance - carteira fictícia
   Tudo é salvo no navegador (localStorage). Não usa dinheiro de verdade.
   ========================================================== */
(function () {
  const $ = id => document.getElementById(id);
  const CHAVE = 'ef_carteira';
  const CAIXA_INICIAL = 10000;
  const dinheiro = v => 'R$ ' + formatar(v, 2);
  const arredonda = n => Math.round(n * 1e8) / 1e8;

  /* ---------- Dados salvos ---------- */
  function novaCarteira() {
    return { caixa: CAIXA_INICIAL, posicoes: {}, historico: [] };
  }

  function carregar() {
    try {
      const c = JSON.parse(localStorage.getItem(CHAVE));
      if (c && typeof c.caixa === 'number' && c.posicoes && Array.isArray(c.historico)) return c;
    } catch (e) { /* começa do zero */ }
    return novaCarteira();
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(carteira)); } catch (e) {}
  }

  let carteira = carregar();
  let precos = {}; // id -> preço atual em reais

  /* ---------- Catálogo de ativos ---------- */
  const catalogo = [
    ...CAMBIO.map(c => ({
      id: c.chave, nome: c.titulo + ' (' + c.codigo + ')', tipo: c.tipo,
      passo: c.tipo === 'cripto' ? 0.0001 : 0.01
    })),
    ...listaTickers().map(t => ({
      id: t, nome: t, tipo: /11$/.test(t) ? 'fii' : 'acao', passo: 1
    }))
  ];
  const porId = id => catalogo.find(a => a.id === id);

  async function carregarPrecos() {
    const tarefas = [];

    tarefas.push(
      buscarCambio().then(r => {
        CAMBIO.forEach(c => {
          const d = r.dados[c.chave];
          if (d && d.bid) precos[c.chave] = parseFloat(d.bid);
        });
      }).catch(() => {})
    );

    listaTickers().forEach(t => {
      tarefas.push(buscarAcao(t).then(r => { precos[t] = r.dados.preco; }).catch(() => {}));
    });

    await Promise.all(tarefas);
    const n = Object.keys(precos).length;
    $('fonte').textContent = n
      ? 'Preços atualizados às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '.'
      : 'Não consegui buscar os preços agora. Tente de novo em alguns minutos.';
  }

  /* ---------- Tela ---------- */
  function preencherSelect() {
    const sel = $('ativo');
    const atual = sel.value;
    sel.textContent = '';
    catalogo.forEach(a => {
      if (precos[a.id] === undefined) return; // só mostra o que tem preço
      const op = document.createElement('option');
      op.value = a.id;
      op.textContent = a.nome + ' — R$ ' + formatar(precos[a.id], a.tipo === 'moeda' ? 4 : 2);
      sel.appendChild(op);
    });
    if (atual && porId(atual) && precos[atual] !== undefined) sel.value = atual;
    ajustarQuantidade();
  }

  function ajustarQuantidade() {
    const a = porId($('ativo').value);
    if (!a) return;
    $('quantidade').step = a.passo;
    $('quantidade').min = a.passo;
    atualizarEstimativa();
  }

  function atualizarEstimativa() {
    const a = porId($('ativo').value);
    const qtd = parseFloat($('quantidade').value);
    if (!a || !(qtd > 0) || precos[a.id] === undefined) { $('estimativa').textContent = ''; return; }
    $('estimativa').textContent = 'Valor da operação: ' + dinheiro(qtd * precos[a.id]);
  }

  function celula(tr, texto, classe) {
    const td = document.createElement('td');
    td.textContent = texto;
    if (classe) td.className = classe;
    tr.appendChild(td);
  }

  function renderizar() {
    // Posições
    let valorInvestido = 0;
    const corpo = $('posicoes');
    corpo.textContent = '';
    const ids = Object.keys(carteira.posicoes);

    if (!ids.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.textContent = 'Você ainda não tem posições. Faça sua primeira compra acima.';
      tr.appendChild(td);
      corpo.appendChild(tr);
    }

    ids.forEach(id => {
      const pos = carteira.posicoes[id];
      const a = porId(id);
      const pm = pos.custo / pos.qtd;
      const atual = precos[id];
      const preco = atual !== undefined ? atual : pm; // sem preço: usa o médio
      const valor = pos.qtd * preco;
      const res = valor - pos.custo;
      const pct = pos.custo > 0 ? (res / pos.custo) * 100 : 0;
      valorInvestido += valor;

      const tr = document.createElement('tr');
      celula(tr, a ? a.nome.split(' (')[0] : id);
      celula(tr, formatar(pos.qtd, a && a.passo < 1 ? 4 : 0));
      celula(tr, dinheiro(pm));
      celula(tr, atual !== undefined ? dinheiro(atual) : 'sem preço');
      celula(tr, dinheiro(valor));
      celula(tr, (res >= 0 ? '+' : '') + dinheiro(res) + ' (' + formatar(pct, 2) + '%)', res >= 0 ? 'positivo' : 'negativo');
      corpo.appendChild(tr);
    });

    // Resumo
    const patrimonio = carteira.caixa + valorInvestido;
    const resultado = patrimonio - CAIXA_INICIAL;
    const pctTotal = (resultado / CAIXA_INICIAL) * 100;
    const cards = [
      { t: '💵 Dinheiro livre', v: dinheiro(carteira.caixa), d: 'Para novas compras', c: '' },
      { t: '📊 Investido (valor atual)', v: dinheiro(valorInvestido), d: 'Soma das suas posições', c: '' },
      { t: '🏆 Patrimônio total', v: dinheiro(patrimonio), d: 'Livre + investido', c: '' },
      { t: '📈 Resultado', v: (resultado >= 0 ? '+' : '') + dinheiro(resultado), d: formatar(pctTotal, 2) + '% sobre os R$ 10.000,00 iniciais', c: resultado >= 0 ? 'positivo' : 'negativo' }
    ];
    const area = $('resumo');
    area.textContent = '';
    cards.forEach(x => {
      const card = document.createElement('div');
      card.className = 'card';
      const h = document.createElement('h3');
      h.textContent = x.t;
      const p = document.createElement('p');
      p.className = 'preco ' + x.c;
      p.textContent = x.v;
      const d = document.createElement('p');
      d.className = 'detalhe';
      d.textContent = x.d;
      card.append(h, p, d);
      area.appendChild(card);
    });

    // Histórico
    const hist = $('historico');
    hist.textContent = '';
    if (!carteira.historico.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.textContent = 'Nenhuma operação ainda.';
      tr.appendChild(td);
      hist.appendChild(tr);
    }
    carteira.historico.slice(0, 20).forEach(h => {
      const a = porId(h.id);
      const tr = document.createElement('tr');
      celula(tr, new Date(h.t).toLocaleString('pt-BR'));
      celula(tr, h.tipo === 'compra' ? 'Compra' : 'Venda');
      celula(tr, a ? a.nome.split(' (')[0] : h.id);
      celula(tr, formatar(h.qtd, a && a.passo < 1 ? 4 : 0));
      celula(tr, dinheiro(h.preco));
      celula(tr, dinheiro(h.qtd * h.preco));
      hist.appendChild(tr);
    });
  }

  /* ---------- Operar ---------- */
  function operar(e) {
    e.preventDefault();
    const msg = $('mensagem');
    msg.textContent = '';

    const a = porId($('ativo').value);
    const tipo = $('operacao').value;
    let qtd = arredonda(parseFloat($('quantidade').value));

    if (!a || precos[a.id] === undefined) { msg.textContent = 'Escolha um ativo com preço disponível.'; return; }
    if (!(qtd > 0)) { msg.textContent = 'Informe uma quantidade maior que zero.'; return; }
    if (a.passo === 1 && !Number.isInteger(qtd)) { msg.textContent = 'Ações e FIIs são negociados em quantidades inteiras.'; return; }

    const preco = precos[a.id];
    const total = qtd * preco;
    const pos = carteira.posicoes[a.id];

    if (tipo === 'compra') {
      if (total > carteira.caixa + 1e-9) {
        msg.textContent = 'Dinheiro insuficiente. Você tem ' + dinheiro(carteira.caixa) + ' livres.';
        return;
      }
      carteira.caixa -= total;
      if (pos) { pos.qtd = arredonda(pos.qtd + qtd); pos.custo += total; }
      else carteira.posicoes[a.id] = { qtd, custo: total };
    } else {
      if (!pos || qtd > pos.qtd + 1e-9) {
        msg.textContent = 'Você não tem essa quantidade para vender.';
        return;
      }
      const custoBaixado = (pos.custo / pos.qtd) * qtd;
      pos.qtd = arredonda(pos.qtd - qtd);
      pos.custo -= custoBaixado;
      carteira.caixa += total;
      if (pos.qtd <= 1e-9) delete carteira.posicoes[a.id];
    }

    carteira.historico.unshift({ t: Date.now(), tipo, id: a.id, qtd, preco });
    carteira.historico = carteira.historico.slice(0, 100);
    salvar();
    renderizar();
    atualizarEstimativa();
  }

  /* ---------- Eventos ---------- */
  $('formOperacao').addEventListener('submit', operar);
  $('ativo').addEventListener('change', ajustarQuantidade);
  $('quantidade').addEventListener('input', atualizarEstimativa);

  $('reiniciar').addEventListener('click', () => {
    if (confirm('Apagar sua carteira fictícia e recomeçar com R$ 10.000,00?')) {
      carteira = novaCarteira();
      salvar();
      renderizar();
    }
  });

  /* ---------- Início ---------- */
  renderizar();
  carregarPrecos().then(() => { preencherSelect(); renderizar(); });
  setInterval(() => carregarPrecos().then(() => { preencherSelect(); renderizar(); }), 5 * 60 * 1000);
})();
