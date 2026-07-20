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

        const precoAntigo = p.precoAntigo ? `<span class="preco-antigo">R$ ${parseFloat(p.precoAntigo).toFixed(2)}</span>` : '';

        const html = `
            <div class="produto-grid">
                <div class="produto-imagem">
                    <img src="${p.imagem || 'https://placehold.co/600x600/1a1025/a78bfa?text=Imagem'}" alt="${p.nome}" />
                </div>
                <div class="produto-info">
                    <span class="badge">${p.badge || ''}</span>
                    <h1>${p.nome}</h1>
                    <p class="produto-vendedor">${p.vendedor || 'R.H.S Oficial'} • ${p.categoria || 'Geral'}</p>
                    <div class="produto-preco">
                        ${precoAntigo}
                        <strong>R$ ${parseFloat(p.preco).toFixed(2)}</strong>
                    </div>
                    <p class="produto-descricao">${p.descricao || 'Sem descrição'}</p>
                    <div class="produto-detalhes">
                        <p><strong>Tipo:</strong> ${p.tipo || 'Não informado'}</p>
                        <p><strong>Entrega:</strong> ${p.entrega || 'Imediata'}</p>
                    </div>
                    <div class="produto-buttons">
                        <button class="btn-primary" id="btnComprarProduto" data-id="${p.id}">🛒 Comprar agora</button>
                        <button class="btn-whatsapp" id="btnWhatsAppProduto" data-id="${p.id}">💬 Comprar via WhatsApp</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('produtoDetalhe').innerHTML = html;

        document.getElementById('btnComprarProduto').addEventListener('click', () => {
            adicionarAoCarrinho(p.id);
            abrirCarrinho();
        });

        document.getElementById('btnWhatsAppProduto').addEventListener('click', () => {
            enviarProdutoWhatsApp(p);
        });

    } catch (err) {
        console.error(err);
        document.getElementById('produtoDetalhe').innerHTML = '<p>Erro ao carregar produto.</p>';
    }
}

// ---- WHATSAPP ----
function enviarProdutoWhatsApp(produto) {
    const numero = '555195886282';
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

// ---- CARRINHO (mesmas funções do loja.js, repetidas para autonomia) ----
function configurarCarrinho() {
    atualizarBadge();
    renderizarCarrinho();
    document.getElementById('cartBtn').addEventListener('click', abrirCarrinho);
    document.getElementById('closeCart').addEventListener('click', fecharCarrinho);
    document.getElementById('cartOverlay').addEventListener('click', fecharCarrinho);
    document.getElementById('finalizarWhatsAppBtn').addEventListener('click', () => {
        enviarPedidoWhatsApp();
    });
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

// (as demais funções de carrinho são idênticas às do loja.js, então copie-as para cá ou importe)
