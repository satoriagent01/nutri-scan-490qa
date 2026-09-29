/**
 * Nutrition calculation module.
 * Scales nutrition data per 100g to arbitrary gram quantities.
 */

/**
 * Calculates nutrition for a given gram quantity of a product.
 * @param {Object} product - Product with nutrition data per 100g
 * @param {number} quantity - Grams of the product
 * @returns {Object} - Nutrition values scaled to the quantity
 */
export function calculateNutrition(product, quantity) {
  if (!product || !product.nutrition) {
    return {};
  }

  const factor = quantity / 100;
  const result = {};

  for (const [key, value] of Object.entries(product.nutrition)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle nested objects like energy: { value: 2292, unit: "kJ" }
      result[key] = { ...value };
      if (typeof result[key].value === 'number') {
        result[key].value = result[key].value * factor;
      }
    } else if (typeof value === 'number') {
      result[key] = value * factor;
    }
  }

  return result;
}

/**
 * Sums multiple nutrition objects together.
 * @param {Array<Object>} nutritionArray - Array of nutrition objects
 * @returns {Object} - Summed nutrition values
 */
export function sumNutrition(nutritionArray) {
  const result = {};

  for (const nutrition of nutritionArray) {
    if (!nutrition || typeof nutrition !== 'object') {
      continue;
    }

    for (const [key, value] of Object.entries(nutrition)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested objects like energy: { value: 2292, unit: "kJ" }
        if (!result[key]) {
          result[key] = { value: 0, unit: value.unit || '' };
        }
        if (typeof value.value === 'number') {
          result[key].value += value.value;
        }
      } else if (typeof value === 'number') {
        if (!result[key]) {
          result[key] = 0;
        }
        result[key] += value;
      }
    }
  }

  return result;
}