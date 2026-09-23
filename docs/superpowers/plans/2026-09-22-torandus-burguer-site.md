# Torandu's Burguer Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Torandu's Burguer landing page + client-side ordering system (cardápio, carrinho, checkout, WhatsApp handoff) as a static site with zero build tooling.

**Architecture:** A single `index.html` with named section anchors, one `assets/css/styles.css`, and plain (non-module) `<script>` files loaded in dependency order that share the global scope (data → utilities → state → rendering → wiring). No bundler, no package manager, no server required — the page must work by double-clicking `index.html`.

**Tech Stack:** HTML5, CSS3 (custom properties, Flexbox/Grid, mobile-first media queries), vanilla JavaScript (ES2017, classic scripts — no `type="module"`, no `fetch` of local files), `localStorage` for cart persistence, Google Fonts (Bebas Neue + Inter), no external JS libraries.

**Spec:** `docs/superpowers/specs/2026-09-22-torandus-burguer-design.md`

**Adaptation note — testing:** Node.js and Python are not installed in this environment (verified: `node`/`npm`/`python` are all unavailable), and the "no build tools" decision rules out installing them just for a test runner. There is no automated test suite. Each task's verification step instead drives the real page in the built-in browser (`mcp__Claude_Browser__navigate` to the local `index.html` via `file://`, then `read_page`/`get_page_text`/`computer` clicks/`read_console_messages`) and asserts the exact expected DOM state or console output. This replaces "write failing test → implement → test passes" with "define expected behavior → implement → verify behavior in the running page", applied with the same rigor (concrete expected values, not eyeballing).

## Global Constraints

- Stack is plain HTML/CSS/JS with no build step, no npm/Node, no Python — the site must open correctly via `file://` (double-click), so no `<script type="module">` and no `fetch()` of local files.
- No backend and no real payment processing; the only "submission" mechanism is generating a WhatsApp message and calling `window.open` on a `wa.me` link.
- `WHATSAPP_NUMBER` must be exactly `"5515997737600"` — never a placeholder, never a different number.
- Do not invent prices, address, hours, payment methods, or testimonials. Use exactly the data in spec sections 3 and 4. Where the spec marks a description "parcial" or a price "não visível", reproduce it exactly as marked — do not complete or guess the missing text/value.
- Color palette is fixed to the hex values in spec section 5 (`#D95F02`, `#E76F00`, `#C65D3A`, `#9E4530`, `#5A321F`, `#321C14`, `#171311`, `#F5EBDD`, `#FFF3DF`). No neon orange.
- Product/promotion imagery is a generic per-category placeholder (CSS gradient + icon), per the user's explicit decision — not cropped screenshot thumbnails, not stock photos.
- Mobile-first. Must look correct at 320/375/390/414/768/1024/1280/1440/1920px viewport widths.

## Review Focus

- Opening `index.html` by double-click (`file://`) must work with zero console errors — no ES module imports, no local `fetch`, nothing that only works over `http://`.
- Products with `available: false` (esgotados) must never be addable to the cart, even by reopening the modal or clicking "Adicionar" — the button must stay disabled and the click handler must not add the item.
- The cart must survive a full page reload (`localStorage`) without duplicating or losing items, and must not resurrect a cleared cart.
- Checkout must block advancing to the next step whenever a required field (name, phone, street, number, neighborhood, payment method) is empty, showing an inline error message instead of silently proceeding.
- The WhatsApp message generated on submit must exactly match the cart's item names, quantities, notes, and computed subtotal/total at the moment of confirmation — including after quantities were changed and items removed earlier in the session.

---

### Task 1: Project skeleton, design tokens, and base layout

**Files:**
- Create: `index.html`
- Create: `assets/css/styles.css`
- Create: `favicon.svg`
- Create: `manifest.json`
- Create: `js/utils.js`
- Create: `js/data/config.js`

**Interfaces:**
- Produces: global `CONFIG` object (`js/data/config.js`) with keys `WHATSAPP_NUMBER`, `INSTAGRAM_URL`, `GOOGLE_MAPS_DIRECTIONS_URL`, `ADDRESS` (`{street, neighborhood, city, state, zip, country}`), `OPENING_HOURS` (keyed `domingo`..`sabado`, each `{open, close}` or `null`), `PAYMENT_METHODS` (array of display strings), `GOOGLE_RATING` (`{score, count}`), `FIRST_ORDER_DISCOUNT` (`{percent, minOrder}`).
- Produces: global `CATEGORY_LABELS` object and `CATEGORY_ICONS` object (`js/data/config.js`), both keyed by the category slugs used in later tasks: `hamburgueres, acompanhamentos, combos, sazonal, sobremesas, vegetarianos, kids, adicionais, shakes, bebidas`.
- Produces: global function `formatCurrency(value: number): string` (`js/utils.js`), formats as `R$ 42,00` using `pt-BR`/`BRL`.
- Produces: HTML section anchors with fixed `id`s that later tasks fill in: `#menu-grid`, `#filter-chips`, `#menu-search`, `#featured-grid`, `#promotions-grid`, `#about`, `#reviews-grid`, `#trust-badges`, `#location`, `#footer`, `#cart-drawer`, `#cart-overlay`, `#cart-items`, `#cart-empty`, `#cart-summary`, `#cart-subtotal`, `#cart-total`, `#cart-count`, `#product-modal`, `#checkout-modal`, `#mobile-nav`, `#mobile-menu-toggle`, `#open-status-badge`.

- [ ] **Step 1: Create `js/data/config.js`**

```js
const CONFIG = {
  WHATSAPP_NUMBER: "5515997737600",
  INSTAGRAM_URL: "https://instagram.com/torandusburguer",
  GOOGLE_MAPS_DIRECTIONS_URL:
    "https://www.google.com/maps/dir/?api=1&destination=Rua+Jo%C3%A3o+Valentino+Joel+1214+Vila+Hort%C3%AAncia+Sorocaba+SP+18020286",
  GOOGLE_MAPS_EMBED_URL:
    "https://www.google.com/maps?q=Rua+Jo%C3%A3o+Valentino+Joel,+1214+-+Vila+Hort%C3%AAncia,+Sorocaba+-+SP,+18020-286&output=embed",
  ADDRESS: {
    street: "Rua João Valentino Joel, 1214",
    neighborhood: "Vila Hortência",
    city: "Sorocaba",
    state: "SP",
    zip: "18020-286",
    country: "Brasil"
  },
  OPENING_HOURS: {
    domingo: { open: "18:00", close: "23:00" },
    segunda: null,
    terca: { open: "18:00", close: "23:00" },
    quarta: { open: "18:00", close: "23:00" },
    quinta: { open: "18:00", close: "23:00" },
    sexta: { open: "18:00", close: "23:30" },
    sabado: { open: "18:00", close: "23:00" }
  },
  PAYMENT_METHODS: [
    { value: "pix", label: "Pix" },
    { value: "google_pay", label: "Google Pay" },
    { value: "nubank", label: "Nubank" },
    { value: "cartao_credito_online", label: "Cartão de crédito (online)" },
    { value: "cartao_credito_entrega", label: "Cartão de crédito (na entrega)" },
    { value: "cartao_debito_entrega", label: "Cartão de débito (na entrega)" },
    { value: "dinheiro", label: "Dinheiro (na entrega)" }
  ],
  GOOGLE_RATING: { score: 5.0, count: 29 },
  FIRST_ORDER_DISCOUNT: { percent: 10, minOrder: 30 }
};

const CATEGORY_LABELS = {
  hamburgueres: "Hambúrgueres",
  acompanhamentos: "Acompanhamentos",
  combos: "Para Dividir",
  sazonal: "Sazonal do Mês",
  sobremesas: "Sobremesas",
  vegetarianos: "Vegetarianos",
  kids: "Kids",
  adicionais: "Adicionais",
  shakes: "Shakes",
  bebidas: "Bebidas"
};

const CATEGORY_ICONS = {
  hamburgueres: "🍔",
  acompanhamentos: "🍟",
  combos: "🍱",
  sazonal: "🔥",
  sobremesas: "🍮",
  vegetarianos: "🥬",
  kids: "🧒",
  adicionais: "🥫",
  shakes: "🥤",
  bebidas: "🧃"
};
```

- [ ] **Step 2: Create `js/utils.js`**

```js
function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
```

- [ ] **Step 3: Create `favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#171311" stroke="#D95F02" stroke-width="3"/>
  <path d="M16 26 C16 18 22 14 32 14 C42 14 48 18 48 26" fill="none" stroke="#E76F00" stroke-width="4" stroke-linecap="round"/>
  <path d="M32 14 L32 8 M24 16 L20 10 M40 16 L44 10" fill="none" stroke="#E76F00" stroke-width="3" stroke-linecap="round"/>
  <text x="32" y="46" text-anchor="middle" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#F5EBDD">TB</text>
</svg>
```

- [ ] **Step 4: Create `manifest.json`**

```json
{
  "name": "Torandu's Burguer",
  "short_name": "Torandu's",
  "description": "Hambúrgueres artesanais, ingredientes selecionados e muito sabor.",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#171311",
  "theme_color": "#D95F02",
  "icons": [{ "src": "favicon.svg", "sizes": "any", "type": "image/svg+xml" }]
}
```

