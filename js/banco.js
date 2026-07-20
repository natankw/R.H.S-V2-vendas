// ============================
// BANCO DE DADOS LOCAL (localStorage)
// ============================

const STORAGE_PRODUTOS = 'rhs_produtos';
const STORAGE_PEDIDOS = 'rhs_pedidos';
const STORAGE_ADMIN = 'rhs_admin';

// --- Dados iniciais (se não existirem) ---
function inicializarDados() {
  if (!localStorage.getItem(STORAGE_PRODUTOS)) {
    const produtosExemplo = [
      {
        id: '1',
        nome: 'Template React Avançado',
        imagem: 'https://placehold.co/400x400/f1f5f9/2563eb?text=React',
        categoria: 'templates',
        descricao: 'Template completo com hooks, context API e roteamento.',
        preco: 79.90,
        tipo: 'Template',
        entrega: 'Download imediato'
      },
      {
        id: '2',
        nome: 'Curso de JavaScript Moderno',
        imagem: 'https://placehold.co/400x400/f1f5f9/2563eb?text=JS',
        categoria: 'cursos',
        descricao: 'Do zero ao avançado com ES6+ e boas práticas.',
        preco: 149.90,
        tipo: 'Curso',
        entrega: 'Acesso via e-mail'
      },
      {
        id: '3',
        nome: 'Ebook Design System',
        imagem: 'https://placehold.co/400x400/f1f5f9/2563eb?text=Ebook',
        categoria: 'ebooks',
        descricao: 'Guia completo para criar sistemas de design escaláveis.',
        preco: 39.90,
        tipo: 'Ebook',
        entrega: 'Download em PDF'
      }
    ];
    localStorage.setItem(STORAGE_PRODUTOS, JSON.stringify(produtosExemplo));
  }
  if (!localStorage.getItem(STORAGE_PEDIDOS)) {
    localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify([]));
  }
}
inicializarDados();

// --- Funções CRUD Produtos ---
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

// --- Funções CRUD Pedidos ---
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

// --- Autenticação (local) ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

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

// Verifica se já está logado (usado no admin.js)
function isAdminLogged() {
  return localStorage.getItem(STORAGE_ADMIN) === 'true';
                     }
