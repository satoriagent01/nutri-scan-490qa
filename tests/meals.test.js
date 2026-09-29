import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createMeal, addMealItem, getMealTotal } from "../src/meals.js";
import { createProduct } from "../src/products.js";

describe("createMeal", () => {
  test("creates a meal with name and date", () => {
    const meal = createMeal("Breakfast", "2024-01-15");

    assert.ok(meal.id);
    assert.strictEqual(meal.name, "Breakfast");
    assert.strictEqual(meal.date, "2024-01-15");
    assert.strictEqual(meal.items.length, 0);
    assert.ok(meal.createdAt);
  });

  test("creates a meal with default date if not provided", () => {
    const meal = createMeal("Lunch");
    assert.ok(meal.id);
    assert.strictEqual(meal.name, "Lunch");
    assert.ok(meal.date);
  });
});

describe("addMealItem", () => {
  test("adds a product with quantity to a meal", () => {
    const meal = createMeal("Dinner");
    const product = createProduct({
      name: "Chocolate Bar",
      nutrition: {
        energy: { value: 2292, unit: "kJ" },
        fat: { value: 33, unit: "g" },
        protein: { value: 6.8, unit: "g" },
      },
    });

    addMealItem(meal.id, product.id, 50);

    assert.strictEqual(meal.items.length, 1);
    assert.strictEqual(meal.items[0].productId, product.id);
    assert.strictEqual(meal.items[0].quantity, 50);
    assert.strictEqual(meal.items[0].productName, "Chocolate Bar");
  });

  test("adds multiple items to a meal", () => {
    const meal = createMeal("Snacks");
    const product1 = createProduct({
      name: "Apple",
      nutrition: { energy: { value: 218, unit: "kJ" } },
    });
    const product2 = createProduct({
      name: "Banana",
      nutrition: { energy: { value: 358, unit: "kJ" } },
    });

    addMealItem(meal.id, product1.id, 150);
    addMealItem(meal.id, product2.id, 120);

    assert.strictEqual(meal.items.length, 2);
  });

  test("throws on invalid meal id", () => {
    assert.throws(() => addMealItem("nonexistent-id", "product-id", 100), /Meal not found/);
  });

  test("throws on invalid product id", () => {
    const meal = createMeal("Test Meal");
    assert.throws(() => addMealItem(meal.id, "nonexistent-product", 100), /Product not found/);
  });
});

describe("getMealTotal", () => {
  test("returns total nutrition for a meal with one item", () => {
    const meal = createMeal("Breakfast");
    const product = createProduct({
      name: "Yogurt",
      nutrition: {
        energy: { value: 370, unit: "kJ" },
        protein: { value: 10, unit: "g" },
        sugar: { value: 4, unit: "g" },
      },
    });

    addMealItem(meal.id, product.id, 200);

    const total = getMealTotal(meal.id);
    assert.strictEqual(total.energy.value, 740);
    assert.strictEqual(total.protein.value, 20);
    assert.strictEqual(total.sugar.value, 8);
  });

  test("returns total nutrition for a meal with multiple items", () => {
    const meal = createMeal("Lunch");
    const product1 = createProduct({
      name: "Rice",
      nutrition: {
        energy: { value: 1500, unit: "kJ" },
        carbohydrates: { value: 28, unit: "g" },
      },
    });
    const product2 = createProduct({
      name: "Chicken",
      nutrition: {
        energy: { value: 690, unit: "kJ" },
        protein: { value: 23, unit: "g" },
      },
    });

    addMealItem(meal.id, product1.id, 200);
    addMealItem(meal.id, product2.id, 150);

    const total = getMealTotal(meal.id);
    assert.strictEqual(total.energy.value, 4380);
    assert.strictEqual(total.carbohydrates.value, 56);
    assert.strictEqual(total.protein.value, 34.5);
  });

  test("handles custom nutrition components in meal total", () => {
    const meal = createMeal("Custom Meal");
    const product1 = createProduct({
      name: "Coffee",
      nutrition: { caffeine: { value: 80, unit: "mg" } },
    });
    const product2 = createProduct({
      name: "Energy Drink",
      nutrition: { caffeine: { value: 150, unit: "mg" } },
    });

    addMealItem(meal.id, product1.id, 200);
    addMealItem(meal.id, product2.id, 300);

    const total = getMealTotal(meal.id);
    assert.strictEqual(total.caffeine.value, 230);
  });

  test("returns empty object for meal with no items", () => {
    const meal = createMeal("Empty Meal");
    const total = getMealTotal(meal.id);
    assert.deepStrictEqual(total, {});
  });

  test("throws on invalid meal id", () => {
    assert.throws(() => getMealTotal("nonexistent-id"), /Meal not found/);
  });

  test("scales nutrition by quantity correctly", () => {
    const meal = createMeal("Scaled Meal");
    const product = createProduct({
      name: "Product",
      nutrition: {
        energy: { value: 1000, unit: "kJ" },
        fat: { value: 20, unit: "g" },
      },
    });

    addMealItem(meal.id, product.id, 50);

    const total = getMealTotal(meal.id);
    assert.strictEqual(total.energy.value, 500);
    assert.strictEqual(total.fat.value, 10);
  });
});