- [ ] **Step 5: Create `assets/css/styles.css` (reset, tokens, base layout, header, hero, footer skeleton)**

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --color-orange-burnt: #D95F02;
  --color-orange-ember: #E76F00;
  --color-terracotta: #C65D3A;
  --color-terracotta-dark: #9E4530;
  --color-brown: #5A321F;
  --color-brown-dark: #321C14;
  --color-charcoal: #171311;
  --color-off-white: #F5EBDD;
  --color-cream: #FFF3DF;

  --font-heading: 'Bebas Neue', 'Oswald', sans-serif;
  --font-body: 'Inter', sans-serif;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --header-height: 64px;
  --bottom-nav-height: 60px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-body);
  background: var(--color-charcoal);
  color: var(--color-off-white);
  line-height: 1.5;
  padding-bottom: var(--bottom-nav-height);
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4 {
  font-family: var(--font-heading);
  letter-spacing: 0.5px;
  margin: 0 0 var(--space-3);
}
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.25rem; }
p { margin: 0 0 var(--space-3); }
button { font-family: var(--font-body); cursor: pointer; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-3); }
.section { padding: var(--space-6) 0; }
.section-title { text-align: center; margin-bottom: var(--space-2); }
.section-subtitle { text-align: center; color: var(--color-off-white); opacity: 0.8; max-width: 640px; margin: 0 auto var(--space-5); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2); border: none; border-radius: var(--radius-md);
  padding: 12px 24px; font-weight: 700; font-size: 1rem;
  transition: transform 0.15s ease, background 0.15s ease;
}
.btn:active { transform: scale(0.97); }
.btn--primary { background: var(--color-orange-burnt); color: var(--color-charcoal); }
.btn--primary:hover { background: var(--color-orange-ember); }
.btn--secondary { background: transparent; color: var(--color-off-white); border: 2px solid var(--color-off-white); }
.btn--secondary:hover { background: var(--color-off-white); color: var(--color-charcoal); }
.btn--block { width: 100%; }
.btn--success { background: #3f8f4f !important; color: white !important; }
.btn:disabled { background: var(--color-brown); color: var(--color-off-white); opacity: 0.5; cursor: not-allowed; }

/* Header */
.site-header {
  position: sticky; top: 0; z-index: 40; height: var(--header-height);
  background: var(--color-brown-dark); border-bottom: 1px solid var(--color-brown);
  display: flex; align-items: center;
}
.site-header .container { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.site-header__logo { display: flex; align-items: center; gap: var(--space-2); font-family: var(--font-heading); font-size: 1.5rem; }
.site-header__logo img { height: 40px; width: 40px; }
.site-nav { display: none; gap: var(--space-4); }
.site-nav a { font-weight: 600; }
.site-nav a:hover { color: var(--color-orange-burnt); }
.site-header__actions { display: flex; align-items: center; gap: var(--space-3); }
.icon-btn { background: transparent; border: none; color: var(--color-off-white); font-size: 1.4rem; position: relative; padding: var(--space-1); }
.cart-count {
  position: absolute; top: -4px; right: -8px; background: var(--color-orange-burnt);
  color: var(--color-charcoal); font-size: 0.7rem; font-weight: 700; min-width: 18px; height: 18px;
  border-radius: 999px; display: none; align-items: center; justify-content: center; padding: 0 4px;
}
.mobile-nav {
  display: none; position: fixed; inset: var(--header-height) 0 0 0; background: var(--color-charcoal);
  z-index: 39; padding: var(--space-4); flex-direction: column; gap: var(--space-4); font-size: 1.25rem;
}
.mobile-nav--open { display: flex; }

@media (min-width: 1024px) {
  .site-nav { display: flex; }
  #mobile-menu-toggle { display: none; }
}

/* Hero */
.hero {
  background: radial-gradient(ellipse at top, rgba(217,95,2,0.25), transparent 60%), var(--color-charcoal);
  padding: var(--space-6) 0;
  text-align: center;
}
.hero__badge { display: inline-flex; align-items: center; gap: var(--space-2); background: var(--color-brown-dark); border-radius: 999px; padding: 6px 14px; font-size: 0.85rem; margin-bottom: var(--space-4); }
.status-badge--open { color: #7CCB7C; }
.status-badge--closed { color: #E07C7C; }
.hero__visual {
  width: 100%; max-width: 420px; aspect-ratio: 1/1; margin: 0 auto var(--space-5);
  border-radius: 50%; background: radial-gradient(circle at 35% 30%, var(--color-orange-ember), var(--color-terracotta-dark) 70%);
  display: flex; align-items: center; justify-content: center; font-size: 6rem;
  box-shadow: 0 0 60px rgba(231,111,0,0.4);
}
.hero h1 { font-size: 2.75rem; }
.hero p.subheadline { max-width: 560px; margin: 0 auto var(--space-4); font-size: 1.1rem; opacity: 0.9; }
.hero__actions { display: flex; flex-direction: column; gap: var(--space-3); align-items: center; margin-bottom: var(--space-4); }
.hero__indicators { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); font-size: 0.9rem; opacity: 0.85; }

@media (min-width: 768px) {
  .hero h1 { font-size: 3.5rem; }
  .hero__actions { flex-direction: row; }
}

/* Footer */
.site-footer { background: var(--color-brown-dark); padding: var(--space-6) 0 var(--space-4); }
.site-footer__grid { display: grid; gap: var(--space-4); }
.site-footer__col h4 { margin-bottom: var(--space-2); }
.site-footer__col a { display: block; padding: 4px 0; opacity: 0.85; }
.site-footer__col a:hover { opacity: 1; color: var(--color-orange-burnt); }
.site-footer__bottom { text-align: center; margin-top: var(--space-5); opacity: 0.6; font-size: 0.85rem; }

@media (min-width: 768px) {
  .site-footer__grid { grid-template-columns: repeat(4, 1fr); }
}

/* Bottom mobile nav */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; height: var(--bottom-nav-height);
  background: var(--color-brown-dark); border-top: 1px solid var(--color-brown);
  display: flex; z-index: 40;
}
.bottom-nav a, .bottom-nav button {
  flex: 1; background: transparent; border: none; color: var(--color-off-white);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 0.7rem; gap: 2px;
}
.bottom-nav .icon { font-size: 1.2rem; }
@media (min-width: 1024px) {
  .bottom-nav { display: none; }
  body { padding-bottom: 0; }
}
```

- [ ] **Step 6: Create `index.html` skeleton with all section anchors**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Torandu's Burguer | Hambúrguer Artesanal</title>
  <meta name="description" content="Hambúrgueres artesanais, ingredientes selecionados e muito sabor. Conheça a Torandu's Burguer e faça seu pedido.">
  <link rel="canonical" href="https://torandusburguer.com.br/">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="Torandu's Burguer | Hambúrguer Artesanal">
  <meta property="og:description" content="Hambúrgueres artesanais, ingredientes selecionados e muito sabor.">
  <meta property="og:type" content="website">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#D95F02">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a href="#inicio" class="site-header__logo" data-scroll-to="inicio">
        <span aria-hidden="true">🤠</span> TORANDU'S BURGUER
      </a>
      <nav class="site-nav" aria-label="Navegação principal">
        <a href="#inicio" data-scroll-to="inicio">Início</a>
        <a href="#pedidos" data-scroll-to="pedidos">Pedidos</a>
        <a href="#promocoes" data-scroll-to="promocoes">Promoções</a>
        <a href="#sobre" data-scroll-to="sobre">Sobre</a>
        <a href="#avaliacoes" data-scroll-to="avaliacoes">Avaliações</a>
        <a href="#location" data-scroll-to="location">Contato</a>
      </nav>
      <div class="site-header__actions">
        <button class="icon-btn" data-action="open-cart" aria-label="Abrir carrinho">
          🛒<span class="cart-count" id="cart-count">0</span>
        </button>
        <button class="icon-btn" id="mobile-menu-toggle" aria-label="Abrir menu">☰</button>
      </div>
    </div>
  </header>

  <nav id="mobile-nav" class="mobile-nav" aria-label="Navegação mobile">
    <a href="#inicio" data-scroll-to="inicio">Início</a>
    <a href="#pedidos" data-scroll-to="pedidos">Pedidos</a>
    <a href="#promocoes" data-scroll-to="promocoes">Promoções</a>
    <a href="#sobre" data-scroll-to="sobre">Sobre</a>
    <a href="#avaliacoes" data-scroll-to="avaliacoes">Avaliações</a>
    <a href="#location" data-scroll-to="location">Contato</a>
  </nav>

  <main>
    <section id="inicio" class="hero">
      <div class="container">
        <span class="hero__badge" id="open-status-badge">Carregando horário...</span>
        <div class="hero__visual" aria-hidden="true">🍔</div>
        <h1>SEU HAMBÚRGUER.<br>SUA EXPERIÊNCIA.</h1>
        <p class="subheadline">Hambúrgueres artesanais, ingredientes selecionados e muito sabor preparados para transformar cada lanche em um momento único.</p>
        <div class="hero__actions">
          <button class="btn btn--primary" data-scroll-to="pedidos">FAZER MEU PEDIDO</button>
          <button class="btn btn--secondary" data-scroll-to="pedidos">VER CARDÁPIO</button>
        </div>
        <div class="hero__indicators">
          <span>🔥 Artesanal</span>
          <span>🥩 Carne selecionada</span>
          <span>🍔 Hambúrguer suculento</span>
          <span>⭐ 5,0 no Google</span>
        </div>
      </div>
    </section>

    <section id="diferenciais" class="section"><div class="container"><!-- TASK 9 --></div></section>

    <section id="pedidos" class="section">
      <div class="container">
        <h2 class="section-title">FAÇA SEU PEDIDO</h2>
        <div class="menu-toolbar">
          <input type="search" id="menu-search" placeholder="🔎 Buscar hambúrguer..." aria-label="Buscar produto">
          <div id="filter-chips" class="filter-chips"></div>
        </div>
        <div id="menu-grid" class="product-grid"></div>
      </div>
    </section>

    <section id="queridinhos" class="section">
      <div class="container">
        <h2 class="section-title">OS QUERIDINHOS DA CASA</h2>
        <div id="featured-grid" class="product-grid product-grid--featured"></div>
      </div>
    </section>

    <section id="promocoes" class="section">
      <div class="container">
        <h2 class="section-title">PROMOÇÕES DA BRASA</h2>
        <div id="promotions-grid" class="promo-grid"></div>
      </div>
    </section>

    <section id="sobre" class="section"><div class="container" id="about"><!-- TASK 9 --></div></section>

    <section id="avaliacoes" class="section">
      <div class="container">
        <h2 class="section-title">O QUE NOSSOS CLIENTES DIZEM</h2>
        <div id="reviews-grid" class="reviews-grid"></div>
      </div>
    </section>

    <section class="section"><div class="container" id="trust-badges"><!-- TASK 9 --></div></section>

    <section id="location-section" class="section"><div class="container" id="location"><!-- TASK 10 --></div></section>

    <section id="cta-final" class="section"><!-- TASK 10 --></section>
  </main>

  <footer class="site-footer" id="footer"><!-- TASK 10 --></footer>

  <nav class="bottom-nav" aria-label="Navegação rápida mobile">
    <a href="#inicio" data-scroll-to="inicio"><span class="icon">🏠</span>Início</a>
    <a href="#pedidos" data-scroll-to="pedidos"><span class="icon">🍔</span>Pedidos</a>
    <a href="#promocoes" data-scroll-to="promocoes"><span class="icon">🔥</span>Promoções</a>
    <button data-action="open-cart"><span class="icon">🛒</span>Carrinho</button>
  </nav>

  <div id="cart-overlay" class="cart-overlay"></div>
  <aside id="cart-drawer" class="cart-drawer" aria-hidden="true"><!-- TASK 6 --></aside>
  <div id="product-modal" class="modal" aria-hidden="true"><!-- TASK 5 --></div>
  <div id="checkout-modal" class="modal" aria-hidden="true"><!-- TASK 7 --></div>

  <script src="js/utils.js"></script>
  <script src="js/data/config.js"></script>
  <script src="js/data/products.js"></script>
  <script src="js/data/promotions.js"></script>
  <script src="js/data/reviews.js"></script>
  <script src="js/openingHours.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/render.js"></script>
  <script src="js/modal.js"></script>
  <script src="js/checkout.js"></script>
  <script src="js/whatsapp.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

Note: `js/data/products.js`, `promotions.js`, `reviews.js`, `openingHours.js`, `cart.js`, `render.js`, `modal.js`, `checkout.js`, `whatsapp.js`, `app.js` are referenced now but created in later tasks — create empty files with a single comment line for each so the page doesn't 404 in the console before those tasks run:

```js
// created in a later task
```

Create each of `js/data/products.js`, `js/data/promotions.js`, `js/data/reviews.js`, `js/openingHours.js`, `js/cart.js`, `js/render.js`, `js/modal.js`, `js/checkout.js`, `js/whatsapp.js`, `js/app.js` with that one-line placeholder content now.

- [ ] **Step 7: Verify in browser**

Use `mcp__Claude_Browser__navigate` with `url: "file:///C:/Users/kelly/Desktop/Felipe/Claude Code/index.html"`, then `mcp__Claude_Browser__read_page`.
Expected: page title reads "Torandu's Burguer | Hambúrguer Artesanal"; header, hero headline "SEU HAMBÚRGUER. SUA EXPERIÊNCIA.", and footer placeholder are present; `mcp__Claude_Browser__read_console_messages` shows no red/error entries (404s for the still-empty JS files are fine since they now exist as empty placeholders and will return 200).

- [ ] **Step 8: Commit**

```bash
git add index.html assets/css/styles.css favicon.svg manifest.json js/utils.js js/data/config.js js/data/products.js js/data/promotions.js js/data/reviews.js js/openingHours.js js/cart.js js/render.js js/modal.js js/checkout.js js/whatsapp.js js/app.js
git commit -m "feat: add site skeleton, design tokens, and config data"
```

---

### Task 2: Product, promotion, and review data

**Files:**
- Modify: `js/data/products.js`
- Modify: `js/data/promotions.js`
- Modify: `js/data/reviews.js`

**Interfaces:**
- Consumes: `CATEGORY_LABELS`, `CATEGORY_ICONS` from Task 1.
- Produces: global `PRODUCTS` array, each item `{ id: string, name: string, description: string, price: number, category: string, badge: string|null, featured: boolean, available: boolean }`.
- Produces: global `PROMOTIONS` array, each item `{ id: string, name: string, description: string, priceOriginal: number, pricePromo: number, badge: string }`.
- Produces: global `REVIEWS` array, each item `{ id: string, author: string, rating: number, text: string }`.

- [ ] **Step 1: Write `js/data/products.js`**

```js
const PRODUCTS = [
  { id: "burg-bruto-rustico", name: "Bruto Rústico", description: "Pão brioche, hambúrguer 160g, ovo, bacon fatias, queijo cheddar, cebola caramelizada, maionese e picles.", price: 42.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-simprao", name: "Simprão", description: "Pão brioche, burguer 160g, queijo cheddar e maionese da casa.", price: 25.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-quase-todo-dia", name: "Quase Todo Dia", description: "Pão brioche, hambúrguer 160g, queijo prato, cebola, tomate chapeados, maionese caipira e picles.", price: 35.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-ce-ta-preparada", name: "Cê Tá Preparada", description: "Pão brioche, hambúrguer 160g, queijo prato, catupiry maçaricado, cebola crispy e barbecue branco.", price: 37.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-esse-bo-e-meu", name: "Esse B.O É Meu", description: "Pão, hambúrguer 160g, queijo cheddar fatia, queijo cheddar cremoso, bacon, doritos e maionese de bacon.", price: 42.00, category: "hamburgueres", badge: "MAIS PEDIDO", featured: true, available: true },
  { id: "burg-relacao-errada", name: "Relação Errada", description: "Pão brioche, hambúrguer 160g, provolone, doce de leite, bacon e maionese caipira.", price: 38.90, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-arranhao", name: "Arranhão", description: "Pão brioche, filé de sobrecoxa empanado, mussarela, creme de milho, alface, cebola roxa, tomate e barbecue branco.", price: 38.00, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-tubaroes", name: "Tubarões", description: "Pão brioche, hambúrguer 160g, queijo mussarela, cream cheese, costela desfiada... (descrição parcial)", price: 51.00, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-eu-te-seguro", name: "Eu Te Seguro", description: "Pão brioche, hambúrguer 160g, queijo coalho no mel, abacaxi grelhado... (descrição parcial)", price: 52.00, category: "hamburgueres", badge: null, featured: false, available: true },
  { id: "burg-ao-goias", name: "Aô Goiás", description: "Uma homenagem ao verdadeiro pit dog goiano, em versão artesanal! Pão brioche macio, hambúrguer artesanal de 160g... (descrição parcial)", price: 39.99, category: "hamburgueres", badge: null, featured: false, available: true },

  { id: "side-aneis-cebola", name: "Anéis de Cebola", description: "Nossos anéis de cebola crocante e sequinhos. 10 unidades.", price: 19.99, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-batata-simprona", name: "Batata Simprona", description: "Batata 300g temperada com nosso tempero caipira. Acompanha maionese da casa.", price: 25.00, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-batata-cheddar-bacon", name: "Batata Cheddar e Bacon", description: "A combinação perfeita e cremosa de batata crinkle com cheddar cremoso, bacon, parmesão ralado e cebolinha.", price: 31.00, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-batata-costela", name: "Batata Costela", description: "Batata frita, creme de catupiry, costela desfiada, torresminho e finalizada com cebolinha.", price: 39.99, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-pastelzinho-pernil", name: "Pastelzinho de Pernil", description: "Porção de 10 mini pastéis com nosso recheio de pernil cremoso.", price: 24.90, category: "acompanhamentos", badge: null, featured: false, available: true },
  { id: "side-franguim", name: "Franguim", description: "Nosso delicioso frango empanado crocante e suculento. 10 unidades por porção.", price: 23.00, category: "acompanhamentos", badge: null, featured: false, available: true },

  { id: "combo-caixa-rodeio", name: "Caixa Rodeio", description: "Nossa caixa rodeio contém: 2 hambúrgueres... (descrição parcial)", price: 97.90, category: "combos", badge: null, featured: false, available: true },

  { id: "sazonal-ponto-fraco", name: "Ponto Fraco", description: "Pão brioche. Hambúrguer de linguiça 150g... (descrição parcial)", price: 39.99, category: "sazonal", badge: "SAZONAL DO MÊS", featured: false, available: true },

  { id: "dessert-mini-pudim", name: "Mini Pudim da Chef", description: "Um docim pós-búrguer.", price: 10.00, category: "sobremesas", badge: null, featured: false, available: true },

  { id: "veg-fala-mal-de-mim", name: "Fala Mal De Mim", description: "Pão vegano, carne de lentilha 150g, alface, tomate, cebola roxa e maionese caipira e picles.", price: 36.90, category: "vegetarianos", badge: null, featured: false, available: true },
  { id: "veg-kibe-vegano", name: "Kibe Vegano", description: "300g de kibe 100% vegetal, feito com ingredientes naturais. (6 unidades)", price: 24.30, category: "vegetarianos", badge: "ESGOTADO", featured: false, available: false },

  { id: "kids-trio", name: "Trio Kids", description: "Pão brioche, smash 160g, queijo cheddar e maionese da casa. Acompanha uma porção de fritas + suco Del Valle laranja.", price: 39.90, category: "kids", badge: null, featured: false, available: true },

  { id: "add-maionese-caipira", name: "Maionese Caipira", description: "Maionese da casa, receita caipira.", price: 3.00, category: "adicionais", badge: null, featured: false, available: true },
  { id: "add-maionese-bacon", name: "Maionese de Bacon", description: "Maionese da casa com bacon.", price: 3.00, category: "adicionais", badge: null, featured: false, available: true },
  { id: "add-barbecue-branco", name: "Barbecue Branco", description: "Criação da nossa chef, um delicioso molho barbecue branco.", price: 3.00, category: "adicionais", badge: null, featured: false, available: true },

  { id: "shake-moranguinnn", name: "Moranguinnn", description: "Shake de morango, creme de morango, geleia... (descrição parcial)", price: 28.90, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-ovotella", name: "Ovotella", description: "Milk-shake com base de creme americano, muita Nutella e o crocante inconfundível do Ovomaltine... (descrição parcial)", price: 29.90, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-kinder-de-bao", name: "Kinder de Bão", description: "Núu... trem bão!", price: 29.90, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-nutella-pacoca", name: "Nutella com Paçoca", description: "Creme americano, Nutella, amendoim e paçoquinha... (descrição parcial)", price: 28.00, category: "shakes", badge: null, featured: false, available: true },
  { id: "shake-dodileite", name: "Dodileite", description: "Base de creme americano super cremoso, muito doce de leite... (descrição parcial)", price: 26.00, category: "shakes", badge: null, featured: false, available: true },

  { id: "drink-agua-mineral", name: "Água Mineral", description: "Verificar qual marca temos no dia.", price: 4.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-coca-zero", name: "Refrigerante Coca-Cola Zero Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-coca-lata", name: "Refrigerante Coca-Cola Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-guarana-antarctica", name: "Refrigerante Guaraná Antarctica Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: "ESGOTADO", featured: false, available: false },
  { id: "drink-sprite-310", name: "Sprite 310ml", description: "Lata 310ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-fanta-laranja", name: "Fanta Laranja Lata", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-fanta-uva", name: "Fanta Uva", description: "Lata 350ml.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-h2oh-limoneto", name: "Refrigerante H2OH Limoneto 500ml", description: "Garrafa 500ml.", price: 7.50, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-sprite-fresh", name: "Sprite Fresh 510ml", description: "Unidade 510ml.", price: 7.50, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-suco-acerola-laranja", name: "Suco Bioleve Acerola e Laranja", description: "Produzida com água mineral bioleve, suco natural e fontes de vitaminas.", price: 5.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-suco-citricas", name: "Suco Bioleve Frutas Cítricas", description: "Produzida com água mineral bioleve, suco natural e fontes de vitaminas.", price: 5.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-itubaina", name: "Itubaina ou Tubaína (vidro)", description: "Garrafa de vidro.", price: 8.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-kuat-momesso", name: "Kuat / Momesso", description: "Refrigerante.", price: 9.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-heineken", name: "Cerveja Heineken Lata", description: "Lata.", price: 9.50, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-refri-1l", name: "Refrigerante 1 Litro", description: "Garrafa 1 litro.", price: 12.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-refri-2l", name: "Refrigerante 2 Litros", description: "Garrafa 2 litros.", price: 15.00, category: "bebidas", badge: "ESGOTADO", featured: false, available: false },
  { id: "drink-refri-600", name: "Refrigerante 600ml", description: "Consultar disponibilidade.", price: 9.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-amstel", name: "Amstel", description: "Cerveja lager.", price: 7.00, category: "bebidas", badge: null, featured: false, available: true },
  { id: "drink-agua-gas-maca", name: "Água Gaseificada Sabor Maçã", description: "Preço não visível na captura de tela original — confirmar com a loja.", price: 0, category: "bebidas", badge: "CONFIRMAR PREÇO", featured: false, available: true }
];
```

- [ ] **Step 2: Write `js/data/promotions.js`**

```js
const PROMOTIONS = [
  {
    id: "promo-2-quase-todo-dia",
    name: "2 Quase Todo Dia",
    description: "2 hambúrgueres Quase Todo Dia por um preço especial da Promo da Noite.",
    priceOriginal: 70.00,
    pricePromo: 54.99,
    badge: "PROMOÇÃO"
  }
];
```

- [ ] **Step 3: Write `js/data/reviews.js`**

```js
const REVIEWS = [
  { id: "review-1", author: "Cliente Torandu's", rating: 5, text: "Comentário do cliente será inserido aqui." },
  { id: "review-2", author: "Cliente Torandu's", rating: 5, text: "Comentário do cliente será inserido aqui." },
  { id: "review-3", author: "Cliente Torandu's", rating: 5, text: "Comentário do cliente será inserido aqui." }
];
```

- [ ] **Step 4: Verify in browser**

Navigate to `index.html`, then `mcp__Claude_Browser__javascript_tool` with `action: "javascript_exec"` and `text: "({products: PRODUCTS.length, promos: PROMOTIONS.length, reviews: REVIEWS.length, soldOut: PRODUCTS.filter(p => !p.available).length})"`.
Expected result: `{"products":49,"promos":1,"reviews":3,"soldOut":3}` (49 total products across all categories; 3 unavailable: Kibe Vegano, Refrigerante Guaraná Antarctica, Refrigerante 2 Litros). Also check `mcp__Claude_Browser__read_console_messages` for zero errors.

- [ ] **Step 5: Commit**

```bash
git add js/data/products.js js/data/promotions.js js/data/reviews.js
git commit -m "feat: add real product, promotion, and review catalog data"
```

---

### Task 3: Menu rendering, category filters, and search

**Files:**
- Modify: `js/render.js`
- Modify: `js/app.js`
- Modify: `index.html` (menu toolbar already scaffolded in Task 1; filter chips are generated by JS)
- Modify: `assets/css/styles.css` (append)

**Interfaces:**
- Consumes: `PRODUCTS`, `CATEGORY_LABELS`, `CATEGORY_ICONS` (Task 1/2), `formatCurrency` (Task 1).
- Produces: global functions `renderProductCard(product): string`, `renderMenu(): void`, `renderFilterChips(): void`, `setMenuCategory(category: string): void`, `setMenuSearch(term: string): void` (all in `js/render.js`) — consumed by `js/app.js` and later by Task 4/5.

- [ ] **Step 1: Write `js/render.js` (menu portion)**

```js
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
```

- [ ] **Step 2: Write `js/app.js` bootstrap (menu portion)**

```js
document.addEventListener("DOMContentLoaded", () => {
  renderFilterChips();
  renderMenu();

  const searchInput = document.getElementById("menu-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => setMenuSearch(e.target.value));
  }
});
```

- [ ] **Step 3: Append CSS for menu toolbar, filter chips, product cards, badges**

```css
.menu-toolbar { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4); }
#menu-search {
  width: 100%; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--color-brown);
  background: var(--color-brown-dark); color: var(--color-off-white); font-size: 1rem;
}
.filter-chips { display: flex; gap: var(--space-2); overflow-x: auto; padding-bottom: 4px; }
.filter-chip {
  flex: none; background: var(--color-brown-dark); color: var(--color-off-white); border: 1px solid var(--color-brown);
  border-radius: 999px; padding: 8px 16px; font-size: 0.85rem; white-space: nowrap;
}
.filter-chip--active { background: var(--color-orange-burnt); color: var(--color-charcoal); border-color: var(--color-orange-burnt); font-weight: 700; }

.product-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-4); }
.product-card {
  background: var(--color-brown-dark); border-radius: var(--radius-lg); overflow: hidden; position: relative;
  display: flex; flex-direction: column; transition: transform 0.2s ease;
}
.product-card:hover { transform: translateY(-4px); }
.product-card__image {
  aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 3rem;
  background: linear-gradient(135deg, var(--color-terracotta), var(--color-brown));
}
.product-card__body { padding: var(--space-3); flex: 1; display: flex; flex-direction: column; }
.product-card__name { margin-bottom: var(--space-1); }
.product-card__description { font-size: 0.85rem; opacity: 0.8; flex: 1; }
.product-card__footer { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-2); gap: var(--space-2); }
.product-card__price { font-weight: 700; color: var(--color-orange-burnt); font-size: 1.1rem; }
.btn--add { background: var(--color-orange-burnt); color: var(--color-charcoal); border: none; border-radius: var(--radius-sm); padding: 8px 14px; font-weight: 700; font-size: 0.85rem; }
.badge {
  position: absolute; top: 10px; left: 10px; background: var(--color-orange-ember); color: var(--color-charcoal);
  font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; z-index: 1;
}
.badge--sold-out { background: #555; color: #ddd; }
.empty-state { grid-column: 1/-1; text-align: center; padding: var(--space-6) 0; opacity: 0.8; }

@media (min-width: 640px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr); } .menu-toolbar { flex-direction: row; justify-content: space-between; align-items: center; } #menu-search { max-width: 280px; } }
```

- [ ] **Step 4: Verify in browser**

Navigate to `index.html`. Use `read_page` scoped to `#menu-grid` (or `get_page_text`) to confirm 44 product cards render with correct names/prices (e.g. "Bruto Rústico" and "R$ 42,00" both present). Click the "Bebidas" filter chip via `computer` (`left_click` on its coordinate/ref from `find`), then re-read the grid and confirm only beverage names appear (e.g. "Amstel" present, "Bruto Rústico" absent). Type "shake" into `#menu-search` and confirm only shake products remain. Clear the search and click "Todos" to confirm the full grid returns.

