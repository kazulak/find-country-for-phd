/**
 * Maps a canonical country YAML profile (data/countries/*.yaml) to the flat
 * shape the website renders. Every derived label here is computed from a real
 * field in the YAML — if a claim can't be traced back to the data, it doesn't
 * belong in this file.
 */

export const ISO_CODES = {
  austria: 'AT', belgium: 'BE', bulgaria: 'BG', croatia: 'HR', cyprus: 'CY',
  czech_republic: 'CZ', denmark: 'DK', estonia: 'EE', finland: 'FI', france: 'FR',
  germany: 'DE', greece: 'GR', hungary: 'HU', ireland: 'IE', italy: 'IT',
  latvia: 'LV', lithuania: 'LT', luxembourg: 'LU', malta: 'MT', netherlands: 'NL',
  norway: 'NO', poland: 'PL', portugal: 'PT', romania: 'RO', slovakia: 'SK',
  slovenia: 'SI', spain: 'ES', sweden: 'SE', switzerland: 'CH', united_kingdom: 'GB'
};

const REGIONS = {
  austria: 'Western Europe', belgium: 'Western Europe', france: 'Western Europe',
  germany: 'Western Europe', ireland: 'Western Europe', luxembourg: 'Western Europe',
  netherlands: 'Western Europe', switzerland: 'Western Europe', united_kingdom: 'Western Europe',
  denmark: 'Northern Europe', estonia: 'Northern Europe', finland: 'Northern Europe',
  latvia: 'Northern Europe', lithuania: 'Northern Europe', norway: 'Northern Europe',
  sweden: 'Northern Europe',
  czech_republic: 'Central Europe', hungary: 'Central Europe', poland: 'Central Europe',
  slovakia: 'Central Europe', slovenia: 'Central Europe',
  bulgaria: 'Southern Europe', croatia: 'Southern Europe', cyprus: 'Southern Europe',
  greece: 'Southern Europe', italy: 'Southern Europe', malta: 'Southern Europe',
  portugal: 'Southern Europe', romania: 'Southern Europe', spain: 'Southern Europe'
};

/**
 * Net pay estimate: gross minus the profile's `deductions_percent` (income tax +
 * employee social contributions). For taxed salaries that rate comes from OECD
 * Taxing Wages at 67% of the average wage; real payslips vary with contract,
 * city and personal situation, and the UI says so.
 */
export function estimateNetMonthly(grossEurPerYear, deductionsPercent) {
  return Math.round(((grossEurPerYear || 0) / 12) * (1 - (deductionsPercent || 0) / 100));
}

/** Price level relative to the EU average (100). */
export function priceLevelFromIndex(index) {
  if (index > 130) return 'Very high';
  if (index > 115) return 'High';
  if (index > 95) return 'Average';
  if (index > 75) return 'Low';
  return 'Very low';
}

// Mild winters by ERA5 capital-city means (January average of 8°C or more).
const hasMildWinters = (winterC) => winterC >= 8;

/**
 * Pay steps (years, tiers, contract shares) in EUR. Each step is scaled from the
 * headline EUR figure, so it inherits the same exchange rate and annual extras.
 * Net uses the same deduction rate (real rates rise a little with pay).
 */
function payScale(data, deductionsPercent) {
  const { local, steps, amount_eur_per_year: eurYear } = data.stipend;
  const list = steps ?? [{ label: 'Typical first year', amount: local.amount }];
  const fmt = (n) => n.toLocaleString('en-GB', { maximumFractionDigits: 2 });
  return list.map((s) => {
    const yearEur = eurYear * (s.amount / local.amount);
    return {
      label: s.label,
      note: s.note ?? null,
      grossMonthly: Math.round(yearEur / 12),
      netMonthly: estimateNetMonthly(yearEur, deductionsPercent),
      published: `${local.currency} ${fmt(s.amount)} / ${local.per}`,
    };
  });
}

