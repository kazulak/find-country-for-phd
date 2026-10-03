import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { toFlatCountry, estimateNetMonthly } from '../../lib/country-model.js';
import { calculateMatchScore } from '../../lib/score-engine.js';

const countriesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/countries');
const raw = Object.fromEntries(
  fs.readdirSync(countriesDir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => { const d = yaml.load(fs.readFileSync(path.join(countriesDir, f), 'utf8')); return [d.id, d]; })
);
const flat = Object.fromEntries(Object.values(raw).map((d) => [d.id, toFlatCountry(d)]));

describe('country model', () => {
  test('maps all 30 countries', () => {
    assert.equal(Object.keys(flat).length, 30);
  });

  test('carries source portals through to the site', () => {
    for (const c of Object.values(flat)) {
      assert.ok(c.portals.length > 0, `${c.id} has no portals`);
      assert.deepEqual(c.portals, raw[c.id].contact_portals);
    }
  });

  test('uses the real post-study visa duration instead of a bucketed label', () => {
    for (const c of Object.values(flat)) {
      assert.equal(c.postStudyVisaMonths, raw[c.id].visa_and_work_rights.post_study_work_visa_duration_months);
    }
    assert.equal(flat.denmark.postStudyVisaMonths, 36);
    assert.equal(flat.germany.postStudyVisaMonths, 18);
  });

  test('keeps missing life-satisfaction data missing instead of inventing a value', () => {
    const withoutScore = toFlatCountry({ ...raw.spain, happiness_index: null });
    assert.equal(withoutScore.happinessIndex, null);
  });

  test('every profile cites sources for pay and visa rules', () => {
    for (const d of Object.values(raw)) {
      const topics = new Set(d.sources.map((s) => s.topic));
      assert.ok(topics.has('pay') && topics.has('visa'), d.id);
    }
  });

  test('every pay figure is traceable to an amount as published at the source', () => {
    for (const d of Object.values(raw)) {
      assert.ok(d.stipend.local?.amount > 0, `${d.id} has no stipend.local`);
      assert.ok(d.stipend.local.description.length > 20, `${d.id} needs a description of the pay figure`);
    }
  });

  test('every country has a sourced living-cost range with the estimate at its midpoint', () => {
    for (const d of Object.values(raw)) {
      const c = flat[d.id];
      assert.ok(d.sources.some((s) => s.topic === 'living_costs'), d.id);
      assert.ok(c.costOfLivingLow > 0 && c.costOfLivingLow <= c.costOfLivingHigh, d.id);
      assert.ok(Math.abs(c.costOfLiving - (c.costOfLivingLow + c.costOfLivingHigh) / 2) <= 5, d.id);
    }
  });

  test('pay that does not cover living costs is reported plainly', () => {
    const shortfall = /doesn't cover the estimated living costs/;
    for (const c of Object.values(flat)) {
      assert.equal(c.warnings.some((w) => shortfall.test(w)), c.netIncome < c.costOfLiving, c.id);
    }
    assert.ok(flat.hungary.warnings.some((w) => shortfall.test(w)));
  });

  test('only claims a tax-free stipend when the data says it is untaxed', () => {
    for (const c of Object.values(flat)) {
      const claimsTaxFree = c.pros.some((p) => /free of income tax/i.test(p));
      assert.equal(claimsTaxFree, c.status !== 'Employed' && !raw[c.id].stipend.is_taxable, c.id);
    }
  });

  test('never praises funding in countries marked as low funding availability', () => {
    for (const c of Object.values(flat).filter((c) => c.fundingAvailability === 'Low')) {
      assert.ok(!c.pros.some((p) => /well-funded/i.test(p)), c.id);
    }
  });

  test('net pay subtracts the profile deduction rate', () => {
    assert.equal(estimateNetMonthly(12000, 0), 1000);
    assert.equal(estimateNetMonthly(12000, 25), 750);
    assert.equal(flat.germany.netIncome, Math.round((raw.germany.stipend.amount_eur_per_year / 12) * (1 - raw.germany.stipend.deductions_percent / 100)));
  });
});

describe('score engine', () => {
  test('employee-status filter keeps contracts and excludes stipend systems', () => {
    assert.equal(calculateMatchScore(flat.germany, { requireEmployeeStatus: true }).eligible, true);
    assert.equal(calculateMatchScore(flat.united_kingdom, { requireEmployeeStatus: true }).eligible, false);
  });

  test('visa only matters for non-EU applicants', () => {
    const eu = calculateMatchScore(flat.switzerland, { isEuStudent: true });
    const nonEu = calculateMatchScore(flat.switzerland, { isEuStudent: false });
    assert.equal(eu.breakdown.visa, 100);
    assert.ok(nonEu.breakdown.visa < 100);
  });

  test('longer stay-back rights score higher for non-EU applicants', () => {
    const dk = calculateMatchScore(flat.denmark, { isEuStudent: false });
    const de = calculateMatchScore(flat.germany, { isEuStudent: false });
    assert.ok(dk.breakdown.visa > de.breakdown.visa);
  });

  test('higher pay scores higher on the stipend dimension', () => {
    assert.ok(calculateMatchScore(flat.switzerland).breakdown.stipend > calculateMatchScore(flat.italy).breakdown.stipend);
  });

  test('shorter-duration preference favours 3-year systems', () => {
    const prefs = { preferShorterDuration: true };
    assert.ok(calculateMatchScore(flat.italy, prefs).breakdown.duration > calculateMatchScore(flat.switzerland, prefs).breakdown.duration);
  });

  test('structure preference changes the ranking', () => {
    const structured = { preferStructure: 'Structured' };
    const individual = { preferStructure: 'Individual' };
    assert.equal(flat.netherlands.structure, 'Structured');
    assert.equal(flat.germany.structure, 'Individual');
    assert.ok(calculateMatchScore(flat.netherlands, structured).totalScore > calculateMatchScore(flat.netherlands, individual).totalScore);
    assert.ok(calculateMatchScore(flat.germany, individual).totalScore > calculateMatchScore(flat.germany, structured).totalScore);
  });

  test('warm-climate preference favours the south', () => {
    const prefs = { preferWarmClimate: true };
    assert.ok(calculateMatchScore(flat.cyprus, prefs).breakdown.climate > calculateMatchScore(flat.finland, prefs).breakdown.climate);
  });

  test('every country gets a finite score, even with missing data', () => {
    for (const c of Object.values(flat)) {
      const { totalScore } = calculateMatchScore(c, { priorityHappiness: 5 });
      assert.ok(Number.isFinite(totalScore), c.id);
    }
  });

  test('explanation wording follows the score instead of always saying "excellent"', () => {
    const res = calculateMatchScore(flat.bulgaria, { priorityStipend: 5, priorityCostOfLiving: 1, priorityTuitionFees: 1, prioritySavings: 1, priorityHappiness: 1 });
    assert.ok(res.totalScore < 60);
    assert.match(res.explanation, /^Weak match/);
  });
});
