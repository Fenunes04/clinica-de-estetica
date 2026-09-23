let currentCategory = "all";
let currentSearch = "";

function renderProductCard(product) {
  const soldOut = product.available === false;
  const badgeHtml = product.badge
    ? `<span class="badge ${soldOut ? "badge--sold-out" : ""}">${product.badge}</span>`
    : "";
  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-card__image product-card__image--${product.category}">
        <span class="product-card__icon">${CATEGORY_ICONS[product.category] || "🍽"}</span>
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
