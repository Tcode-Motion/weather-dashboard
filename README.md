# 🌤️ Nimbus Weather Platform

A modern, high-performance, and visually stunning weather dashboard built with **React**, **TypeScript**, and **Vite**. It features dark theme contrast styling, weather-reactive backgrounds, detailed air quality analysis, interactive mapping, and an advanced export modal for multi-format weather reports (PDF, CSV, JSON, Text).

---

## ✨ Features

- **🌦️ Dynamic Weather-Reactive Backgrounds**: Dynamic backgrounds adapt instantly to current weather conditions (sunny, rainy, foggy, snowy, stormy, clear night, etc.) for a fully immersive aesthetic.
- **📊 Premium Glassmorphic Design**: Clean, modern glassmorphic interface with high-contrast elements, customized weather icon themes, and micro-animations built with Framer Motion.
- **⭐ Global Favorites Sidebar**: Save, search, and pin your favorite cities. Add them instantly using the quick star toggle button directly in the main weather card.
- **👁️ Export & Preview Dashboard**: View formatted previews of your weather reports before downloading them. Choose between:
  - **PDF Document**: A beautifully structured, print-ready Dark Mode A4 page report with custom grids, tabular hourly trends, and 7-day outlooks.
  - **CSV Data**: Raw 48-hour hourly weather dataset pre-converted to your selected units (Fahrenheit, mph, etc.) for quick Excel ingestion.
  - **JSON Payload**: Clean structured API response for developer use.
  - **Plain Text**: Copyable text summary to paste directly in Slack, WhatsApp, or emails.
- **🗺️ Interactive Map & Charts**: Scrollable charts showing temperature, precipitation probability, and wind metrics alongside an OpenStreetMap layer showing weather patterns.
- **📱 Responsive & Accessible**: Gracefully scales to fit screens of all sizes, down to mobile viewports (with auto-stacking columns and scaled SVG gauges).
- **🚀 Automated Git Deployment**: CI/CD integration using GitHub Actions that automatically compiles TypeScript assets and deploys updates to GitHub Pages on every push to the `main` branch.

---

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript 6, Vite 8, React Router
- **Animations**: Framer Motion
- **Charts & Mapping**: Recharts, Leaflet, React Leaflet
- **Exporting**: jsPDF (for programmatic vector PDF generation)
- **Styling**: Vanilla CSS with curated CSS variables and dynamic classes
- **Tooling**: Oxlint (ultra-fast linter), TypeScript Compiler

---

## ⚙️ Local Setup & Development

Follow these steps to run the application locally on your machine:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Tcode-Motion/weather-dashboard.git
   cd weather-dashboard
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```

### Start Development Server
Run the local dev server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Build & Deployment

### Production Compilation
Compile TypeScript types and bundle optimized build assets:
```bash
npm run build
```
The compiled output will be generated inside the `dist/` directory.

### Preview Build Locally
To test the production build locally before pushing changes:
```bash
npm run preview
```

### GitHub Pages Deployment
This repository is configured with a GitHub Actions workflow in `.github/workflows/deploy.yml`. When you push changes to GitHub, the workflow will automatically trigger:
1. Installs Node.js and packages.
2. Compiles TypeScript and runs `npm run build`.
3. Deploys the static assets from the `/dist` directory to your GitHub Pages hosting site.
