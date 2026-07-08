/**
 * European PhD Country Match Platform - Score Calculation Engine
 */

export const DEFAULT_PREFERENCES = {
  isEuStudent: true,
  priorityStipend: 3,        // 1-5 scale
  priorityCostOfLiving: 3,   // 1-5 scale (wants low cost of living)
  priorityTuitionFees: 3,    // 1-5 scale (wants low tuition fees)
  prioritySavings: 3,        // 1-5 scale (wants high savings potential)
  priorityHappiness: 3,      // 1-5 scale (wants high happiness index)
  visaImportance: 3,         // 1-5 scale (wants long post-study work rights)
  requireEnglishFriendly: false,
  requireEmployeeStatus: false,
  preferShorterDuration: false,
};

/**
 * Calculates matching score for a single country based on user preferences.
 * Returns an object with the total score and breakdown.
 */
export function calculateMatchScore(country, preferences = {}) {
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  // 1. Hard Filters
  if (prefs.requireEnglishFriendly) {
    const hasEnglish = country.languages.some(lang => lang.name === 'English' && lang.english_friendly);
    if (!hasEnglish) {
      return { eligible: false, totalScore: 0, breakdown: {} };
    }
  }

  if (prefs.requireEmployeeStatus) {
    if (country.phd_system.is_employee_status !== true) {
      return { eligible: false, totalScore: 0, breakdown: {} };
    }
  }

  // 2. Individual Dimension Scorers

  // Stipend (use amount_eur_per_year and purchasing_power_index)
  // Let's assume stipend ranges from €12,000 to €55,000
  const stipendVal = country.stipend.amount_eur_per_year || 0;
  const rawStipendScore = Math.max(0, Math.min(100, ((stipendVal - 12000) / (55000 - 12000)) * 100));
  // Combine with purchasing power index (standardized to 100)
  const ppi = country.stipend.purchasing_power_index || 100;
  const ppiScore = Math.max(0, Math.min(100, ((ppi - 70) / (140 - 70)) * 100));
  const stipendScore = (rawStipendScore + ppiScore) / 2;

  // Cost of Living (lower is better)
  // Range: €600 (score 100) to €2200 (score 0)
  const colVal = country.cost_of_living.estimated_monthly_expenses_eur || 1200;
  const costOfLivingScore = Math.max(0, Math.min(100, ((2200 - colVal) / (2200 - 600)) * 100));

  // Tuition Fees (lower is better)
  // Range: €0 (score 100) to €25,000 (score 0)
  const fee = prefs.isEuStudent 
    ? (country.tuition_fees.eu_students_eur_per_year ?? 0)
    : (country.tuition_fees.non_eu_students_eur_per_year ?? 0);
  const tuitionScore = Math.max(0, Math.min(100, ((25000 - fee) / 25000) * 100));

  // Savings Potential: Annual Stipend - (12 * monthly expenses)
  // Let's assume savings range from €0 to €30,000
  const annualExpenses = (country.cost_of_living.estimated_monthly_expenses_eur || 1200) * 12;
  const savings = Math.max(0, stipendVal - annualExpenses);
  const savingsScore = Math.max(0, Math.min(100, (savings / 30000) * 100));

  // Happiness Index (range 0 to 10, typically 5.5 to 7.8 in Europe)
  const happyVal = country.happiness_index || 6.5; // default to average if null
  const happinessScore = Math.max(0, Math.min(100, ((happyVal - 5.0) / (8.0 - 5.0)) * 100));

  // Visa & Post-Study Work Rights
  // Only matters for non-EU students (EU students have free movement, so they get 100%)
  let visaScore = 100;
  if (!prefs.isEuStudent) {
    const postStudyMonths = country.visa_and_work_rights.post_study_work_visa_duration_months || 0;
    // Range: 0 months (score 20) to 36 months (score 100)
    visaScore = Math.max(20, Math.min(100, 20 + (postStudyMonths / 36) * 80));
  }

  // PhD Duration
  // If user prefers shorter duration, 3.0 gets 100, 4.0 gets 50, else 100 (neutral)
  const duration = country.phd_system.typical_duration_years || 3.5;
  const durationScore = prefs.preferShorterDuration 
    ? Math.max(0, Math.min(100, 100 - (duration - 3.0) * 50))
    : 100;

  // 3. Weighting Calculation
  const weights = {
    stipend: prefs.priorityStipend,
    costOfLiving: prefs.priorityCostOfLiving,
    tuitionFees: prefs.priorityTuitionFees,
    savings: prefs.prioritySavings,
    happiness: prefs.priorityHappiness,
    visa: prefs.isEuStudent ? 0 : prefs.visaImportance, // 0 weight if EU
    duration: prefs.preferShorterDuration ? 3 : 0, // only weight if preferred
  };

  const scores = {
    stipend: stipendScore,
    costOfLiving: costOfLivingScore,
    tuitionFees: tuitionScore,
    savings: savingsScore,
    happiness: happinessScore,
    visa: visaScore,
    duration: durationScore,
  };

  let totalWeight = 0;
  let weightedScoreSum = 0;

  for (const key in weights) {
    const weight = weights[key];
    if (weight > 0) {
      totalWeight += weight;
      weightedScoreSum += scores[key] * weight;
    }
  }

  const finalScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;

  return {
    eligible: true,
    totalScore: finalScore,
    breakdown: {
      stipend: Math.round(stipendScore),
      costOfLiving: Math.round(costOfLivingScore),
      tuitionFees: Math.round(tuitionScore),
      savings: Math.round(savingsScore),
      happiness: Math.round(happinessScore),
      visa: Math.round(visaScore),
      duration: Math.round(durationScore),
    },
    metrics: {
      annualSavingsEur: Math.round(savings),
      effectiveTuitionEur: fee,
      isEmployee: country.phd_system.is_employee_status,
      durationYears: duration
    }
  };
}
