document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  configurarCarrinho();
  configurarBuscaECategorias();
});

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let produtosData = [];

// ---- CARRINHO ----
function configurarCarrinho() {
  atualizarBadge();
  renderizarCarrinho();
  document.getElementById('cartBtn').addEventListener('click', abrirCarrinho);
  document.getElementById('closeCart').addEventListener('click', fecharCarrinho);
  document.getElementById('cartOverlay').addEventListener('click', fecharCarrinho);
  document.getElementById('produtosGrid').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-comprar')) {
      adicionarAoCarrinho(e.target.dataset.id);
    }
  });
}

function abrirCarrinho() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('active');
  renderizarCarrinho();
}
function fecharCarrinho() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('active');
}

function adicionarAoCarrinho(id) {
  const produto = produtosData.find(p => p.id === id);
  if (!produto) {
    getProduto(id).then(p => {
      if (p) {
        carrinho.push(p);
        salvarCarrinho();
        atualizarBadge();
        renderizarCarrinho();
      }
    });
    return;
  }
  carrinho.push(produto);
  salvarCarrinho();
  atualizarBadge();
  renderizarCarrinho();
}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}
function atualizarBadge() {
  document.getElementById('cartCount').textContent = carrinho.length;
}
function renderizarCarrinho() {
  const container = document.getElementById('cartItems');
  if (carrinho.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;">Seu carrinho está vazio</p>';
    document.getElementById('cartTotal').textContent = 'R$ 0,00';
    return;
  }
  let html = '', total = 0;
  carrinho.forEach((item, index) => {
    total += parseFloat(item.preco || 0);
    html += `
      <div class="cart-item">
        <div class="item-info">
          <strong>${item.nome}</strong>
          <span class="item-preco">R$ ${parseFloat(item.preco).toFixed(2)}</span>
        </div>
        <button class="remove-item" data-index="${index}">✕</button>
      </div>
    `;
  });
  container.innerHTML = html;
  document.getElementById('cartTotal').textContent = `R$ ${total.toFixed(2)}`;
  container.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      carrinho.splice(idx, 1);
      salvarCarrinho();
      atualizarBadge();
      renderizarCarrinho();
    });
  });
}

// ---- PRODUTOS ----
async function carregarProdutos(filtro = 'todos', busca = '') {
  try {
    const produtos = await getProdutos();
    produtosData = produtos;
    exibirProdutos(produtos, filtro, busca);
    atualizarCategorias(produtos);
  } catch (err) {
    console.error(err);
  }
}

function exibirProdutos(produtos, filtro, busca) {
  let lista = produtos;
  if (filtro !== 'todos') {
    lista = lista.filter(p => p.categoria?.toLowerCase() === filtro.toLowerCase());
  }
  if (busca) {
    const termo = busca.toLowerCase();
    lista = lista.filter(p => p.nome.toLowerCase().includes(termo) ||
                              (p.descricao && p.descricao.toLowerCase().includes(termo)));
  }
  const grid = document.getElementById('produtosGrid');
  if (lista.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;">Nenhum produto encontrado</p>';
    return;
  }
  grid.innerHTML = lista.map(p => `
    <div class="card-produto">
      <img src="${p.imagem || 'https://placehold.co/400x400/f1f5f9/2563eb?text=Imagem'}" alt="${p.nome}" loading="lazy" />
      <h3>${p.nome}</h3>
      <span class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</span>
      <button class="btn-comprar" data-id="${p.id}">Comprar</button>
    </div>
  `).join('');
}

function atualizarCategorias(produtos) {
  const cats = ['todos', ...new Set(produtos.map(p => p.categoria).filter(Boolean))];
  const container = document.getElementById('categoriasContainer');
  container.innerHTML = cats.map(c => `
    <button class="cat-btn ${c === 'todos' ? 'active' : ''}" data-cat="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</button>
  `).join('');
  container.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      const busca = document.getElementById('searchInput').value.trim();
      carregarProdutos(cat, busca);
    });
  });
}

function configurarBuscaECategorias() {
  const searchInput = document.getElementById('searchInput');
  let timeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const busca = searchInput.value.trim();
      const catAtiva = document.querySelector('.cat-btn.active')?.dataset.cat || 'todos';
      carregarProdutos(catAtiva, busca);
    }, 300);
  });
            }
