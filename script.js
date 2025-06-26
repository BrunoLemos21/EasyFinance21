const ativos = [
  { codigo: 'PETR4.SA', nome: 'Petrobras PN', tipo: 'ações' },
  { codigo: 'VALE3.SA', nome: 'Vale', tipo: 'ações' },
  { codigo: 'BTC-USD', nome: 'Bitcoin/USD', tipo: 'cripto' },
  { codigo: 'HCTR11.SA', nome: 'HCTR11', tipo: 'fiis' },
  { codigo: 'ITUB4.SA', nome: 'Itaú Unibanco PN', tipo: 'ações' },
  { codigo: 'MXRF11.SA', nome: 'MXRF11', tipo: 'fiis' }
];

const icones = {
  'ações': '📈',
  'cripto': '💰',
  'fiis': '🏢'
};

function exibirAtivos(tipoSelecionado = 'todos') {
  const container = document.getElementById('ativos-container');
  container.innerHTML = '';

  const ativosFiltrados = ativos
    .filter(ativo => tipoSelecionado === 'todos' || ativo.tipo === tipoSelecionado)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  ativosFiltrados.forEach(ativo => {
    const preco = (Math.random() * 100 + 10).toFixed(2);
    const variacao = (Math.random() * 10 - 5).toFixed(2);
    const cor = variacao >= 0 ? 'green' : 'red';
    const simbolo = variacao >= 0 ? '▲' : '▼';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${icones[ativo.tipo] || ''} ${ativo.nome}</h3>
      <p><strong>Código:</strong> ${ativo.codigo}</p>
      <p><strong>Tipo:</strong> ${ativo.tipo}</p>
      <p><strong>Preço:</strong> R$ ${preco}</p>
      <p><strong>Variação:</strong> <span style="color:${cor}">${simbolo} ${variacao}%</span></p>
    `;
    container.appendChild(card);
  });
}

function criarFiltros() {
  const filtros = ['todos', 'ações', 'cripto', 'fiis'];
  const nav = document.querySelector('.filtros');

  filtros.forEach(tipo => {
    const btn = document.createElement('button');
    btn.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    btn.onclick = () => {
      document.querySelectorAll('.filtros button').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      exibirAtivos(tipo);
    };
    nav.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  criarFiltros();
  exibirAtivos();
});
