document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    carregarProduto(id);
  } else {
    document.getElementById('produtoDetalhe').innerHTML = '<p>Produto não encontrado.</p>';
  }
  configurarCarrinho();
});

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

async function carregarProduto(id) {
  try {
    const p = await getProduto(id);
    if (!p) {
      document.getElementById('produtoDetalhe').innerHTML = '<p>Produto não encontrado.</p>';
      return;
    }
    const html = `
      <div class="produto-imagem">
        <img src="${p.imagem || 'https://placehold.co/600x600/f1f5f9/2563eb?text=Imagem'}" alt="${p.nome}" />
      </div>
      <div class="produto-info">
        <h1>${p.nome}</h1>
        <p class="produto-categoria">${p.categoria || 'Geral'}</p>
        <p class="produto-preco">R$ ${parseFloat(p.preco).toFixed(2)}</p>
        <p class="produto-descricao">${p.descricao || 'Sem descrição'}</p>
        <div class="produto-detalhes">
          <p><strong>Tipo:</strong> ${p.tipo || 'Não informado'}</p>
          <p><strong>Entrega:</strong> ${p.entrega || 'Imediata'}</p>
        </div>
        <button class="btn-primary" id="btnComprarProduto" data-id="${p.id}">Comprar agora</button>
      </div>
    `;
    document.getElementById('produtoDetalhe').innerHTML = html;
    document.getElementById('btnComprarProduto').addEventListener('click', () => {
      adicionarAoCarrinho(p.id);
      abrirCarrinho();
    });
  } catch (err) {
    console.error(err);
    document.getElementById('produtoDetalhe').innerHTML = '<p>Erro ao carregar produto.</p>';
  }
}

// Funções do carrinho (repetidas para autonomia)
function configurarCarrinho() {
  atualizarBadge();
  renderizarCarrinho();
  document.getElementById('cartBtn').addEventListener('click', abrirCarrinho);
  document.getElementById('closeCart').addEventListener('click', fecharCarrinho);
  document.getElementById('cartOverlay').addEventListener('click', fecharCarrinho);
}
function abrirCarrinho() { /* ... */ }
function fecharCarrinho() { /* ... */ }
function adicionarAoCarrinho(id) {
  getProduto(id).then(p => {
    if (p) {
      carrinho.push(p);
      salvarCarrinho();
      atualizarBadge();
      renderizarCarrinho();
    }
  });
}
function salvarCarrinho() { localStorage.setItem('carrinho', JSON.stringify(carrinho)); }
function atualizarBadge() { document.getElementById('cartCount').textContent = carrinho.length; }
function renderizarCarrinho() {
  const container = document.getElementById('cartItems');
  if (carrinho.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;">Carrinho vazio</p>';
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
// (copiar as funções abrir/fechar se necessário, ou usar as mesmas)
