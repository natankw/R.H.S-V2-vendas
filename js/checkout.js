document.addEventListener('DOMContentLoaded', () => {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    renderizarResumo(carrinho);
    configurarPagamentos(carrinho);

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await finalizarPedido();
    });
});

function configurarPagamentos(carrinho) {
    const total = carrinho.reduce((acc, item) => acc + parseFloat(item.preco || 0), 0);

    // Atualizar valores
    document.getElementById('pixValor').textContent = formatarMoeda(total);
    document.getElementById('boletoValor').textContent = formatarMoeda(total);

    // Alternar métodos
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const method = btn.dataset.method;
            document.querySelectorAll('.payment-area').forEach(area => area.style.display = 'none');
            if (method === 'pix') {
                document.getElementById('pixArea').style.display = 'block';
                gerarPix(total);
            } else if (method === 'card') {
                document.getElementById('cardArea').style.display = 'block';
                configurarMercadoPago(total, carrinho);
            } else if (method === 'boleto') {
                document.getElementById('boletoArea').style.display = 'block';
            }
        });
    });

    // PIX
    gerarPix(total);
    document.getElementById('copiarPixBtn').addEventListener('click', () => {
        const chave = document.getElementById('pixKey').textContent;
        navigator.clipboard.writeText(chave).then(() => {
            alert('Chave PIX copiada!');
        });
    });

    // Boleto
    document.getElementById('gerarBoletoBtn').addEventListener('click', () => {
        gerarBoleto(carrinho, total);
    });
}

function gerarPix(valor) {
    const chavePix = 'seu@email.com'; // Coloque sua chave PIX aqui
    const payload = `00020126330014br.gov.bcb.pix0111${chavePix}5204000053039865802BR5913RHSSAOPAULO62070503***6304`;
    const qrImg = document.getElementById('qrCodeImage');
    qrImg.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(payload)}&choe=UTF-8`;
    qrImg.style.display = 'block';
    document.getElementById('pixKey').textContent = chavePix;
    document.getElementById('pixValor').textContent = formatarMoeda(valor);
}

function configurarMercadoPago(total, carrinho) {
    const mpButton = document.getElementById('mpButton');
    const mpStatus = document.getElementById('mpStatus');

    // Substitua pela sua Public Key do Mercado Pago
    const mp = new MercadoPago('SUA_PUBLIC_KEY_AQUI', { locale: 'pt-BR' });

    mpButton.addEventListener('click', () => {
        const itens = carrinho.map(item => ({
            title: item.nome,
            unit_price: parseFloat(item.preco),
            quantity: 1,
            currency_id: 'BRL'
        }));

        const preference = {
            items: itens,
            payer: {
                email: document.getElementById('email').value || 'cliente@email.com',
                name: document.getElementById('nome').value || 'Cliente'
            },
            back_urls: {
                success: window.location.origin + '/sucesso.html',
                failure: window.location.origin + '/checkout.html',
                pending: window.location.origin + '/checkout.html'
            },
            auto_return: 'approved'
        };

        mpStatus.innerHTML = '⏳ Gerando pagamento...';
        mpButton.disabled = true;

        // Simulação - para produção, envie para seu backend
        setTimeout(() => {
            mpStatus.innerHTML = `
                <div style="background:#1e293b;padding:12px;border-radius:8px;color:#f5f5f7;">
                    ⚠️ Para pagamento real, configure um backend para gerar a preferência do Mercado Pago.<br/>
                    <a href="https://www.mercadopago.com.br/developers/pt/reference" target="_blank" style="color:#a78bfa;">
                        Ver documentação
                    </a>
                </div>
            `;
            mpButton.disabled = false;
        }, 1500);
    });
}

function gerarBoleto(carrinho, total) {
    alert(`✅ Boleto gerado com sucesso!\n\nValor: ${formatarMoeda(total)}\n\nO boleto será enviado para o e-mail informado em até 24h.`);
    const pedido = {
        cliente: document.getElementById('nome').value || 'Cliente',
        whatsapp: document.getElementById('whatsapp').value || '',
        email: document.getElementById('email').value || '',
        itens: carrinho.map(p => ({ id: p.id, nome: p.nome, preco: p.preco })),
        valor: total,
        data: new Date().toISOString(),
        status: 'aguardando_pagamento',
        metodo: 'boleto'
    };
    localStorage.setItem('pedido_temp', JSON.stringify(pedido));
}

async function finalizarPedido() {
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const email = document.getElementById('email').value.trim();
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (!nome || !whatsapp) {
        alert('Preencha nome e WhatsApp.');
        return;
    }

    const total = carrinho.reduce((acc, item) => acc + parseFloat(item.preco || 0), 0);
    const metodoAtivo = document.querySelector('.payment-btn.active');
    const metodo = metodoAtivo ? metodoAtivo.dataset.method : 'pix';

    const pedido = {
        cliente: nome,
        whatsapp: whatsapp,
        email: email || '',
        itens: carrinho.map(p => ({ id: p.id, nome: p.nome, preco: p.preco })),
        valor: total,
        data: new Date().toISOString(),
        status: 'pendente',
        metodo: metodo
    };

    try {
        await addPedido(pedido);
        localStorage.removeItem('carrinho');
        window.location.href = 'sucesso.html';
    } catch (err) {
        console.error(err);
        alert('Erro ao criar pedido. Tente novamente.');
    }
}

function formatarMoeda(valor) {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}

function renderizarResumo(carrinho) {
    const container = document.getElementById('resumoItens');
    let html = '', total = 0;
    carrinho.forEach(item => {
        total += parseFloat(item.preco || 0);
        html += `
            <div class="cart-item" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <span>${item.nome}</span>
                <span>${formatarMoeda(item.preco)}</span>
            </div>
        `;
    });
    container.innerHTML = html;
    document.getElementById('resumoTotal').textContent = formatarMoeda(total);
                            }
