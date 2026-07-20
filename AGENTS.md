# Agent Developer Guidelines (`AGENTS.md`)

Welcome, Agent. You are tasked with contributing code, data, or tests to the **European PhD Country Match Platform**. To maintain the reliability, accessibility, and simplicity of the product, you must strictly follow these instructions.

---

## 1. Project Purpose & Architecture
* **Purpose**: Helps prospective PhD candidates compare European destinations using clean, objective facts (funding structures, net salaries, cost of living, visa complexity).
* **Architecture**: Astro + React static site.
  * Canonical country data is maintained in YAML format under [data/countries/](file:///home/tom/repos/find-country-for-phd/data/countries/).
  * At build time, scripts compile the YAML files into structured JSON files inside `public/data/` and `dist/`.
  * Dynamic, serverless country detail routes are generated statically at `/find-country-for-phd/countries/[id]/` using Astro pages.
  * Base URL is `/find-country-for-phd/` (for GitHub Pages deployment compatibility). All relative links MUST include this prefix.

---

## 2. Core Rules & Constraints

### 🚫 Forbidden Shortcuts (Strictly Prohibited)
* **Do not use client-side JavaScript click simulation for core page navigation.** All country details must be standard, crawler-indexable static HTML links.
* **Do not use untrusted `innerHTML` interpolation** without strict encoding to avoid HTML injection risks.
* **Do not lock body scrolling (`overflow: hidden`)** or mutate window/document layouts in ways that can freeze the page.
* **Do not use glassmorphism, glow filters, animated gradients, or excessive decorative hover translations.** Maintain a light, flat, research-focused design.
* **Do not disable any failing unit or end-to-end tests.** If a test fails, you must repair the root cause, not silence the test runner.
* **Do not hardcode aggregate stats** (e.g. system counts or peak stipends) in the UI templates. All summaries must be derived dynamically from the canonical country dataset.

---

## 3. Measurable Definition of Done (DoD)
A task is complete only when:
1. **Schema Validation Passes**: `npm run validate` runs successfully with no warnings.
2. **Consistency Rules Pass**: Verified that no country has a negative net disposable-income estimate and all files have verified source URLs.
3. **Core Unit Tests Pass**: `npm run test` executes successfully.
4. **End-to-End Tests Pass**: `npm run test:e2e` completes with zero errors on Chromium.
5. **Dynamic Routes Verified**: All 30 static country details routes compile successfully during `npm run build`.
6. **Accessibility Conformity**: Meets WCAG 2.2 AA standards (semantic structure, keyboard focus outlines present, contrast meets ratio requirements, zero empty headers).
7. **No Console Errors**: The page runs in standard preview with zero uncaught browser-level exceptions or console failures.

---

## 4. Execution Loops & Quality Gates
Every contribution must run through the following pipeline before merging:
1. **Validation**: `npm run validate`
2. **Unit Testing**: `npm run test`
3. **Build**: `npm run build`
4. **Browser E2E Testing**: `npm run test:e2e`
