import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const countriesDir = path.join(__dirname, '../data/countries');
const distDir = path.join(__dirname, '../dist');

const idMap = {
  netherlands: 'NL',
  germany: 'DE',
  sweden: 'SE',
  switzerland: 'CH',
  denmark: 'DK',
  france: 'FR',
  united_kingdom: 'GB',
  italy: 'IT',
  spain: 'ES',
  norway: 'NO',
  austria: 'AT',
  belgium: 'BE',
  ireland: 'IE',
  finland: 'FI',
  portugal: 'PT',
  bulgaria: 'BG',
  croatia: 'HR',
  cyprus: 'CY',
  czech_republic: 'CZ',
  estonia: 'EE',
  greece: 'GR',
  hungary: 'HU',
  latvia: 'LV',
  lithuania: 'LT',
  luxembourg: 'LU',
  malta: 'MT',
  poland: 'PL',
  romania: 'RO',
  slovakia: 'SK',
  slovenia: 'SI'
};

const regionMap = {
  netherlands: 'Western Europe',
  germany: 'Western Europe',
  sweden: 'Northern Europe',
  switzerland: 'Western Europe',
  denmark: 'Northern Europe',
  france: 'Western Europe',
  united_kingdom: 'Western Europe',
  italy: 'Southern Europe',
  spain: 'Southern Europe',
  norway: 'Northern Europe',
  austria: 'Western Europe',
  belgium: 'Western Europe',
  ireland: 'Western Europe',
  finland: 'Northern Europe',
  portugal: 'Southern Europe',
  bulgaria: 'Southern Europe',
  croatia: 'Southern Europe',
  cyprus: 'Southern Europe',
  czech_republic: 'Central Europe',
  estonia: 'Northern Europe',
  greece: 'Southern Europe',
  hungary: 'Central Europe',
  latvia: 'Northern Europe',
  lithuania: 'Northern Europe',
  luxembourg: 'Western Europe',
  malta: 'Southern Europe',
  poland: 'Central Europe',
  romania: 'Southern Europe',
  slovakia: 'Central Europe',
  slovenia: 'Central Europe'
};

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
  const rawCountries = [];

  for (const file of files) {
    const filePath = path.join(countriesDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);
      rawCountries.push(data);
    } catch (e) {
      console.error(`Error loading ${file}:`, e.message);
      process.exit(1);
    }
  }

  // Map YAML schema to flat UI schema expected by Astro
  const countries = rawCountries.map(data => {
    const code = idMap[data.id] || 'EU';
    // Generate regional flag emoji dynamically from ISO 2-letter code
    const flag = code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));

    const stipendVal = data.stipend.amount_eur_per_year || 0;
    const isTaxable = data.stipend.is_taxable;
    // Apply realistic tax factor to gross stipend to get estimated net monthly income
    const netIncome = Math.round((stipendVal / 12) * (isTaxable ? (data.id === 'denmark' ? 0.65 : 0.8) : 1.0));
    const grossSalary = Math.round(stipendVal / 12);

    const isEmployee = data.phd_system.is_employee_status;
    const isSocialCovered = data.stipend.is_social_security_covered;
    const status = isEmployee ? 'Employed' : (isSocialCovered ? 'Fellowship' : 'Student');

    const ects = data.phd_system.required_ects || 0;
    const structure = ects > 0 ? 'Structured' : 'Individual';

    const colIndex = data.cost_of_living.index_relative_to_eu_average || 100;
    const housingCrisis = colIndex > 130 ? 'Critical' : (colIndex > 115 ? 'High' : (colIndex > 95 ? 'Medium' : (colIndex > 75 ? 'Low' : 'None')));

    const englishFriendly = data.languages.some(l => l.name === 'English' && l.english_friendly) ? 9 : 6;
    const localLanguageImportance = englishFriendly >= 9 ? 'Medium' : 'High';

    const postStudy = data.visa_and_work_rights.post_study_work_visa_duration_months || 0;
    const visaComplexityNonEU = data.visa_and_work_rights.requires_visa_for_non_eu ? (postStudy >= 12 ? 'Medium' : 'Hard') : 'Easy';

    const pros = [];
    if (isEmployee) {
      pros.push('Full employee rights & social benefits');
      pros.push('State pension contributions covered');
    } else {
      pros.push('Tax-free stipend income');
      if (isSocialCovered) {
        pros.push('Basic social security coverage');
      }
    }
    if (data.climate.type.toLowerCase().includes('mediterranean') || data.climate.type.toLowerCase().includes('sunny')) {
      pros.push('Vibrant Mediterranean lifestyle & sunny weather');
    }
    if (data.climate.type.toLowerCase().includes('nordic')) {
      pros.push('Excellent work-life balance & equality focus');
    }
    if (data.funding_availability.main_sources && data.funding_availability.main_sources.length > 0) {
      pros.push(`Excellent funding via ${data.funding_availability.main_sources[0]}`);
    }

    const cons = [];
    if (housingCrisis === 'Critical' || housingCrisis === 'High') {
      cons.push('Severe housing shortage & high rental costs');
    }
    if (visaComplexityNonEU === 'Hard') {
      cons.push('Strict visa stay-back terms post-PhD');
    }
    if (stipendVal < 15000) {
      cons.push('Low starting stipend compared to Northern Europe');
    }
    if (!isEmployee && !isSocialCovered) {
      cons.push('No pension contributions built up during studies');
    }

    const warnings = [];
    if (ects > 0) {
      warnings.push(`Mandatory coursework of ${ects} ECTS required`);
    }
    if (data.cost_of_living.estimated_monthly_expenses_eur > 1400) {
      warnings.push('High daily cost of living in university towns');
    }

    const quizTags = [];
    if (isEmployee) quizTags.push('employee');
    if (netIncome >= 2200) quizTags.push('high-pay');
    if (data.phd_system.typical_duration_years <= 3.5) quizTags.push('fast-phd');
    if (englishFriendly >= 9) quizTags.push('english-ok');
    if (data.climate.type.toLowerCase().includes('mediterranean') || data.climate.type.toLowerCase().includes('sunny')) quizTags.push('sunny');
    if (data.climate.type.toLowerCase().includes('nordic')) quizTags.push('welfare');

    return {
      id: data.id,
      name: data.name,
      code,
      region: regionMap[data.id] || 'Europe',
      flag,
      duration: `${data.phd_system.typical_duration_years} Years`,
      status,
      structure,
      grossSalary,
      netIncome,
      tuitionFeesEU: data.tuition_fees.eu_students_eur_per_year || 0,
      tuitionFeesNonEU: data.tuition_fees.non_eu_students_eur_per_year || 0,
      costOfLiving: data.cost_of_living.estimated_monthly_expenses_eur || 1000,
      fundingAvailability: data.funding_availability.rate === 'high' ? 'High' : (data.funding_availability.rate === 'medium' ? 'Medium' : 'Low'),
      englishFriendly,
      localLanguageImportance,
      visaComplexityNonEU,
      happinessIndex: data.happiness_index || 6.5,
      housingCrisis,
      academicReputation: data.funding_availability.rate === 'high' ? 'World Class' : 'Strong',
      pros,
      cons,
      warnings,
      quizTags
    };
  });

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Write combined countries JSON
  const countriesJsonPath = path.join(distDir, 'countries.json');
  fs.writeFileSync(countriesJsonPath, JSON.stringify(countries, null, 2), 'utf8');
  console.log(`Combined country data saved to: ${countriesJsonPath}`);

  // Write to public/data/countries.json for Astro build
  const publicDataDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDataDir, 'countries.json'), JSON.stringify(countries, null, 2), 'utf8');
  console.log(`Copy of country data saved to public data: ${path.join(publicDataDir, 'countries.json')}`);

  // Write minified version too
  const countriesMinJsonPath = path.join(distDir, 'countries.min.json');
  fs.writeFileSync(countriesMinJsonPath, JSON.stringify(countries), 'utf8');
  console.log(`Minified country data saved to: ${countriesMinJsonPath}`);

  console.log('\n--- Step 3: Generating Search Index ---');
  // Build a search index optimised for client-side search (e.g. Fuse.js or simple string match)
  const searchIndex = countries.map(c => {
    return {
      id: c.id,
      name: c.name,
      languages: c.englishFriendly >= 9 ? ['English'] : [],
      englishFriendly: c.englishFriendly >= 9,
      climateType: c.pros.join(' '),
      fundingSources: c.pros,
      employeeStatus: c.status === 'Employed',
      stipendAmount: c.netIncome * 12,
      searchBlob: [
        c.name,
        c.region,
        c.status,
        ...c.pros
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
