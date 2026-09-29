# NutriScan - Nutrition Label Scanner & Meal Planner

## Product Overview

NutriScan is a free, ad-free nutrition tracking application that allows users to photograph nutrition labels from food products and extract nutritional information using AI-powered OCR. The app supports multilingual labels (German, Dutch, Italian, English, etc.) and enables users to create custom meals by adding products with specific gram quantities, automatically calculating total nutritional values.

## Features

### 1. Photo Capture
- Users can take photos of nutrition labels using their device camera
- Support for both front-facing and rear-facing cameras
- Image preview before processing
- Basic image adjustments (brightness, contrast) for better OCR results

### 2. OCR with AI Extraction
- AI-powered OCR extracts nutritional information from photos
- Uses OpenAI-compatible endpoint (configurable by user)
- Supports multiple languages (German, Dutch, Italian, English, French, Spanish, etc.)
- Extracts: energy (kJ/kcal), fats, saturated fats, carbohydrates, sugars, fiber, proteins, sodium, and other nutritional components
- Returns structured data from unstructured label images

### 3. Nutrition Tracking
- Track any nutritional component (calories, sodium, saturated fats, etc.)
- Custom tracking categories
- Historical tracking with date-based entries
- Visual charts and summaries

### 4. Meal Planning
- Create custom meals by adding products
- Specify quantity in grams for each product
- Automatic calculation of total nutritional values
- Save meals for future use
- Daily meal planning

### 5. Product Database
- Store extracted product information
- Reuse previously scanned products
- Edit product details as needed

## Technical Requirements

### Stack
- **Runtime**: Node.js 24 with ES modules
- **Testing**: Node's built-in test runner (`node --test`)
- **Build**: No build step required
- **UI**: Static web page in `public/` directory
- **AI**: OpenAI-compatible endpoint for OCR (user-configured URL and API key)

