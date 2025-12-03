// Substituir o script.js atual por este.
// Objetivo: usar as URLs corretas por produto e fallback por categoria caso alguma imagem falhe.

document.addEventListener('DOMContentLoaded', function() {

  // =================================================================
  // CATALOGO (URLs correspondentes aos produtos)
  // =================================================================
  const catalogoProdutos = [
    { id: 1, nome: 'Fone Bluetooth JBL', preco: 249.90, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    { id: 2, nome: 'Smartwatch Xiaomi Mi Band 7', preco: 299.90, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
    { id: 3, nome: 'Camiseta Minimalista Branca', preco: 79.90, categoria: 'roupas', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80' },
    { id: 4, nome: 'Tênis Nike Revolution', preco: 329.90, categoria: 'calcados', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80' },
    { id: 5, nome: 'Notebook Gamer Dell G15', preco: 5499.00, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80' },
    { id: 6, nome: 'Óculos de Sol Ray-Ban Aviator', preco: 650.00, categoria: 'acessorios', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80' },
    { id: 7, nome: 'Livro "Milk and honey"', preco: 34.90, categoria: 'livros', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80' },
    { id: 8, nome: 'Caderneta', preco: 399.00, categoria: 'acessorios', img: 'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?auto=format&fit=crop&w=600&q=80' },
    { id: 9, nome: 'Relógio Casio Vintage', preco: 250.00, categoria: 'acessorios', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80' },
    { id: 10, nome: 'Bola de Basquete Wilson NBA', preco: 149.90, categoria: 'esporte', img: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80' },
    { id: 11, nome: 'Vestido Floral de Verão', preco: 199.90, categoria: 'roupas', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
    { id: 12, nome: 'Caixa de Som Bluetooth JBL', preco: 350.00, categoria: 'eletronicos', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80' },
    { id: 13, nome: 'Maquiagem', preco: 49.90, categoria: 'acessorios', img: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=600&q=80' },
  ];

  let carrinho = JSON.parse(localStorage.getItem('cart')) || [];

  // =================================================================
  // Fallback por categoria (URLs estáveis). São usadas apenas se a original falhar.
  // Troque essas URLs por assets locais se preferir armazenar no repo.
  // =================================================================
  const categoryFallbacks = {
    roupas: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    calcados: 'https://images.unsplash.com/photo-1587563871167-1ee7c735df57?auto=format&fit=crop&w=600&q=80',
    eletronicos: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    acessorios: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
    livros: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    casa: 'https://images.unsplash.com/photo-1598550476439-6847785f5533?auto=format&fit=crop&w=600&q=80',
    esporte: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80'
  };

  // handler global para onerror das <img> (aplica fallback por categoria)
  function handleImageError(imgEl, categoria) {
    try {
      imgEl.onerror = null;
      const fallback = categoryFallbacks[categoria] || Object.values(categoryFallbacks)[0];
      imgEl.src = fallback;
      imgEl.classList.add('img-fallback');
    } catch (e) {
      console.error('Erro no fallback de imagem', e);
    }
  }
  window.handleImageError = handleImageError;

  // =================================================================
  // Funções de render (mantive o comportamento existente)
  // =================================================================
  function renderizarCatalogo(produtos) {
    const containerProdutos = document.querySelector('.grid');
    if (!containerProdutos) return;
    containerProdutos.innerHTML = '';
    produtos.forEach(produto => {
      containerProdutos.innerHTML += `
        <div class="card" data-id="${produto.id}">
          <img class="produto-img" src="${produto.img}" alt="${produto.nome}" loading="lazy" onerror="handleImageError(this, '${produto.categoria}')">
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

  function adicionarProdutoAoCarrinho(idProduto, btnElement) {
    const produto = catalogoProdutos.find(p => p.id == idProduto);
    if (!produto) return;
    const itemExistente = carrinho.find(item => item.id == idProduto);
    if (itemExistente) itemExistente.qtd++;
    else carrinho.push({ ...produto, qtd: 1 });

    if (btnElement) {
      btnElement.innerHTML = 'Adicionado ✓';
      btnElement.classList.add('adicionado');
      setTimeout(() => {
        btnElement.innerHTML = 'Adicionar ao Carrinho';
        btnElement.classList.remove('adicionado');
      }, 1500);
    }

    salvarCarrinho();
    atualizarContadorCarrinho();
    renderizarCarrinhoLateral();
    abrirCarrinho();
  }

  function renderizarCarrinhoLateral() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElem = document.getElementById('cart-total');
    if (!cartItemsContainer || !cartTotalElem) return;
    cartItemsContainer.innerHTML = '';
    let total = 0;
    carrinho.forEach(item => {
      total += item.preco * item.qtd;
      cartItemsContainer.innerHTML += `
        <div class="cart-item">
          <img class="produto-img" src="${item.img}" alt="${item.nome}" loading="lazy" onerror="handleImageError(this, '${item.categoria}')">
          <div class="cart-item-info">
            <span>${item.nome}</span>
            <span>Qtd: ${item.qtd}</span>
          </div>
          <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
        </div>
      `;
    });
    cartTotalElem.textContent = total.toFixed(2).replace('.', ',');
  }

  function salvarCarrinho() {
    localStorage.setItem('cart', JSON.stringify(carrinho));
  }

  function atualizarContadorCarrinho() {
    const cartBadge = document.getElementById('cart-count-badge');
    if (!cartBadge) return;
    const totalItens = carrinho.reduce((t, i) => t + i.qtd, 0);
    if (totalItens > 0) {
      cartBadge.textContent = totalItens;
      cartBadge.classList.add('visible');
    } else {
      cartBadge.textContent = '';
      cartBadge.classList.remove('visible');
    }
  }

  function abrirCarrinho() { const cartDrawer = document.getElementById('cart-drawer'); const cartOverlay = document.getElementById('cart-overlay'); if (cartDrawer) cartDrawer.classList.add('ativo'); if (cartOverlay) cartOverlay.classList.add('ativo'); }
  function fecharCarrinho() { const cartDrawer = document.getElementById('cart-drawer'); const cartOverlay = document.getElementById('cart-overlay'); if (cartDrawer) cartDrawer.classList.remove('ativo'); if (cartOverlay) cartOverlay.classList.remove('ativo'); }

  // ligações de categoria e inicialização
  const linksCategoria = document.querySelectorAll('.cat-link');
  if (linksCategoria) {
    linksCategoria.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        linksCategoria.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const categoriaSelecionada = this.dataset.categoria;
        const produtosFiltrados = categoriaSelecionada === 'todos' ? catalogoProdutos : catalogoProdutos.filter(p => p.categoria === categoriaSelecionada);
        renderizarCatalogo(produtosFiltrados);
      });
    });
  }

  // inicializa
  renderizarCatalogo(catalogoProdutos);
  atualizarContadorCarrinho();
  renderizarCarrinhoLateral();

  // Checkout (mantive lógica anterior — caso precise eu ajusto também)
  if (document.body.contains(document.querySelector('.checkout-container'))) {
    // ... deixe a lógica de checkout que você já tem aqui, usando os mesmos nomes de função se necessário
  }

});