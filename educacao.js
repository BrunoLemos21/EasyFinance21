/* ==========================================================
   Easy Finance - educação: trilha, glossário e quiz
   Para adicionar conteúdo, edite as listas MODULOS, TERMOS e PERGUNTAS abaixo.
   ========================================================== */

/* ---------- CONTEÚDO ---------- */

const MODULOS = [
  {
    titulo: 'Dinheiro, inflação e poder de compra',
    textos: [
      'Inflação é o aumento geral dos preços. Com ela, o mesmo dinheiro compra menos coisas com o passar do tempo.',
      'Por isso, deixar dinheiro parado perde valor. O objetivo de investir é, no mínimo, render mais do que a inflação. O que sobra depois de descontá-la se chama rentabilidade real.',
      'No Brasil, a inflação oficial é medida pelo IPCA. Você vê o valor atual na página inicial.'
    ],
    link: { href: 'index.html', texto: 'Ver o IPCA de hoje' }
  },
  {
    titulo: 'Juros compostos e o poder do tempo',
    textos: [
      'Nos juros compostos, o rendimento de hoje também rende no mês seguinte. É "juros sobre juros".',
      'Isso faz o tempo pesar mais do que o valor: investir um pouco todo mês, por muitos anos, costuma render mais do que esperar para investir muito de uma vez.',
      'Teste no simulador: aumente o prazo e veja a curva ficar cada vez mais inclinada.'
    ],
    link: { href: 'simulador.html', texto: 'Abrir o simulador' }
  },
  {
    titulo: 'Selic, CDI e renda fixa',
    textos: [
      'A Selic é a taxa básica de juros do Brasil, definida pelo Banco Central. O CDI anda muito perto dela e serve de referência para a renda fixa.',
      'Renda fixa é quando as regras de remuneração são conhecidas na hora da aplicação. Exemplos: CDB, LCI, LCA e Tesouro Direto.',
      'Quando a Selic sobe, a renda fixa tende a render mais. Compare Poupança, CDB e Tesouro Selic com o Imposto de Renda já descontado.'
    ],
    link: { href: 'comparar.html', texto: 'Comparar na prática' }
  },
  {
    titulo: 'Renda variável: ações',
    textos: [
      'Ao comprar uma ação, você vira sócio de uma empresa, mesmo que de uma fatia bem pequena. Você pode ganhar com a valorização do preço e com dividendos, quando a empresa distribui lucros.',
      'O preço varia todos os dias, para cima e para baixo. Por isso ações costumam fazer mais sentido para objetivos de longo prazo.',
      'Treine sem risco na carteira fictícia: compre algumas ações e acompanhe alguns dias.'
    ],
    link: { href: 'carteira.html', texto: 'Abrir a carteira fictícia' }
  },
  {
    titulo: 'FIIs e criptoativos',
    textos: [
      'Fundos imobiliários (FIIs) reúnem dinheiro de muitas pessoas para investir em imóveis ou em papéis ligados ao setor. Quem compra cotas costuma receber rendimentos todo mês.',
      'Criptoativos, como Bitcoin e Ethereum, são moedas digitais. Os preços oscilam muito, então o risco é maior.',
      'Nos dois casos, vale entender bem o que você está comprando antes de colocar dinheiro de verdade.'
    ],
    link: null
  },
  {
    titulo: 'Risco, diversificação e reserva de emergência',
    textos: [
      'Quanto maior o possível ganho, em geral maior o risco de perda. Não existe retorno alto sem risco.',
      'Diversificar é não colocar todos os ovos na mesma cesta: espalhar o dinheiro entre tipos diferentes de investimento.',
      'Antes de arriscar, muitos educadores recomendam ter uma reserva de emergência, que costuma ser de 3 a 12 meses de gastos, em algo seguro e com resgate rápido.'
    ],
    link: null
  }
];

