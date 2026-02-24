import { base_url } from "./api_details.js";

async function getProducts() {
  try {
    const response = await fetch(`${base_url}/api/products`);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
getProducts();
