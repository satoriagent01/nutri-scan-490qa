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

    // Energy line: "Energie 2292 kJ / 549 kcal" or similar
    // Match patterns like: "Energie\t2292 kJ / 549 kcal"
    const energyMatch = trimmed.match(/(?:energie|energia|energy)\s*(?:per|pro|per\s+\d+\s*(?:g|ml))?\s*(?:\d+\s*(?:g|ml)\s*(?:\/|–|-))?\s*(\d+[.,]?\d*)\s*(?:kj|kJ)\s*(?:\/|–|-)\s*(\d+[.,]?\d*)\s*(?:kcal|kCal)/i);
    if (energyMatch) {
      result.energy = { value: parseFloat(energyMatch[1].replace(',', '.')), unit: 'kJ' };
      result.energyKcal = { value: parseFloat(energyMatch[2].replace(',', '.')), unit: 'kcal' };
      continue;
    }

    // Also try: "energie 199 kJ / 47 kcal" (Dutch style, lowercase)
    const energyMatch2 = trimmed.match(/(?:energie|energia|energy)\s*(\d+[.,]?\d*)\s*(?:kj|kJ)\s*(?:\/|–|-)\s*(\d+[.,]?\d*)\s*(?:kcal|kCal)/i);
    if (energyMatch2) {
      result.energy = { value: parseFloat(energyMatch2[1].replace(',', '.')), unit: 'kJ' };
      result.energyKcal = { value: parseFloat(energyMatch2[2].replace(',', '.')), unit: 'kcal' };
      continue;
    }

    // Fat: "Fett 33 g" or "vetten 0 g" or "grassi 0 g"
    const fatMatch = trimmed.match(/(?:fett|vetten|grassi|matières grasses)\s*(?:,\s*(?:davon|waarvan|di\s+essi|dont))?\s*(\d+[.,]?\d*)\s*g/i);
    if (fatMatch) {
      result.fat = { value: parseFloat(fatMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Saturated fat: "davon gesättigte Fettsäuren 13 g" or "waarvan verzadigde vetzuren 0 g"
    const satFatMatch = trimmed.match(/(?:davon|waarvan|di\s+essi|dont)\s*(?:gesättigte\s+fettsäuren|verzadigde\s+vetzuren|acidi\s+grassi\s+saturi|acides\s+gras\s+saturés)\s*(\d+[.,]?\d*)\s*g/i);
    if (satFatMatch) {
      result.saturatedFat = { value: parseFloat(satFatMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Carbohydrates: "Kohlenhydrate 55 g" or "koolhydraten 11 g"
    const carbMatch = trimmed.match(/(?:kohlenhydrate|koolhydraten|carboidrati|glucides|carbohydrates)\s*(?:,\s*(?:davon|waarvan|di\s+essi|dont))?\s*(\d+[.,]?\d*)\s*g/i);
    if (carbMatch) {
      result.carbohydrates = { value: parseFloat(carbMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Sugars: "davon Zucker 45 g" or "waarvan suikers 10 g"
    const sugarMatch = trimmed.match(/(?:davon|waarvan|di\s+essi|dont)\s*(?:zucker|suikers|zuccheri|sucres|zucchero)\s*(\d+[.,]?\d*)\s*g/i);
    if (sugarMatch) {
      result.sugars = { value: parseFloat(sugarMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Fiber: "Ballaststoffe 2,4 g" or "vezels 0,7 g" or "fibra 0 g"
    const fiberMatch = trimmed.match(/(?:ballaststoffe|vezels|fibra|fibres|fiber)\s*(\d+[.,]?\d*)\s*g/i);
    if (fiberMatch) {
      result.fiber = { value: parseFloat(fiberMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Protein: "Eiweiß 6,8 g" or "eiwitten 0,4 g" or "proteine 0 g"
    const proteinMatch = trimmed.match(/(?:eiweiß|eiweiss|eiwitten|proteine|proteins|proteine)\s*(\d+[.,]?\d*)\s*g/i);
    if (proteinMatch) {
      result.protein = { value: parseFloat(proteinMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Sodium/Salt: "Salz 0,18 g" or "zout 0 g" or "sale 0 g"
    const sodiumMatch = trimmed.match(/(?:salz|zout|sale|sel|sodium)\s*(\d+[.,]?\d*)\s*g/i);
    if (sodiumMatch) {
      result.sodium = { value: parseFloat(sodiumMatch[1].replace(',', '.')), unit: 'g' };
      continue;
    }

    // Check for custom components (anything with a value and unit)
    // Pattern: "component_name 80 mg" or "component_name: 80 mg"
    const customMatch = trimmed.match(/^([a-zA-ZäöüÄÖÜéèàùàèìòùéèàùàèìòù\s]+?)\s*[:\-]?\s*(\d+[.,]?\d*)\s*(g|mg|ml|%)\s*$/i);
    if (customMatch) {
      const name = customMatch[1].trim();
      const value = parseFloat(customMatch[2].replace(',', '.'));
      const unit = customMatch[3].toLowerCase();

      // Skip lines that are headers or already parsed
      if (name && !/(?:pro|per|nährwert|voedingswaarde|valore|nutrition|energy|energie|energia|fett|vetten|grassi|kohlenhydrate|koolhydraten|carboidrati|zucker|suikers|zuccheri|eiweiß|eiweiss|eiwitten|proteine|salz|zout|sale|ballast|vezels|fibra|davon|waarvan|di\s+essi|acidi|gesättigte|verzadigde|acids|grassi|saturi|saturés|glucides|sucres|zucchero|kcal|kj|per|pro|mg|ml|g|%)/i.test(name)) {
        const key = name.toLowerCase().replace(/\s+/g, '');
        // Avoid overwriting standard components
        const standardKeys = ['energy', 'energykcal', 'fat', 'saturatedfat', 'carbohydrates', 'sugars', 'fiber', 'protein', 'sodium'];
        if (!standardKeys.includes(key)) {
          result[key] = { value, unit };
        }
      }
    }
  }

  return result;
}

/**
 * Calls an OpenAI-compatible endpoint to extract nutrition data from an image.
 * @param {string|Blob|Buffer} imageData - The image data (base64 string or buffer)
 * @param {Object} config - { url: string, key: string }
 * @returns {Promise<string>} - The OCR text extracted from the image
 */
export async function extractNutrition(imageData, config) {
  const { url, key } = config;

  let base64Image;
  if (imageData instanceof Buffer) {
    base64Image = imageData.toString('base64');
  } else if (typeof imageData === 'string') {
    base64Image = imageData;
  } else if (imageData instanceof Blob) {
    const buffer = Buffer.from(await imageData.arrayBuffer());
    base64Image = buffer.toString('base64');
  } else {
    throw new Error('Unsupported image data type');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all nutritional information from this nutrition label. Return the raw text exactly as it appears, preserving all numbers, units, and labels. Include all languages present (German, Dutch, Italian, etc.). Do not summarize or translate - return the raw OCR text.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}