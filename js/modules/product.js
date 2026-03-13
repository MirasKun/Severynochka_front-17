import { API_CONFIG } from "../api_details.js";
import { addToCart, updateCartCounter } from "./cart.js";
import {
  toggleFavorite,
  isFavorite,
  renderStars,
  buildCardHTML,
} from "./favorites.js";
import { initSearchInput } from "./search.js";

const loadingEl = document.getElementById("product-loading");
const errorEl = document.getElementById("product-error");
const detailEl = document.getElementById("product-detail");
const relatedEl = document.getElementById("product-related");
const countEl = document.getElementById("count-view");

async function init() {
  updateCartCounter(countEl);
  initSearchInput(document.getElementById("search_input"), true);

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    showError();
    return;
  }

  try {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id)}`,
    );
    if (!res.ok) throw new Error("Product not found");

    const data = await res.json();

    const product = data.products ? data.products[0] : data;
    renderProductPage(product);
    loadRelatedProducts();
  } catch (err) {
    console.error(err);
    showError();
  }
}

function renderProductPage(p) {
  if (!p) return;

  document.getElementById("product-title").textContent = p.name;
  const desktopTitle = document.getElementById("product-title-desktop");
  if (desktopTitle) desktopTitle.textContent = p.name;

  document.getElementById("product-price-card").textContent = `${p.price} ₽`;
  document.getElementById("product-price-regular").textContent = p.oldPrice
    ? `${p.oldPrice} ₽`
    : "";

  const imgEl = document.getElementById("product-img");
  imgEl.src = p.imageUrl || "../assets/images/placeholder.png";
  imgEl.onerror = () => {
    imgEl.src = "../assets/images/placeholder.png";
  };

  const discEl = document.getElementById("product-discount");
  if (p.discount) {
    discEl.textContent = `-${p.discount}%`;
    discEl.style.display = "block";
  } else {
    discEl.style.display = "none";
  }

  document.getElementById("product-rating").innerHTML = renderStars(p.rating);

  const gallery = p["watching-photo"];
  if (Array.isArray(gallery) && gallery.length) {
    const galleryEl = document.getElementById("product-gallery");
    if (galleryEl) {
      galleryEl.innerHTML = gallery
        .map(
          (url) =>
            `<img src="${url}" alt="${p.name}" loading="lazy"
              onerror="this.src='../assets/images/placeholder.png'">`,
        )
        .join("");
    }
  }

  const favBtn = document.getElementById("btn-add-favorite");
  const updateFavUI = () => {
    const active = isFavorite(p.id);
    favBtn.classList.toggle("is-favorite", active);
    favBtn
      .querySelector("svg")
      .setAttribute("fill", active ? "#FF6633" : "none");
  };
  updateFavUI();

  favBtn.onclick = () => {
    toggleFavorite(p);
    updateFavUI();
  };
  document.getElementById("btn-add-to-cart").onclick = () => {
    addToCart(p);
    updateCartCounter(countEl);
  };

  if (loadingEl) loadingEl.style.display = "none";
  if (detailEl) detailEl.style.display = "flex";
}

async function loadRelatedProducts() {
  try {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`,
    );
    const data = await res.json();
    const all = data.products ?? data;
    const related = all.slice(0, 4);

    const grid = document.getElementById("related-grid");
    grid.innerHTML = related.map((item) => buildCardHTML(item, "../")).join("");
    relatedEl.style.display = "block";
  } catch (e) {
    console.warn("Не удалось загрузить похожие товары");
  }
}

function showError() {
  if (loadingEl) loadingEl.style.display = "none";
  if (errorEl) errorEl.style.display = "block";
}

init();
