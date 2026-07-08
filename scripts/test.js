import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { calculateMatchScore } from '../lib/score-engine.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const countriesDir = path.join(__dirname, '../data/countries');

function runTests() {
  console.log('Running tests for score calculation engine...\n');

  // Load a couple of country profiles for testing
  const germany = yaml.load(fs.readFileSync(path.join(countriesDir, 'germany.yaml'), 'utf8'));
  const uk = yaml.load(fs.readFileSync(path.join(countriesDir, 'united_kingdom.yaml'), 'utf8'));
  const switzerland = yaml.load(fs.readFileSync(path.join(countriesDir, 'switzerland.yaml'), 'utf8'));
  const italy = yaml.load(fs.readFileSync(path.join(countriesDir, 'italy.yaml'), 'utf8'));

  let failed = false;

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  };

  // Test 1: Employee Status filter
  const resEmpYes = calculateMatchScore(germany, { requireEmployeeStatus: true });
  assert(resEmpYes.eligible === true, 'Germany is eligible for employee-status required');

  const resEmpNo = calculateMatchScore(uk, { requireEmployeeStatus: true });
  assert(resEmpNo.eligible === false, 'UK is NOT eligible for employee-status required');

  // Test 2: English Friendly filter
  const resEngYes = calculateMatchScore(germany, { requireEnglishFriendly: true });
  assert(resEngYes.eligible === true, 'Germany is English-friendly');

  // Let's check how the scoring changes for EU vs Non-EU student in terms of visa importance
  const resEuStudent = calculateMatchScore(switzerland, { 
    isEuStudent: true,
    priorityStipend: 5,
    priorityCostOfLiving: 1 
  });
  const resNonEuStudent = calculateMatchScore(switzerland, { 
    isEuStudent: false,
    priorityStipend: 5,
    priorityCostOfLiving: 1,
    visaImportance: 5 
  });
  
  // For non-EU student, visa is factored in (Switzerland has 6 months post-study work visa, which gets penalized). 
  // Thus, the score should reflect the visa penalty.
  assert(resEuStudent.eligible === true && resNonEuStudent.eligible === true, 'Both student types eligible in Switzerland');
  assert(resEuStudent.breakdown.visa === 100, 'EU student gets 100 on visa score automatically');
  assert(resNonEuStudent.breakdown.visa < 100, `Non-EU student gets visa penalty due to 6 months post-study visa (score: ${resNonEuStudent.breakdown.visa})`);

  // Test 3: High stipend vs Low stipend preference
  const resHighStipend = calculateMatchScore(switzerland, { priorityStipend: 5, priorityCostOfLiving: 1 }); // Switzerland has high stipend
  const resLowStipend = calculateMatchScore(italy, { priorityStipend: 5, priorityCostOfLiving: 1 }); // Italy has low stipend
  assert(resHighStipend.breakdown.stipend > resLowStipend.breakdown.stipend, 'Switzerland stipend score is higher than Italy stipend score');

  // Test 4: Duration preference
  const resShorterPref = calculateMatchScore(switzerland, { preferShorterDuration: true }); // Swiss PhD typical is 4.0 years
  const resShorterPrefItaly = calculateMatchScore(italy, { preferShorterDuration: true }); // Italy typical is 3.0 years
  assert(resShorterPrefItaly.breakdown.duration > resShorterPref.breakdown.duration, 'Italy gets higher duration score when shorter duration is preferred');

  if (failed) {
    console.error('\nSome tests failed.');
    process.exit(1);
  } else {
    console.log('\nAll score engine tests passed successfully!');
    process.exit(0);
  }
}

runTests();
