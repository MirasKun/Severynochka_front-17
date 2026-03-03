const CART_KEY = "cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      price_with_card: product.price_with_card ?? product.price,
      currency: product.currency,
      img: product.img,
      quantity: 1,
    });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);
  if (!item) return cart;

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  item.quantity = quantity;
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  return [];
}

export function getCartTotal(cart) {
  return cart.reduce(
    (sum, item) => sum + item.price_with_card * item.quantity,
    0,
  );
}

export function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function updateCartCounter(countElement) {
  const cart = getCart();
  const total = getCartCount(cart);

  if (!countElement) return;

  if (total > 0) {
    countElement.hidden = false;
    countElement.textContent = total > 99 ? "99+" : total;
  } else {
    countElement.hidden = true;
  }
}
