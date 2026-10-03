import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import { toFlatCountry } from '../lib/country-model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const countriesDir = path.join(__dirname, '../data/countries');
const publicDataDir = path.join(__dirname, '../public/data');
const metaPath = path.join(__dirname, '../data/meta.yaml');

// Compiles data/countries/*.yaml into public/data/countries.json. Astro imports
// that file at build time and also copies it into dist/, so the dataset is
// published as a plain JSON file next to the site.
function runBuild() {
  if (!fs.existsSync(countriesDir)) {
    console.error(`Countries directory not found at: ${countriesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(countriesDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
  const countries = files.map(file => {
    try {
      return toFlatCountry(yaml.load(fs.readFileSync(path.join(countriesDir, file), 'utf8')));
    } catch (e) {
      console.error(`Error loading ${file}:`, e.message);
      process.exit(1);
    }
  });

  fs.mkdirSync(publicDataDir, { recursive: true });
  const outPath = path.join(publicDataDir, 'countries.json');
  fs.writeFileSync(outPath, JSON.stringify(countries, null, 2) + '\n', 'utf8');
  console.log(`Compiled ${countries.length} countries to ${path.relative(process.cwd(), outPath)}`);

  // Provenance of the automated figures (written by `npm run data:refresh`).
  const meta = fs.existsSync(metaPath) ? yaml.load(fs.readFileSync(metaPath, 'utf8')) : { refreshed: null, automated_sources: {} };
  fs.writeFileSync(path.join(publicDataDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');
}

runBuild();
