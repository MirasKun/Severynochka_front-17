import { API_CONFIG } from "../api_details.js";
import { addToCart, updateCartCounter } from "./cart.js";
import {
  toggleFavorite,
  isFavorite,
  renderStars,
  buildCardHTML,
} from "./favorites.js";
import { initSearchInput } from "./search.js";

const countEl = document.getElementById("count-view");
const loadingEl = document.getElementById("product-loading");
const errorEl = document.getElementById("product-error");
const detailEl = document.getElementById("product-detail");
const relatedEl = document.getElementById("product-related");

let currentProduct = null;

async function init() {
  updateCartCounter(countEl);
  initSearchInput(document.getElementById("search_input"), true);

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id) {
    showError();
    return;
  }

  try {
    const [productRes, allRes] = await Promise.all([
      fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id)}`),
      fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`),
    ]);

    if (!productRes.ok) throw new Error("Not found");

    currentProduct = await productRes.json();
    const allProducts = await allRes.json();

    renderProduct(currentProduct);
    renderRelated(allProducts.filter((p) => p.id !== id).slice(0, 4));
  } catch {
    showError();
  }
}

function renderProduct(p) {
  document.title = `${p.name} — Северяночка`;

  document.getElementById("product-name-breadcrumb").textContent = p.name;
  document.getElementById("product-title").textContent = p.name;
  document.getElementById("product-img").src = p.img;
  document.getElementById("product-img").alt = p.name;
  document.getElementById("product-rating").innerHTML = renderStars(p.rating);

  const pricingEl = document.getElementById("product-pricing");
  pricingEl.innerHTML =
    p.price_with_card && p.price_with_card !== p.price
      ? `<div class="price-with-card">
        <span class="price-big">${p.price_with_card} ${p.currency}</span>
        <span class="price-label">С картой</span>
      </div>
      <div class="price-regular">
        <span class="price-old">${p.price} ${p.currency}</span>
        <span class="price-label">Обычная</span>
      </div>`
      : `<span class="price-big">${p.price} ${p.currency}</span>`;

  const favBtn = document.getElementById("btn-favorite");
  const updateFavBtn = () => {
    const fav = isFavorite(p.id);
    favBtn.querySelector("path").setAttribute("fill", fav ? "#ff6633" : "none");
    favBtn.classList.toggle("is-favorite", fav);
  };
  updateFavBtn();

  favBtn.addEventListener("click", () => {
    toggleFavorite(p);
    updateFavBtn();
  });

  document.getElementById("btn-add-to-cart").addEventListener("click", () => {
    addToCart(p);
    updateCartCounter(countEl);
  });

  loadingEl.style.display = "none";
  detailEl.style.display = "flex";
}

function renderRelated(products) {
  if (!products.length) return;
  const grid = document.getElementById("related-grid");
  grid.innerHTML = products.map((p) => buildCardHTML(p, "../")).join("");
  relatedEl.style.display = "block";

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (e.target.closest(".add-to-cart")) {
      addToCart(product);
      updateCartCounter(countEl);
    } else if (e.target.closest(".like-heart")) {
      toggleFavorite(product);
      const btn = card.querySelector(".like-heart");
      const now = isFavorite(id);
      btn.classList.toggle("is-favorite", now);
      btn.querySelector("path").setAttribute("fill", now ? "#FF6633" : "none");
    }
  });
}

function showError() {
  loadingEl.style.display = "none";
  errorEl.style.display = "flex";
}

init();