const TERMOS = [
  { t: 'Inflação', c: 'Básico', d: 'Aumento geral dos preços. Faz o dinheiro perder poder de compra com o tempo.' },
  { t: 'IPCA', c: 'Básico', d: 'Índice oficial de inflação do Brasil, medido pelo IBGE.' },
  { t: 'Selic', c: 'Básico', d: 'Taxa básica de juros da economia, definida pelo Banco Central. Influencia quase todos os investimentos e empréstimos.' },
  { t: 'CDI', c: 'Renda fixa', d: 'Taxa que acompanha de perto a Selic. É a principal referência de rendimento da renda fixa.' },
  { t: 'Juros compostos', c: 'Básico', d: 'Juros que incidem sobre o valor inicial e também sobre os juros já acumulados ("juros sobre juros").' },
  { t: 'Rentabilidade real', c: 'Básico', d: 'Quanto o investimento rendeu depois de descontar a inflação. Mostra o ganho de poder de compra.' },
  { t: 'Liquidez', c: 'Básico', d: 'Facilidade de transformar o investimento em dinheiro sem perder valor. Quanto mais rápido o resgate, maior a liquidez.' },
  { t: 'Vencimento', c: 'Renda fixa', d: 'Data em que o título termina e o dinheiro volta para você, com o rendimento combinado.' },
  { t: 'Renda fixa', c: 'Renda fixa', d: 'Investimentos com regra de remuneração conhecida na hora da aplicação, como CDB e Tesouro Direto.' },
  { t: 'CDB', c: 'Renda fixa', d: 'Certificado de Depósito Bancário. Você empresta dinheiro ao banco e recebe juros. Tem proteção do FGC dentro de um limite.' },
  { t: 'LCI e LCA', c: 'Renda fixa', d: 'Títulos de crédito ligados ao setor imobiliário (LCI) e ao agronegócio (LCA). Para pessoa física, os rendimentos são isentos de Imposto de Renda.' },
  { t: 'Tesouro Selic', c: 'Renda fixa', d: 'Título do governo que acompanha a Selic. É considerado um dos investimentos mais seguros do país e costuma ser usado em reserva de emergência.' },
  { t: 'Tesouro Direto', c: 'Renda fixa', d: 'Programa em que você empresta dinheiro ao governo comprando títulos públicos, como Selic, IPCA+ e Prefixado.' },
  { t: 'Poupança', c: 'Renda fixa', d: 'Aplicação simples e isenta de Imposto de Renda. Com a Selic acima de 8,5% ao ano, rende 0,5% ao mês mais a TR.' },
  { t: 'FGC', c: 'Renda fixa', d: 'Fundo Garantidor de Créditos. Protege depósitos e alguns títulos bancários até R$ 250 mil por CPF em cada instituição.' },
  { t: 'IR regressivo', c: 'Renda fixa', d: 'Imposto de Renda que cai com o tempo: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima disso, sobre o ganho.' },
  { t: 'Renda variável', c: 'Renda variável', d: 'Investimentos sem rendimento garantido, como ações, FIIs e criptoativos. O preço sobe e desce.' },
  { t: 'Ação', c: 'Renda variável', d: 'Pequena parte de uma empresa. Quem tem ações é sócio e pode ganhar com valorização e dividendos.' },
  { t: 'Dividendos', c: 'Renda variável', d: 'Parte do lucro que uma empresa distribui aos seus acionistas.' },
  { t: 'FII', c: 'Renda variável', d: 'Fundo de Investimento Imobiliário. Reúne dinheiro de várias pessoas para investir no setor imobiliário e costuma pagar rendimentos mensais.' },
  { t: 'Cota', c: 'Renda variável', d: 'A "fatia" de um fundo. Ao comprar uma cota de FII, você passa a ser dono de uma parte do fundo.' },
  { t: 'Ibovespa', c: 'Renda variável', d: 'Principal índice da bolsa brasileira. Mostra o desempenho médio das ações mais negociadas.' },
  { t: 'Criptoativo', c: 'Renda variável', d: 'Moeda ou ativo digital, como Bitcoin e Ethereum. Costuma ter variação de preço muito alta.' },
  { t: 'Volatilidade', c: 'Risco', d: 'Quanto o preço de um ativo oscila. Alta volatilidade significa mudanças fortes e rápidas.' },
  { t: 'Diversificação', c: 'Risco', d: 'Espalhar o dinheiro entre investimentos diferentes para reduzir o impacto de um deles ir mal.' },
  { t: 'Reserva de emergência', c: 'Risco', d: 'Dinheiro guardado para imprevistos, em algo seguro e de resgate rápido. Muitos educadores indicam de 3 a 12 meses de gastos.' },
  { t: 'Perfil de investidor', c: 'Risco', d: 'Seu jeito de lidar com risco: conservador, moderado ou arrojado. Ajuda a escolher onde investir.' },
  { t: 'Aporte', c: 'Básico', d: 'Dinheiro novo que você coloca no investimento, por exemplo, todo mês.' }
];

