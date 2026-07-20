import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
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
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // Validate ID matches filename (without extension)
      const expectedId = path.basename(file, path.extname(file));
      if (data.id !== expectedId) {
        console.error(`[ERROR] File "${file}": 'id' field "${data.id}" does not match filename "${expectedId}"`);
        hasErrors = true;
      }

      const valid = validateFn(data);
      if (!valid) {
        console.error(`[ERROR] File "${file}" failed schema validation:`);
        validateFn.errors.forEach(err => {
          console.error(`  - Path: "${err.instancePath}" | Message: ${err.message} | Params: ${JSON.stringify(err.params)}`);
        });
        hasErrors = true;
      } else {
        // Run automated consistency rules
        const stipendVal = data.stipend?.amount_eur_per_year || 0;
        const isTaxable = data.stipend?.is_taxable;
        const netIncome = Math.round((stipendVal / 12) * (isTaxable ? (data.id === 'denmark' ? 0.65 : 0.8) : 1.0));
        const costOfLiving = data.cost_of_living?.estimated_monthly_expenses_eur || 1200;
        const disposableIncome = netIncome - costOfLiving;

        if (disposableIncome < 0) {
          console.error(`[ERROR] File "${file}": Negative disposable-income estimate (Net pay: €${netIncome}/mo, Living costs: €${costOfLiving}/mo)`);
          hasErrors = true;
        }

        if (!data.contact_portals || data.contact_portals.length === 0) {
          console.error(`[ERROR] File "${file}": Profile contains no source URLs or reference portals.`);
          hasErrors = true;
        }

        if (!data.description || !data.description.overview) {
          console.error(`[ERROR] File "${file}": Profile is missing the description overview text.`);
          hasErrors = true;
        }

        if (!hasErrors) {
          console.log(`[OK] File "${file}" is valid and passes all consistency rules.`);
        }
      }
    } catch (e) {
      console.error(`[ERROR] File "${file}" failed to parse or read:`, e.message);
      hasErrors = true;
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
