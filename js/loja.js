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

    document.getElementById('finalizarWhatsAppBtn').addEventListener('click', () => {
        enviarPedidoWhatsApp();
    });

    document.getElementById('produtosGrid').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-comprar')) {
            const id = e.target.dataset.id;
            adicionarAoCarrinho(id);
        }
        if (e.target.classList.contains('btn-whatsapp-produto')) {
            const id = e.target.dataset.id;
            const produto = produtosData.find(p => p.id === id);
            if (produto) {
                enviarProdutoWhatsApp(produto);
            }
        }
    });

    // Também para a grid de mais vendidos (se existir)
    document.getElementById('maisVendidosGrid')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-comprar')) {
            adicionarAoCarrinho(e.target.dataset.id);
        }
        if (e.target.classList.contains('btn-whatsapp-produto')) {
            const id = e.target.dataset.id;
            const produto = produtosData.find(p => p.id === id);
            if (produto) {
                enviarProdutoWhatsApp(produto);
            }
        }
    });
}

// ---- WHATSAPP ----
function enviarProdutoWhatsApp(produto) {
    const numero = '555195886282'; // Seu número com DDD e país
    const mensagem = `Oi atendimento R.H.S vim comprar ${produto.nome}

📦 *Produto:* ${produto.nome}
💰 *Preço:* R$ ${parseFloat(produto.preco).toFixed(2)}
📋 *Descrição:* ${produto.descricao || 'Produto digital de qualidade'}
📂 *Categoria:* ${produto.categoria || 'Geral'}
📥 *Entrega:* ${produto.entrega || 'Imediata'}

Quero finalizar a compra! 🚀`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

function enviarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    const numero = '555195886282';
    let itensMensagem = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        const preco = parseFloat(item.preco || 0);
        total += preco;
        itensMensagem += `${index + 1}. ${item.nome} - R$ ${preco.toFixed(2)}\n`;
    });

    const mensagem = `🛒 *NOVO PEDIDO - R.H.S VENDAS*

*Produtos:*
${itensMensagem}

*Total: R$ ${total.toFixed(2)}*

*Dados do cliente:*
👤 Nome: [Seu nome aqui]
📱 WhatsApp: [Seu WhatsApp aqui]
📧 E-mail: [Seu e-mail aqui]

*Forma de pagamento:* [PIX / Cartão / Boleto]

Aguardando confirmação! 🚀`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    fecharCarrinho();
}

// ---- CARRINHO (abrir/fechar/adicionar) ----
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
        exibirMaisVendidos(produtos);
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
    if (!grid) return;
    if (lista.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;">Nenhum produto encontrado</p>';
        return;
    }
    grid.innerHTML = lista.map(p => criarCardProduto(p)).join('');
}

function exibirMaisVendidos(produtos) {
    const grid = document.getElementById('maisVendidosGrid');
    if (!grid) return;
    // Pega os 4 primeiros como exemplo de mais vendidos
    const maisVendidos = produtos.slice(0, 4);
    grid.innerHTML = maisVendidos.map(p => criarCardProduto(p)).join('');
}

function criarCardProduto(p) {
    const precoAntigo = p.precoAntigo ? `<span class="preco-antigo">R$ ${parseFloat(p.precoAntigo).toFixed(2)}</span>` : '';
    const badge = p.badge ? `<span class="badge">${p.badge}</span>` : '';
    const vendedor = p.vendedor ? `<span class="vendedor">${p.vendedor}</span>` : '';
    return `
        <div class="card-produto">
            <img src="${p.imagem || 'https://placehold.co/400x400/1a1025/a78bfa?text=Imagem'}" alt="${p.nome}" loading="lazy" />
            ${badge}
            <h3>${p.nome}</h3>
            ${vendedor}
            <div class="preco">
                ${precoAntigo}
                R$ ${parseFloat(p.preco).toFixed(2)}
            </div>
            <div class="produto-actions">
                <button class="btn-comprar" data-id="${p.id}">🛒 Comprar</button>
                <button class="btn-whatsapp-produto" data-id="${p.id}">💬 WhatsApp</button>
            </div>
        </div>
    `;
}

function atualizarCategorias(produtos) {
    const container = document.getElementById('categoriasContainer');
    if (!container) return;
    const cats = ['todos', ...new Set(produtos.map(p => p.categoria).filter(Boolean))];
    container.innerHTML = cats.map(c => `
        <button class="cat-btn ${c === 'todos' ? 'active' : ''}" data-cat="${c}">
            ${c === 'todos' ? '⚡ Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
        </button>
    `).join('');

    container.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.cat;
            const busca = document.getElementById('searchInput')?.value.trim() || '';
            carregarProdutos(cat, busca);
        });
    });
}

function configurarBuscaECategorias() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
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
