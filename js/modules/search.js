import { API_CONFIG } from "../api_details.js";

const SEARCH_QUERY_KEY = "searchQuery";

export function saveSearchQuery(query) {
  sessionStorage.setItem(SEARCH_QUERY_KEY, query);
}

export function loadSearchQuery() {
  return sessionStorage.getItem(SEARCH_QUERY_KEY) || "";
}

// export function initSearchInput(inputEl) {
//   if (!inputEl) return;

//   inputEl.value = loadSearchQuery();

//   const doSearch = () => {
//     const query = inputEl.value.trim();
//     if (!query) return;
//     saveSearchQuery(query);

//     const isInPages = window.location.pathname.includes("/pages/");
//     const targetPath = isInPages
//       ? "./search-results.html"
//       : "./pages/search-results.html";

//     window.location.href = targetPath;
//   };

//   inputEl.addEventListener("keydown", (e) => {
//     if (e.key === "Enter") doSearch();
//   });

//   const searchIcon = document.querySelector(".search-icon-wrap");
//   searchIcon?.addEventListener("click", doSearch);
// }
export function initSearchInput(inputEl) {
  if (!inputEl) return;

  inputEl.value = loadSearchQuery();

  const suggestionsEl = document.querySelector(".search-suggestions");

  const doSearch = () => {
    const query = inputEl.value.trim();
    if (!query) return;

    saveSearchQuery(query);

    const isInPages = window.location.pathname.includes("/pages/");
    const targetPath = isInPages
      ? "./search-results.html"
      : "./pages/search-results.html";

    window.location.href = targetPath;
  };

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  const searchIcon = document.querySelector(".search-icon-wrap");
  searchIcon?.addEventListener("click", doSearch);




  inputEl.addEventListener("input", async () => {
    const query = inputEl.value.trim();

    if (query.length < 2) {
      suggestionsEl.style.display = "none";
      return;
    }

    const products = await fetchSearchResults(query);

    suggestionsEl.innerHTML = "";

    products.slice(0, 5).forEach((product) => {
      const item = document.createElement("div");
      item.textContent = product.name;

      item.addEventListener("click", () => {
        inputEl.value = product.name;
        suggestionsEl.style.display = "none";
        doSearch();
      });

      suggestionsEl.appendChild(item);
    });

    suggestionsEl.style.display = "block";
  });


  document.addEventListener("click", (e) => {
    if (!e.target.closest(".input-box")) {
      suggestionsEl.style.display = "none";
    }
  });
}

export async function fetchSearchResults(query) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ошибка сети: ${res.status}`);
  const products = await res.json();

  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)),
  );
}

export function filterProducts(products, query) {
  const q = query.toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(q));
}
