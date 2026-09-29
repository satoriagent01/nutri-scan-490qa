# NutriScan

A free, ad-free nutrition tracking application that allows users to photograph nutrition labels from food products and extract nutritional information using AI-powered OCR.

## Features

- **Photo Capture**: Take photos of nutrition labels using your device camera
- **AI-Powered OCR**: Extracts nutritional information from photos using OpenAI-compatible endpoints
- **Multilingual Support**: Supports German, Dutch, Italian, English, and other languages
- **Nutrition Tracking**: Track calories, macronutrients, and custom nutritional components
- **Meal Planning**: Create custom meals by adding products with specific gram quantities
- **Product Database**: Store and reuse previously scanned products

## Technical Requirements

- **Runtime**: Node.js 24 with ES modules
- **No build step required**
- **No external dependencies**

## How to Run

### Running Tests

```bash
npm test
```

### Running the Web App

Open `public/index.html` in a browser. No server required for basic functionality.

## How to Configure the AI Endpoint

1. Open the app in your browser
2. Enter your OpenAI-compatible API URL (e.g., `https://api.openai.com/v1/chat/completions`)
3. Enter your API key
4. Click "Save Configuration"

The app uses the configured endpoint to extract nutrition data from uploaded images.

## How to Test

```bash
npm test
```

The test suite covers:
- OCR parsing for German, Dutch, and Italian nutrition labels
- Nutrition calculation and scaling
- Product CRUD operations
- Meal planning and total calculation
- Storage operations

## What Is Not Done Yet

- Real camera integration (uses file input instead)
- Image adjustments (brightness, contrast)
- Historical tracking with date-based entries
- Visual charts and summaries
- Server-side storage backend (currently uses localStorage)
- Additional language support beyond the tested languages