- [ ] **Step 5: Commit**

```bash
git add js/render.js js/app.js assets/css/styles.css
git commit -m "feat: render menu grid with category filters and search"
```

---

### Task 4: Featured products and promotions sections

**Files:**
- Modify: `js/render.js`
- Modify: `js/app.js`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: `PRODUCTS`, `PROMOTIONS`, `formatCurrency`, `renderProductCard` (Task 3).
- Produces: global functions `renderFeatured(): void`, `renderPromotions(): void`.

- [ ] **Step 1: Append to `js/render.js`**

```js
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
```

- [ ] **Step 2: Call new renders in `js/app.js`**

In the existing `DOMContentLoaded` listener from Task 3, add:

```js
  renderFeatured();
  renderPromotions();
```

(placed right after the existing `renderMenu();` call).

- [ ] **Step 3: Append CSS**

```css
.product-grid--featured .product-card { border: 2px solid var(--color-orange-burnt); }

.promo-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-4); }
.promo-card {
  background: linear-gradient(135deg, var(--color-terracotta-dark), var(--color-brown-dark));
  border-radius: var(--radius-lg); overflow: hidden; position: relative; display: flex; flex-direction: column;
}
.promo-card__image { aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: rgba(0,0,0,0.2); }
.promo-card__body { padding: var(--space-4); }
.promo-card__prices { display: flex; align-items: baseline; gap: var(--space-2); margin: var(--space-2) 0 var(--space-3); }
.promo-card__price-original { text-decoration: line-through; opacity: 0.6; }
.promo-card__price-promo { font-size: 1.4rem; font-weight: 700; color: var(--color-orange-burnt); }
.promo-card__discount { background: var(--color-orange-burnt); color: var(--color-charcoal); font-weight: 700; font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; }
.badge--promo { background: #c0392b; color: white; }

@media (min-width: 768px) { .promo-grid { grid-template-columns: repeat(2, 1fr); } }
```

