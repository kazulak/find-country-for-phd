/**
 * Refreshes every figure that has a machine-readable, credible source:
 *
 *   price level index   Eurostat prc_ppp_ind (PLI, EU27_2020 = 100, household consumption)
 *   life satisfaction   World Happiness Report (Cantril ladder), via Our World in Data
 *   climate             Open-Meteo historical API (ERA5 reanalysis), capital city, 10 full years
 *   pay deductions      OECD Taxing Wages (income tax + employee SSC at 67% of the average wage)
 *                       -> stipend.deductions_percent, for taxed salaries in OECD countries
 *   exchange rates      ECB euro reference rates, annual average of the last full year
 *                       -> recomputes stipend.amount_eur_per_year from `stipend.local` and the
 *                          living-cost range (cost_of_living.*_eur_per_month) from `cost_of_living.local`
 *
 * Pay amounts, fees, visa rules and living costs are researched by hand. See docs/DATA_SOURCES.md.
 *
 * Usage: npm run data:refresh                 (writes data/countries/*.yaml and data/meta.yaml)
 *        npm run data:refresh -- --dry-run     (show what would change, write nothing)
 *        npm run data:refresh -- --climate     (also refresh temperatures; slow, see below)
 *
 * Climate is opt-in: ten-year means barely move from one year to the next, and the
 * free Open-Meteo tier rate-limits 30 x 10 years of daily data. Every few years is plenty.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { ISO_CODES } from '../lib/country-model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const countriesDir = path.join(__dirname, '../data/countries');
const metaPath = path.join(__dirname, '../data/meta.yaml');
const dryRun = process.argv.includes('--dry-run');
const withClimate = process.argv.includes('--climate');

// Eurostat uses EL for Greece and UK for the United Kingdom.
const EUROSTAT_GEO = { GR: 'EL', GB: 'UK' };

const ISO3 = {
  AT: 'AUT', BE: 'BEL', BG: 'BGR', HR: 'HRV', CY: 'CYP', CZ: 'CZE', DK: 'DNK', EE: 'EST',
  FI: 'FIN', FR: 'FRA', DE: 'DEU', GR: 'GRC', HU: 'HUN', IE: 'IRL', IT: 'ITA', LV: 'LVA',
  LT: 'LTU', LU: 'LUX', MT: 'MLT', NL: 'NLD', NO: 'NOR', PL: 'POL', PT: 'PRT', RO: 'ROU',
  SK: 'SVK', SI: 'SVN', ES: 'ESP', SE: 'SWE', CH: 'CHE', GB: 'GBR'
};

// Not OECD members, so absent from Taxing Wages (their deductions are researched by hand).
const NON_OECD = new Set(['BGR', 'HRV', 'CYP', 'MLT', 'ROU']);

// Coordinates of each profile's `capital` (climate reference point).
const CAPITAL_COORDS = {
  austria: [48.21, 16.37], belgium: [50.85, 4.35], bulgaria: [42.70, 23.32], croatia: [45.81, 15.98],
  cyprus: [35.17, 33.36], czech_republic: [50.08, 14.44], denmark: [55.68, 12.57], estonia: [59.44, 24.75],
  finland: [60.17, 24.94], france: [48.86, 2.35], germany: [52.52, 13.40], greece: [37.98, 23.73],
  hungary: [47.50, 19.04], ireland: [53.35, -6.26], italy: [41.90, 12.50], latvia: [56.95, 24.11],
  lithuania: [54.69, 25.28], luxembourg: [49.61, 6.13], malta: [35.90, 14.51], netherlands: [52.37, 4.90],
  norway: [59.91, 10.75], poland: [52.23, 21.01], portugal: [38.72, -9.14], romania: [44.43, 26.10],
  slovakia: [48.15, 17.11], slovenia: [46.06, 14.51], spain: [40.42, -3.70], sweden: [59.33, 18.07],
  switzerland: [46.95, 7.45], united_kingdom: [51.51, -0.13]
};

const today = new Date().toISOString().slice(0, 10);
const lastFullYear = new Date().getUTCFullYear() - 1;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function request(url, retries = 3) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (retries === 0) throw err;
    console.log(`  network error (${err.cause?.code || err.message}), retrying in 15 s ...`);
    await sleep(15_000);
    return request(url, retries - 1);
  }
  // Open-Meteo's free tier rate-limits per minute and the OECD API returns sporadic
  // 5xx errors; wait and retry rather than fail the whole refresh.
  if ((res.status === 429 || res.status >= 500) && retries > 0) {
    const wait = res.status === 429 ? 65 : 15 * 2 ** (3 - retries); // 15, 30, 60 s
    console.log(`  HTTP ${res.status}, retrying in ${wait} s ...`);
    await sleep(wait * 1000);
    return request(url, retries - 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
}

const getJson = async (url) => (await request(url)).json();
const getText = async (url) => (await request(url)).text();

/** Latest year in which Eurostat has a price level index for every country. */
async function fetchPriceLevels(isoCodes) {
  const url = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_ppp_ind'
    + '?format=JSON&lang=EN&na_item=PLI_EU27_2020&ppp_cat=A01&lastTimePeriod=3';
  const data = await getJson(url);
  // JSON-stat: the flat value index is the row-major position across all dimensions.
  const strides = data.id.map((_, i) => data.size.slice(i + 1).reduce((a, b) => a * b, 1));
  const valueAt = (coords) => data.value[data.id.reduce((sum, dim, i) => sum + coords[dim] * strides[i], 0)];
  const geoIndex = data.dimension.geo.category.index;
  const years = Object.entries(data.dimension.time.category.index).sort((a, b) => b[1] - a[1]);

  for (const [year, timeIdx] of years) {
    const values = {};
    for (const iso of isoCodes) {
      const geo = EUROSTAT_GEO[iso] || iso;
      const v = valueAt({ freq: 0, na_item: 0, ppp_cat: 0, geo: geoIndex[geo], time: timeIdx });
      if (v === undefined || v === null) break;
      values[iso] = Math.round(v);
    }
    if (Object.keys(values).length === isoCodes.length) {
      return { year: Number(year), values, url: 'https://ec.europa.eu/eurostat/databrowser/view/prc_ppp_ind/default/table' };
    }
  }
  throw new Error('Eurostat: no recent year with a price level index for every country');
}

