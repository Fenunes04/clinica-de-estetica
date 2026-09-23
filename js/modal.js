let modalState = { item: null, quantity: 1 };
let modalAddOriginalText = "ADICIONAR AO CARRINHO";
let modalCloseTimer = null;

function findItemById(id) {
  return PRODUCTS.find((p) => p.id === id) || PROMOTIONS.find((p) => p.id === id) || null;
}

function getItemPrice(item) {
  return item.price !== undefined ? item.price : item.pricePromo;
}

function resetModalAddButton() {
  if (modalCloseTimer) {
    clearTimeout(modalCloseTimer);
    modalCloseTimer = null;
  }
  const addButton = document.getElementById("product-modal-add");
  addButton.disabled = false;
  addButton.textContent = modalAddOriginalText;
  addButton.classList.remove("btn--success");
}

function openProductModal(id) {
  const item = findItemById(id);
  if (!item || item.available === false) return;
  modalState = { item, quantity: 1 };
  resetModalAddButton();
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
  resetModalAddButton();
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
  const addButton = document.getElementById("product-modal-add");
  if (addButton.disabled) return;
  const notes = document.getElementById("product-modal-notes").value.trim();
  const price = getItemPrice(modalState.item);
  addToCart({ id: modalState.item.id, name: modalState.item.name, price }, modalState.quantity, notes);
  addButton.disabled = true;
  addButton.textContent = "✓ ADICIONADO";
  addButton.classList.add("btn--success");
  modalCloseTimer = setTimeout(() => {
    modalCloseTimer = null;
    closeProductModal();
  }, 700);
}
