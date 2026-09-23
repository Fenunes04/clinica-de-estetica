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

document.addEventListener("DOMContentLoaded", () => {
  renderFilterChips();
  renderMenu();
  renderFeatured();
  renderPromotions();
  renderReviews();
  renderCartDrawer();
  updateCartBadge();

  window.addEventListener("cart:updated", () => {
    renderCartDrawer();
    updateCartBadge();
  });

  document.getElementById("cart-overlay").addEventListener("click", closeCartDrawer);

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
