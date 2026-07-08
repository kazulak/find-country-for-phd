# European PhD Country Match Platform

An interactive, high-fidelity, client-side Single Page Application (SPA) designed to match PhD candidates to European countries based on structural frameworks, funding models, employee rights, stay-back visa opportunities, and cultural lifestyles.

This repository contains both the data validation pipeline (canonical YAML dataset and JSON schema validation) and the Vite-based frontend web application.

---

## 🏗️ Directory Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── data/
│   └── countries/             # Canonical YAML profiles for each country
├── dist/                      # Production build output (git-ignored)
│   ├── assets/                # Vite compiled JS and CSS chunks
│   ├── index.html             # Bundled static webpage
│   ├── .nojekyll              # Marker to disable Jekyll on GitHub Pages
│   ├── countries.json         # Compiled country dataset
│   ├── countries.min.json     # Minified country dataset
│   └── search-index.json      # Search index for client-side search
├── lib/
│   └── score-engine.js        # Core matching score calculation engine
├── reports/
│   └── missing_data_report.md  # Generated data completeness report
├── schemas/
│   └── country.schema.json    # JSON Schema for validating country profiles
├── scripts/
│   ├── build.js               # Data build script (validation + index building)
│   ├── report.js              # Missing data reporting script
│   ├── test.js                # Unit test runner for matching engine
│   ├── validate.js            # YAML validation using AJV
│   └── verify-output.js       # Production build static verification script
├── app.js                     # Main frontend SPA application logic
├── data.js                    # Question definitions & hardcoded client fallback data
├── index.html                 # Frontend SPA HTML entry point
├── style.css                  # Frontend SPA styling (Vanilla CSS)
├── package.json               # Project scripts and dependencies
└── README.md                  # This documentation
```

---

## ⚡ Getting Started

### 1. Install Dependencies
Run from the project root:
```bash
npm install
```

### 2. Run the Development Server
Start the local development server at `http://localhost:5173`:
```bash
npm run dev
```

### 3. Build the Project
Runs validation, test suites, builds the client bundles, aggregates JSON data, creates the `.nojekyll` configuration, and verifies output:
```bash
npm run build
```

### 4. Preview the Build
Runs a local server to preview the built production app from the `dist/` directory at `http://localhost:4173`:
```bash
npm run preview
```

---

## 🛠️ Validation, Testing & Verification Pipeline

Our build pipeline guarantees correctness, schema consistency, and deployment integrity:

1. **Schema Validation (`npm run validate`)**  
   Validates each country file under `data/countries/*.yaml` against the strict schema defined in `schemas/country.schema.json` using **AJV**. It ensures all required fields (like stipend rates, tuition fees, post-study work rights, and employee status) are correctly typed and present.
2. **Matching Engine Tests (`npm run test`)**  
   Runs unit tests against the core scoring logic (`lib/score-engine.js`) to assert that filters (e.g. Employee status, English-friendliness) and weights (e.g. stipend vs. cost of living) score countries correctly.
3. **Distribution Compilation (`npm run data:build`)**  
   Compiles raw YAML profiles into unified `countries.json` and minified `countries.min.json` files. It also constructs `search-index.json` optimized for client-side search, and writes `.nojekyll`.
4. **Static Output Verification (`npm run verify`)**  
   Verifies that the build output folder (`dist/`) contains all required production assets (`index.html`, `.nojekyll`, `countries.json`, etc.), that they are non-empty, and that all generated JSON files parse correctly.

---

## 🛡️ No-Public-Backend Guarantee

The platform is designed to be **100% static, client-side, and serverless**.
* **Zero APIs**: There are no database queries or runtime API requests made to dynamic servers.
* **Client Calculation**: Matching score calculations and country comparisons run entirely inside the user's browser via the JS engine.
* **Privacy by Design**: Candidate quiz answers and selected countries for comparison are held in the application's local memory state. No personal data is transmitted over the network.
* **Static Portability**: The build output in the `dist/` directory can be deployed directly to any static web host (GitHub Pages, Vercel, Netlify) with zero configuration or database setups.

---

## 🚀 GitHub Pages Deployment

Deployment is automated via **GitHub Actions** using the modern, secure actions-based deployment.

### Automated CI/CD Workflow
The file `.github/workflows/deploy.yml` controls the deployment:
1. Activates on push to the `main` branch.
2. Installs Node.js dependencies (`npm ci`).
3. Runs `npm run build` which runs the validation and verification pipeline.
4. Packages and uploads the `dist/` directory as a Pages artifact.
5. Deploys the artifact to the GitHub Pages environment securely without SSH/PAT credentials.

### `.nojekyll` Handling
To prevent GitHub Pages' default Jekyll engine from skipping files or folders starting with underscores, the build script automatically includes an empty `.nojekyll` marker in the `dist/` root directory.
