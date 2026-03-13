import { updateCartCounter, addToCart } from "./cart.js";

const FAVORITES_KEY = "favorites";

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(product) {
  const favorites = getFavorites();
  const index = favorites.findIndex((item) => item.id === product.id);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      imageUrl: product.imageUrl,
      rating: product.rating,
      discount: product.discount,
    });
  }

  saveFavorites(favorites);
  return favorites;
}

export function isFavorite(productId) {
  return getFavorites().some((item) => item.id === productId);
}

export function renderStars(rating) {
  if (!Array.isArray(rating)) return "";
  return rating
    .map(
      (url) =>
        `<img src="${url}" alt="★" style="height:16px;width:16px;object-fit:contain;">`,
    )
    .join("");
}

export function buildCardHTML(product, assetPrefix = "./") {
  const currency = "₽";
  const priceHTML = product.oldPrice
    ? `<div class="price-left">
        <p class="_price">${product.price} <span>${currency}</span></p>
        <p class="with-card">С картой</p>
      </div>
      <div class="price-right">
        <p class="regular-price">${product.oldPrice} <span>${currency}</span></p>
        <p class="regular">Обычная</p>
      </div>`
    : `<div class="price-left" style="width:100%">
        <p class="_price">${product.price} <span>${currency}</span></p>
        <p class="with-card">Цена</p>
      </div>`;

  const favorited = isFavorite(product.id);
  const discountLabel = product.discount
    ? `<div class="discount"><p>-${product.discount}%</p></div>`
    : "";

  return `
    <div class="card" data-id="${product.id}">
      <div class="img-box-card">
        <img
          src="${product.imageUrl}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.classList.add('img-error');this.src='${assetPrefix}assets/images/placeholder.png'"
        >
        ${discountLabel}
        <button class="like-heart ${favorited ? "is-favorite" : ""}" aria-label="В избранное">
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill="${favorited ? "#FF6633" : "none"}" stroke="#FF6633" stroke-width="2">
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

export function updateFavoritesCounter() {
  const favCount = document.getElementById("fav-count");
  if (!favCount) return;
  const count = getFavorites().length;
  favCount.hidden = count === 0;
  favCount.textContent = count > 99 ? "99+" : count;
}

function initFavoritesPage() {
  const grid = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("favorites-empty");
  const clearBtn = document.getElementById("clear-favorites");
  const countEl = document.getElementById("count-view");

  updateCartCounter(countEl);
  renderFavoritesGrid(grid, emptyState);

  clearBtn?.addEventListener("click", () => {
    saveFavorites([]);
    renderFavoritesGrid(grid, emptyState);
  });

  grid?.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const favorites = getFavorites();
    const product = favorites.find((p) => p.id === id);

    if (e.target.closest(".remove-favorite")) {
      saveFavorites(favorites.filter((p) => p.id !== id));
      renderFavoritesGrid(grid, emptyState);
      return;
    }

    if (e.target.closest(".like-heart") && product) {
      toggleFavorite(product);
      renderFavoritesGrid(grid, emptyState);
      return;
    }

    if (e.target.closest(".add-to-cart") && product) {
      addToCart(product);
      updateCartCounter(countEl);
    }
  });
}

function show(el) {
  if (!el) return;
  el.removeAttribute("hidden");
}

function hide(el) {
  if (!el) return;
  el.setAttribute("hidden", "");
}

function renderFavoritesGrid(grid, emptyState) {
  if (!grid) return;
  const favorites = getFavorites();

  if (favorites.length === 0) {
    grid.innerHTML = "";
    hide(grid);
    show(emptyState);
    return;
  }

  grid.innerHTML = favorites.map((p) => buildCardHTML(p, "../")).join("");
  hide(emptyState);
  show(grid);
}

if (document.getElementById("favorites-grid")) {
  initFavoritesPage();
}