const PERGUNTAS = [
  { p: 'O que acontece com o poder de compra quando a inflação sobe?', o: ['Diminui', 'Aumenta', 'Fica igual', 'Depende só da Selic'], r: 0, e: 'Com preços maiores, o mesmo dinheiro compra menos.' },
  { p: 'O que são juros compostos?', o: ['Juros só sobre o valor inicial', 'Juros sobre o valor inicial e sobre os juros acumulados', 'Uma taxa fixa de banco', 'Um imposto sobre investimentos'], r: 1, e: 'É o "juros sobre juros", que faz o dinheiro crescer cada vez mais rápido.' },
  { p: 'O que é a Selic?', o: ['O índice da bolsa', 'A taxa básica de juros do Brasil', 'Um tipo de ação', 'A inflação do ano'], r: 1, e: 'A Selic é definida pelo Banco Central e serve de base para os juros da economia.' },
  { p: 'Qual destes investimentos tem rendimento isento de IR para pessoa física?', o: ['CDB', 'Tesouro Selic', 'LCI', 'Todos os anteriores'], r: 2, e: 'LCI e LCA são isentas de Imposto de Renda para pessoa física. CDB e Tesouro pagam IR regressivo.' },
  { p: 'Até quanto o FGC protege por CPF em cada instituição?', o: ['R$ 10 mil', 'R$ 100 mil', 'R$ 250 mil', 'Sem limite'], r: 2, e: 'O limite é de R$ 250 mil por CPF em cada instituição financeira.' },
  { p: 'O que significa liquidez?', o: ['O quanto o investimento rende', 'A facilidade de virar dinheiro sem perder valor', 'O risco de perder dinheiro', 'O imposto cobrado no resgate'], r: 1, e: 'Alta liquidez é poder resgatar rápido, sem perda relevante.' },
  { p: 'O que é diversificar?', o: ['Investir tudo no melhor ativo', 'Espalhar o dinheiro entre investimentos diferentes', 'Trocar de investimento toda semana', 'Investir só em renda fixa'], r: 1, e: 'Diversificar reduz o impacto de um único investimento ir mal.' },
  { p: 'O que é rentabilidade real?', o: ['O rendimento antes dos impostos', 'O rendimento depois de descontar a inflação', 'O rendimento da poupança', 'O rendimento do último mês'], r: 1, e: 'Ela mostra se o seu poder de compra realmente cresceu.' },
  { p: 'O que é o Tesouro Selic?', o: ['Uma ação de empresa estatal', 'Um título do governo que acompanha a Selic', 'Um fundo imobiliário', 'Uma conta de banco'], r: 1, e: 'É um título público pós-fixado, bastante usado em reserva de emergência.' },
  { p: 'Como funciona o Imposto de Renda regressivo?', o: ['A alíquota sobe com o tempo', 'A alíquota é sempre a mesma', 'A alíquota cai quanto mais tempo o dinheiro fica investido', 'Só vale para ações'], r: 2, e: 'Começa em 22,5% e cai até 15% para prazos acima de 720 dias.' },
  { p: 'O que é um FII?', o: ['Um fundo que investe no setor imobiliário e distribui rendimentos', 'Um tipo de poupança', 'Um imposto sobre imóveis', 'Uma moeda digital'], r: 0, e: 'FII é um fundo imobiliário. Quem tem cotas costuma receber rendimentos mensais.' },
  { p: 'Onde costuma fazer mais sentido guardar a reserva de emergência?', o: ['Em ações de uma só empresa', 'Em criptoativos', 'Em algo seguro e com resgate rápido', 'Em imóveis'], r: 2, e: 'A reserva precisa estar disponível quando o imprevisto aparecer, então segurança e liquidez vêm primeiro.' }
];