/** Latest World Happiness Report ladder score per country (Our World in Data mirror). */
async function fetchLifeSatisfaction(isoCodes) {
  const csv = await getText('https://ourworldindata.org/grapher/happiness-cantril-ladder.csv?v=1&csvType=full&useColumnShortNames=true');
  const latest = {};
  for (const line of csv.trim().split('\n').slice(1)) {
    const cols = line.split(',');
    const [code, year, score] = cols.slice(-3);
    if (!code || score === '') continue;
    if (!latest[code] || Number(year) > latest[code].year) latest[code] = { year: Number(year), score: Number(score) };
  }
  const values = {};
  const yearsSeen = new Set();
  for (const iso of isoCodes) {
    const hit = latest[ISO3[iso]];
    values[iso] = hit ? Math.round(hit.score * 100) / 100 : null;
    if (hit) yearsSeen.add(hit.year);
  }
  return { years: [...yearsSeen].sort(), values, url: 'https://ourworldindata.org/grapher/happiness-cantril-ladder' };
}

/** ECB annual average reference rates (units of currency per 1 EUR). */
async function fetchExchangeRates(currencies) {
  const needed = currencies.filter(c => c !== 'EUR');
  if (needed.length === 0) return { year: lastFullYear, rates: {} };
  const url = `https://data-api.ecb.europa.eu/service/data/EXR/A.${needed.join('+')}.EUR.SP00.A`
    + `?startPeriod=${lastFullYear}&endPeriod=${lastFullYear}&format=csvdata`;
  const csv = await getText(url);
  const [header, ...rows] = csv.trim().split('\n');
  const cols = header.split(',');
  const cur = cols.indexOf('CURRENCY');
  const val = cols.indexOf('OBS_VALUE');
  const rates = {};
  for (const row of rows) {
    const c = row.split(',');
    rates[c[cur]] = Math.round(Number(c[val]) * 10000) / 10000;
  }
  const missing = needed.filter(c => !(c in rates));
  if (missing.length) throw new Error(`ECB: no ${lastFullYear} rate for ${missing.join(', ')}`);
  return { year: lastFullYear, rates, url: 'https://data.ecb.europa.eu/data/datasets/EXR' };
}

/**
 * OECD Taxing Wages: income tax + employee social security contributions as % of gross
 * wage, single person without children at 67% of the average wage (close to typical PhD pay).
 */
