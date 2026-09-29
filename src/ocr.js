const { fetch } = globalThis;

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

/**
 * Parses OCR text into structured nutrition data.
 * Handles multilingual nutrition labels (German, Dutch, Italian).
 * @param {string} text - The OCR text from the image
 * @returns {Object} - Structured nutrition data
 */
export function parseNutritionTable(text) {
  const result = {
    energy: { kJ: 0, kcal: 0 },
    fat: 0,
    saturatedFat: 0,
    carbohydrates: 0,
    sugars: 0,
    protein: 0,
    sodium: 0,
    // Custom components can be added dynamically
  };

  // Normalize text
  const normalized = text.toLowerCase();

  // Energy patterns - multilingual
  // German: Energie, Dutch: energie, Italian: energia
  const energyKcalMatch = normalized.match(/(?:energie|energia|energi)[^\d]*(\d+[.,]?\d*)\s*(?:kcal|kj)/i);
  const energyKjMatch = normalized.match(/(?:energie|energia|energi)[^\d]*(\d+[.,]?\d*)\s*(?:kj|kcal)/i);
  
  // Try to find energy values with units
  const energyLines = text.split('\n').filter(line => 
    /(?:energie|energia|energi|energy)/i.test(line)
  );
  
  for (const line of energyLines) {
    const kcalMatch = line.match(/(\d+[.,]?\d*)\s*kcal/i);
    const kjMatch = line.match(/(\d+[.,]?\d*)\s*kj/i);
    if (kcalMatch) {
      result.energy.kcal = parseFloat(kcalMatch[1].replace(',', '.'));
    }
    if (kjMatch) {
      result.energy.kJ = parseFloat(kjMatch[1].replace(',', '.'));
    }
  }

  // Fat patterns - multilingual
  // German: Fett, Dutch: vet/vetten, Italian: grassi
  const fatMatch = text.match(/(?:fett|matières grasses|vetten|grassi)[^\d]*(\d+[.,]?\d*)\s*g/i);
  if (fatMatch) {
    result.fat = parseFloat(fatMatch[1].replace(',', '.'));
  }

  // Saturated fat patterns
  // German: gesättigte Fettsäuren, Dutch: verzadigde vetzuren, Italian: acidi grassi saturi
  const satFatMatch = text.match(/(?:gesättigte fettsäuren|verzadigde vetzuren|acidi grassi saturi)[^\d]*(\d+[.,]?\d*)\s*g/i);
  if (satFatMatch) {
    result.saturatedFat = parseFloat(satFatMatch[1].replace(',', '.'));
  }

  // Carbohydrates patterns
  // German: Kohlenhydrate, Dutch: koolhydraten, Italian: carboidrati
  const carbMatch = text.match(/(?:kohlenhydrate|koolhydraten|carboidrati)[^\d]*(\d+[.,]?\d*)\s*g/i);
  if (carbMatch) {
    result.carbohydrates = parseFloat(carbMatch[1].replace(',', '.'));
  }

  // Sugars patterns
  // German: Zucker, Dutch: suikers, Italian: zuccheri
  const sugarMatch = text.match(/(?:zucker|suikers|zuccheri)[^\d]*(\d+[.,]?\d*)\s*g/i);
  if (sugarMatch) {
    result.sugars = parseFloat(sugarMatch[1].replace(',', '.'));
  }

  // Protein patterns
  // German: Eiweiß/Eiweiss, Dutch: eiwitten, Italian: proteine
  const proteinMatch = text.match(/(?:eiweiß|eiweiss|eiwitten|proteine|proteins)[^\d]*(\d+[.,]?\d*)\s*g/i);
  if (proteinMatch) {
    result.protein = parseFloat(proteinMatch[1].replace(',', '.'));
  }

  // Sodium/Salt patterns
  // German: Salz, Dutch: zout, Italian: sale
  const sodiumMatch = text.match(/(?:salz|sel|zout|sale)[^\d]*(\d+[.,]?\d*)\s*g/i);
  if (sodiumMatch) {
    result.sodium = parseFloat(sodiumMatch[1].replace(',', '.'));
  }

  // Check for custom components (anything with a value and unit)
  const lines = text.split('\n');
  for (const line of lines) {
    // Skip lines we already parsed
    if (/(?:energie|energia|energi|fett|vetten|grassi|gesättigte|verzadigde|acidi grassi|kohlenhydrate|koolhydraten|carboidrati|zucker|suikers|zuccheri|eiweiß|eiweiss|eiwitten|proteine|proteins|salz|sel|zout|sale)/i.test(line)) {
      continue;
    }
    
    // Look for pattern: component name followed by value and unit
    const customMatch = line.match(/^\s*([a-zA-ZäöüÄÖÜéèàùàèìòùéèàùàèìòù\s]+?)\s*[:\-]?\s*(\d+[.,]?\d*)\s*(g|mg|mg|ml|%)\s*$/i);
    if (customMatch) {
      const name = customMatch[1].trim();
      const value = parseFloat(customMatch[2].replace(',', '.'));
      const unit = customMatch[3].toLowerCase();
      
      // Only add if not already a standard component
      const standardComponents = ['energy', 'fat', 'saturatedfat', 'carbohydrates', 'sugars', 'protein', 'sodium'];
      const key = name.toLowerCase().replace(/\s+/g, '');
      if (!standardComponents.includes(key)) {
        result[key] = value;
      }
    }
  }

  return result;
}