- [ ] **Step 4: Verify in browser**

Navigate to `index.html`. Confirm `#featured-grid` contains exactly 5 cards (Bruto Rústico, Simprão, Quase Todo Dia, Cê Tá Preparada, Esse B.O É Meu — the `featured: true` products from Task 2). Confirm `#promotions-grid` shows "2 Quase Todo Dia" with original price "R$ 70,00" struck through and promo price "R$ 54,99".

- [ ] **Step 5: Commit**

```bash
git add js/render.js js/app.js assets/css/styles.css
git commit -m "feat: render featured products and promotions sections"
```

---

### Task 5: Product detail modal

**Files:**
- Modify: `index.html` (fill `#product-modal`)
- Modify: `js/modal.js`
- Modify: `js/app.js`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: `PRODUCTS`, `PROMOTIONS`, `formatCurrency` (Tasks 1-4). `addToCart` (Task 6) is called from here but implemented next — that's fine because `js/cart.js` loads before `js/modal.js` and this task's own verification will add the function stub needed; to keep task order clean, `confirmAddFromModal` in this task calls `window.addToCart(...)` defensively (`if (typeof addToCart === "function")`) so Task 5 is independently verifiable before Task 6 exists it will just skip persisting, and Task 6 wires it for real. Once Task 6 lands, no change is needed here because `addToCart` will already be defined by then.
- Produces: global functions `findItemById(id): object|null`, `openProductModal(id): void`, `closeProductModal(): void`, `changeModalQuantity(delta): void`, `confirmAddFromModal(): void` (all `js/modal.js`) — `confirmAddFromModal` is consumed by `js/app.js`'s action dispatcher.

- [ ] **Step 1: Replace `#product-modal` content in `index.html`**

```html
<div id="product-modal" class="modal" aria-hidden="true">
  <div class="modal__overlay" data-action="close-product-modal"></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="product-modal-name">
    <button class="modal__close" data-action="close-product-modal" aria-label="Fechar">✕</button>
    <div id="product-modal-image" class="modal__image"><span id="product-modal-icon">🍔</span></div>
    <div class="modal__content">
      <h3 id="product-modal-name">Nome do produto</h3>
      <p id="product-modal-description">Descrição</p>
      <p class="modal__price" id="product-modal-price">R$ 0,00</p>
      <label for="product-modal-notes">Alguma observação?</label>
      <textarea id="product-modal-notes" placeholder="Ex: Sem cebola, adicionar molho extra..."></textarea>
      <div class="modal__quantity">
        <button data-action="modal-qty-decrease" aria-label="Diminuir quantidade">-</button>
        <span id="product-modal-quantity">1</span>
        <button data-action="modal-qty-increase" aria-label="Aumentar quantidade">+</button>
      </div>
      <button class="btn btn--primary btn--block" id="product-modal-add" data-action="modal-add-to-cart">ADICIONAR AO CARRINHO</button>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Write `js/modal.js`**

```js
let modalState = { item: null, quantity: 1 };

function findItemById(id) {
  return PRODUCTS.find((p) => p.id === id) || PROMOTIONS.find((p) => p.id === id) || null;
}

function getItemPrice(item) {
  return item.price !== undefined ? item.price : item.pricePromo;
}

