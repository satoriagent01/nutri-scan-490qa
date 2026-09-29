/**
 * Storage operations for products and meals.
 * Uses a simple in-memory store that can be backed by a file or database.
 */

// In-memory storage
const storage = {
  products: new Map(),
  meals: new Map(),
};

/**
 * Saves a product to storage.
 * @param {Object} product - Product object with id
 * @returns {Object} - The saved product
 */
export function saveProduct(product) {
  storage.products.set(product.id, product);
  return product;
}

/**
 * Loads a product from storage by ID.
 * @param {string} id - Product ID
 * @returns {Object|null} - The product or null if not found
 */
export function loadProduct(id) {
  return storage.products.get(id) || null;
}

/**
 * Saves a meal to storage.
 * @param {Object} meal - Meal object with id
 * @returns {Object} - The saved meal
 */
export function saveMeal(meal) {
  storage.meals.set(meal.id, meal);
  return meal;
}

/**
 * Loads a meal from storage by ID.
 * @param {string} id - Meal ID
 * @returns {Object|null} - The meal or null if not found
 */
export function loadMeal(id) {
  return storage.meals.get(id) || null;
}

/**
 * Clears all storage.
 */
export function clearStorage() {
  storage.products.clear();
  storage.meals.clear();
}

/**
 * Gets all products from storage.
 * @returns {Array<Object>} - Array of all products
 */
export function getAllProducts() {
  return Array.from(storage.products.values());
}

/**
 * Gets all meals from storage.
 * @returns {Array<Object>} - Array of all meals
 */
export function getAllMeals() {
  return Array.from(storage.meals.values());
}