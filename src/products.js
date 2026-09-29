/**
 * Product CRUD operations.
 * Products store nutrition data per 100g and support custom components.
 */

// In-memory storage
const products = new Map();

/**
 * Creates a new product with unique ID.
 * @param {Object} data - Product data
 * @param {string} data.name - Product name
 * @param {string} [data.brand] - Brand name
 * @param {Object} [data.nutrition] - Nutrition data per 100g
 * @returns {Object} - The created product with id
 */
export function createProduct(data) {
  const id = crypto.randomUUID();
  const product = {
    id,
    name: data.name,
    brand: data.brand,
    nutrition: data.nutrition,
    createdAt: new Date().toISOString(),
  };
  products.set(id, product);
  return product;
}

/**
 * Updates a product by ID.
 * @param {string} id - Product ID
 * @param {Object} data - Updated fields
 * @returns {Object} - The updated product
 * @throws {Error} - If product not found
 */
export function updateProduct(id, data) {
  const product = products.get(id);
  if (!product) {
    throw new Error(`Product not found: ${id}`);
  }

  // Merge all provided fields into the product
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      product[key] = value;
    }
  }

  products.set(id, product);
  return product;
}

/**
 * Deletes a product by ID.
 * @param {string} id - Product ID
 * @returns {boolean} - True if deleted
 * @throws {Error} - If product not found
 */
export function deleteProduct(id) {
  const product = products.get(id);
  if (!product) {
    throw new Error(`Product not found: ${id}`);
  }
  return products.delete(id);
}

/**
 * Gets a product by ID.
 * @param {string} id - Product ID
 * @returns {Object|null} - The product or null if not found
 */
export function getProduct(id) {
  return products.get(id) || null;
}

/**
 * Gets all products.
 * @returns {Array<Object>} - Array of all products
 */
export function getAllProducts() {
  return Array.from(products.values());
}