export function toFlatCountry(data) {
  const code = ISO_CODES[data.id] || 'EU';
  const flag = code.replace(/./g, (ch) => String.fromCodePoint(ch.charCodeAt(0) + 127397));

  const grossYear = data.stipend.amount_eur_per_year || 0;
  const isTaxable = data.stipend.is_taxable;
  const deductionsPercent = data.stipend.deductions_percent;
  const netIncome = estimateNetMonthly(grossYear, deductionsPercent);
  const payScaleList = payScale(data, deductionsPercent);
  const costOfLiving = data.cost_of_living.estimated_monthly_expenses_eur;

  const isEmployee = data.phd_system.is_employee_status;
  const isSocialCovered = data.stipend.is_social_security_covered;
  const status = isEmployee ? 'Employed' : (isSocialCovered ? 'Fellowship' : 'Student');

  const priceIndex = data.cost_of_living.index_relative_to_eu_average || 100;
  const postStudyVisaMonths = data.visa_and_work_rights.post_study_work_visa_duration_months || 0;
  const happiness = data.happiness_index ?? null;
  const fundingSources = data.funding_availability.main_sources || [];
  const { average_temperature_summer_c: summerC, average_temperature_winter_c: winterC } = data.climate;

  const pros = [];
  if (isEmployee) {
    pros.push('Employment contract: salary, pension contributions and social security');
  } else {
    if (!isTaxable) pros.push('Stipend is free of income tax');
    if (isSocialCovered) pros.push('Stipend includes social security coverage');
  }
  if (happiness !== null && happiness >= 7.2) {
    pros.push(`One of Europe's highest life-satisfaction scores (${happiness}/10)`);
  }
  if (postStudyVisaMonths >= 24) {
    pros.push(`Generous post-PhD stay for non-EU graduates (${postStudyVisaMonths} months)`);
  }
  if (hasMildWinters(winterC)) {
    pros.push(`Mild winters (around ${winterC}°C in January) and warm summers (around ${summerC}°C)`);
  }
  if (data.description?.pros) pros.push(...data.description.pros);

  const cons = [];
  if (priceIndex > 115) {
    cons.push(`Living costs well above the EU average (price index ${priceIndex})`);
  }
  if (postStudyVisaMonths < 12) {
    cons.push(`Short post-PhD stay-back window for non-EU graduates (${postStudyVisaMonths} months)`);
  }
  if (grossYear < 15000) {
    cons.push('Low stipend compared to Northern and Western Europe');
  }
  if (!isEmployee && !isSocialCovered) {
    cons.push('No pension contributions built up during the PhD');
  }
  if (winterC <= -3) {
    cons.push(`Real winters (around ${winterC}°C) — pack a proper coat`);
  }
  if (data.description?.cons) cons.push(...data.description.cons);

  const warnings = [];
  if (netIncome < costOfLiving) {
    warnings.push("The documented pay doesn't cover the estimated living costs. Plan on savings, a side job or a top-up.");
  }
  if (costOfLiving > 1400) {
    warnings.push('High day-to-day costs — budget carefully in big university cities');
  }
  if (data.description?.warnings) warnings.push(...data.description.warnings);

  return {
    id: data.id,
    name: data.name,
    code,
    flag,
    region: REGIONS[data.id] || 'Europe',
    capital: data.capital,
    durationYears: data.phd_system.typical_duration_years,
    duration: `${data.phd_system.typical_duration_years} years`,
    status,
    grossSalary: Math.round(grossYear / 12),
    netIncome,
    isTaxable,
    deductionsPercent,
    payBasis: data.stipend.local?.description ?? null,
    payScale: payScaleList,
    netIncomeMin: Math.min(...payScaleList.map((s) => s.netMonthly)),
    netIncomeMax: Math.max(...payScaleList.map((s) => s.netMonthly)),
    tuitionFeesEU: data.tuition_fees.eu_students_eur_per_year || 0,
    tuitionFeesNonEU: data.tuition_fees.non_eu_students_eur_per_year || 0,
    costOfLiving,
    costOfLivingLow: data.cost_of_living.low_eur_per_month,
    costOfLivingHigh: data.cost_of_living.high_eur_per_month,
    costBasis: data.cost_of_living.local?.description ?? null,
    priceIndex,
    priceLevel: priceLevelFromIndex(priceIndex),
    fundingSources,
    postStudyVisaMonths,
    euFreeMovement: data.visa_and_work_rights.eu_free_movement !== false,
    happinessIndex: happiness,
    climate: { summerC, winterC },
    portals: data.contact_portals,
    sources: data.sources,
    overview: data.description?.overview
      || `PhD candidates in ${data.name} typically have ${status.toLowerCase()} status and finish in about ${data.phd_system.typical_duration_years} years.`,
    pros,
    cons,
    warnings
  };
}
