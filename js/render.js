let currentCategory = "all";
let currentSearch = "";

function renderProductImage(product) {
  if (product.image) {
    return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`;
  }
  return `<span class="product-card__icon">${CATEGORY_ICONS[product.category] || "🍽"}</span>`;
}

function renderProductCard(product) {
  const soldOut = product.available === false;
  const badgeHtml = product.badge
    ? `<span class="badge ${soldOut ? "badge--sold-out" : ""}">${product.badge}</span>`
    : "";
  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-card__image product-card__image--${product.category} ${product.image ? "product-card__image--photo" : ""}">
        ${renderProductImage(product)}
      </div>
      ${badgeHtml}
      <div class="product-card__body">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__description">${product.description}</p>
        <div class="product-card__footer">
          <span class="product-card__price">${formatCurrency(product.price)}</span>
          <button class="btn btn--add" data-action="open-product" data-id="${product.id}" ${soldOut ? "disabled" : ""}>
            ${soldOut ? "Esgotado" : "+ Adicionar"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderFilterChips() {
  const container = document.getElementById("filter-chips");
  if (!container) return;
  const categories = ["all", ...Object.keys(CATEGORY_LABELS)];
  container.innerHTML = categories
    .map((cat) => {
      const label = cat === "all" ? "Todos" : CATEGORY_LABELS[cat];
      const active = cat === currentCategory ? "filter-chip--active" : "";
      return `<button class="filter-chip ${active}" data-category="${cat}">${label}</button>`;
    })
    .join("");
  container.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => setMenuCategory(chip.dataset.category));
  });
}

function renderMenu() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  const term = currentSearch.trim().toLowerCase();
  const filtered = PRODUCTS.filter((p) => {
    const matchesCategory = currentCategory === "all" || p.category === currentCategory;
    const matchesSearch = term === "" || p.name.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>Não encontramos esse produto.</p>
        <p>Tente outra busca.</p>
      </div>
    `;
    return;
  }
  grid.innerHTML = filtered.map(renderProductCard).join("");
}

function setMenuCategory(category) {
  currentCategory = category;
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("filter-chip--active", chip.dataset.category === category);
  });
  renderMenu();
}

function setMenuSearch(term) {
  currentSearch = term;
  renderMenu();
}

function renderFirstOrderBanner() {
  const el = document.getElementById("first-order-banner");
  if (!el) return;
  const discount = CONFIG.FIRST_ORDER_DISCOUNT;
  el.innerHTML = `
    <span class="first-order-banner__icon" aria-hidden="true">🎁</span>
    <span>Desconto de <strong>${discount.percent}%</strong> na primeira compra — identifique-se. Pedido mínimo ${formatCurrency(discount.minOrder)}.</span>
  `;
}

function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  const featured = PRODUCTS.filter((p) => p.featured);
  grid.innerHTML = featured.map(renderProductCard).join("");
}

function renderPromotions() {
  const grid = document.getElementById("promotions-grid");
  if (!grid) return;
  grid.innerHTML = PROMOTIONS.map((promo) => {
    const discountPercent = Math.round(
      ((promo.priceOriginal - promo.pricePromo) / promo.priceOriginal) * 100
    );
    return `
      <article class="promo-card">
        <div class="promo-card__image"><span>🔥</span></div>
        <span class="badge badge--promo">${promo.badge}</span>
        <div class="promo-card__body">
          <h3>${promo.name}</h3>
          <p>${promo.description}</p>
          <div class="promo-card__prices">
            <span class="promo-card__price-original">${formatCurrency(promo.priceOriginal)}</span>
            <span class="promo-card__price-promo">${formatCurrency(promo.pricePromo)}</span>
            <span class="promo-card__discount">-${discountPercent}%</span>
          </div>
          <button class="btn btn--primary btn--block" data-action="open-product" data-id="${promo.id}">APROVEITAR</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCartDrawer() {
  const container = document.getElementById("cart-items");
  const emptyState = document.getElementById("cart-empty");
  const summary = document.getElementById("cart-summary");
  const items = getCartItems();
  if (items.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "block";
    summary.style.display = "none";
    return;
  }
  emptyState.style.display = "none";
  summary.style.display = "block";
  container.innerHTML = items
    .map(
      (item) => `
    <div class="cart-item" data-cart-item-id="${item.cartItemId}">
      <div class="cart-item__info">
        <p class="cart-item__name">${escapeHtml(item.name)}</p>
        ${item.notes ? `<p class="cart-item__notes">${escapeHtml(item.notes)}</p>` : ""}
        <p class="cart-item__unit-price">${formatCurrency(item.unitPrice)} un.</p>
      </div>
      <div class="cart-item__controls">
        <button class="qty-btn" data-action="cart-decrease" data-cart-item-id="${item.cartItemId}" aria-label="Diminuir quantidade">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-action="cart-increase" data-cart-item-id="${item.cartItemId}" aria-label="Aumentar quantidade">+</button>
        <button class="cart-item__remove" data-action="cart-remove" data-cart-item-id="${item.cartItemId}" aria-label="Remover ${item.name}">🗑</button>
      </div>
      <span class="cart-item__subtotal">${formatCurrency(item.unitPrice * item.quantity)}</span>
    </div>
  `
    )
    .join("");
  document.getElementById("cart-subtotal").textContent = formatCurrency(getCartSubtotal());
  document.getElementById("cart-total").textContent = formatCurrency(getCartSubtotal());
}

function renderReviews() {
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;
  const stars = "★".repeat(Math.round(CONFIG.GOOGLE_RATING.score));
  grid.innerHTML = `
    <div class="reviews-summary">
      <span class="reviews-summary__stars">${stars}</span>
      <span class="reviews-summary__score">${CONFIG.GOOGLE_RATING.score.toFixed(1)}</span>
      <span class="reviews-summary__count">${CONFIG.GOOGLE_RATING.count} avaliações no Google</span>
    </div>
    ${REVIEWS.map(
      (review) => `
      <article class="review-card">
        <p class="review-card__stars">${"★".repeat(review.rating)}</p>
        <p class="review-card__text">${review.text}</p>
        <p class="review-card__author">${review.author}</p>
      </article>
    `
    ).join("")}
  `;
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = String(count);
  badge.style.display = count > 0 ? "flex" : "none";
}
