document.addEventListener('DOMContentLoaded', () => {
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  if (carrinho.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  renderizarResumo(carrinho);

  document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!nome || !whatsapp) {
      alert('Preencha nome e WhatsApp.');
      return;
    }

    const total = carrinho.reduce((acc, item) => acc + parseFloat(item.preco || 0), 0);
    const pedido = {
      cliente: nome,
      whatsapp: whatsapp,
      email: email || '',
      itens: carrinho.map(p => ({ id: p.id, nome: p.nome, preco: p.preco })),
      valor: total,
      data: new Date().toISOString(),
      status: 'pendente'
    };

    try {
      await addPedido(pedido);
      localStorage.removeItem('carrinho');
      window.location.href = 'sucesso.html';
    } catch (err) {
      console.error(err);
      alert('Erro ao criar pedido. Tente novamente.');
    }
  });
});

function renderizarResumo(carrinho) {
  const container = document.getElementById('resumoItens');
  let html = '', total = 0;
  carrinho.forEach(item => {
    total += parseFloat(item.preco || 0);
    html += `<div class="cart-item" style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
      <span>${item.nome}</span>
      <span>R$ ${parseFloat(item.preco).toFixed(2)}</span>
    </div>`;
  });
  container.innerHTML = html;
  document.getElementById('resumoTotal').textContent = `R$ ${total.toFixed(2)}`;
                   }
