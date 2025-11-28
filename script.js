document.addEventListener('DOMContentLoaded', function() {
  
    // =================================================================
    // 1. VARIÁVEIS GLOBAIS
    // =================================================================
    let catalogoProdutos = []; 
    let carrinho = JSON.parse(localStorage.getItem('cart')) || [];
  
    // LINK DO BACK END NO RENDER (ATUALIZADO!)
    const API_URL = 'https://loja-api-72te.onrender.com';

    // Elementos da Interface
    const containerProdutos = document.querySelector('.grid');
    const linksCategoria = document.querySelectorAll('.cat-link');
    const cartIcon = document.getElementById("cart-icon");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElem = document.getElementById("cart-total");
    const cartBadge = document.getElementById('cart-count-badge');
  
    // =================================================================
    // 2. BUSCAR PRODUTOS (DO RENDER)
    // =================================================================
    async function carregarProdutos() {
      try {
          if (containerProdutos) containerProdutos.innerHTML = '<p style="padding:2rem;">Carregando produtos...</p>';
  
          // Usa a variável API_URL
          const response = await fetch(`${API_URL}/api/produtos`);
          catalogoProdutos = await response.json();
          
          if (containerProdutos) {
               renderizarCatalogo(catalogoProdutos);
          }
      } catch (erro) {
          console.error("Erro ao buscar produtos:", erro);
          if (containerProdutos) containerProdutos.innerHTML = '<p>Erro ao carregar. O servidor pode estar "dormindo" (Render demora uns 30s para acordar). Recarregue a página.</p>';
      }
    }
  
    // =================================================================
    // 3. LÓGICA DA PÁGINA PRINCIPAL
    // =================================================================
    function renderizarCatalogo(produtos) {
        if (!containerProdutos) return;
        containerProdutos.innerHTML = '';
        
        produtos.forEach(produto => {
          containerProdutos.innerHTML += `
            <div class="card" data-id="${produto.id}">
              <img src="${produto.img}" alt="${produto.nome}">
              <div class="card-content">
                <h3 class="nome">${produto.nome}</h3>
                <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                <button class="btn-adicionar">Adicionar ao Carrinho</button>
              </div>
            </div>
          `;
        });
        adicionarListenersAosCards();
    }
  
    function adicionarListenersAosCards() {
        document.querySelectorAll('.btn-adicionar').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const idProduto = card.dataset.id;
            adicionarProdutoAoCarrinho(idProduto, btn);
          });
        });
    }
  
    if (linksCategoria) {
        linksCategoria.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                linksCategoria.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                const categoriaSelecionada = this.dataset.categoria;
                const produtosFiltrados = categoriaSelecionada === 'todos' 
                    ? catalogoProdutos 
                    : catalogoProdutos.filter(p => p.categoria === categoriaSelecionada);
                
                renderizarCatalogo(produtosFiltrados);
            });
        });
    }
  
    // =================================================================
    // 4. LÓGICA DO CARRINHO
    // =================================================================
    function adicionarProdutoAoCarrinho(idProduto, btnElement) {
        const produto = catalogoProdutos.find(p => p.id == idProduto);
        if (!produto) return;
  
        const itemExistente = carrinho.find(item => item.id == idProduto);
        if (itemExistente) {
          itemExistente.qtd++;
        } else {
          carrinho.push({ ...produto, qtd: 1 });
        }
        
        salvarCarrinho();
        atualizarInterfaceCarrinho();
        abrirCarrinho();
        
        if (btnElement) {
          const textoOriginal = btnElement.innerText;
          btnElement.innerText = 'Adicionado ✓';
          btnElement.style.background = '#28a745';
          setTimeout(() => {
              btnElement.innerText = textoOriginal;
              btnElement.style.background = '';
          }, 1500);
        }
    }
  
    function salvarCarrinho() {
      localStorage.setItem('cart', JSON.stringify(carrinho));
    }
  
    function atualizarInterfaceCarrinho() {
        atualizarContadorBadge();
        if (cartItemsContainer) renderizarCarrinhoLateral();
        if (document.getElementById('checkout-itens-container')) renderizarCheckoutPage();
    }
  
    function atualizarContadorBadge() {
        if (!cartBadge) return;
        const total = carrinho.reduce((acc, item) => acc + item.qtd, 0);
        cartBadge.innerText = total;
        cartBadge.classList.toggle('visible', total > 0);
    }
  
    function renderizarCarrinhoLateral() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        carrinho.forEach(item => {
          total += item.preco * item.qtd;
          cartItemsContainer.innerHTML += `
              <div class="cart-item">
                  <img src="${item.img}" alt="${item.nome}">
                  <div class="cart-item-info">
                      <span>${item.nome}</span>
                      <span>Qtd: ${item.qtd}</span>
                  </div>
                  <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
              </div>
          `;
        });
        
        if (cartTotalElem) cartTotalElem.textContent = total.toFixed(2).replace('.', ',');
    }
  
    function abrirCarrinho() { 
        if(cartDrawer) cartDrawer.classList.add("ativo"); 
        if(cartOverlay) cartOverlay.classList.add("ativo"); 
    }
    
    function fecharCarrinho() { 
        if(cartDrawer) cartDrawer.classList.remove("ativo"); 
        if(cartOverlay) cartOverlay.classList.remove("ativo"); 
    }
    
    if(cartIcon) cartIcon.addEventListener("click", (e) => { e.preventDefault(); abrirCarrinho(); });
    if(closeCartBtn) closeCartBtn.addEventListener("click", fecharCarrinho);
    if(cartOverlay) cartOverlay.addEventListener("click", fecharCarrinho);
  
    // =================================================================
    // 5. PÁGINA DE CHECKOUT (Carrinho.html)
    // =================================================================
    const containerCheckout = document.getElementById('checkout-itens-container');
    const btnFinalizarCheckout = document.getElementById('finalizar-pedido-btn');
    const btnLimpar = document.getElementById('limpar-carrinho-btn');
  
    function renderizarCheckoutPage() {
        if (!containerCheckout) return;
        
        containerCheckout.innerHTML = '';
        const subtotalElem = document.getElementById('resumo-subtotal');
        const totalElem = document.getElementById('resumo-total');
        const freteElem = document.getElementById('resumo-frete');
        const FRETE = 15.00;
  
        if (carrinho.length === 0) {
            containerCheckout.innerHTML = '<p>Seu carrinho está vazio.</p>';
            if(btnFinalizarCheckout) btnFinalizarCheckout.disabled = true;
            return;
        }
  
        if(btnFinalizarCheckout) btnFinalizarCheckout.disabled = false;
        
        let subtotal = 0;
        
        carrinho.forEach(item => {
            subtotal += item.preco * item.qtd;
            containerCheckout.innerHTML += `
              <div class="item-carrinho">
                <img src="${item.img}" alt="${item.nome}">
                <div class="item-detalhes">
                  <strong>${item.nome}</strong>
                  <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                  <div class="controle-qtd">
                    <button class="btn-qtd diminuir" data-id="${item.id}">-</button>
                    <span>${item.qtd}</span>
                    <button class="btn-qtd aumentar" data-id="${item.id}">+</button>
                  </div>
                </div>
                <div class="item-acoes">
                  <p><strong>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</strong></p>
                  <button class="btn-remover" data-id="${item.id}" title="Remover item">🗑️</button>
                </div>
              </div>
            `;
        });
  
        const total = subtotal + FRETE;
        if(subtotalElem) subtotalElem.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if(freteElem) freteElem.innerText = `R$ ${FRETE.toFixed(2).replace('.', ',')}`;
        if(totalElem) totalElem.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
  
        adicionarListenersCheckout();
    }
  
    function adicionarListenersCheckout() {
        document.querySelectorAll('.aumentar').forEach(btn => btn.addEventListener('click', () => alterarQtd(btn.dataset.id, 1)));
        document.querySelectorAll('.diminuir').forEach(btn => btn.addEventListener('click', () => alterarQtd(btn.dataset.id, -1)));
        document.querySelectorAll('.btn-remover').forEach(btn => btn.addEventListener('click', () => removerItem(btn.dataset.id)));
    }
  
    function alterarQtd(id, delta) {
        const item = carrinho.find(p => p.id == id);
        if (item) {
            item.qtd += delta;
            if (item.qtd <= 0) removerItem(id);
            else {
                salvarCarrinho();
                atualizarInterfaceCarrinho();
            }
        }
    }
  
    function removerItem(id) {
        carrinho = carrinho.filter(p => p.id != id);
        salvarCarrinho();
        atualizarInterfaceCarrinho();
    }
  
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            if(confirm("Esvaziar carrinho?")) {
                carrinho = [];
                salvarCarrinho();
                atualizarInterfaceCarrinho();
            }
        });
    }
  
    // =================================================================
    // 6. BOTÃO DE PAGAMENTO (CONECTADO AO RENDER)
    // =================================================================
    if (btnFinalizarCheckout) {
        const novoBtn = btnFinalizarCheckout.cloneNode(true);
        btnFinalizarCheckout.parentNode.replaceChild(novoBtn, btnFinalizarCheckout);
  
        novoBtn.addEventListener('click', async () => {
            if (carrinho.length === 0) return alert('Carrinho vazio!');
            
            novoBtn.innerText = "Processando...";
            novoBtn.disabled = true;
            novoBtn.style.opacity = "0.7";
  
            try {
                // AGORA CHAMA O RENDER
                const resposta = await fetch(`${API_URL}/api/criar-pagamento`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        itensDoCarrinho: carrinho
                    })
                });
  
                const dados = await resposta.json();
                
                if (dados.url_pagamento) {
                    window.location.href = dados.url_pagamento;
                } else {
                    alert('Erro: ' + (dados.erro || 'Erro desconhecido'));
                    novoBtn.innerText = "Tentar Novamente";
                    novoBtn.disabled = false;
                }
  
            } catch (erro) {
                console.error(erro);
                alert('Erro de conexão. O servidor online pode estar inicializando, tente de novo em 30 segundos.');
                novoBtn.innerText = "Confirmar Pedido";
                novoBtn.disabled = false;
                novoBtn.style.opacity = "1";
            }
        });
    }
  
    carregarProdutos(); 
    atualizarInterfaceCarrinho(); 
});