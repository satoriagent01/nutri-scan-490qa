# NutriScan - Nutrition Label Scanner & Meal Planner

A free, ad-free nutrition tracking application that allows users to photograph nutrition labels from food products and extract nutritional information using AI-powered OCR.

## Features

- **Photo Capture**: Upload photos of nutrition labels from your device
- **AI-Powered OCR**: Extracts nutritional information using OpenAI-compatible endpoints
- **Multilingual Support**: German, Dutch, Italian, English, and more
- **Product Database**: Store and manage extracted product information
- **Meal Planning**: Create custom meals by adding products with specific gram quantities
- **Automatic Calculations**: Total nutritional values calculated automatically

## Technical Stack

- **Runtime**: Node.js 24 with ES modules
- **Testing**: Node's built-in test runner (`node --test`)
- **Build**: No build step required
- **UI**: Static web page in `public/` directory

## Modules

- `src/ocr.js` - OCR extraction with `extractNutrition(imageData, config)` and `parseNutritionTable(text)`
- `src/nutrition.js` - Nutrition calculation with `calculateNutrition(product, quantity)` and `sumNutrition(nutritionArray)`
- `src/products.js` - Product CRUD with `createProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)`
- `src/meals.js` - Meal planning with `createMeal(name, date)`, `addMealItem(mealId, productId, quantity)`, `getMealTotal(mealId)`
- `src/storage.js` - Storage operations with `saveProduct`, `loadProduct`, `saveMeal`, `loadMeal`

## Configuration

### AI Endpoint

NutriScan uses an OpenAI-compatible endpoint for OCR. Configure it in the app UI or via the `config` parameter:

```javascript
const config = {
  url: 'https://api.openai.com/v1/chat/completions',
  key: 'sk-your-api-key-here'
};
```

The endpoint must accept the same request format as OpenAI's Chat Completions API (model, messages with image support, max_tokens).

## Running

### Tests

```bash
npm test
```

### Development

Serve the `public/` directory with any static file server:

```bash
npx serve public
```

Then open your browser to the served URL.

## How It Works

1. **Scan**: Upload a photo of a nutrition label
2. **Extract**: AI OCR extracts the raw text from the label
3. **Parse**: The text is parsed into structured nutrition data (energy, fats, carbs, protein, sodium, etc.)
4. **Save**: Store the product in your database
5. **Plan**: Create meals and add products with gram quantities
6. **Calculate**: Total nutrition is automatically calculated for each meal

## Not Yet Implemented

- Real-time camera capture (currently uses file upload)
- Image adjustments (brightness, contrast)
- Historical tracking with date-based entries
- Visual charts and summaries
- Persistent storage (currently in-memory only)
- Backend API server (UI is standalone)
- User authentication

## License

Free and ad-free. No tracking, no ads, no data collection.