function openProductModal(id) {
  const item = findItemById(id);
  if (!item || item.available === false) return;
  modalState = { item, quantity: 1 };
  const modal = document.getElementById("product-modal");
  document.getElementById("product-modal-icon").textContent = CATEGORY_ICONS[item.category] || "🔥";
  document.getElementById("product-modal-name").textContent = item.name;
  document.getElementById("product-modal-description").textContent = item.description;
  document.getElementById("product-modal-price").textContent = formatCurrency(getItemPrice(item));
  document.getElementById("product-modal-quantity").textContent = "1";
  document.getElementById("product-modal-notes").value = "";
  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
}

function changeModalQuantity(delta) {
  modalState.quantity = Math.max(1, modalState.quantity + delta);
  document.getElementById("product-modal-quantity").textContent = modalState.quantity;
}

function confirmAddFromModal() {
  if (!modalState.item) return;
  const notes = document.getElementById("product-modal-notes").value.trim();
  const price = getItemPrice(modalState.item);
  if (typeof addToCart === "function") {
    addToCart({ id: modalState.item.id, name: modalState.item.name, price }, modalState.quantity, notes);
  }
  const addButton = document.getElementById("product-modal-add");
  const originalText = addButton.textContent;
  addButton.textContent = "✓ ADICIONADO";
  addButton.classList.add("btn--success");
  setTimeout(() => {
    addButton.textContent = originalText;
    addButton.classList.remove("btn--success");
    closeProductModal();
  }, 700);
}
```

- [ ] **Step 3: Add action dispatcher to `js/app.js`**

Add this delegated click listener inside the existing `DOMContentLoaded` callback (after the renders from Tasks 3-4):

```js
  document.body.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    switch (el.dataset.action) {
      case "open-product":
        openProductModal(el.dataset.id);
        break;
      case "close-product-modal":
        closeProductModal();
        break;
      case "modal-qty-increase":
        changeModalQuantity(1);
        break;
      case "modal-qty-decrease":
        changeModalQuantity(-1);
        break;
      case "modal-add-to-cart":
        confirmAddFromModal();
        break;
    }
  });
```

- [ ] **Step 4: Append CSS**

```css
.modal { position: fixed; inset: 0; z-index: 60; display: none; }
.modal--open { display: block; }
.modal__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); }
.modal__panel {
  position: absolute; bottom: 0; left: 0; right: 0; max-height: 90vh; overflow-y: auto;
  background: var(--color-brown-dark); border-radius: var(--radius-lg) var(--radius-lg) 0 0; padding: var(--space-4);
}
.modal__close { position: absolute; top: var(--space-3); right: var(--space-3); background: none; border: none; color: var(--color-off-white); font-size: 1.2rem; }
.modal__image { aspect-ratio: 16/9; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--color-terracotta), var(--color-brown)); display: flex; align-items: center; justify-content: center; font-size: 4rem; margin-bottom: var(--space-3); }
.modal__price { font-size: 1.5rem; font-weight: 700; color: var(--color-orange-burnt); }
.modal__content label { display: block; margin-bottom: var(--space-1); font-size: 0.85rem; opacity: 0.85; }
.modal__content textarea { width: 100%; border-radius: var(--radius-sm); border: 1px solid var(--color-brown); background: var(--color-charcoal); color: var(--color-off-white); padding: var(--space-2); min-height: 60px; margin-bottom: var(--space-3); }
.modal__quantity { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
.modal__quantity button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--color-orange-burnt); background: transparent; color: var(--color-off-white); font-size: 1.2rem; }

@media (min-width: 768px) {
  .modal__panel { position: relative; max-width: 480px; margin: 5vh auto; border-radius: var(--radius-lg); }
}
```

- [ ] **Step 5: Verify in browser**

Navigate to `index.html`. Use `find` to locate an "+ Adicionar" button for "Bruto Rústico" and click it. Confirm `#product-modal` gains class `modal--open`, `#product-modal-name` reads "Bruto Rústico", `#product-modal-price` reads "R$ 42,00". Click the `+` quantity button twice and confirm `#product-modal-quantity` reads "3". Click "ADICIONAR AO CARRINHO" and confirm the button briefly shows "✓ ADICIONADO" then the modal closes. Also verify clicking "+ Adicionar" on the sold-out "Kibe Vegano" card does nothing (button is disabled, no modal opens).

- [ ] **Step 6: Commit**

```bash
git add index.html js/modal.js js/app.js assets/css/styles.css
git commit -m "feat: add product detail modal with quantity and notes"
```

---

### Task 6: Cart engine and cart drawer

**Files:**
- Modify: `index.html` (fill `#cart-drawer`)
- Modify: `js/cart.js`
- Modify: `js/render.js`
- Modify: `js/app.js`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: `formatCurrency` (Task 1).
- Produces: global functions `addToCart(item: {id,name,price}, quantity: number, notes: string): void`, `removeFromCart(cartItemId: string): void`, `updateQuantity(cartItemId: string, quantity: number): void`, `clearCart(): void`, `getCartItems(): array`, `getCartSubtotal(): number`, `getCartCount(): number` (all `js/cart.js`); dispatches a `window` `CustomEvent("cart:updated")` on every mutation.
- Produces: global functions `renderCartDrawer(): void`, `updateCartBadge(): void` (`js/render.js`), and `openCartDrawer()/closeCartDrawer()` (`js/app.js`), wired to the `cart:updated` event.

- [ ] **Step 1: Write `js/cart.js`**

```js
const CART_STORAGE_KEY = "torandus_cart";

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

let cartItems = loadCartFromStorage();

function persistCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

function addToCart(item, quantity, notes) {
  notes = notes || "";
  const existing = cartItems.find((i) => i.productId === item.id && i.notes === notes);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({
      cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity,
      notes
    });
  }
  persistCart();
}

function removeFromCart(cartItemId) {
  cartItems = cartItems.filter((i) => i.cartItemId !== cartItemId);
  persistCart();
}

function updateQuantity(cartItemId, quantity) {
  const item = cartItems.find((i) => i.cartItemId === cartItemId);
  if (!item) return;
  if (quantity <= 0) {
    removeFromCart(cartItemId);
    return;
  }
  item.quantity = quantity;
  persistCart();
}

function clearCart() {
  cartItems = [];
  persistCart();
}

function getCartItems() {
  return cartItems;
}

function getCartSubtotal() {
  return cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

function getCartCount() {
  return cartItems.reduce((sum, i) => sum + i.quantity, 0);
}
```

- [ ] **Step 2: Fill `#cart-drawer` in `index.html`**

```html
<aside id="cart-drawer" class="cart-drawer" aria-hidden="true">
  <div class="cart-drawer__header">
    <h3>Seu carrinho</h3>
    <button data-action="close-cart" aria-label="Fechar carrinho">✕</button>
  </div>
  <div id="cart-empty" class="cart-empty">
    <p>Seu carrinho está vazio.</p>
    <p>Que tal escolher um hambúrguer?</p>
    <button class="btn btn--primary" data-action="close-cart" data-scroll-to="pedidos">VER CARDÁPIO</button>
  </div>
  <div id="cart-items" class="cart-items"></div>
  <div id="cart-summary" class="cart-summary" style="display:none;">
    <div class="cart-summary__row"><span>Subtotal</span><span id="cart-subtotal">R$ 0,00</span></div>
    <div class="cart-summary__row"><span>Entrega</span><span>a combinar</span></div>
    <div class="cart-summary__row cart-summary__row--total"><span>Total</span><span id="cart-total">R$ 0,00</span></div>
    <button class="btn btn--primary btn--block" data-action="open-checkout">FINALIZAR PEDIDO</button>
  </div>
</aside>
```

- [ ] **Step 3: Append cart rendering to `js/render.js`**

```js
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
        <p class="cart-item__name">${item.name}</p>
        ${item.notes ? `<p class="cart-item__notes">${item.notes}</p>` : ""}
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

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = String(count);
  badge.style.display = count > 0 ? "flex" : "none";
}
```

- [ ] **Step 4: Wire cart drawer open/close and cart item actions in `js/app.js`**

Add these functions above `DOMContentLoaded`:

```js
function openCartDrawer() {
  document.getElementById("cart-drawer").classList.add("cart-drawer--open");
  document.getElementById("cart-overlay").classList.add("cart-overlay--visible");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("cart-drawer--open");
  document.getElementById("cart-overlay").classList.remove("cart-overlay--visible");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
}
```

Inside `DOMContentLoaded`, after the existing renders, add:

```js
  renderCartDrawer();
  updateCartBadge();

  window.addEventListener("cart:updated", () => {
    renderCartDrawer();
    updateCartBadge();
  });

  document.getElementById("cart-overlay").addEventListener("click", closeCartDrawer);
```

Extend the existing `switch (el.dataset.action)` block (from Task 5) with these cases:

```js
      case "open-cart":
        openCartDrawer();
        break;
      case "close-cart":
        closeCartDrawer();
        break;
      case "cart-increase": {
        const item = getCartItems().find((i) => i.cartItemId === el.dataset.cartItemId);
        if (item) updateQuantity(item.cartItemId, item.quantity + 1);
        break;
      }
      case "cart-decrease": {
        const item = getCartItems().find((i) => i.cartItemId === el.dataset.cartItemId);
        if (item) updateQuantity(item.cartItemId, item.quantity - 1);
        break;
      }
      case "cart-remove":
        removeFromCart(el.dataset.cartItemId);
        break;
```

- [ ] **Step 5: Append CSS**

```css
.cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 55; display: none; }
.cart-overlay--visible { display: block; }
.cart-drawer {
  position: fixed; top: 0; right: -100%; width: 100%; max-width: 400px; height: 100%;
  background: var(--color-brown-dark); z-index: 56; transition: right 0.25s ease; display: flex; flex-direction: column;
}
.cart-drawer--open { right: 0; }
.cart-drawer__header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); border-bottom: 1px solid var(--color-brown); }
.cart-drawer__header button { background: none; border: none; color: var(--color-off-white); font-size: 1.2rem; }
.cart-empty { text-align: center; padding: var(--space-6) var(--space-4); }
.cart-items { flex: 1; overflow-y: auto; padding: var(--space-3); }
.cart-item { display: grid; grid-template-columns: 1fr auto; gap: 4px; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-brown); }
.cart-item__name { font-weight: 600; margin: 0; }
.cart-item__notes { font-size: 0.75rem; opacity: 0.7; margin: 2px 0; }
.cart-item__unit-price { font-size: 0.75rem; opacity: 0.6; margin: 0; }
.cart-item__controls { display: flex; align-items: center; gap: var(--space-2); grid-column: 1/2; }
.qty-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--color-orange-burnt); background: transparent; color: var(--color-off-white); }
.cart-item__remove { background: none; border: none; color: var(--color-off-white); opacity: 0.7; margin-left: auto; }
.cart-item__subtotal { grid-column: 2/3; grid-row: 1/3; align-self: center; font-weight: 700; color: var(--color-orange-burnt); }
.cart-summary { padding: var(--space-3); border-top: 1px solid var(--color-brown); }
.cart-summary__row { display: flex; justify-content: space-between; margin-bottom: var(--space-2); }
.cart-summary__row--total { font-weight: 700; font-size: 1.1rem; color: var(--color-orange-burnt); }
```

