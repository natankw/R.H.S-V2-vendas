// ============================
// BANCO DE DADOS LOCAL (localStorage)
// ============================

const STORAGE_PRODUTOS = 'rhs_produtos';
const STORAGE_PEDIDOS = 'rhs_pedidos';
const STORAGE_ADMIN = 'rhs_admin';

// --- Dados iniciais ---
function inicializarDados() {
    if (!localStorage.getItem(STORAGE_PRODUTOS)) {
        const produtosExemplo = [
            {
                id: '1',
                nome: 'Discord Nitro Full — 1 Mês (Ativação Direta)',
                imagem: 'https://placehold.co/400x400/1a1025/a78bfa?text=Nitro',
                categoria: 'contas',
                descricao: 'Ativação direta na sua conta Discord. Entrega automática em segundos.',
                preco: 14.90,
                precoAntigo: 49.90,
                tipo: 'Ativação',
                entrega: 'Automática',
                vendedor: 'RHS_Oficial',
                badge: '💜 Mais Vendido',
                metodoPagamento: 'whatsapp'
            },
            {
                id: '2',
                nome: 'Spotify Premium Individual 1 Ano',
                imagem: 'https://placehold.co/400x400/1a1025/a78bfa?text=Spotify',
                categoria: 'streaming',
                descricao: 'Conta premium individual com 1 ano de assinatura garantida.',
                preco: 45.90,
                precoAntigo: 120.00,
                tipo: 'Conta',
                entrega: 'Automática',
                vendedor: 'MasterKeys',
                badge: '🎧 Promoção',
                metodoPagamento: 'whatsapp'
            },
            {
                id: '3',
                nome: 'Conta Valorant Nível 50 + Skins Raras',
                imagem: 'https://placehold.co/400x400/1a1025/a78bfa?text=Valorant',
                categoria: 'contas',
                descricao: 'Conta level 50 com skins exclusivas e agentes desbloqueados.',
                preco: 89.00,
                precoAntigo: null,
                tipo: 'Conta',
                entrega: 'Manual',
                vendedor: 'ViperVendas',
                badge: '🎯 Estoque baixo',
                metodoPagamento: 'mercadopago'
            }
        ];
        localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(produtosExemplo));
    }
    if (!localStorage.getItem(STORAGE_PEDIDOS)) {
        localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify([]));
    }
}
inicializarDados();

// --- CRUD Produtos ---
function getProdutos() {
    return new Promise((resolve) => {
        const data = JSON.parse(localStorage.getItem(STORAGE_PRODUTOS) || '[]');
        resolve(data);
    });
}

function getProduto(id) {
    return new Promise((resolve) => {
        const produtos = JSON.parse(localStorage.getItem(STORAGE_PRODUTOS) || '[]');
        const produto = produtos.find(p => p.id === id);
        resolve(produto || null);
    });
}

function addProduto(produto) {
    return new Promise((resolve) => {
        const produtos = JSON.parse(localStorage.getItem(STORAGE_PRODUTOS) || '[]');
        const novo = { ...produto, id: Date.now().toString() };
        produtos.push(novo);
        localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(produtos));
        resolve(novo);
    });
}

function updateProduto(id, dados) {
    return new Promise((resolve) => {
        const produtos = JSON.parse(localStorage.getItem(STORAGE_PRODUTOS) || '[]');
        const index = produtos.findIndex(p => p.id === id);
        if (index !== -1) {
            produtos[index] = { ...produtos[index], ...dados };
            localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(produtos));
        }
        resolve();
    });
}

function deleteProduto(id) {
    return new Promise((resolve) => {
        let produtos = JSON.parse(localStorage.getItem(STORAGE_PRODUTOS) || '[]');
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(produtos));
        resolve();
    });
}

// --- CRUD Pedidos ---
function getPedidos() {
    return new Promise((resolve) => {
        const data = JSON.parse(localStorage.getItem(STORAGE_PEDIDOS) || '[]');
        resolve(data);
    });
}

function addPedido(pedido) {
    return new Promise((resolve) => {
        const pedidos = JSON.parse(localStorage.getItem(STORAGE_PEDIDOS) || '[]');
        const novo = { ...pedido, id: Date.now().toString() };
        pedidos.push(novo);
        localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify(pedidos));
        resolve(novo);
    });
}

function updatePedido(id, dados) {
    return new Promise((resolve) => {
        const pedidos = JSON.parse(localStorage.getItem(STORAGE_PEDIDOS) || '[]');
        const index = pedidos.findIndex(p => p.id === id);
        if (index !== -1) {
            pedidos[index] = { ...pedidos[index], ...dados };
            localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify(pedidos));
        }
        resolve();
    });
}

// ==========================================
// 🔐 AUTENTICAÇÃO - NOVAS CREDENCIAIS
// ==========================================

const ADMIN_USER = 'rhs@gmail.com';     // ← NOVO USUÁRIO
const ADMIN_PASS = 'rhsbotarkkpramama'; // ← NOVA SENHA

function loginAdmin(email, senha) {
    return new Promise((resolve, reject) => {
        if (email === ADMIN_USER && senha === ADMIN_PASS) {
            localStorage.setItem(STORAGE_ADMIN, 'true');
            resolve({ user: { email: ADMIN_USER } });
        } else {
            reject(new Error('Credenciais inválidas'));
        }
    });
}

function logoutAdmin() {
    return new Promise((resolve) => {
        localStorage.removeItem(STORAGE_ADMIN);
        resolve();
    });
}

function isAdminLogged() {
    return localStorage.getItem(STORAGE_ADMIN) === 'true';
}

// Exportar
window.getProdutos = getProdutos;
window.getProduto = getProduto;
window.addProduto = addProduto;
window.updateProduto = updateProduto;
window.deleteProduto = deleteProduto;
window.getPedidos = getPedidos;
window.addPedido = addPedido;
window.updatePedido = updatePedido;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.isAdminLogged = isAdminLogged;
