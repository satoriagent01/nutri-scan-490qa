import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateNutrition, sumNutrition } from "../src/nutrition.js";

describe("calculateNutrition", () => {
  test("calculates nutrition for 100g of product", () => {
    const product = {
      name: "Test Product",
      nutrition: {
        energy: { value: 2292, unit: "kJ" },
        energyKcal: { value: 549, unit: "kcal" },
        fat: { value: 33, unit: "g" },
        saturatedFat: { value: 13, unit: "g" },
        carbohydrates: { value: 55, unit: "g" },
        sugars: { value: 45, unit: "g" },
        fiber: { value: 2.4, unit: "g" },
        protein: { value: 6.8, unit: "g" },
        sodium: { value: 0.18, unit: "g" },
      },
    };

    const result = calculateNutrition(product, 100);
    assert.strictEqual(result.energy.value, 2292);
    assert.strictEqual(result.energyKcal.value, 549);
    assert.strictEqual(result.fat.value, 33);
    assert.strictEqual(result.saturatedFat.value, 13);
    assert.strictEqual(result.carbohydrates.value, 55);
    assert.strictEqual(result.sugars.value, 45);
    assert.strictEqual(result.fiber.value, 2.4);
    assert.strictEqual(result.protein.value, 6.8);
    assert.strictEqual(result.sodium.value, 0.18);
  });

  test("calculates nutrition for 30g serving", () => {
    const product = {
      name: "Test Product",
      nutrition: {
        energy: { value: 2292, unit: "kJ" },
        energyKcal: { value: 549, unit: "kcal" },
        fat: { value: 33, unit: "g" },
        saturatedFat: { value: 13, unit: "g" },
        carbohydrates: { value: 55, unit: "g" },
        sugars: { value: 45, unit: "g" },
        fiber: { value: 2.4, unit: "g" },
        protein: { value: 6.8, unit: "g" },
        sodium: { value: 0.18, unit: "g" },
      },
    };

    const result = calculateNutrition(product, 30);
    assert.strictEqual(result.energy.value, 687.6);
    assert.strictEqual(result.energyKcal.value, 164.7);
    assert.strictEqual(result.fat.value, 9.9);
    assert.strictEqual(result.saturatedFat.value, 3.9);
    assert.strictEqual(result.carbohydrates.value, 16.5);
    assert.strictEqual(result.sugars.value, 13.5);
    assert.strictEqual(result.fiber.value, 0.72);
    assert.strictEqual(result.protein.value, 2.04);
    assert.strictEqual(result.sodium.value, 0.054);
  });

  test("handles zero quantity", () => {
    const product = {
      name: "Test Product",
      nutrition: {
        energy: { value: 2292, unit: "kJ" },
        fat: { value: 33, unit: "g" },
      },
    };

    const result = calculateNutrition(product, 0);
    assert.strictEqual(result.energy.value, 0);
    assert.strictEqual(result.fat.value, 0);
  });

  test("handles custom nutrition components", () => {
    const product = {
      name: "Test Product",
      nutrition: {
        energy: { value: 2292, unit: "kJ" },
        caffeine: { value: 80, unit: "mg" },
        vitaminC: { value: 50, unit: "mg" },
      },
    };

    const result = calculateNutrition(product, 100);
    assert.strictEqual(result.caffeine.value, 80);
    assert.strictEqual(result.vitaminC.value, 50);
  });

  test("scales custom components correctly", () => {
    const product = {
      name: "Test Product",
      nutrition: {
        caffeine: { value: 80, unit: "mg" },
      },
    };

    const result = calculateNutrition(product, 50);
    assert.strictEqual(result.caffeine.value, 40);
  });
});

describe("sumNutrition", () => {
  test("sums two nutrition objects", () => {
    const nutrition1 = {
      energy: { value: 2292, unit: "kJ" },
      fat: { value: 33, unit: "g" },
    };

    const nutrition2 = {
      energy: { value: 500, unit: "kJ" },
      fat: { value: 10, unit: "g" },
    };

    const result = sumNutrition([nutrition1, nutrition2]);
    assert.strictEqual(result.energy.value, 2792);
    assert.strictEqual(result.fat.value, 43);
  });

  test("sums multiple nutrition objects", () => {
    const nutrition1 = { energy: { value: 100, unit: "kJ" } };
    const nutrition2 = { energy: { value: 200, unit: "kJ" } };
    const nutrition3 = { energy: { value: 300, unit: "kJ" } };

    const result = sumNutrition([nutrition1, nutrition2, nutrition3]);
    assert.strictEqual(result.energy.value, 600);
  });

  test("sums with different units (preserves first unit)", () => {
    const nutrition1 = { energy: { value: 100, unit: "kJ" } };
    const nutrition2 = { energy: { value: 200, unit: "kcal" } };

    const result = sumNutrition([nutrition1, nutrition2]);
    assert.strictEqual(result.energy.unit, "kJ");
    assert.strictEqual(result.energy.value, 300);
  });

  test("handles empty array", () => {
    const result = sumNutrition([]);
    assert.deepStrictEqual(result, {});
  });

  test("sums custom components", () => {
    const nutrition1 = { caffeine: { value: 80, unit: "mg" } };
    const nutrition2 = { caffeine: { value: 40, unit: "mg" } };

    const result = sumNutrition([nutrition1, nutrition2]);
    assert.strictEqual(result.caffeine.value, 120);
  });
});