- [ ] **Step 6: Verify in browser**

Navigate to `index.html`. Open a product modal, set quantity to 2, add to cart. Confirm `#cart-count` shows "2" and the drawer icon badge is visible. Click the cart icon; confirm the drawer shows the item with quantity 2 and correct subtotal/total. Click `+` on the cart item row and confirm quantity becomes 3 and totals update. Click the remove (🗑) button and confirm the drawer returns to the empty state ("Seu carrinho está vazio."). Add an item again, then reload the page (`navigate` to the same `file://` URL again) and confirm the cart still shows that item (localStorage persistence) with the same quantity — not duplicated.

- [ ] **Step 7: Commit**

```bash
git add index.html js/cart.js js/render.js js/app.js assets/css/styles.css
git commit -m "feat: add cart engine with localStorage persistence and drawer UI"
```

---

### Task 7: Checkout wizard (4 steps)

**Files:**
- Modify: `index.html` (fill `#checkout-modal`)
- Modify: `js/checkout.js`
- Modify: `js/app.js`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: `getCartItems`, `getCartSubtotal`, `closeCartDrawer` (Task 6), `formatCurrency` (Task 1), `CONFIG.PAYMENT_METHODS` (Task 1).
- Produces: global `checkoutState` object (`{step, name, phone, address:{street,number,complement,neighborhood,zip,reference}, payment, changeFor, notes}`), and global functions `openCheckout(): void`, `closeCheckout(): void`, `goToNextStep(): void`, `goToPreviousStep(): void`, `renderCheckoutStep(): void` (all `js/checkout.js`) — `submitOrder` (Task 8) will read `checkoutState` directly.

- [ ] **Step 1: Fill `#checkout-modal` in `index.html`**

```html
<div id="checkout-modal" class="modal" aria-hidden="true">
  <div class="modal__overlay" data-action="close-checkout"></div>
  <div class="modal__panel checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
    <button class="modal__close" data-action="close-checkout" aria-label="Fechar">✕</button>
    <h3 id="checkout-title">Finalizar pedido</h3>
    <p id="checkout-error" class="checkout-error" role="alert"></p>

    <div class="checkout-step" data-step="1">
      <h4>SEUS DADOS</h4>
      <label for="checkout-name">Nome</label>
      <input id="checkout-name" type="text" required>
      <label for="checkout-phone">Telefone</label>
      <input id="checkout-phone" type="tel" required>
    </div>

    <div class="checkout-step" data-step="2" style="display:none;">
      <h4>ENTREGA</h4>
      <label for="checkout-street">Endereço</label>
      <input id="checkout-street" type="text" required>
      <label for="checkout-number">Número</label>
      <input id="checkout-number" type="text" required>
      <label for="checkout-complement">Complemento</label>
      <input id="checkout-complement" type="text">
      <label for="checkout-neighborhood">Bairro</label>
      <input id="checkout-neighborhood" type="text" required>
      <label for="checkout-zip">CEP</label>
      <input id="checkout-zip" type="text">
      <label for="checkout-reference">Referência</label>
      <input id="checkout-reference" type="text">
    </div>

    <div class="checkout-step" data-step="3" style="display:none;">
      <h4>FORMA DE PAGAMENTO</h4>
      <div id="checkout-payment-options"></div>
      <div id="checkout-change-wrapper" style="display:none;">
        <label for="checkout-change-for">Troco para quanto?</label>
        <input id="checkout-change-for" type="text" placeholder="Ex: 100,00">
      </div>
    </div>

    <div class="checkout-step" data-step="4" style="display:none;">
      <h4>CONFIRMAÇÃO</h4>
      <div id="checkout-summary"></div>
      <label for="checkout-notes">Observações gerais (opcional)</label>
      <textarea id="checkout-notes"></textarea>
    </div>

    <div class="checkout-nav">
      <button class="btn btn--secondary" data-action="checkout-back" id="checkout-back-btn">VOLTAR</button>
      <button class="btn btn--primary" data-action="checkout-next" id="checkout-next-btn">AVANÇAR</button>
      <button class="btn btn--primary" data-action="checkout-submit" id="checkout-submit-btn" style="display:none;">CONFIRMAR PEDIDO</button>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Write `js/checkout.js`**

```js
let checkoutState = {
  step: 1,
  name: "",
  phone: "",
  address: { street: "", number: "", complement: "", neighborhood: "", zip: "", reference: "" },
  payment: "",
  paymentLabel: "",
  changeFor: "",
  notes: ""
};

function openCheckout() {
  if (getCartItems().length === 0) return;
  checkoutState = {
    step: 1,
    name: "",
    phone: "",
    address: { street: "", number: "", complement: "", neighborhood: "", zip: "", reference: "" },
    payment: "",
    paymentLabel: "",
    changeFor: "",
    notes: ""
  };
  renderPaymentOptions();
  document.getElementById("checkout-modal").classList.add("modal--open");
  document.getElementById("checkout-modal").setAttribute("aria-hidden", "false");
  closeCartDrawer();
  renderCheckoutStep();
}

function closeCheckout() {
  const modal = document.getElementById("checkout-modal");
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
}

function renderPaymentOptions() {
  const container = document.getElementById("checkout-payment-options");
  container.innerHTML = CONFIG.PAYMENT_METHODS.map(
    (method) => `
    <label class="payment-option">
      <input type="radio" name="payment" value="${method.value}" data-label="${method.label}">
      ${method.label}
    </label>
  `
  ).join("");
  container.querySelectorAll('input[name="payment"]').forEach((input) => {
    input.addEventListener("change", () => {
      const changeWrapper = document.getElementById("checkout-change-wrapper");
      changeWrapper.style.display = input.value === "dinheiro" ? "block" : "none";
    });
  });
}

function showCheckoutError(message) {
  document.getElementById("checkout-error").textContent = message;
}

function renderCheckoutStep() {
  document.querySelectorAll(".checkout-step").forEach((panel) => {
    panel.style.display = Number(panel.dataset.step) === checkoutState.step ? "block" : "none";
  });
  document.getElementById("checkout-error").textContent = "";
  document.getElementById("checkout-back-btn").style.display = checkoutState.step === 1 ? "none" : "inline-flex";
  document.getElementById("checkout-next-btn").style.display = checkoutState.step === 4 ? "none" : "inline-flex";
  document.getElementById("checkout-submit-btn").style.display = checkoutState.step === 4 ? "inline-flex" : "none";
  if (checkoutState.step === 4) {
    renderCheckoutSummary();
  }
}

function goToNextStep() {
  if (checkoutState.step === 1) {
    checkoutState.name = document.getElementById("checkout-name").value.trim();
    checkoutState.phone = document.getElementById("checkout-phone").value.trim();
    if (!checkoutState.name) return showCheckoutError("Preencha seu nome para continuar.");
    if (!checkoutState.phone) return showCheckoutError("Informe seu telefone para continuar.");
  }
  if (checkoutState.step === 2) {
    checkoutState.address.street = document.getElementById("checkout-street").value.trim();
    checkoutState.address.number = document.getElementById("checkout-number").value.trim();
    checkoutState.address.complement = document.getElementById("checkout-complement").value.trim();
    checkoutState.address.neighborhood = document.getElementById("checkout-neighborhood").value.trim();
    checkoutState.address.zip = document.getElementById("checkout-zip").value.trim();
    checkoutState.address.reference = document.getElementById("checkout-reference").value.trim();
    if (!checkoutState.address.street) return showCheckoutError("Informe seu endereço.");
    if (!checkoutState.address.number) return showCheckoutError("Informe o número do endereço.");
    if (!checkoutState.address.neighborhood) return showCheckoutError("Informe o bairro.");
  }
  if (checkoutState.step === 3) {
    const selected = document.querySelector('input[name="payment"]:checked');
    if (!selected) return showCheckoutError("Selecione uma forma de pagamento.");
    checkoutState.payment = selected.value;
    checkoutState.paymentLabel = selected.dataset.label;
    checkoutState.changeFor = document.getElementById("checkout-change-for").value.trim();
  }
  checkoutState.step = Math.min(4, checkoutState.step + 1);
  renderCheckoutStep();
}

function goToPreviousStep() {
  checkoutState.step = Math.max(1, checkoutState.step - 1);
  renderCheckoutStep();
}

function renderCheckoutSummary() {
  const items = getCartItems();
  const addr = checkoutState.address;
  const paymentText =
    checkoutState.payment === "dinheiro" && checkoutState.changeFor
      ? `${checkoutState.paymentLabel} (troco para ${formatCurrency(Number(checkoutState.changeFor.replace(",", ".")) || 0)})`
      : checkoutState.paymentLabel;
  document.getElementById("checkout-summary").innerHTML = `
    <ul class="checkout-summary__items">
      ${items.map((i) => `<li>${i.quantity}x ${i.name} — ${formatCurrency(i.unitPrice * i.quantity)}</li>`).join("")}
    </ul>
    <p><strong>Subtotal:</strong> ${formatCurrency(getCartSubtotal())}</p>
    <p><strong>Entrega:</strong> a combinar</p>
    <p><strong>Total:</strong> ${formatCurrency(getCartSubtotal())}</p>
    <p><strong>Nome:</strong> ${checkoutState.name} — ${checkoutState.phone}</p>
    <p><strong>Endereço:</strong> ${addr.street}, ${addr.number}${addr.complement ? " - " + addr.complement : ""} - ${addr.neighborhood}</p>
    <p><strong>Pagamento:</strong> ${paymentText}</p>
  `;
}
```

- [ ] **Step 3: Wire checkout actions in `js/app.js`**

Extend the `switch (el.dataset.action)` block with:

```js
      case "open-checkout":
        openCheckout();
        break;
      case "close-checkout":
        closeCheckout();
        break;
      case "checkout-next":
        goToNextStep();
        break;
      case "checkout-back":
        goToPreviousStep();
        break;