### Architecture
- **src/**: Node.js modules (tests import from here)
  - No browser APIs (localStorage, window, document, camera)
  - Pure functions where possible
- **public/**: Static web files (HTML, CSS, JavaScript)
  - Browser-specific functionality (camera, storage, UI)
  - Storage abstraction via passed-in objects

### OCR/AI Module
- Configurable OpenAI-compatible endpoint
- User provides their own API key and URL
- Tests never call the actual AI endpoint
- Deterministic processing after OCR extraction

## Data Model

### Product
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Product name
  brand?: string,       // Brand name
  servingSize: {        // Serving size information
    amount: number,     // Amount in grams or ml
    unit: string        // 'g' or 'ml'
  },
  nutritionPer100g: {   // Nutrition per 100g/ml
    energyKj: number,
    energyKcal: number,
    fat: number,
    saturatedFat: number,
    carbohydrate: number,
    sugars: number,
    fiber: number,
    protein: number,
    sodium: number,
    [customField: string]: number  // For custom tracking fields
  },
  ingredients?: string, // Ingredients list
  allergens?: string[], // Allergen information
  language: string,     // Language of the label
  createdAt: string     // ISO date string
}
```

### Meal
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Meal name
  date: string,         // ISO date string
  items: [{             // Items in the meal
    productId: string,  // Reference to product
    quantity: number,   // Amount in grams
    calculatedNutrition: {  // Calculated nutrition for this quantity
      energyKj: number,
      energyKcal: number,
      fat: number,
      // ... other fields
    }
  }],
  totalNutrition: {     // Total nutrition for the meal
    energyKj: number,
    energyKcal: number,
    fat: number,
    // ... other fields
  }
}
```

### User Tracking Entry
```javascript
{
  id: string,           // Unique identifier
  date: string,         // ISO date string
  mealId?: string,      // Reference to meal (if from meal)
  productId?: string,   // Reference to product (if direct entry)
  quantity: number,     // Amount in grams
  nutrition: {          // Nutrition consumed
    energyKj: number,
    energyKcal: number,
    fat: number,
    // ... other fields
  },
  customFields?: {      // Custom tracking fields
    [fieldName: string]: number
  }
}
```

## User Interface Requirements

### Public Directory Structure
```
public/
├── index.html         # Main application page
├── css/
│   └── style.css      # Application styles
├── js/
│   ├── app.js         # Main application logic
│   ├── camera.js      # Camera functionality
│   ├── storage.js     # Browser storage abstraction
│   └── ui.js          # UI components
└── assets/
    └── icons/         # Application icons
```

### Key UI Components
- **Camera View**: Full-screen camera with preview
- **Product Scanner**: Upload/capture nutrition label
- **Product List**: Browse and search products
- **Meal Builder**: Add products with quantities
- **Nutrition Dashboard**: View daily/weekly totals
- **Settings**: Configure AI endpoint, custom fields

## Acceptance Criteria

### AC-1: Photo Capture
- Users can capture photos of nutrition labels using device camera
- Captured images are displayed for preview before processing
- Users can retake photos if the result is unsatisfactory

### AC-2: OCR with AI Extraction
- The app calls a configurable OpenAI-compatible endpoint for OCR
- Users can configure their own API URL and key in settings
- The OCR module extracts nutritional information from multilingual labels
- Tests mock the AI endpoint and never make actual API calls

### AC-3: Multilingual Support
- The app handles nutrition labels in German, Dutch, Italian, English, and other languages
- Example: German label "Nährwertdeklaration" with columns "100 g" and "30 g = 1 Melto"
- Example: Dutch label "Voedingswaarde per 100 ml" with "glas (200 ml)"
- Example: Italian label "Dichiarazione nutrizionale" with values per 100g

### AC-4: Nutrition Data Extraction
- Extracted data includes: energy (kJ and kcal), fat, saturated fat, carbohydrates, sugars, fiber, protein, sodium
- Example from Image 1 (German chocolate bar):
  - Per 100g: Energie 2292 kJ / 549 kcal, Fett 33 g, Kohlenhydrate 55 g, Zucker 45 g, Eiweiß 6,8 g, Salz 0,18 g
  - Per 30g (1 Melto): Energie 688 kJ / 165 kcal, Fett 10 g, Kohlenhydrate 16 g, Zucker 14 g, Eiweiß 2,0 g, Salz 0,05 g
- Example from Image 2 (Dutch juice):
  - Per 100 ml: energie 199 kJ / 47 kcal, vetten 0 g, koolhydraten 11 g, suikers 10 g, eiwitten 0,7 g, zout 0 g
  - Per glas (200 ml): energie 399 kJ / 94 kcal, koolhydraten 22 g, suikers 20 g, eiwitten 1,4 g, zout 0 g

### AC-5: Product Storage
- Extracted products are stored locally in the browser
- Users can view, edit, and delete stored products
- Products can be reused when creating meals

### AC-6: Meal Planning
- Users can create meals by adding products with specific gram quantities
- The app automatically calculates nutrition based on the quantity
- Example: Adding 150g of a product with known per-100g nutrition calculates 1.5x the per-100g values
- Users can save meals for future reference

### AC-7: Custom Tracking
- Users can track any nutritional component, not just predefined ones
- Custom fields can be added (e.g., specific vitamins, minerals)
- Example: User can add "Vitamin C" as a custom field and track it across products

### AC-8: Nutrition Calculation
- The app correctly calculates nutrition for any quantity of a product
- Formula: (quantity / 100) * nutritionPer100g for each component
- Example: 200g of a product with 55g carbs per 100g = 110g total carbs

### AC-9: Free and Ad-Free
- The application is completely free to use
- No advertisements or sponsored content
- No paywalls for any features

### AC-10: Privacy-Friendly
- All data is stored locally in the browser (localStorage)
- No personal data is sent to external servers (except the configurable AI endpoint)
- Users control their own API keys and endpoints

### AC-11: Technical - Node Modules
- All modules in `src/` run in Node.js environment
- No browser APIs used in `src/` modules
- Tests can import and test `src/` modules without browser dependencies

### AC-12: Technical - Browser Modules
- Browser-specific functionality (camera, storage, UI) is in `public/`
- Storage operations use a passed-in storage object abstraction
- Camera functionality is isolated from Node.js modules

## Non-Functional Requirements

- **Performance**: OCR extraction should complete within 10 seconds for typical images
- **Accessibility**: WCAG 2.1 AA compliance for the web interface
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Offline Capability**: Core features work offline (product storage, meal planning)
- **Privacy**: No tracking, no analytics, no data collection

## Examples from Shared Images

### Image 1: German Chocolate Bar (Dr. Schär AG)
- **Product**: Gluten-free chocolate bar with hazelnuts
- **Language**: German (primary), with French, Dutch, Italian translations
- **Nutrition Table**:
  - Columns: "100 g" and "30 g = 1 Melto"
  - Rows: Energie, Fett (davon gesättigte Fettsäuren), Kohlenhydrate (davon Zucker), Ballaststoffe, Eiweiß, Salz
  - Values per 100g: 2292 kJ / 549 kcal, 33g fat, 55g carbs, 45g sugars, 6.8g protein, 0.18g salt
  - Values per 30g: 688 kJ / 165 kcal, 10g fat, 16g carbs, 14g sugars, 2.0g protein, 0.05g salt
- **Allergens**: Contains hazelnuts, milk, soy. May contain peanuts and tree nuts (almonds, walnuts, pistachios). Gluten-free.

### Image 2: Dutch Juice Bottle
- **Product**: Fresh pressed apple-orange-mango juice (Versgeperst Appel-Sinaasappel- en Mangosap)
- **Language**: Dutch
- **Volume**: 1L / 5 portions (200 ml)
- **Nutrition Table**:
  - Columns: "100 ml" and "glas (200 ml)"
  - Rows: energie, vetten (waarvan verzadigde vetzuren, onverzadigde vetzuren), koolhydraten (waarvan suikers, vezels, zoetstoffen), eiwitten, zout
  - Values per 100ml: 199 kJ / 47 kcal, 0g fat, 11g carbs, 10g sugars, 0.7g protein, 0g salt
  - Values per 200ml glass: 399 kJ / 94 kcal, 22g carbs, 20g sugars, 1.4g protein, 0g salt
- **Ingredients**: 45% apple, 35% orange, 20% mango, antioxidant (ascorbic acid)

### Image 3: Italian Olive Oil Spray
- **Product**: Extra virgin olive oil spray (Extra Olijfolie van de Eerste Persing)
- **Language**: Dutch/Italian
- **Volume**: 200 ml e / 335 g
- **Nutrition Table** (per 100 ml):
  - energie: 3404 kJ / 828 kcal
  - vetten: 92 g (waarvan verzadigde vetzuren: 14 g)
  - koolhydraten: 0 g (waarvan suikers: 0 g)
  - vezels: 0 g
  - eiwitten: 0 g
  - zout: 0 g
- **Allergens**: None
- **Origin**: Spain

## Module Structure (Planned)

### src/ocr.js
- `extractNutrition(imageData, config)`: Extracts nutrition data from an image using AI
- `parseNutritionTable(text)`: Parses extracted text into structured nutrition data

### src/nutrition.js
- `calculateNutrition(product, quantity)`: Calculates nutrition for a given quantity
- `sumNutrition(nutritionArray)`: Sums multiple nutrition objects

### src/products.js
- `createProduct(data)`: Creates a new product
- `updateProduct(id, data)`: Updates an existing product
- `deleteProduct(id)`: Deletes a product

### src/meals.js
- `createMeal(name, date)`: Creates a new meal
- `addMealItem(mealId, productId, quantity)`: Adds an item to a meal
- `getMealTotal(mealId)`: Gets total nutrition for a meal

### src/storage.js (Node module)
- `saveProduct(product)`: Saves a product to storage
- `loadProduct(id)`: Loads a product by ID
- `saveMeal(meal)`: Saves a meal to storage
- `loadMeal(id)`: Loads a meal by ID