import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '../schemas/country.schema.json');
const countriesDir = path.join(__dirname, '../data/countries');

function validate() {
  console.log('Starting validation of country data...');

  // Load Schema
  if (!fs.existsSync(schemaPath)) {
    console.error(`Schema file not found at: ${schemaPath}`);
    process.exit(1);
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  // Initialize AJV
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  const validateFn = ajv.compile(schema);

  // Read Countries
  if (!fs.existsSync(countriesDir)) {
    console.error(`Countries directory not found at: ${countriesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(countriesDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
  if (files.length === 0) {
    console.error('No country YAML files found to validate.');
    process.exit(1);
  }

  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(countriesDir, file);
    let fileHasErrors = false;
    const fail = (msg) => { console.error(msg); fileHasErrors = true; hasErrors = true; };
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // Validate ID matches filename (without extension)
      const expectedId = path.basename(file, path.extname(file));
      if (data.id !== expectedId) {
        fail(`[ERROR] File "${file}": 'id' field "${data.id}" does not match filename "${expectedId}"`);
      }

      const valid = validateFn(data);
      if (!valid) {
        fail(`[ERROR] File "${file}" failed schema validation:`);
        validateFn.errors.forEach(err => {
          console.error(`  - Path: "${err.instancePath}" | Message: ${err.message} | Params: ${JSON.stringify(err.params)}`);
        });
      } else {
        // Run automated consistency rules. Pay that doesn't cover living costs is not an
        // error: it's a fact the site reports (see lib/country-model.js).
        const topics = new Set((data.sources || []).map(s => s.topic));
        for (const required of ['pay', 'visa']) {
          if (!topics.has(required)) fail(`[ERROR] File "${file}": no source with topic "${required}".`);
        }

        // EUR amounts need no exchange rate, so their conversion can be checked offline.
        const local = data.stipend.local;
        if (local?.currency === 'EUR') {
          const expected = Math.round((local.amount * (local.per === 'month' ? (local.payments_per_year ?? 12) : 1)) / 100) * 100;
          if (expected !== data.stipend.amount_eur_per_year) {
            fail(`[ERROR] File "${file}": amount_eur_per_year (${data.stipend.amount_eur_per_year}) does not match stipend.local (${expected}). Run \`npm run data:refresh\`.`);
          }
        }

        const cost = data.cost_of_living;
        if (cost.local.low > cost.local.high) {
          fail(`[ERROR] File "${file}": cost_of_living.local.low is above high.`);
        }
        if (cost.local.currency === 'EUR') {
          if (cost.local.low !== cost.low_eur_per_month || cost.local.high !== cost.high_eur_per_month) {
            fail(`[ERROR] File "${file}": cost_of_living EUR range does not match cost_of_living.local. Run \`npm run data:refresh\`.`);
          }
        }
        if (!topics.has('living_costs')) fail(`[ERROR] File "${file}": no source with topic "living_costs".`);

        if (!data.contact_portals || data.contact_portals.length === 0) {
          fail(`[ERROR] File "${file}": Profile contains no source URLs or reference portals.`);
        }

        if (!data.description || !data.description.overview) {
          fail(`[ERROR] File "${file}": Profile is missing the description overview text.`);
        }

        if (!fileHasErrors) {
          console.log(`[OK] File "${file}" is valid and passes all consistency rules.`);
        }
      }
    } catch (e) {
      fail(`[ERROR] File "${file}" failed to parse or read: ${e.message}`);
    }
  }

  if (hasErrors) {
    console.error('\nValidation failed! Please fix the errors listed above.');
    process.exit(1);
  } else {
    console.log('\nAll country files successfully validated against the schema!');
    process.exit(0);
  }
}

validate();
