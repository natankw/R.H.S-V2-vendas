let currentUser = null;
let produtos = [];
let pedidos = [];

document.addEventListener('DOMContentLoaded', () => {
    if (isAdminLogged()) {
        mostrarPainel();
    } else {
        document.getElementById('loginArea').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const senha = document.getElementById('adminPassword').value;
        try {
            await loginAdmin(email, senha);
            mostrarPainel();
        } catch (err) {
            alert('Erro: ' + err.message);
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await logoutAdmin();
        document.getElementById('loginArea').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
    });

    // Abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById('tabProdutos').style.display = tab === 'produtos' ? 'block' : 'none';
            document.getElementById('tabPedidos').style.display = tab === 'pedidos' ? 'block' : 'none';
            if (tab === 'produtos') renderizarProdutosAdmin();
            if (tab === 'pedidos') renderizarPedidosAdmin();
        });
    });

    // Modal - Adicionar/Editar
    const modal = document.getElementById('produtoModal');
    document.getElementById('addProdutoBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Novo Produto';
        document.getElementById('produtoId').value = '';
        document.getElementById('produtoForm').reset();
        document.getElementById('metodoPagamentoSelect').value = 'whatsapp'; // padrão
        modal.classList.add('active');
    });
    document.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    document.getElementById('produtoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('produtoId').value;
        const dados = {
            nome: document.getElementById('pNome').value.trim(),
            imagem: document.getElementById('pImagem').value.trim(),
            categoria: document.getElementById('pCategoria').value.trim(),
            descricao: document.getElementById('pDescricao').value.trim(),
            preco: parseFloat(document.getElementById('pPreco').value),
            precoAntigo: document.getElementById('pPrecoAntigo').value ? parseFloat(document.getElementById('pPrecoAntigo').value) : null,
            tipo: document.getElementById('pTipo').value.trim(),
            entrega: document.getElementById('pEntrega').value.trim(),
            vendedor: document.getElementById('pVendedor').value.trim(),
            badge: document.getElementById('pBadge').value.trim(),
            metodoPagamento: document.getElementById('metodoPagamentoSelect').value // 'whatsapp' ou 'mercadopago'
        };
        try {
            if (id) await updateProduto(id, dados);
            else await addProduto(dados);
            modal.classList.remove('active');
            carregarDados();
        } catch (err) {
            alert('Erro: ' + err.message);
        }
    });
});

function mostrarPainel() {
    document.getElementById('loginArea').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    carregarDados();
}

async function carregarDados() {
    try {
        produtos = await getProdutos();
        pedidos = await getPedidos();
        renderizarProdutosAdmin();
        renderizarPedidosAdmin();
    } catch (err) { console.error(err); }
}

function renderizarProdutosAdmin() {
    const container = document.getElementById('produtosAdminList');
    if (!produtos.length) {
        container.innerHTML = '<p style="color:#94a3b8;">Nenhum produto cadastrado.</p>';
        return;
    }
    container.innerHTML = produtos.map(p => `
        <div class="admin-item">
            <div class="info">
                <img src="${p.imagem || 'https://placehold.co/60x60/1a1025/a78bfa?text=Img'}" />
                <div>
                    <strong>${p.nome}</strong>
                    <span style="color:#a78bfa;">R$ ${parseFloat(p.preco).toFixed(2)}</span>
                    <span style="color:#94a3b8;font-size:0.8rem;margin-left:8px;">${p.categoria || ''}</span>
                    <span style="color:#25d366;font-size:0.7rem;margin-left:8px;">${p.metodoPagamento === 'whatsapp' ? '💬 WhatsApp' : '💳 Mercado Pago'}</span>
                </div>
            </div>
            <div class="actions">
                <button class="edit" data-id="${p.id}">✏️</button>
                <button class="delete" data-id="${p.id}">🗑️</button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const p = produtos.find(prod => prod.id === id);
            if (!p) return;
            document.getElementById('modalTitle').textContent = 'Editar Produto';
            document.getElementById('produtoId').value = p.id;
            document.getElementById('pNome').value = p.nome || '';
            document.getElementById('pImagem').value = p.imagem || '';
            document.getElementById('pCategoria').value = p.categoria || '';
            document.getElementById('pDescricao').value = p.descricao || '';
            document.getElementById('pPreco').value = p.preco || '';
            document.getElementById('pPrecoAntigo').value = p.precoAntigo || '';
            document.getElementById('pTipo').value = p.tipo || '';
            document.getElementById('pEntrega').value = p.entrega || '';
            document.getElementById('pVendedor').value = p.vendedor || '';
            document.getElementById('pBadge').value = p.badge || '';
            document.getElementById('metodoPagamentoSelect').value = p.metodoPagamento || 'whatsapp';
            document.getElementById('produtoModal').classList.add('active');
        });
    });

    container.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Tem certeza?')) {
                await deleteProduto(btn.dataset.id);
                carregarDados();
            }
        });
    });
}

function renderizarPedidosAdmin() {
    const container = document.getElementById('pedidosAdminList');
    if (!pedidos.length) {
        container.innerHTML = '<p style="color:#94a3b8;">Nenhum pedido.</p>';
        return;
    }
    container.innerHTML = pedidos.map(p => {
        const data = new Date(p.data).toLocaleDateString('pt-BR');
        const statusClass = p.status === 'entregue' ? 'entregue' : '';
        return `
            <div class="admin-item">
                <div class="info">
                    <div>
                        <strong>${p.cliente}</strong><br />
                        <span style="color:#94a3b8;">${p.itens.map(i => i.nome).join(', ')}</span><br />
                        <span style="color:#64748b;font-size:0.8rem;">${data} - R$ ${parseFloat(p.valor).toFixed(2)}</span>
                        <span style="color:#a78bfa;font-size:0.7rem;margin-left:8px;">${p.metodo || 'pix'}</span>
                    </div>
                    <span class="status-pedido ${statusClass}">${p.status || 'pendente'}</span>
                </div>
                <div class="actions">
                    <a href="https://wa.me/55${p.whatsapp.replace(/\D/g,'')}?text=Olá%20${p.cliente}%2C%20seu%20pedido%20na%20R.H.S%20VENDAS%20foi%20confirmado%21%20🚀" 
                       target="_blank" class="whatsapp-link">💬 WhatsApp</a>
                    ${p.status !== 'entregue' ? `<button class="btn-secondary" data-id="${p.id}">✅ Entregue</button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', async () => {
            await updatePedido(btn.dataset.id, { status: 'entregue' });
            carregarDados();
        });
    });
          }
