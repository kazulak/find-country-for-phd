import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const distDir = path.join(__dirname, '../dist');

function verify() {
  console.log('\n--- Step 4: Verifying Static Output ---');
  let hasErrors = false;

  const filesToCheck = [
    { name: 'index.html', required: true, checkJson: false },
    { name: '.nojekyll', required: true, checkJson: false },
    { name: 'countries.json', required: true, checkJson: true },
    { name: 'countries.min.json', required: true, checkJson: true },
    { name: 'search-index.json', required: true, checkJson: true }
  ];

  for (const file of filesToCheck) {
    const filePath = path.join(distDir, file.name);
    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] Missing required file: ${file.name}`);
      hasErrors = true;
      continue;
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0 && file.name !== '.nojekyll') {
      console.error(`[ERROR] File is empty: ${file.name}`);
      hasErrors = true;
      continue;
    }

    console.log(`[OK] Found ${file.name} (${stats.size} bytes)`);

    if (file.checkJson) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        console.log(`[OK] File ${file.name} parses as valid JSON.`);
      } catch (e) {
        console.error(`[ERROR] File ${file.name} is not valid JSON: ${e.message}`);
        hasErrors = true;
      }
    }
  }

  // Check that the assets folder exists and is not empty
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.error('[ERROR] Missing assets/ directory');
    hasErrors = true;
  } else {
    const assetsFiles = fs.readdirSync(assetsDir);
    if (assetsFiles.length === 0) {
      console.error('[ERROR] Assets directory is empty');
      hasErrors = true;
    } else {
      console.log(`[OK] Assets directory contains ${assetsFiles.length} files.`);
    }
  }

  if (hasErrors) {
    console.error('\nStatic output verification failed!');
    process.exit(1);
  } else {
    console.log('\nStatic output successfully verified!');
    process.exit(0);
  }
}

verify();