```

- [ ] **Step 4: Append CSS**

```css
.checkout-panel { max-width: 480px; }
.checkout-error { color: #ff8b7a; min-height: 1.2em; font-size: 0.85rem; }
.checkout-step label { display: block; margin: var(--space-2) 0 4px; font-size: 0.85rem; opacity: 0.85; }
.checkout-step input, .checkout-step textarea {
  width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-brown);
  background: var(--color-charcoal); color: var(--color-off-white); font-size: 1rem; margin-bottom: var(--space-2);
}
.payment-option { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) 0; }
.checkout-nav { display: flex; gap: var(--space-2); margin-top: var(--space-4); }
.checkout-summary__items { list-style: none; padding: 0; margin: 0 0 var(--space-2); }
```

- [ ] **Step 5: Verify in browser**

With at least one item in the cart, open checkout. On step 1, click "AVANÇAR" with both fields empty and confirm the error "Preencha seu nome para continuar." appears and the step does not advance. Fill name and phone, advance; on step 2 leave "Bairro" empty and confirm it's blocked with "Informe o bairro."; fill it and advance; on step 3 try advancing with no payment selected and confirm the block, then select "Dinheiro (na entrega)" and confirm the "Troco para quanto?" field appears, fill it, advance; on step 4 confirm the summary lists the correct item names/quantities/prices, the entered name/phone/address, and the payment line including the change amount.

- [ ] **Step 6: Commit**

```bash
git add index.html js/checkout.js js/app.js assets/css/styles.css
git commit -m "feat: add 4-step checkout wizard with field validation"
```

---

### Task 8: WhatsApp message generation

**Files:**
- Modify: `js/whatsapp.js`
- Modify: `js/checkout.js`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `getCartItems`, `getCartSubtotal`, `clearCart` (Task 6), `checkoutState` (Task 7), `formatCurrency`, `CONFIG.WHATSAPP_NUMBER` (Task 1).
- Produces: global functions `buildOrderMessage(): string`, `openWhatsAppOrder(): void` (`js/whatsapp.js`); modifies `js/checkout.js` to add `submitOrder(): void`.

- [ ] **Step 1: Write `js/whatsapp.js`**

```js
function buildOrderMessage() {
  const items = getCartItems();
  const itemsText = items
    .map((item) => {
      const notes = item.notes ? ` (Obs: ${item.notes})` : "";
      return `${item.quantity}x ${item.name} - ${formatCurrency(item.unitPrice * item.quantity)}${notes}`;
    })
    .join("\n");
  const subtotal = getCartSubtotal();
  const addr = checkoutState.address;
  const addressText = `${addr.street}, ${addr.number}${addr.complement ? " - " + addr.complement : ""} - ${addr.neighborhood}${addr.zip ? ", CEP " + addr.zip : ""}${addr.reference ? " (Ref: " + addr.reference + ")" : ""}`;
  const paymentText =
    checkoutState.payment === "dinheiro" && checkoutState.changeFor
      ? `${checkoutState.paymentLabel} (troco para ${formatCurrency(Number(checkoutState.changeFor.replace(",", ".")) || 0)})`
      : checkoutState.paymentLabel;

  return [
    "Olá, Torandu's Burguer!",
    "",
    "Gostaria de fazer o seguinte pedido:",
    "",
    itemsText,
    "",
    `Subtotal: ${formatCurrency(subtotal)}`,
    "Entrega: a combinar",
    `Total: ${formatCurrency(subtotal)}`,
    "",
    `Nome: ${checkoutState.name}`,
    `Telefone: ${checkoutState.phone}`,
    `Endereço: ${addressText}`,
    `Forma de pagamento: ${paymentText}`,
    `Observações: ${checkoutState.notes || "Nenhuma"}`
  ].join("\n");
}

function openWhatsAppOrder() {
  const message = buildOrderMessage();
  const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}
```

- [ ] **Step 2: Add `submitOrder` to `js/checkout.js`**

```js
function submitOrder() {
  checkoutState.notes = document.getElementById("checkout-notes").value.trim();
  openWhatsAppOrder();
  clearCart();
  closeCheckout();
}
```

- [ ] **Step 3: Wire submit action in `js/app.js`**

Extend the `switch (el.dataset.action)` block with:

```js
      case "checkout-submit":
        submitOrder();
        break;
```

- [ ] **Step 4: Verify in browser**

Add two different products to the cart (different quantities, one with a note typed in the modal). Complete checkout through step 4 with real sample data. Before clicking "CONFIRMAR PEDIDO", use `mcp__Claude_Browser__javascript_tool` to stub the popup: `window.open = (url) => { window.__lastWhatsAppUrl = url; return null; }`. Click "CONFIRMAR PEDIDO", then read `window.__lastWhatsAppUrl` via `javascript_tool`. Expected: the URL starts with `https://wa.me/5515997737600?text=`, and `decodeURIComponent` of the `text` param contains both product names with their exact quantities/subtotals, the note text, the entered name/phone/address, the chosen payment method, and matches `Total: ` equal to the subtotal shown in the cart before checkout. Also confirm the cart is now empty (`getCartItems().length === 0`) and `#cart-count` is hidden.

- [ ] **Step 5: Commit**

```bash
git add js/whatsapp.js js/checkout.js js/app.js
git commit -m "feat: generate WhatsApp order message and open wa.me on submit"
```

---

### Task 9: About, benefits, reviews, and trust badges sections

**Files:**
- Modify: `index.html` (fill `#diferenciais`, `#about`, `#trust-badges`)
- Modify: `js/render.js`
- Modify: `js/app.js`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: `REVIEWS`, `CONFIG.GOOGLE_RATING` (Tasks 1-2).
- Produces: global function `renderReviews(): void` (`js/render.js`).

- [ ] **Step 1: Replace `#diferenciais` container content in `index.html`**

```html
<h2 class="section-title">MAIS QUE UM HAMBÚRGUER</h2>
<p class="section-subtitle">Na Torandu's Burguer, acreditamos que um hambúrguer vai muito além de matar a fome: ele precisa proporcionar uma experiência.</p>
<div class="benefits-grid">
  <div class="benefit-card"><span class="benefit-card__icon">🔥</span><h3>FEITO NA BRASA</h3><p>Preparação com foco em sabor, suculência e personalidade.</p></div>
  <div class="benefit-card"><span class="benefit-card__icon">🥩</span><h3>CARNE DE QUALIDADE</h3><p>Hambúrgueres preparados com carnes selecionadas.</p></div>
  <div class="benefit-card"><span class="benefit-card__icon">🍞</span><h3>PÃO MACIO</h3><p>Pães escolhidos para complementar cada receita.</p></div>
  <div class="benefit-card"><span class="benefit-card__icon">🥫</span><h3>MOLHOS ESPECIAIS</h3><p>Molhos desenvolvidos para combinar com cada lanche.</p></div>
  <div class="benefit-card"><span class="benefit-card__icon">🥬</span><h3>INGREDIENTES FRESCOS</h3><p>Ingredientes selecionados para manter qualidade e sabor.</p></div>
  <div class="benefit-card"><span class="benefit-card__icon">🍔</span><h3>COMBINAÇÕES EXCLUSIVAS</h3><p>Receitas que fogem do comum.</p></div>
</div>
```

- [ ] **Step 2: Fill `#about` container content in `index.html`**

```html
<h2 class="section-title">UMA EXPERIÊNCIA FEITA PARA VOCÊ</h2>
<p class="about-text">
  "Na Torandu's Burguer, acreditamos que um hambúrguer vai muito além de matar a fome: ele precisa proporcionar uma experiência.
  Por isso, criamos hambúrgueres artesanais preparados com ingredientes selecionados, carnes de alta qualidade e combinações
  exclusivas que fogem do comum, sem abrir mão do sabor que conquista qualquer pessoa. Cada receita é desenvolvida com cuidado
  para oferecer equilíbrio, personalidade e muito sabor. Utilizamos pão macio, hambúrgueres suculentos, ingredientes frescos
  e molhos especiais produzidos para transformar cada lanche em um momento único."
</p>
```

- [ ] **Step 3: Fill `#trust-badges` container content in `index.html`**

```html
<h2 class="section-title">COMPRA COM CONFIANÇA</h2>
<div class="trust-grid">
  <div class="trust-badge"><span>🔒</span><h4>COMPRA SEGURA</h4><p>Pagamento protegido</p></div>
  <div class="trust-badge"><span>🛡️</span><h4>DADOS PROTEGIDOS</h4><p>Seus dados estão seguros</p></div>
  <div class="trust-badge"><span>💳</span><h4>PAGAMENTO SEGURO</h4><p>Transações protegidas</p></div>
  <div class="trust-badge"><span>📦</span><h4>PEDIDO ACOMPANHADO</h4><p>Acompanhe seu pedido pelo WhatsApp</p></div>
  <div class="trust-badge"><span>⚡</span><h4>PEDIDO RÁPIDO</h4><p>Processamento ágil</p></div>
</div>
```

- [ ] **Step 4: Add `renderReviews` to `js/render.js`**

```js
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
```

- [ ] **Step 5: Call `renderReviews()` in `js/app.js`**

Add `renderReviews();` to the existing `DOMContentLoaded` render calls (alongside `renderMenu(); renderFeatured(); renderPromotions();`).

- [ ] **Step 6: Append CSS**

```css
.benefits-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-4); }
.benefit-card { background: var(--color-brown-dark); border-radius: var(--radius-md); padding: var(--space-4); text-align: center; transition: transform 0.2s ease; }
.benefit-card:hover { transform: translateY(-4px); }
.benefit-card__icon { font-size: 2rem; display: block; margin-bottom: var(--space-2); }

.about-text { max-width: 720px; margin: 0 auto; font-size: 1.05rem; line-height: 1.7; opacity: 0.9; text-align: center; }

.reviews-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-3); }
.reviews-summary { grid-column: 1/-1; text-align: center; margin-bottom: var(--space-3); }
.reviews-summary__stars { color: var(--color-orange-burnt); font-size: 1.5rem; }
.reviews-summary__score { font-weight: 700; font-size: 1.5rem; margin: 0 var(--space-2); }
.review-card { background: var(--color-brown-dark); border-radius: var(--radius-md); padding: var(--space-3); }
.review-card__stars { color: var(--color-orange-burnt); margin: 0 0 4px; }
.review-card__author { opacity: 0.6; font-size: 0.85rem; margin: 0; }

.trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); text-align: center; }
.trust-badge span { font-size: 1.75rem; }
.trust-badge h4 { font-size: 0.9rem; margin: var(--space-1) 0 4px; }
.trust-badge p { font-size: 0.8rem; opacity: 0.75; margin: 0; }

@media (min-width: 640px) { .benefits-grid { grid-template-columns: repeat(2, 1fr); } .reviews-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .benefits-grid { grid-template-columns: repeat(3, 1fr); } .trust-grid { grid-template-columns: repeat(5, 1fr); } }
```

- [ ] **Step 7: Verify in browser**

Navigate to `index.html`. Confirm the 6 "Por que Torandu's" cards render with the exact copy above. Confirm the "Sobre" section shows the institutional text verbatim (spot-check the opening and closing sentences). Confirm the reviews section shows "5.0" and "29 avaliações no Google" plus 3 review cards with the placeholder text "Comentário do cliente será inserido aqui." Confirm 5 trust badges render.

- [ ] **Step 8: Commit**

