import {
  fetchSearchResults,
  loadSearchQuery,
  initSearchInput,
} from "./search.js";
import { addToCart, updateCartCounter } from "./cart.js";
import { toggleFavorite, isFavorite, renderStars } from "./favorites.js";

const grid = document.getElementById("search-results-grid");
const emptyState = document.getElementById("search-empty");
const queryLabel = document.getElementById("search-query-label");
const resultsCount = document.getElementById("results-count");
const countEl = document.getElementById("count-view");

let searchProducts = [];

async function init() {
  updateCartCounter(countEl);
  initSearchInput(document.getElementById("search_input"));

  const query = loadSearchQuery();
  if (queryLabel) queryLabel.textContent = `«${query}»`;

  if (!query) {
    emptyState.hidden = false;
    return;
  }

  try {
    grid.innerHTML = '<p class="loading-text">Поиск…</p>';
    searchProducts = await fetchSearchResults(query);

    if (!searchProducts.length) {
      grid.innerHTML = "";
      emptyState.hidden = false;
      return;
    }

    if (resultsCount)
      resultsCount.textContent = `Найдено: ${searchProducts.length} товаров`;
    grid.innerHTML = searchProducts.map(buildCardHTML).join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML =
      '<p class="error-text">Ошибка поиска. Попробуйте ещё раз.</p>';
  }
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
        <img src="${product.img}" alt="${product.name}" loading="lazy">
        ${product.discount ? `<div class="discount"><p>${product.discount}</p></div>` : ""}
        <button class="like-heart ${favorited ? "is-favorite" : ""}" aria-label="В избранное">
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

grid?.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = Number(card.dataset.id);
  const product = searchProducts.find((p) => p.id === id);
  if (!product) return;

  if (e.target.closest(".add-to-cart")) {
    addToCart(product);
    updateCartCounter(countEl);
    return;
  }

  if (e.target.closest(".like-heart")) {
    toggleFavorite(product);
    const btn = card.querySelector(".like-heart");
    const now = isFavorite(id);
    btn.classList.toggle("is-favorite", now);
    btn.querySelector("path").setAttribute("fill", now ? "#FF6633" : "none");
  }
});

init();
