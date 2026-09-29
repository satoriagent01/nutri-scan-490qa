import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createProduct, updateProduct, deleteProduct } from "../src/products.js";

describe("createProduct", () => {
  test("creates a product with all fields", () => {
    const product = createProduct({
      name: "Test Chocolate",
      brand: "TestBrand",
      nutrition: {
        energy: { value: 2292, unit: "kJ" },
        fat: { value: 33, unit: "g" },
      },
    });

    assert.ok(product.id);
    assert.strictEqual(product.name, "Test Chocolate");
    assert.strictEqual(product.brand, "TestBrand");
    assert.strictEqual(product.nutrition.energy.value, 2292);
    assert.ok(product.createdAt);
  });

  test("creates a product with minimal fields", () => {
    const product = createProduct({
      name: "Simple Product",
    });

    assert.ok(product.id);
    assert.strictEqual(product.name, "Simple Product");
    assert.strictEqual(product.nutrition, undefined);
  });

  test("creates a product with custom nutrition components", () => {
    const product = createProduct({
      name: "Energy Drink",
      nutrition: {
        caffeine: { value: 80, unit: "mg" },
        sugar: { value: 27, unit: "g" },
      },
    });

    assert.strictEqual(product.nutrition.caffeine.value, 80);
    assert.strictEqual(product.nutrition.sugar.value, 27);
  });
});

describe("updateProduct", () => {
  test("updates product name", () => {
    const product = createProduct({ name: "Old Name" });
    updateProduct(product.id, { name: "New Name" });

    assert.strictEqual(product.name, "New Name");
  });

  test("updates product nutrition", () => {
    const product = createProduct({
      name: "Product",
      nutrition: { energy: { value: 100, unit: "kJ" } },
    });

    updateProduct(product.id, {
      nutrition: { energy: { value: 200, unit: "kJ" } },
    });

    assert.strictEqual(product.nutrition.energy.value, 200);
  });

  test("updates product with additional fields", () => {
    const product = createProduct({ name: "Product" });
    updateProduct(product.id, { brand: "TestBrand", category: "Snacks" });

    assert.strictEqual(product.brand, "TestBrand");
    assert.strictEqual(product.category, "Snacks");
  });

  test("throws on invalid id", () => {
    assert.throws(() => updateProduct("nonexistent-id", { name: "Test" }), /Product not found/);
  });
});

describe("deleteProduct", () => {
  test("deletes a product", () => {
    const product = createProduct({ name: "To Delete" });
    deleteProduct(product.id);

    // After deletion, the product should be marked as deleted or removed
    assert.throws(() => updateProduct(product.id, { name: "Test" }), /Product not found/);
  });

  test("throws on deleting non-existent product", () => {
    assert.throws(() => deleteProduct("nonexistent-id"), /Product not found/);
  });
});