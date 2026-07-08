import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const countriesDir = path.join(__dirname, '../data/countries');
const distDir = path.join(__dirname, '../dist');

function runBuild() {
  console.log('--- Step 1: Validating Canonical Data ---');
  try {
    execSync('node scripts/validate.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Validation failed. Aborting build.');
    process.exit(1);
  }

  console.log('\n--- Step 2: Generating Distribution JSON ---');

  if (!fs.existsSync(countriesDir)) {
    console.error(`Countries directory not found at: ${countriesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(countriesDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
  const countries = [];

  for (const file of files) {
    const filePath = path.join(countriesDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);
      countries.push(data);
    } catch (e) {
      console.error(`Error loading ${file}:`, e.message);
      process.exit(1);
    }
  }

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Write combined countries JSON
  const countriesJsonPath = path.join(distDir, 'countries.json');
  fs.writeFileSync(countriesJsonPath, JSON.stringify(countries, null, 2), 'utf8');
  console.log(`Combined country data saved to: ${countriesJsonPath}`);

  // Write minified version too
  const countriesMinJsonPath = path.join(distDir, 'countries.min.json');
  fs.writeFileSync(countriesMinJsonPath, JSON.stringify(countries), 'utf8');
  console.log(`Minified country data saved to: ${countriesMinJsonPath}`);

  console.log('\n--- Step 3: Generating Search Index ---');
  // Build a search index optimised for client-side search (e.g. Fuse.js or simple string match)
  const searchIndex = countries.map(c => {
    // Flatten languages
    const languageNames = c.languages.map(l => l.name);
    const englishFriendly = c.languages.some(l => l.name === 'English' && l.english_friendly);

    return {
      id: c.id,
      name: c.name,
      capital: c.capital,
      languages: languageNames,
      englishFriendly,
      climateType: c.climate?.type || null,
      fundingSources: c.funding_availability?.main_sources || [],
      employeeStatus: c.phd_system?.is_employee_status ?? false,
      stipendAmount: c.stipend?.amount_eur_per_year || 0,
      searchBlob: [
        c.name,
        c.capital,
        ...languageNames,
        c.climate?.type,
        ...(c.funding_availability?.main_sources || [])
      ].filter(Boolean).join(' ').toLowerCase()
    };
  });

  const searchIndexPath = path.join(distDir, 'search-index.json');
  fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf8');
  console.log(`Search index saved to: ${searchIndexPath}`);

  // Write .nojekyll to bypass Jekyll processing on GitHub Pages
  const noJekyllPath = path.join(distDir, '.nojekyll');
  fs.writeFileSync(noJekyllPath, '', 'utf8');
  console.log(`Created .nojekyll at: ${noJekyllPath}`);

  console.log('\nBuild completed successfully!');
}

runBuild();
