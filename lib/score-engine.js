/**
 * PhD country match scoring.
 *
 * Takes a flat country (see lib/country-model.js) and a set of preferences,
 * normalises each dimension to 0–100 and returns a weighted average. It is a
 * transparent, deliberately simple heuristic — not a prediction.
 */

export const DEFAULT_PREFERENCES = {
  isEuStudent: true,
  priorityStipend: 3,        // 1-5 scale, or 99 for deal-breaker
  priorityCostOfLiving: 3,   // 1-5 scale, or 99 for deal-breaker
  priorityTuitionFees: 3,    // 1-5 scale, or 99 for deal-breaker
  prioritySavings: 3,        // 1-5 scale, or 99 for deal-breaker
  priorityHappiness: 3,      // 1-5 scale, or 99 for deal-breaker
  visaImportance: 3,         // 1-5 scale, or 99 for deal-breaker (non-EU only)
  requireEmployeeStatus: false,
  preferShorterDuration: false,
  preferWarmClimate: false,
};

const clamp = (v) => Math.max(0, Math.min(100, v));
const scale = (value, worst, best) => clamp(((value - worst) / (best - worst)) * 100);

const DIMENSION_LABELS = {
  stipend: 'Net pay',
  costOfLiving: 'Cost of living',
  tuitionFees: 'Tuition fees',
  savings: 'Savings potential',
  happiness: 'Life satisfaction',
  visa: 'Post-PhD stay-back',
  duration: 'Programme length',
  climate: 'Climate',
};

export function calculateMatchScore(country, preferences = {}) {
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  const netSalary = country.netIncome;
  const colVal = country.costOfLiving;
  const fee = prefs.isEuStudent ? country.tuitionFeesEU : country.tuitionFeesNonEU;
  const savings = netSalary - colVal;
  const happyVal = country.happinessIndex;
  const postStudyMonths = country.postStudyVisaMonths;
  const isEmployee = country.status === 'Employed';

  const scores = {
    stipend: scale(netSalary, 1000, 4500),
    costOfLiving: scale(colVal, 2500, 600),
    tuitionFees: scale(fee, 25000, 0),
    savings: scale(savings, -500, 2500),
    // Missing life-satisfaction data scores neutral rather than guessing a value.
    happiness: happyVal === null ? 50 : scale(happyVal, 5.0, 8.5),
    visa: prefs.isEuStudent ? 100 : Math.max(20, Math.min(100, 20 + (postStudyMonths / 36) * 80)),
    duration: prefs.preferShorterDuration ? clamp(100 - (country.durationYears - 3.0) * 50) : 100,
    climate: scale(country.climate.winterC, -6, 12),
  };

  // Hard filters and numeric deal-breakers
  const failedDealbreakers = [];
  if (prefs.requireEmployeeStatus && !isEmployee) {
    failedDealbreakers.push('Employee contract status');
  }
  if (prefs.priorityStipend === 99 && netSalary < 1500) {
    failedDealbreakers.push('Net pay of at least €1,500/month');
  }
  if (prefs.priorityCostOfLiving === 99 && colVal > 1500) {
    failedDealbreakers.push('Living costs under €1,500/month');
  }
  if (prefs.priorityTuitionFees === 99 && fee > 2000) {
    failedDealbreakers.push('Tuition under €2,000/year');
  }
  if (prefs.prioritySavings === 99 && savings < 0) {
    failedDealbreakers.push('Positive savings potential');
  }
  if (prefs.priorityHappiness === 99 && (happyVal === null || happyVal < 6.0)) {
    failedDealbreakers.push('Life satisfaction of at least 6.0');
  }
  if (prefs.visaImportance === 99 && !prefs.isEuStudent && postStudyMonths < 12) {
    failedDealbreakers.push('Post-PhD stay-back of at least 12 months');
  }
  const eligible = failedDealbreakers.length === 0;

  const getWeight = (val) => (val === 99 ? 15 : (val || 0));
  const weights = {
    stipend: getWeight(prefs.priorityStipend),
    costOfLiving: getWeight(prefs.priorityCostOfLiving),
    tuitionFees: getWeight(prefs.priorityTuitionFees),
    savings: getWeight(prefs.prioritySavings),
    happiness: getWeight(prefs.priorityHappiness),
    visa: prefs.isEuStudent ? 0 : getWeight(prefs.visaImportance),
    duration: prefs.preferShorterDuration ? 3 : 0,
    climate: prefs.preferWarmClimate ? 5 : 0,
  };

  let totalWeight = 0;
  let weightedScoreSum = 0;
  for (const key in weights) {
    if (weights[key] > 0) {
      totalWeight += weights[key];
      weightedScoreSum += scores[key] * weights[key];
    }
  }
  const finalScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 100;

  // Affordability risk
  let affordability_risk = 'Low Risk';
  if (colVal > 1400 || country.priceLevel === 'Very high' || savings < 200) {
    affordability_risk = 'High Risk';
  } else if (colVal > 1000 || country.priceLevel === 'High' || savings < 500) {
    affordability_risk = 'Moderate Risk';
  }

  const warnings = [];
  if (!eligible) {
    warnings.push(`Fails deal-breaker requirements: ${failedDealbreakers.join(', ')}.`);
  }
  if (affordability_risk === 'High Risk') {
    warnings.push('High affordability risk: high living costs or thin savings margin.');
  } else if (affordability_risk === 'Moderate Risk') {
    warnings.push('Moderate affordability risk: living costs are high relative to pay.');
  }
  if (country.warnings?.length) warnings.push(...country.warnings);

  let explanation;
  if (!eligible) {
    explanation = `Excluded by your deal-breakers: ${failedDealbreakers.join(', ')}.`;
  } else {
    const active = Object.keys(weights)
      .filter((k) => weights[k] > 0)
      .map((k) => ({ name: DIMENSION_LABELS[k], score: scores[k] }))
      .sort((a, b) => b.score - a.score);
    const verdict = finalScore >= 80 ? 'Strong match' : (finalScore >= 60 ? 'Decent match' : 'Weak match');
    if (active.length >= 2) {
      const best = active[0];
      const worst = active[active.length - 1];
      explanation = `${verdict} (${finalScore}%). Strongest: ${best.name} (${Math.round(best.score)}). Weakest: ${worst.name} (${Math.round(worst.score)}).`;
    } else if (active.length === 1) {
      explanation = `${verdict} (${finalScore}%) on ${active[0].name}.`;
    } else {
      explanation = `${verdict} (${finalScore}%).`;
    }
  }

  const rounded = {};
  for (const key in scores) rounded[key] = Math.round(scores[key]);

  return {
    eligible,
    totalScore: eligible ? finalScore : 0,
    breakdown: rounded,
    metrics: {
      annualSavingsEur: Math.round(savings * 12),
      effectiveTuitionEur: fee,
      isEmployee,
      durationYears: country.durationYears,
    },
    affordability_risk,
    warnings,
    explanation,
  };
}
