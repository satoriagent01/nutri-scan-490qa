import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { saveProduct, loadProduct, saveMeal, loadMeal } from "../src/storage.js";

describe("saveProduct", () => {
  test("saves a product to storage", () => {
    const product = {
      id: "test-product-1",
      name: "Test Product",
      brand: "TestBrand",
      nutrition: {
        energy: { value: 500, unit: "kJ" },
        fat: { value: 10, unit: "g" },
      },
      createdAt: "2024-01-15T10:00:00.000Z",
    };

    saveProduct(product);
    const loaded = loadProduct("test-product-1");

    assert.strictEqual(loaded.name, "Test Product");
    assert.strictEqual(loaded.brand, "TestBrand");
    assert.strictEqual(loaded.nutrition.energy.value, 500);
    assert.strictEqual(loaded.nutrition.fat.value, 10);
  });

  test("overwrites existing product with same id", () => {
    const product1 = {
      id: "test-product-2",
      name: "Original Name",
      nutrition: { energy: { value: 100, unit: "kJ" } },
    };
    const product2 = {
      id: "test-product-2",
      name: "Updated Name",
      nutrition: { energy: { value: 200, unit: "kJ" } },
    };

    saveProduct(product1);
    saveProduct(product2);

    const loaded = loadProduct("test-product-2");
    assert.strictEqual(loaded.name, "Updated Name");
    assert.strictEqual(loaded.nutrition.energy.value, 200);
  });

  test("handles product with custom nutrition components", () => {
    const product = {
      id: "test-product-3",
      name: "Custom Product",
      nutrition: {
        caffeine: { value: 100, unit: "mg" },
        sugar: { value: 5, unit: "g" },
      },
    };

    saveProduct(product);
    const loaded = loadProduct("test-product-3");

    assert.strictEqual(loaded.nutrition.caffeine.value, 100);
    assert.strictEqual(loaded.nutrition.sugar.value, 5);
  });
});

describe("loadProduct", () => {
  test("returns null for non-existent product", () => {
    const loaded = loadProduct("non-existent-id");
    assert.strictEqual(loaded, null);
  });

  test("returns saved product", () => {
    const product = {
      id: "test-product-4",
      name: "Existing Product",
      nutrition: { protein: { value: 20, unit: "g" } },
    };

    saveProduct(product);
    const loaded = loadProduct("test-product-4");

    assert.ok(loaded);
    assert.strictEqual(loaded.name, "Existing Product");
    assert.strictEqual(loaded.nutrition.protein.value, 20);
  });
});

describe("saveMeal", () => {
  test("saves a meal to storage", () => {
    const meal = {
      id: "test-meal-1",
      name: "Test Meal",
      date: "2024-01-15",
      items: [
        {
          productId: "product-1",
          quantity: 100,
          productName: "Product 1",
        },
      ],
      createdAt: "2024-01-15T10:00:00.000Z",
    };

    saveMeal(meal);
    const loaded = loadMeal("test-meal-1");

    assert.strictEqual(loaded.name, "Test Meal");
    assert.strictEqual(loaded.date, "2024-01-15");
    assert.strictEqual(loaded.items.length, 1);
    assert.strictEqual(loaded.items[0].productId, "product-1");
    assert.strictEqual(loaded.items[0].quantity, 100);
  });

  test("overwrites existing meal with same id", () => {
    const meal1 = {
      id: "test-meal-2",
      name: "Original Meal",
      date: "2024-01-15",
      items: [],
    };
    const meal2 = {
      id: "test-meal-2",
      name: "Updated Meal",
      date: "2024-01-16",
      items: [{ productId: "product-2", quantity: 200, productName: "Product 2" }],
    };

    saveMeal(meal1);
    saveMeal(meal2);

    const loaded = loadMeal("test-meal-2");
    assert.strictEqual(loaded.name, "Updated Meal");
    assert.strictEqual(loaded.date, "2024-01-16");
    assert.strictEqual(loaded.items.length, 1);
  });
});

describe("loadMeal", () => {
  test("returns null for non-existent meal", () => {
    const loaded = loadMeal("non-existent-id");
    assert.strictEqual(loaded, null);
  });

  test("returns saved meal", () => {
    const meal = {
      id: "test-meal-3",
      name: "Saved Meal",
      date: "2024-01-15",
      items: [
        { productId: "product-3", quantity: 150, productName: "Product 3" },
      ],
    };

    saveMeal(meal);
    const loaded = loadMeal("test-meal-3");

    assert.ok(loaded);
    assert.strictEqual(loaded.name, "Saved Meal");
    assert.strictEqual(loaded.items.length, 1);
    assert.strictEqual(loaded.items[0].quantity, 150);
  });
});