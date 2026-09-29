/**
 * OCR extraction module.
 * Parses nutrition labels in multiple languages (German, Dutch, Italian, English).
 */

/**
 * Parses OCR text into structured nutrition data.
 * Handles multilingual nutrition labels.
 * @param {string} text - The OCR text from the image
 * @returns {Object} - Structured nutrition data
 */
export function parseNutritionTable(text) {
  const result = {};

  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split on tab or multiple spaces
    let parts;
    if (trimmed.includes('\t')) {
      parts = trimmed.split('\t');
    } else {
      parts = trimmed.split(/\s{2,}/);
    }

    const key = parts[0].trim().toLowerCase();
    const valueStr = parts[1] ? parts[1].trim() : '';

    // Energy line: "Energie 2292 kJ / 549 kcal"
    const energyMatch = valueStr.match(/(\d+[.,]?\d*)\s*(?:kj|kJ)\s*(?:\/|–|-)\s*(\d+[.,]?\d*)\s*(?:kcal|kCal)/i);
    if (energyMatch && (key.includes('energie') || key.includes('energia') || key.includes('energy'))) {
      result.energy = { value: parseFloat(energyMatch[1].replace(',', '.')), unit: 'kJ' };
      result.energyKcal = { value: parseFloat(energyMatch[2].replace(',', '.')), unit: 'kcal' };
      continue;
    }

    // Fat: "Fett 33 g" or "vetten 0 g" or "grassi 0 g"
    // Must match fat but NOT saturated fat (which has "davon", "waarvan", "di cui", "dont")
    if (!key.includes('verzadigd') && !key.includes('gesättigt') && !key.includes('saturi') &&
        !key.includes('vetzuren') && !key.includes('fettsäuren') && !key.includes('fatty')) {
      const fatMatch = valueStr.match(/^(\d+[.,]?\d*)\s*g/i);
      if (fatMatch && (key.includes('fett') || key.includes('vet') || key.includes('grass') || key.includes('matière'))) {
        result.fat = { value: parseFloat(fatMatch[1].replace(',', '.')), unit: 'g' };
        continue;
      }
    }

    // Saturated fat: "davon gesättigte Fettsäuren 13 g" or "waarvan verzadigde vetzuren 0 g"
    const satFatMatch = valueStr.match(/^(\d+[.,]?\d*)\s*g/i);
    if (satFatMatch && (key.includes('verzadigd') || key.includes('gesättigt') || key.includes('saturi') || key.includes('saturated'))) {
      result.saturatedFat = { value: parseFloat(satFatMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Carbohydrates: "Kohlenhydrate 55 g" or "koolhydraten 11 g" or "Carboidrati 55 g"
    const carbMatch = valueStr.match(/^(\d+[.,]?\d*)\s*g/i);
    if (carbMatch && (key.includes('kohl') || key.includes('koolhydra') || key.includes('carboidra') || key.includes('carbo'))) {
      result.carbohydrates = { value: parseFloat(carbMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Sugars: "davon Zucker 45 g" or "- suikers 10 g" or "di cui zuccheri 45 g"
    const sugarMatch = valueStr.match(/^(\d+[.,]?\d*)\s*g/i);
    if (sugarMatch && (key.includes('zucker') || key.includes('suiker') || key.includes('zuccher') || key.includes('sugar'))) {
      result.sugars = { value: parseFloat(sugarMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Fiber: "Ballaststoffe 2,4 g" or "vezels 0,7 g" or "Fibre 2,4 g"
    const fiberMatch = valueStr.match(/^(\d+[.,]?\d*)\s*g/i);
    if (fiberMatch && (key.includes('ballast') || key.includes('vezel') || key.includes('fib') || key.includes('fibre'))) {
      result.fiber = { value: parseFloat(fiberMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Protein: "Eiweiß 6,8 g" or "eiwitten 0,4 g" or "Proteine 6,8 g"
    const proteinMatch = valueStr.match(/^(\d+[.,]?\d*)\s*g/i);
    if (proteinMatch && (key.includes('eiweiß') || key.includes('eiwit') || key.includes('proteine') || key.includes('protein'))) {
      result.protein = { value: parseFloat(proteinMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Sodium/Salt: "Salz 0,18 g" or "zout 0 g" or "Sale 0,18 g"
    const sodiumMatch = valueStr.match(/^(\d+[.,]?\d*)\s*g/i);
    if (sodiumMatch && (key.includes('salz') || key.includes('zout') || key.includes('sale') || key.includes('sodium'))) {
      result.sodium = { value: parseFloat(sodiumMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }
  }

  return result;
}

/**
 * Extracts nutrition from an image by calling an AI endpoint.
 * @param {string} imageData - Base64 encoded image data
 * @param {Object} config - Configuration with apiKey and optionally endpoint URL
 * @param {string} [config.endpoint] - AI endpoint URL (defaults to OpenAI-compatible)
 * @param {string} config.apiKey - API key for the AI endpoint
 * @returns {Promise<Object>} - Parsed nutrition data
 */
export async function extractNutrition(imageData, config) {
  const endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the nutrition information from this label. Return it as a structured format with keys: energy (kJ), energyKcal (kcal), fat (g), saturatedFat (g), carbohydrates (g), sugars (g), fiber (g), protein (g), sodium (g). Only include values that are present.' },
            { type: 'image_url', image_url: { url: imageData } },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI extraction failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const ocrText = data.choices?.[0]?.message?.content || '';

  return parseNutritionTable(ocrText);
}