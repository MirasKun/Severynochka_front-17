import { API_CONFIG } from "./api_details.js";
import { addToCart, updateCartCounter } from "./modules/cart.js";
import {
  toggleFavorite,
  isFavorite,
  updateFavoritesCounter,
  renderStars,
} from "./modules/favorites.js";
import { initSearchInput } from "./modules/search.js";

let allProducts = [];

const cardBox = document.querySelector(".card-box");
const countEl = document.getElementById("count-view");
const searchInput = document.getElementById("search_input");

async function init() {
  updateCartCounter(countEl);
  updateFavoritesCounter();
  initSearchInput(searchInput);
  await loadProducts();
}

async function loadProducts() {
  try {
    cardBox.innerHTML = '<p class="loading-text">Загрузка товаров…</p>';
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`,
    );
    if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (err) {
    console.error("Ошибка загрузки товаров:", err);
    cardBox.innerHTML =
      '<p class="error-text">Не удалось загрузить товары. Попробуйте позже.</p>';
  }
}

function renderProducts(products) {
  if (!products.length) {
    cardBox.innerHTML = '<p class="empty-text">Товары не найдены.</p>';
    return;
  }

  cardBox.innerHTML = products.map(buildCardHTML).join("");
}

function buildCardHTML(product) {
  const priceHTML = product.price_with_card
    ? `<div class="price-left">
        <p class="_price">${product.price_with_card} <span>${product.currency}</span></p>
        <p class="with-card">С картой</p>
      </div>
      <div class="price-right">
        <p class="regular-price">${product.price} <span>${product.currency}</span></p>
        <p class="regular">Обычная</p>
      </div>`
    : `<div class="price-left" style="width:100%">
        <p class="_price">${product.price} <span>${product.currency}</span></p>
        <p class="with-card">Цена</p>
      </div>`;

  const favorited = isFavorite(product.id);

  return `
    <div class="card" data-id="${product.id}">
      <div class="img-box-card">
<img 
  src="${product.img}" 
  alt="${product.name}" 
  onerror="this.src='../assets/images/placeholder.png';"
  loading="lazy"
>
        ${product.discount ? `<div class="discount"><p>${product.discount}</p></div>` : ""}
        <button class="like-heart ${favorited ? "is-favorite" : ""}" aria-label="Добавить в избранное">
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill="${favorited ? "#FF6633" : "none"}"
            stroke="#FF6633" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="card-inf">
        <div class="card-price">${priceHTML}</div>
        <div class="inf-abaut-card"><p>${product.name}</p></div>
        <div class="card-rating">${renderStars(product.rating)}</div>
        <button class="add-to-cart">В корзину</button>
      </div>
    </div>`;
}

cardBox.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const id = Number(card.dataset.id);
  const product = allProducts.find((p) => p.id === id);
  if (!product) return;

  if (e.target.closest(".add-to-cart")) {
    addToCart(product);
    updateCartCounter(countEl);
    return;
  }

  if (e.target.closest(".like-heart")) {
    toggleFavorite(product);

    const heartBtn = card.querySelector(".like-heart");
    const now = isFavorite(id);
    heartBtn.classList.toggle("is-favorite", now);
    heartBtn
      .querySelector("path")
      .setAttribute("fill", now ? "#FF6633" : "none");
  }
});

init();
