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
