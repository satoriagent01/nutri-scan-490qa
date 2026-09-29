/**
 * Meal planning module.
 * Allows creating meals, adding products with gram quantities,
 * and calculating total nutrition for a meal.
 */

import { calculateNutrition } from './nutrition.js';
import { getProduct } from './products.js';

// In-memory storage
const meals = new Map();

/**
 * Creates a new meal with unique ID.
 * @param {string} name - Meal name
 * @param {string} [date] - Date of the meal (ISO string), defaults to now
 * @returns {Object} - The created meal with id
 */
export function createMeal(name, date) {
  const id = crypto.randomUUID();
  const meal = {
    id,
    name,
    date: date || new Date().toISOString(),
    items: [],
    createdAt: new Date().toISOString(),
  };
  meals.set(id, meal);
  return meal;
}

/**
 * Adds a product with a gram quantity to a meal.
 * @param {string} mealId - Meal ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Grams of the product
 * @returns {Object|null} - The added item or null if meal/product not found
 */
export function addMealItem(mealId, productId, quantity) {
  const meal = meals.get(mealId);
  if (!meal) {
    return null;
  }

  const product = getProduct(productId);
  if (!product) {
    return null;
  }

  const nutrition = calculateNutrition(product, quantity);

  const item = {
    id: crypto.randomUUID(),
    productId,
    productName: product.name,
    quantity,
    nutrition,
  };

  meal.items.push(item);
  return item;
}

/**
 * Gets the total nutrition for a meal by summing all items.
 * @param {string} mealId - Meal ID
 * @returns {Object|null} - Total nutrition or null if meal not found
 */
export function getMealTotal(mealId) {
  const meal = meals.get(mealId);
  if (!meal) {
    return null;
  }

  if (meal.items.length === 0) {
    return {};
  }

  const nutritionArray = meal.items.map(item => item.nutrition);
  const { sumNutrition } = await import('./nutrition.js');
  return sumNutrition(nutritionArray);
}

/**
 * Gets a meal by ID.
 * @param {string} id - Meal ID
 * @returns {Object|null} - The meal or null if not found
 */
export function getMeal(id) {
  return meals.get(id) || null;
}

/**
 * Gets all meals.
 * @returns {Array<Object>} - Array of all meals
 */
export function getAllMeals() {
  return Array.from(meals.values());
}

/**
 * Deletes a meal by ID.
 * @param {string} id - Meal ID
 * @returns {boolean} - True if deleted, false if not found
 */
export function deleteMeal(id) {
  return meals.delete(id);
}