/* ---------- ABAS ---------- */
(function () {
  const botoes = document.querySelectorAll('[data-aba]');
  botoes.forEach(b => b.addEventListener('click', () => {
    botoes.forEach(x => x.classList.toggle('ativo', x === b));
    ['trilha', 'glossario', 'quiz', 'recursos'].forEach(nome => {
      document.getElementById('aba-' + nome).hidden = nome !== b.dataset.aba;
    });
  }));
})();

/* ---------- TRILHA ---------- */
(function () {
  const CHAVE = 'ef_trilha';
  let feitos = [];
  try { feitos = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (e) {}

  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(feitos)); } catch (e) {} }

  function desenhar() {
    const area = document.getElementById('trilha');
    area.textContent = '';

    MODULOS.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'card-conteudo' + (feitos.includes(i) ? ' concluido' : '');

      const h = document.createElement('h2');
      h.textContent = (i + 1) + '. ' + m.titulo + (feitos.includes(i) ? ' ✅' : '');
      card.appendChild(h);

      m.textos.forEach(t => {
        const p = document.createElement('p');
        p.style.marginBottom = '0.6rem';
        p.textContent = t;
        card.appendChild(p);
      });

      const acoes = document.createElement('div');
      acoes.className = 'atalhos';

      if (m.link) {
        const a = document.createElement('a');
        a.href = m.link.href;
        a.className = 'btn-secundario';
        a.style.textDecoration = 'none';
        a.textContent = m.link.texto;
        acoes.appendChild(a);
      }

      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-secundario';
      b.textContent = feitos.includes(i) ? 'Desmarcar como concluído' : 'Marcar como concluído';
      b.addEventListener('click', () => {
        feitos = feitos.includes(i) ? feitos.filter(x => x !== i) : feitos.concat(i);
        salvar();
        desenhar();
      });
      acoes.appendChild(b);

      card.appendChild(acoes);
      area.appendChild(card);
    });

    document.getElementById('progresso').value = feitos.length;
    document.getElementById('progressoTexto').textContent =
      feitos.length + ' de ' + MODULOS.length + ' módulos concluídos. Siga a ordem, do básico ao avançado.';
  }

  desenhar();
})();