```bash
git add index.html js/render.js js/app.js assets/css/styles.css
git commit -m "feat: add benefits, about, reviews, and trust badge sections"
```

---

### Task 10: Location, footer, and conversion CTA

**Files:**
- Modify: `index.html` (fill `#location`, `#cta-final`, `#footer`)
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes: `CONFIG.ADDRESS`, `CONFIG.GOOGLE_MAPS_DIRECTIONS_URL`, `CONFIG.GOOGLE_MAPS_EMBED_URL`, `CONFIG.INSTAGRAM_URL`, `CONFIG.WHATSAPP_NUMBER`, `CONFIG.OPENING_HOURS` (Task 1). Static markup only — no new JS functions.

- [ ] **Step 1: Fill `#location` container content in `index.html`**

```html
<h2 class="section-title">ONDE ESTAMOS</h2>
<div class="location-grid">
  <div class="location-info">
    <p><strong>Endereço:</strong><br>Rua João Valentino Joel, 1214 - Vila Hortência<br>Sorocaba - SP, 18020-286</p>
    <p><strong>Horário de funcionamento:</strong></p>
    <ul class="hours-list">
      <li>Domingo: 18h às 23h</li>
      <li>Segunda-feira: Fechado</li>
      <li>Terça-feira: 18h às 23h</li>
      <li>Quarta-feira: 18h às 23h</li>
      <li>Quinta-feira: 18h às 23h</li>
      <li>Sexta-feira: 18h às 23h30</li>
      <li>Sábado: 18h às 23h</li>
    </ul>
    <p><strong>WhatsApp:</strong> <a href="https://wa.me/5515997737600" target="_blank" rel="noopener">(15) 99773-7600</a></p>
    <a class="btn btn--primary" href="https://www.google.com/maps/dir/?api=1&destination=Rua+Jo%C3%A3o+Valentino+Joel+1214+Vila+Hort%C3%AAncia+Sorocaba+SP+18020286" target="_blank" rel="noopener">COMO CHEGAR</a>
  </div>
  <iframe class="location-map" title="Mapa Torandu's Burguer" src="https://www.google.com/maps?q=Rua+Jo%C3%A3o+Valentino+Joel,+1214+-+Vila+Hort%C3%AAncia,+Sorocaba+-+SP,+18020-286&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>
```

- [ ] **Step 2: Fill `#cta-final` section content in `index.html`**

```html
<div class="container cta-final__inner">
  <h2>DEU FOME?</h2>
  <p>Então não fica só olhando. Faça seu pedido e experimente a Torandu's Burguer.</p>
  <button class="btn btn--primary" data-scroll-to="pedidos">PEDIR AGORA</button>
</div>
```

- [ ] **Step 3: Fill `#footer` content in `index.html`**

```html
<div class="container">
  <div class="site-footer__grid">
    <div class="site-footer__col">
      <div class="site-header__logo"><span aria-hidden="true">🤠</span> TORANDU'S BURGUER</div>
      <p style="opacity:0.7;font-size:0.85rem;">Sua hamburgueria favorita.</p>
    </div>
    <div class="site-footer__col">
      <h4>Navegação</h4>
      <a href="#inicio" data-scroll-to="inicio">Início</a>
      <a href="#pedidos" data-scroll-to="pedidos">Pedidos</a>
      <a href="#promocoes" data-scroll-to="promocoes">Promoções</a>
      <a href="#sobre" data-scroll-to="sobre">Sobre</a>
      <a href="#avaliacoes" data-scroll-to="avaliacoes">Avaliações</a>
    </div>
    <div class="site-footer__col">
      <h4>Contato</h4>
      <a href="https://wa.me/5515997737600" target="_blank" rel="noopener">WhatsApp</a>
      <a href="https://instagram.com/torandusburguer" target="_blank" rel="noopener">Instagram</a>
      <a href="#location-section" data-scroll-to="location-section">Rua João Valentino Joel, 1214 - Sorocaba/SP</a>
    </div>
    <div class="site-footer__col">
      <h4>Pagamento</h4>
      <p style="opacity:0.8;font-size:0.85rem;">Pix · Google Pay · Nubank · Cartão de crédito (online e na entrega) · Dinheiro</p>
    </div>
  </div>
  <p class="site-footer__bottom">© 2026 Torandu's Burguer. Todos os direitos reservados.</p>
</div>
```

- [ ] **Step 4: Append CSS**

```css
.location-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-4); }
.hours-list { list-style: none; padding: 0; margin: 0 0 var(--space-3); opacity: 0.9; }
.hours-list li { padding: 2px 0; }
.location-map { width: 100%; height: 300px; border: 0; border-radius: var(--radius-md); }
.cta-final__inner { text-align: center; background: linear-gradient(135deg, var(--color-orange-burnt), var(--color-terracotta-dark)); border-radius: var(--radius-lg); padding: var(--space-6) var(--space-4); }
.cta-final__inner h2 { color: var(--color-charcoal); }
.cta-final__inner p { color: var(--color-charcoal); opacity: 0.85; }

@media (min-width: 768px) { .location-grid { grid-template-columns: 1fr 1fr; } }
```

- [ ] **Step 5: Verify in browser**

Navigate to `index.html` and use `get_page_text` to confirm the address "Rua João Valentino Joel, 1214 - Vila Hortência" and all 7 opening-hours lines (including "Segunda-feira: Fechado" and "Sexta-feira: 18h às 23h30") appear verbatim. Confirm the "COMO CHEGAR" link's `href` contains `google.com/maps/dir` and the map `iframe` `src` contains `google.com/maps` with the same address. Confirm the footer shows the WhatsApp link pointing to `wa.me/5515997737600` and the copyright line "© 2026 Torandu's Burguer. Todos os direitos reservados."

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/styles.css
git commit -m "feat: add location, conversion CTA, and footer sections"
```

---

### Task 11: Opening-hours badge, mobile menu, and smooth scroll

**Files:**
- Modify: `js/openingHours.js`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `CONFIG.OPENING_HOURS` (Task 1).
- Produces: global functions `isOpenNow(date?: Date): boolean`, `getTodayHoursLabel(date?: Date): string` (`js/openingHours.js`) — consumed by `js/app.js`.

- [ ] **Step 1: Write `js/openingHours.js`**

```js
const WEEKDAY_KEYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function isOpenNow(date) {
  date = date || new Date();
  const hours = CONFIG.OPENING_HOURS[WEEKDAY_KEYS[date.getDay()]];
  if (!hours) return false;
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const minutesNow = date.getHours() * 60 + date.getMinutes();
  return minutesNow >= openH * 60 + openM && minutesNow < closeH * 60 + closeM;
}

function getTodayHoursLabel(date) {
  date = date || new Date();
  const hours = CONFIG.OPENING_HOURS[WEEKDAY_KEYS[date.getDay()]];
  if (!hours) return "Fechado hoje";
  return `Hoje: ${hours.open} às ${hours.close}`;
}
```

- [ ] **Step 2: Wire status badge, mobile menu toggle, and smooth scroll in `js/app.js`**

Add this function above `DOMContentLoaded`:

```js
function updateOpenStatusBadge() {
  const badge = document.getElementById("open-status-badge");
  if (!badge) return;
  const open = isOpenNow();
  badge.textContent = open ? "🟢 Estamos abertos" : "🔴 Fechado no momento";
  badge.classList.toggle("status-badge--open", open);
  badge.classList.toggle("status-badge--closed", !open);
}
```

Inside `DOMContentLoaded`, add:

```js
  updateOpenStatusBadge();

  document.getElementById("mobile-menu-toggle").addEventListener("click", () => {
    document.getElementById("mobile-nav").classList.toggle("mobile-nav--open");
  });

  document.querySelectorAll("[data-scroll-to]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const targetId = el.dataset.scrollTo;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
      document.getElementById("mobile-nav").classList.remove("mobile-nav--open");
    });
  });
```

- [ ] **Step 3: Verify in browser**

Navigate to `index.html`. Confirm `#open-status-badge` shows either "🟢 Estamos abertos" or "🔴 Fechado no momento" (never the "Carregando horário..." placeholder) — cross-check against the current real time and the hours table (e.g. if it's Monday, or outside 18h-23h/23h30, it must show closed). Resize the viewport to 375px width, click the `☰` toggle, and confirm `#mobile-nav` becomes visible with all 6 links; click "Pedidos" and confirm the page scrolls to `#pedidos` and the mobile menu closes. Resize to 1280px and confirm the desktop nav (`.site-nav`) is visible instead and `#mobile-menu-toggle` is hidden.

- [ ] **Step 4: Commit**

```bash
git add js/openingHours.js js/app.js
git commit -m "feat: add open/closed status badge, mobile menu, and smooth scroll"
```

---

### Task 12: Responsive polish and full acceptance walkthrough

**Files:**
- Modify: `assets/css/styles.css` (fixes found during this pass only — no new features)

**Interfaces:** None new — this task only verifies and patches issues found live.

- [ ] **Step 1: Visual pass at each required breakpoint**

Using `mcp__Claude_Browser__resize_window` with `width`/`height` set to each of 320×720, 375×812, 390×844, 414×896, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080, navigate/reload `index.html` at each size and take a screenshot (`computer` action `screenshot`). For each: confirm no horizontal scrollbar, no overlapping text/buttons, the bottom nav bar only appears below 1024px and never covers footer content or the last visible section, and the cart drawer occupies the full width on mobile and a fixed 400px panel on desktop. Fix any issue found by editing the relevant CSS rule (media query breakpoint, `overflow-x`, `z-index`, or spacing) — do not introduce new components.

- [ ] **Step 2: Full acceptance checklist from the spec**

Reset viewport to `desktop` preset. Re-navigate to `index.html` fresh (clear `localStorage` first via `javascript_tool`: `localStorage.clear()`) and walk every checkbox in spec section 12 end-to-end in one pass:
- All header/footer/nav links scroll to the correct section.
- Search and category filters update the grid instantly.
- Add/remove/quantity changes update cart, subtotal, total, and header badge immediately.
- Reload the page mid-session and confirm the cart persisted.
- Confirm "Kibe Vegano" and "Refrigerante Guaraná Antarctica" cannot be added (disabled buttons, no modal).
- Complete a full checkout and confirm the stubbed `window.open` URL (same technique as Task 8) is well-formed and complete.
- Confirm the layout is correct at 375px, 768px, and 1440px (reuse Step 1's screenshots).
- Confirm the open/closed badge matches the real current time against `CONFIG.OPENING_HOURS`.
- Grep the final `js/data/products.js` and `index.html` for the literal string `TODO`/`TBD`/invented placeholder values other than the one explicitly documented "CONFIRMAR PREÇO" item — there should be none.

Record the outcome of each bullet; if any fails, fix it in the owning file (not necessarily this task's CSS-only file list — reopen the relevant task's file) and re-verify before continuing.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: responsive polish and final acceptance pass"
```
