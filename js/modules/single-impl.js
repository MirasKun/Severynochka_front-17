import { updateCartCounter } from "./cart.js";
import { initSearchInput } from "./search.js";

const searchInput = document.getElementById("search_input");
const countEl = document.getElementById("count-view");

initSearchInput(searchInput);
updateCartCounter(countEl);
