const CART_STORAGE_KEY = "torandus_cart";

function findCatalogItemById(id) {
  return PRODUCTS.find((p) => p.id === id) || PROMOTIONS.find((p) => p.id === id) || null;
}

function loadCartFromStorage() {
  let stored;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    stored = raw ? JSON.parse(raw) : [];
  } catch (e) {
    stored = [];
  }
  if (!Array.isArray(stored)) stored = [];

  const validated = [];
  stored.forEach((item) => {
    const catalogItem = findCatalogItemById(item.productId);
    if (!catalogItem || catalogItem.available === false) return;
    const currentPrice = catalogItem.price !== undefined ? catalogItem.price : catalogItem.pricePromo;
    validated.push({ ...item, name: catalogItem.name, unitPrice: currentPrice });
  });
  if (validated.length !== stored.length) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validated));
  }
  return validated;
}

let cartItems = loadCartFromStorage();

function reloadCartFromStorage() {
  cartItems = loadCartFromStorage();
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

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