/* ---------- GLOSSÁRIO ---------- */
(function () {
  const area = document.getElementById('listaTermos');
  const busca = document.getElementById('busca');
  const semResultado = document.getElementById('semResultado');
  const areaCategorias = document.getElementById('categorias');
  let categoria = 'Todos';

  const semAcento = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function desenhar() {
    const q = semAcento(busca.value.trim());
    area.textContent = '';
    let achou = 0;

    TERMOS.slice().sort((a, b) => a.t.localeCompare(b.t, 'pt-BR')).forEach(x => {
      if (categoria !== 'Todos' && x.c !== categoria) return;
      if (q && !semAcento(x.t + ' ' + x.d).includes(q)) return;
      achou++;

      const card = document.createElement('div');
      card.className = 'card-conteudo';
      const h = document.createElement('h3');
      h.textContent = x.t;
      const cat = document.createElement('p');
      cat.className = 'nota';
      cat.style.marginTop = '0';
      cat.textContent = x.c;
      const p = document.createElement('p');
      p.textContent = x.d;
      card.append(h, cat, p);
      area.appendChild(card);
    });

    semResultado.hidden = achou > 0;
  }

  ['Todos', 'Básico', 'Renda fixa', 'Renda variável', 'Risco'].forEach(nome => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = nome;
    if (nome === 'Todos') b.className = 'ativo';
    b.addEventListener('click', () => {
      categoria = nome;
      areaCategorias.querySelectorAll('button').forEach(x => x.classList.toggle('ativo', x === b));
      desenhar();
    });
    areaCategorias.appendChild(b);
  });

  busca.addEventListener('input', desenhar);
  desenhar();
})();

/* ---------- QUIZ ---------- */
(function () {
  const area = document.getElementById('quiz');
  const TOTAL = 5;
  let sorteadas = [];
  let atual = 0;
  let acertos = 0;

  function embaralhar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function comecar() {
    sorteadas = embaralhar(PERGUNTAS).slice(0, TOTAL);
    atual = 0;
    acertos = 0;
    mostrarPergunta();
  }

  function mostrarPergunta() {
    area.textContent = '';
    const q = sorteadas[atual];

    const card = document.createElement('div');
    card.className = 'card-conteudo';

    const prog = document.createElement('p');
    prog.className = 'nota';
    prog.style.marginTop = '0';
    prog.textContent = 'Pergunta ' + (atual + 1) + ' de ' + TOTAL;

    const h = document.createElement('h2');
    h.textContent = q.p;

    const opcoes = embaralhar(q.o.map((texto, i) => ({ texto, certa: i === q.r })));
    const feedback = document.createElement('p');
    feedback.style.margin = '0.75rem 0';
    feedback.setAttribute('role', 'status');

    const proxima = document.createElement('button');
    proxima.type = 'button';
    proxima.className = 'btn';
    proxima.hidden = true;
    proxima.textContent = atual + 1 < TOTAL ? 'Próxima pergunta' : 'Ver resultado';
    proxima.addEventListener('click', () => {
      atual++;
      if (atual < TOTAL) mostrarPergunta(); else mostrarResultado();
    });

    const botoes = [];
    card.append(prog, h);

    opcoes.forEach(op => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opcao';
      b.textContent = op.texto;
      b.addEventListener('click', () => {
        botoes.forEach(x => { x.disabled = true; });
        if (op.certa) {
          acertos++;
          b.classList.add('certa');
          feedback.textContent = '✅ Correto! ' + q.e;
        } else {
          b.classList.add('errada');
          botoes[opcoes.findIndex(o => o.certa)].classList.add('certa');
          feedback.textContent = '❌ Não foi dessa vez. ' + q.e;
        }
        proxima.hidden = false;
        proxima.focus();
      });
      botoes.push(b);
      card.appendChild(b);
    });

    card.append(feedback, proxima);
    area.appendChild(card);
  }

  function mostrarResultado() {
    area.textContent = '';
    const card = document.createElement('div');
    card.className = 'card-conteudo';

    const h = document.createElement('h2');
    h.textContent = 'Você acertou ' + acertos + ' de ' + TOTAL;
    const p = document.createElement('p');
    p.style.margin = '0.5rem 0 1rem';
    p.textContent = acertos === TOTAL
      ? 'Perfeito! Você domina o básico.'
      : acertos >= 3
        ? 'Muito bem! Revise os termos que errou no glossário.'
        : 'Bom começo. Volte na trilha e no glossário e tente de novo.';

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = 'Jogar de novo';
    b.addEventListener('click', comecar);

    card.append(h, p, b);
    area.appendChild(card);
  }

  comecar();
})();
