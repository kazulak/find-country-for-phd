import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');
const countriesDir = path.join(__dirname, '../data/countries');

// Sanity-checks the static site in dist/ before it gets deployed.
function verify() {
  console.log('Verifying static output in dist/ ...');
  const errors = [];
  const check = (ok, message) => { if (ok) console.log(`[OK] ${message}`); else errors.push(message); };

  check(fs.existsSync(path.join(distDir, 'index.html')), 'index.html exists');
  check(fs.existsSync(path.join(distDir, '.nojekyll')), '.nojekyll exists');

  const assetsDir = path.join(distDir, 'assets');
  check(fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).length > 0, 'assets/ is non-empty');

  const expectedIds = fs.readdirSync(countriesDir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => path.basename(f, path.extname(f)));

  const dataPath = path.join(distDir, 'data', 'countries.json');
  let published = [];
  try {
    published = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    check(published.length === expectedIds.length, `data/countries.json has ${published.length}/${expectedIds.length} countries`);
  } catch (e) {
    check(false, `data/countries.json is readable JSON (${e.message})`);
  }

  const missingPages = expectedIds.filter(id => !fs.existsSync(path.join(distDir, 'countries', id, 'index.html')));
  check(missingPages.length === 0,
    missingPages.length === 0
      ? `all ${expectedIds.length} country pages built`
      : `missing country pages: ${missingPages.join(', ')}`);

  if (errors.length > 0) {
    errors.forEach(e => console.error(`[ERROR] ${e}`));
    console.error('\nStatic output verification failed!');
    process.exit(1);
  }
  console.log('\nStatic output successfully verified!');
}

verify();
