import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { extractNutrition, parseNutritionTable } from "../src/ocr.js";

// Mock the AI/OCR call by intercepting fetch or by providing a mock implementation.
// Since we can't modify src/ocr.js, we test parseNutritionTable directly (deterministic)
// and test extractNutrition by mocking the AI response.

describe("parseNutritionTable", () => {
  test("parses German nutrition label", () => {
    const text = `Nährwertdeklaration
Pro 100 g
Energie	2292 kJ / 549 kcal
Fett	33 g
davon gesättigte Fettsäuren	13 g
Kohlenhydrate	55 g
davon Zucker	45 g
Ballaststoffe	2,4 g
Eiweiß	6,8 g
Salz	0,18 g`;

    const result = parseNutritionTable(text);
    assert.deepStrictEqual(result, {
      energy: { value: 2292, unit: "kJ" },
      energyKcal: { value: 549, unit: "kcal" },
      fat: { value: 33, unit: "g" },
      saturatedFat: { value: 13, unit: "g" },
      carbohydrates: { value: 55, unit: "g" },
      sugars: { value: 45, unit: "g" },
      fiber: { value: 2.4, unit: "g" },
      protein: { value: 6.8, unit: "g" },
      sodium: { value: 0.18, unit: "g" },
    });
  });

  test("parses Dutch nutrition label", () => {
    const text = `Voedingswaarde per 100 ml
energie	199 kJ / 47 kcal
vetten, waarvan	0 g
- verzadigde vetzuren	0 g
- onverzadigde vetzuren	0 g
koolhydraten, waarvan	11 g
- suikers	10 g
- zoetstoffen	0 g
vezels	0,7 g
eiwitten	0,4 g
zout	0 g`;

    const result = parseNutritionTable(text);
    assert.deepStrictEqual(result, {
      energy: { value: 199, unit: "kJ" },
      energyKcal: { value: 47, unit: "kcal" },
      fat: { value: 0, unit: "g" },
      saturatedFat: { value: 0, unit: "g" },
      carbohydrates: { value: 11, unit: "g" },
      sugars: { value: 10, unit: "g" },
      fiber: { value: 0.7, unit: "g" },
      protein: { value: 0.4, unit: "g" },
      sodium: { value: 0, unit: "g" },
    });
  });

  test("parses Italian nutrition label", () => {
    const text = `Valore nutrizionale per 100 g
Energia	2292 kJ / 549 kcal
Grassi	33 g
di cui acidi grassi saturi	13 g
Carboidrati	55 g
di cui zuccheri	45 g
Fibre	2,4 g
Proteine	6,8 g
Sale	0,18 g`;

    const result = parseNutritionTable(text);
    assert.deepStrictEqual(result, {
      energy: { value: 2292, unit: "kJ" },
      energyKcal: { value: 549, unit: "kcal" },
      fat: { value: 33, unit: "g" },
      saturatedFat: { value: 13, unit: "g" },
      carbohydrates: { value: 55, unit: "g" },
      sugars: { value: 45, unit: "g" },
      fiber: { value: 2.4, unit: "g" },
      protein: { value: 6.8, unit: "g" },
      sodium: { value: 0.18, unit: "g" },
    });
  });

  test("handles missing values gracefully", () => {
    const text = `Nährwertdeklaration
Pro 100 g
Energie	2292 kJ / 549 kcal
Fett	33 g`;

    const result = parseNutritionTable(text);
    assert.strictEqual(result.energy.value, 2292);
    assert.strictEqual(result.fat.value, 33);
    assert.strictEqual(result.saturatedFat, undefined);
    assert.strictEqual(result.carbohydrates, undefined);
  });

  test("parses with comma decimals (European format)", () => {
    const text = `Nährwertdeklaration
Pro 100 g
Energie	2292 kJ / 549 kcal
Ballaststoffe	2,4 g
Salz	0,18 g`;

    const result = parseNutritionTable(text);
    assert.strictEqual(result.fiber.value, 2.4);
    assert.strictEqual(result.sodium.value, 0.18);
  });
});

describe("extractNutrition", () => {
  test("calls AI endpoint and returns parsed nutrition", async () => {
    // Mock fetch for the AI call
    const originalFetch = global.fetch;
    global.fetch = async (url, options) => {
      assert.ok(url.includes("openai") || url.includes("api"));
      const body = JSON.parse(options.body);
      assert.ok(body.messages);
      // Return a mock AI response with OCR text
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Nährwertdeklaration\nPro 100 g\nEnergie\t2292 kJ / 549 kcal\nFett\t33 g\nSalz\t0,18 g" } }],
        }),
      };
    };

    try {
      const result = await extractNutrition("mock-image-data", { apiKey: "test-key" });
      assert.ok(result.energy);
      assert.strictEqual(result.energy.value, 2292);
      assert.strictEqual(result.fat.value, 33);
      assert.strictEqual(result.sodium.value, 0.18);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("throws on AI failure", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({ ok: false, status: 500 });

    try {
      await assert.rejects(
        async () => await extractNutrition("mock-image-data", { apiKey: "test-key" }),
        /AI extraction failed/
      );
    } finally {
      global.fetch = originalFetch;
    }
  });
});