async function fetchDeductions(iso3Codes) {
  const url = 'https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/'
    + `${iso3Codes.join('+')}.AV_RITEESSC..S_C0.AW67...?startPeriod=${lastFullYear - 2}&format=csvfilewithlabels`;
  const csv = await getText(url);
  const parse = (line) => {
    const out = [];
    let cell = '';
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === ',' && !quoted) { out.push(cell); cell = ''; }
      else cell += ch;
    }
    out.push(cell);
    return out;
  };
  const [header, ...rows] = csv.trim().split('\n').map(parse);
  const [area, year, value] = ['REF_AREA', 'TIME_PERIOD', 'OBS_VALUE'].map(c => header.indexOf(c));
  const latest = {};
  for (const r of rows) {
    if (r[value] === '') continue;
    if (!latest[r[area]] || Number(r[year]) > latest[r[area]].year) latest[r[area]] = { year: Number(r[year]), rate: Number(r[value]) };
  }
  const years = [...new Set(Object.values(latest).map(v => v.year))].sort();
  const values = Object.fromEntries(Object.entries(latest).map(([k, v]) => [k, Math.round(v.rate * 10) / 10]));
  return { years, values, url: 'https://data-explorer.oecd.org/vis?df%5Bag%5D=OECD.CTP.TPS&df%5Bid%5D=DSD_TAX_WAGES_COMP%40DF_TW_COMP' };
}

