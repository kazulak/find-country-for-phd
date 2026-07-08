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
        console.log(`[OK] File "${file}" is valid.`);
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
