/**
 * European PhD Country Match Platform - Upgraded Score Calculation Engine
 */

export const DEFAULT_PREFERENCES = {
  isEuStudent: true,
  priorityStipend: 3,        // 1-5 scale, or 99 for deal-breaker
  priorityCostOfLiving: 3,   // 1-5 scale
  priorityTuitionFees: 3,    // 1-5 scale
  prioritySavings: 3,        // 1-5 scale
  priorityHappiness: 3,      // 1-5 scale
  visaImportance: 3,         // 1-5 scale
  requireEnglishFriendly: false,
  requireEmployeeStatus: false,
  preferShorterDuration: false,
};

/**
 * Calculates matching score for a single country based on user preferences.
 * Returns an object with the total score, breakdown, confidence, risk, warnings, and explanations.
 */
export function calculateMatchScore(country, preferences = {}) {
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  // Helper getters to support both raw YAML structure and compiled flat JSON structure
  const getNetIncome = () => {
    if (country.netIncome !== undefined) return country.netIncome;
    const stipendVal = country.stipend?.amount_eur_per_year || 0;
    const isTaxable = country.stipend?.is_taxable;
    return Math.round((stipendVal / 12) * (isTaxable ? (country.id === 'denmark' ? 0.65 : 0.8) : 1.0));
  };

  const getCostOfLiving = () => {
    if (country.costOfLiving !== undefined) return country.costOfLiving;
    return country.cost_of_living?.estimated_monthly_expenses_eur || 1200;
  };

  const getTuitionFees = (isEu) => {
    if (isEu) {
      if (country.tuitionFeesEU !== undefined) return country.tuitionFeesEU;
      return country.tuition_fees?.eu_students_eur_per_year ?? 0;
    } else {
      if (country.tuitionFeesNonEU !== undefined) return country.tuitionFeesNonEU;
      return country.tuition_fees?.non_eu_students_eur_per_year ?? 0;
    }
  };

  const isEmployee = () => {
    if (country.status !== undefined) return country.status === 'Employed';
    return country.phd_system?.is_employee_status === true;
  };

  const getDuration = () => {
    if (country.duration !== undefined) {
      const match = country.duration.toString().match(/([0-9.]+)/);
      return match ? parseFloat(match[1]) : 3.5;
    }
    return country.phd_system?.typical_duration_years || 3.5;
  };

  const getEnglishFriendly = () => {
    if (country.englishFriendly !== undefined) return country.englishFriendly;
    const hasEnglish = country.languages?.some(l => l.name === 'English' && l.english_friendly);
    return hasEnglish ? 9 : 6;
  };

  const getVisaPostStudy = () => {
    if (country.visaComplexityNonEU !== undefined) {
      return country.visaComplexityNonEU === 'Easy' ? 36 : (country.visaComplexityNonEU === 'Medium' ? 12 : 6);
    }
    return country.visa_and_work_rights?.post_study_work_visa_duration_months || 0;
  };

  const getHappiness = () => {
    if (country.happinessIndex !== undefined) return country.happinessIndex;
    return country.happiness_index || 6.5;
  };

  const getHousingCrisis = () => {
    if (country.housingCrisis !== undefined) return country.housingCrisis;
    const colIndex = country.cost_of_living?.index_relative_to_eu_average || 100;
    return colIndex > 130 ? 'Critical' : (colIndex > 115 ? 'High' : (colIndex > 95 ? 'Medium' : (colIndex > 75 ? 'Low' : 'None')));
  };

  // 1. Data Presence & Confidence Scoring
  let totalMetrics = 6;
  let presentMetrics = 0;
  
  if (country.stipend?.amount_eur_per_year !== null && country.stipend?.amount_eur_per_year !== undefined) presentMetrics++;
  if (country.cost_of_living?.estimated_monthly_expenses_eur !== null && country.cost_of_living?.estimated_monthly_expenses_eur !== undefined) presentMetrics++;
  if (country.tuition_fees?.eu_students_eur_per_year !== null && country.tuition_fees?.eu_students_eur_per_year !== undefined) presentMetrics++;
  if (country.phd_system?.typical_duration_years !== null && country.phd_system?.typical_duration_years !== undefined) presentMetrics++;
  if (country.happiness_index !== null && country.happiness_index !== undefined) presentMetrics++;
  if (country.visa_and_work_rights?.post_study_work_visa_duration_months !== null && country.visa_and_work_rights?.post_study_work_visa_duration_months !== undefined) presentMetrics++;

  if (country.netIncome !== undefined) {
    totalMetrics = 6;
    presentMetrics = 6; // Flat JSON compiled files have complete data
  }
  const confidence = totalMetrics > 0 ? Math.round((presentMetrics / totalMetrics) * 100) : 100;

  // 2. Hard Filters & Custom Deal-Breakers
  let eligible = true;
  const failedDealbreakers = [];

  if (prefs.requireEnglishFriendly && getEnglishFriendly() < 8) {
    eligible = false;
    failedDealbreakers.push('English-friendly environment');
  }

  if (prefs.requireEmployeeStatus && !isEmployee()) {
    eligible = false;
    failedDealbreakers.push('Employee contract status');
  }

  // 3. Dimension calculations & normalizations
  const netSalary = getNetIncome();
  const rawStipendScore = Math.max(0, Math.min(100, ((netSalary - 1000) / (4500 - 1000)) * 100));
  const stipendScore = rawStipendScore;

  const colVal = getCostOfLiving();
  const costOfLivingScore = Math.max(0, Math.min(100, ((2500 - colVal) / (2500 - 600)) * 100));

  const fee = getTuitionFees(prefs.isEuStudent);
  const tuitionScore = Math.max(0, Math.min(100, ((25000 - fee) / 25000) * 100));

  const savings = netSalary - colVal;
  const savingsScore = Math.max(0, Math.min(100, ((savings - (-500)) / (2500 - (-500))) * 100));

  const happyVal = getHappiness();
  const happinessScore = Math.max(0, Math.min(100, ((happyVal - 5.0) / (8.5 - 5.0)) * 100));

  let visaScore = 100;
  const postStudyMonths = getVisaPostStudy();
  if (!prefs.isEuStudent) {
    visaScore = Math.max(20, Math.min(100, 20 + (postStudyMonths / 36) * 80));
  }

  const duration = getDuration();
  const durationScore = prefs.preferShorterDuration 
    ? Math.max(0, Math.min(100, 100 - (duration - 3.0) * 50))
    : 100;

  // Numerical Deal-breakers check
  if (prefs.priorityStipend === 99 && netSalary < 1500) {
    eligible = false;
    failedDealbreakers.push('Stipend threshold (min €1,500/mo)');
  }
  if (prefs.priorityCostOfLiving === 99 && colVal > 1500) {
    eligible = false;
    failedDealbreakers.push('Cost of Living threshold (max €1,500/mo)');
  }
  if (prefs.priorityTuitionFees === 99 && fee > 2000) {
    eligible = false;
    failedDealbreakers.push('Tuition fees threshold (max €2,000/yr)');
  }
  if (prefs.prioritySavings === 99 && savings < 0) {
    eligible = false;
    failedDealbreakers.push('Positive savings potential');
  }
  if (prefs.priorityHappiness === 99 && happyVal < 6.0) {
    eligible = false;
    failedDealbreakers.push('Happiness Index threshold (min 6.0)');
  }
  if (prefs.visaImportance === 99 && !prefs.isEuStudent && postStudyMonths < 12) {
    eligible = false;
    failedDealbreakers.push('Visa stay-back threshold (min 12 months)');
  }

  // 4. Ranked-priority Weighting calculation
  const getWeight = (val) => (val === 99 ? 15 : (val || 0));

  const weights = {
    stipend: getWeight(prefs.priorityStipend),
    costOfLiving: getWeight(prefs.priorityCostOfLiving),
    tuitionFees: getWeight(prefs.priorityTuitionFees),
    savings: getWeight(prefs.prioritySavings),
    happiness: getWeight(prefs.priorityHappiness),
    visa: prefs.isEuStudent ? 0 : getWeight(prefs.visaImportance),
    duration: prefs.preferShorterDuration ? 3 : 0,
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
    const w = weights[key];
    if (w > 0) {
      totalWeight += w;
      weightedScoreSum += scores[key] * w;
    }
  }

  const finalScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 100;

  // 5. Affordability Risk Classification
  let affordability_risk = 'Low Risk';
  const hc = getHousingCrisis();
  if (colVal > 1400 || hc === 'Critical' || hc === 'High' || savings < 200) {
    affordability_risk = 'High Risk';
  } else if (colVal > 1000 || hc === 'Medium' || savings < 500) {
    affordability_risk = 'Moderate Risk';
  }

  // 6. Warnings Generation
  const warnings = [];
  if (!eligible) {
    warnings.push(`Fails deal-breaker requirements: ${failedDealbreakers.join(', ')}.`);
  }
  if (confidence < 80) {
    warnings.push(`High uncertainty: only ${confidence}% of metric data is present.`);
  }
  if (affordability_risk === 'High Risk') {
    warnings.push('High affordability risk: rental shortage or low net savings potential.');
  } else if (affordability_risk === 'Moderate Risk') {
    warnings.push('Moderate affordability risk: high cost of living relative to stipend.');
  }

  // Append pre-existing custom warnings
  if (country.warnings && country.warnings.length > 0) {
    warnings.push(...country.warnings);
  }

  // 7. Match Explanation Text
  let explanation = '';
  if (!eligible) {
    explanation = `This country does not meet your required deal-breakers for: ${failedDealbreakers.join(', ')}.`;
  } else {
    // Sort active categories by their scores
    const activeDimensions = [];
    if (weights.stipend > 0) activeDimensions.push({ name: 'Stipend', score: stipendScore });
    if (weights.costOfLiving > 0) activeDimensions.push({ name: 'Cost of Living', score: costOfLivingScore });
    if (weights.tuitionFees > 0) activeDimensions.push({ name: 'Tuition Fees', score: tuitionScore });
    if (weights.savings > 0) activeDimensions.push({ name: 'Savings Potential', score: savingsScore });
    if (weights.happiness > 0) activeDimensions.push({ name: 'Quality of Life', score: happinessScore });
    if (weights.visa > 0) activeDimensions.push({ name: 'Post-study Visa Ease', score: visaScore });
    if (weights.duration > 0) activeDimensions.push({ name: 'Program Duration', score: durationScore });

    activeDimensions.sort((a, b) => b.score - a.score);

    if (activeDimensions.length >= 2) {
      explanation = `Excellent match (${finalScore}%) primarily driven by your preferences for ${activeDimensions[0].name} (scoring ${Math.round(activeDimensions[0].score)}%) and ${activeDimensions[1].name} (scoring ${Math.round(activeDimensions[1].score)}%).`;
    } else if (activeDimensions.length === 1) {
      explanation = `Solid match (${finalScore}%) matching your key priority for ${activeDimensions[0].name} (scoring ${Math.round(activeDimensions[0].score)}%).`;
    } else {
      explanation = `Matches your default criteria with ${finalScore}% compatibility.`;
    }

    if (confidence < 80) {
      explanation += ' Note: This estimation has higher uncertainty due to missing database fields.';
    }
  }

  return {
    eligible,
    totalScore: eligible ? finalScore : 0,
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
      annualSavingsEur: Math.round(savings * 12),
      effectiveTuitionEur: fee,
      isEmployee: isEmployee(),
      durationYears: duration,
    },
    confidence,
    affordability_risk,
    warnings,
    explanation,
  };
}
