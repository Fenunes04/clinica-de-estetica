document.addEventListener("DOMContentLoaded", () => {
  renderFilterChips();
  renderMenu();
  renderFeatured();
  renderPromotions();

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
    }
  });
});
