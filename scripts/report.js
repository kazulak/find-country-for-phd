import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const countriesDir = path.join(__dirname, '../data/countries');
const reportsDir = path.join(__dirname, '../reports');

// Recursively traverse object and find null or empty values
function getMissingFields(obj, prefix = '') {
  let missing = [];
  if (obj === null || obj === undefined) {
    missing.push(prefix);
    return missing;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      missing.push(prefix);
    } else {
      obj.forEach((item, index) => {
        missing = missing.concat(getMissingFields(item, `${prefix}[${index}]`));
      });
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      missing = missing.concat(getMissingFields(obj[key], fullKey));
    }
  } else if (obj === '') {
    missing.push(prefix);
  }
  return missing;
}

// Estimate completeness score
function calculateCompleteness(data) {
  // Let's count total possible leaf fields based on our model
  // Flatten keys and count non-null
  let totalKeys = 0;
  let populatedKeys = 0;

  function traverse(obj) {
    if (obj === null || obj === undefined || obj === '') {
      totalKeys++;
      return;
    }
    if (Array.isArray(obj)) {
      totalKeys++;
      if (obj.length > 0) populatedKeys++;
      obj.forEach(item => {
        if (typeof item === 'object') traverse(item);
      });
      return;
    }
    if (typeof obj === 'object') {
      for (const key in obj) {
        traverse(obj[key]);
      }
      return;
    }
    totalKeys++;
    populatedKeys++;
  }

  traverse(data);
  return totalKeys > 0 ? Math.round((populatedKeys / totalKeys) * 100) : 0;
}

function generateReport() {
  console.log('Generating missing data report...');

  if (!fs.existsSync(countriesDir)) {
    console.error(`Countries directory not found at: ${countriesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(countriesDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
  const reportData = [];

  for (const file of files) {
    const filePath = path.join(countriesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    const missingFields = getMissingFields(data);
    const completeness = calculateCompleteness(data);

    reportData.push({
      id: data.id,
      name: data.name,
      completeness,
      missingFields,
      file: file
    });
  }

  // Generate Markdown
  let markdown = `# European PhD Country Match Platform - Missing Data Report\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;

  markdown += `This report lists the data completeness and missing fields across all configured countries in the canonical YAML dataset. Gaps should be filled to improve matching accuracy for prospective PhD students.\n\n`;

  // Summary Table
  markdown += `## Data Completeness Summary\n\n`;
  markdown += `| Country | Completeness % | Status | Missing Fields Count |\n`;
  markdown += `|---------|----------------|--------|----------------------|\n`;

  reportData.sort((a, b) => b.completeness - a.completeness).forEach(item => {
    let status = '🟢 Complete';
    if (item.completeness < 85) status = '🔴 Action Required';
    else if (item.completeness < 100) status = '🟡 Minor Gaps';

    markdown += `| **${item.name}** | ${item.completeness}% | ${status} | ${item.missingFields.length} |\n`;
  });

  markdown += `\n## Missing Fields Detail\n\n`;

  let detailsAdded = false;
  reportData.forEach(item => {
    if (item.missingFields.length > 0) {
      detailsAdded = true;
      markdown += `### ${item.name} (\`${item.file}\`)\n`;
      markdown += `Completeness: **${item.completeness}%**\n\n`;
      markdown += `The following fields are missing (null or empty):\n`;
      item.missingFields.forEach(field => {
        markdown += `- \`${field}\`\n`;
      });
      markdown += `\n`;
    }
  });

  if (!detailsAdded) {
    markdown += `*No missing fields found across any countries! All datasets are 100% complete.*\n`;
  }

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'missing_data_report.md');
  fs.writeFileSync(reportPath, markdown, 'utf8');

  console.log(`Report generated successfully at: ${reportPath}`);
  console.log('\n--- Quick Summary ---');
  reportData.forEach(item => {
    console.log(`- ${item.name}: ${item.completeness}% complete (${item.missingFields.length} missing fields)`);
  });
}

generateReport();
