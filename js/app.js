function updateOpenStatusBadge() {
  const badge = document.getElementById("open-status-badge");
  if (!badge) return;
  const open = isOpenNow();
  badge.textContent = open ? "🟢 Estamos abertos" : "🔴 Fechado no momento";
  badge.classList.toggle("status-badge--open", open);
  badge.classList.toggle("status-badge--closed", !open);
}

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

if (location.protocol === "http:" || location.protocol === "https:") {
  const manifestLink = document.createElement("link");
  manifestLink.rel = "manifest";
  manifestLink.href = "manifest.json";
  document.head.appendChild(manifestLink);
}

document.addEventListener("DOMContentLoaded", () => {
  renderFirstOrderBanner();
  renderFilterChips();
  renderMenu();
  renderFeatured();
  renderPromotions();
  renderReviews();
  renderCartDrawer();
  updateCartBadge();
  updateOpenStatusBadge();

  window.addEventListener("cart:updated", () => {
    renderCartDrawer();
    updateCartBadge();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === CART_STORAGE_KEY) {
      reloadCartFromStorage();
    }
  });

  document.getElementById("cart-overlay").addEventListener("click", closeCartDrawer);

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

  const searchInput = document.getElementById("menu-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => setMenuSearch(e.target.value));
  }

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
      case "checkout-submit":
        submitOrder();
        break;
    }
  });
});
