import { getCart, saveCart, updateCartCounter, getCartCount } from "./cart.js";
import { initSearchInput } from "./search.js";

const itemsEl = document.getElementById("basket-items");
const emptyEl = document.getElementById("basket-empty");
const summaryEl = document.getElementById("basket-summary");
const summaryCount = document.getElementById("summary-count");
const summaryTotal = document.getElementById("summary-total");
const countEl = document.getElementById("count-view");

function init() {
  updateCartCounter(countEl);
  initSearchInput(document.getElementById("search_input"), true);
  render();

  document.getElementById("btn-order")?.addEventListener("click", () => {
    alert("Заглушка");
  });
}

function render() {
  const cart = getCart();

  if (!cart.length) {
    itemsEl.style.display = "none";
    summaryEl.style.display = "none";
    emptyEl.style.display = "flex";
    return;
  }

  itemsEl.style.display = "flex";
  summaryEl.style.display = "flex";
  emptyEl.style.display = "none";

  itemsEl.innerHTML = cart.map(buildItemHTML).join("");

  const total = cart.reduce(
    (s, i) => s + (i.price_with_card ?? i.price) * i.quantity,
    0,
  );
  summaryCount.textContent = getCartCount(cart);
  summaryTotal.textContent = `${total.toLocaleString("ru-RU")} ${cart[0].currency}`;
}

function buildItemHTML(item) {
  return `
    <div class="basket-item" data-id="${item.id}">
      <div class="basket-item__img">
        <img src="${item.img}" alt="${item.name}"
          onerror="this.src='../assets/images/placeholder.png';this.style.opacity='1'">
      </div>
      <div class="basket-item__info">
        <p class="basket-item__name">${item.name}</p>
        <p class="basket-item__price">${(item.price_with_card ?? item.price).toLocaleString("ru-RU")} ${item.currency}</p>
      </div>
      <div class="basket-item__controls">
        <button class="qty-btn qty-btn--minus" data-action="dec" aria-label="Уменьшить">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn qty-btn--plus" data-action="inc" aria-label="Увеличить">+</button>
      </div>
      <p class="basket-item__subtotal">
        ${((item.price_with_card ?? item.price) * item.quantity).toLocaleString("ru-RU")} ${item.currency}
      </p>
      <button class="basket-item__remove" data-action="remove" aria-label="Удалить">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bfbfbf" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`;
}

itemsEl?.addEventListener("click", (e) => {
  const item = e.target.closest(".basket-item");
  if (!item) return;
  const id = Number(item.dataset.id);
  const cart = getCart();
  const entry = cart.find((i) => i.id === id);
  if (!entry) return;

  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "inc") {
    entry.quantity++;
  } else if (action === "dec") {
    if (entry.quantity > 1) entry.quantity--;
    else cart.splice(cart.indexOf(entry), 1);
  } else if (action === "remove") {
    cart.splice(cart.indexOf(entry), 1);
  } else return;

  saveCart(cart);
  updateCartCounter(countEl);
  render();
});

init();