/** Mean daily temperature in January and July over the last 10 full years. */
async function fetchClimate(id) {
  const [lat, lon] = CAPITAL_COORDS[id];
  const start = `${lastFullYear - 9}-01-01`;
  const end = `${lastFullYear}-12-31`;
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}`
    + `&start_date=${start}&end_date=${end}&daily=temperature_2m_mean&timezone=UTC`;
  const { daily } = await getJson(url);
  const byMonth = { '01': [], '07': [] };
  daily.time.forEach((t, i) => {
    const m = t.slice(5, 7);
    if (m in byMonth && daily.temperature_2m_mean[i] !== null) byMonth[m].push(daily.temperature_2m_mean[i]);
  });
  const mean = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  return { winter: mean(byMonth['01']), summer: mean(byMonth['07']), period: `${lastFullYear - 9}–${lastFullYear}` };
}

/** Converts a published monthly living-cost range to EUR (converted amounts rounded to EUR 10). */
function livingCostsEur(local, rates) {
  if (local.currency === 'EUR') return { low: local.low, high: local.high };
  const rate = rates[local.currency];
  const toEur = (v) => Math.round(v / rate / 10) * 10;
  return { low: toEur(local.low), high: toEur(local.high) };
}

/** Replace the value of a single `key: value` line, keeping the rest of the file untouched. */
function setField(text, key, value, file) {
  const re = new RegExp(`^(\\s*${key}:[ \\t]*).*$`, 'm');
  if (!re.test(text)) throw new Error(`${file}: field "${key}" not found`);
  return text.replace(re, `$1${value === null ? 'null' : value}`);
}

async function main() {
  const files = fs.readdirSync(countriesDir).filter(f => f.endsWith('.yaml'));
  const profiles = files.map(file => {
    const text = fs.readFileSync(path.join(countriesDir, file), 'utf8');
    return { file, text, data: yaml.load(text) };
  });
  const isoOf = (p) => ISO_CODES[p.data.id];
  const isoCodes = profiles.map(isoOf);

  console.log('Fetching Eurostat price levels ...');
  const pli = await fetchPriceLevels(isoCodes);
  console.log('Fetching World Happiness Report scores ...');
  const whr = await fetchLifeSatisfaction(isoCodes);
  const currencies = [...new Set(profiles.flatMap(p => [p.data.stipend.local?.currency, p.data.cost_of_living.local?.currency]).filter(Boolean))];
  console.log(`Fetching ECB exchange rates (${currencies.join(', ') || 'none needed'}) ...`);
  const fx = await fetchExchangeRates(currencies);
  console.log('Fetching OECD Taxing Wages deduction rates ...');
  // The OECD API is flaky; if it is down, keep the current rates rather than abort everything.
  let taxes = null;
  try {
    taxes = await fetchDeductions(profiles.filter(p => p.data.stipend.is_taxable).map(p => ISO3[isoOf(p)]).filter(c => !NON_OECD.has(c)));
  } catch (err) {
    console.warn(`  WARNING: OECD Taxing Wages unavailable (${err.message}). Keeping existing deductions_percent values; re-run later to refresh them.`);
  }

  const previousMeta = fs.existsSync(metaPath) ? yaml.load(fs.readFileSync(metaPath, 'utf8')) : null;
  const changes = [];
  let climatePeriod = previousMeta?.automated_sources?.climate?.period ?? 'not refreshed yet';
  for (const p of profiles) {
    const iso = isoOf(p);
    const { id } = p.data;

    const updates = [
      ['index_relative_to_eu_average', p.data.cost_of_living.index_relative_to_eu_average, pli.values[iso]],
      ['happiness_index', p.data.happiness_index, whr.values[iso]],
    ];

    if (withClimate) {
      console.log(`Fetching climate for ${p.data.capital} ...`);
      const climate = await fetchClimate(id);
      await sleep(3000);
      climatePeriod = climate.period;
      updates.push(
        ['average_temperature_summer_c', p.data.climate.average_temperature_summer_c, climate.summer],
        ['average_temperature_winter_c', p.data.climate.average_temperature_winter_c, climate.winter],
      );
    }

    // Taxed salaries use the OECD rate; untaxed stipends and non-OECD countries keep their
    // hand-researched deductions_percent (documented in the profile's `sources`).
    const oecdRate = p.data.stipend.is_taxable && taxes ? taxes.values[ISO3[iso]] : undefined;
    if (oecdRate !== undefined) {
      updates.push(['deductions_percent', p.data.stipend.deductions_percent, oecdRate]);
    }

    const local = p.data.stipend.local;
    if (local) {
      const rate = local.currency === 'EUR' ? 1 : fx.rates[local.currency];
      const perYear = local.amount * (local.per === 'month' ? (local.payments_per_year ?? 12) : 1);
      updates.push(['amount_eur_per_year', p.data.stipend.amount_eur_per_year, Math.round(perYear / rate / 100) * 100]);
    }

    // Living-cost range as published -> EUR; the headline estimate is the midpoint.
    const cost = p.data.cost_of_living;
    if (cost.local) {
      const { low, high } = livingCostsEur(cost.local, fx.rates);
      updates.push(
        ['low_eur_per_month', cost.low_eur_per_month, low],
        ['high_eur_per_month', cost.high_eur_per_month, high],
        ['estimated_monthly_expenses_eur', cost.estimated_monthly_expenses_eur, Math.round((low + high) / 2 / 10) * 10],
      );
    }

    for (const [key, before, after] of updates) {
      if (before !== after) {
        p.text = setField(p.text, key, after, p.file);
        changes.push({ country: id, field: key, before, after });
      }
    }
  }

  const meta = {
    refreshed: today,
    automated_sources: {
      price_level_index: {
        source: 'Eurostat, prc_ppp_ind: price level index, household final consumption (EU27_2020 = 100)',
        year: pli.year,
        url: pli.url,
      },
      life_satisfaction: {
        source: 'World Happiness Report (Cantril ladder, 0-10), via Our World in Data',
        year: whr.years.length === 1 ? whr.years[0] : whr.years.join(', '),
        url: whr.url,
      },
      climate: {
        source: 'Open-Meteo historical weather API (ERA5 reanalysis): mean daily temperature in the capital, January and July',
        period: climatePeriod,
        url: 'https://open-meteo.com/en/docs/historical-weather-api',
      },
      pay_deductions: taxes ? {
        source: 'OECD Taxing Wages: income tax + employee social security contributions, % of gross wage, single person without children at 67% of the average wage (taxed salaries only)',
        year: taxes.years.length === 1 ? taxes.years[0] : taxes.years.join(', '),
        url: taxes.url,
      } : previousMeta?.automated_sources?.pay_deductions,
      exchange_rates: {
        source: 'European Central Bank euro reference rates, annual average (units per 1 EUR)',
        year: fx.year,
        url: fx.url,
        rates: fx.rates,
      },
    },
  };

  if (changes.length === 0) {
    console.log('Everything is already up to date.');
  } else {
    console.log(`${changes.length} value(s) changed:`);
    for (const c of changes) console.log(`  ${c.country.padEnd(16)} ${c.field.padEnd(30)} ${String(c.before).padStart(7)} -> ${c.after}`);
  }

  if (dryRun) {
    console.log('\nDry run: nothing written.');
    return;
  }
  for (const p of profiles) fs.writeFileSync(path.join(countriesDir, p.file), p.text, 'utf8');
  const header = '# Written by `npm run data:refresh`. Do not edit by hand.\n'
    + '# Manually researched figures (pay, fees, visas) are documented in docs/DATA_SOURCES.md.\n';
  fs.writeFileSync(metaPath, header + yaml.dump(meta, { lineWidth: 120 }), 'utf8');
  console.log(`\nUpdated ${profiles.length} profiles and data/meta.yaml. Run \`npm run validate\` next.`);
}

main().catch(err => {
  console.error(`Refresh failed: ${err.message}`);
  process.exit(1);
});
