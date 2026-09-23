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
