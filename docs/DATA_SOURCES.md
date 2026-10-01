# Data sources and the yearly refresh

This page explains where every number on the site comes from and how to bring the dataset up to date. The goal is that a refresh takes an afternoon, not a research project.

The canonical data lives in [`data/countries/*.yaml`](../data/countries/) (one file per country). Provenance of the automated figures is recorded in [`data/meta.yaml`](../data/meta.yaml), and each country file has a `sources:` list for everything researched by hand.

## At a glance

| Figure (YAML field) | Source | How it's updated |
| --- | --- | --- |
| Pay as published (`stipend.local`) | Official pay table, collective agreement or funder rules (per country, see below) | **Manual**, yearly |
| Pay in EUR (`stipend.amount_eur_per_year`) | Computed from `stipend.local` with the ECB annual average exchange rate | Automatic |
| Tax and contributions on salaries (`stipend.deductions_percent`) | [OECD Taxing Wages](https://data-explorer.oecd.org/vis?df%5Bag%5D=OECD.CTP.TPS&df%5Bid%5D=DSD_TAX_WAGES_COMP%40DF_TW_COMP): income tax + employee social contributions, single person without children at 67% of the average wage | Automatic for taxed salaries in OECD countries; **manual** for untaxed stipends and for Croatia and Malta |
| Price level (`cost_of_living.index_relative_to_eu_average`) | [Eurostat `prc_ppp_ind`](https://ec.europa.eu/eurostat/databrowser/view/prc_ppp_ind/default/table): price level index, household final consumption, EU27 = 100 | Automatic |
| Life satisfaction (`happiness_index`) | [World Happiness Report](https://worldhappiness.report/) Cantril ladder, via [Our World in Data](https://ourworldindata.org/grapher/happiness-cantril-ladder) | Automatic |
| Climate (`climate.average_temperature_*`) | [Open-Meteo historical API](https://open-meteo.com/en/docs/historical-weather-api) (ERA5 reanalysis): mean daily temperature in the capital, January and July, last 10 full years | Automatic, opt-in (`--climate`) |
| Post-PhD stay (`visa_and_work_rights.post_study_work_visa_duration_months`) | [EMN Inform 2022, Table 1](https://www.emn.lt/uploads/Products/product_1934/EMN_inform_international_researchers.2022.pdf), national immigration sites for non-EU countries and more generous national rules; [Directive (EU) 2016/801 Art. 25](https://eur-lex.europa.eu/eli/dir/2016/801/oj/eng) sets a 9-month minimum | **Manual** |
| Living costs (`cost_of_living.estimated_monthly_expenses_eur`) | Author's estimates | **Not sourced yet** (shown as such on the site) |
| Tuition, duration, ECTS, funding rate, funders | Hand-compiled, mostly from the national portals in `contact_portals` | **Not systematically sourced yet** |

`npm run report` writes [`reports/data_report.md`](../reports/data_report.md), which lists, per country, which topics still have no source. Use it as the to-do list.

## The rules behind the pay figure

So that countries are comparable, every `stipend.local` follows the same rules:

1. **First-year** pay for a typical funded PhD position. If there are tiers (Poland before/after the mid-term evaluation, Lithuania year 1 vs later), use the first tier and mention the later ones in `description`.
2. **Gross**, as published, in the **original currency** and period (`per: month` or `per: year`).
3. Include **guaranteed** annual extras through `payments_per_year`: Austria's 14 salaries (`14`), the Dutch 8% holiday allowance + 8.3% year-end bonus (`13.96`), Germany's TV-L annual payment of 46.47% (`12.4647`). Leave out discretionary bonuses.
4. Where pay is set per position rather than nationally (Finland, Luxembourg, Norway, Malta), use the figure most universities advertise and say so in `description`.
5. If a funder publishes only a **net** amount (Belgium's FWO), store it with `deductions_percent: 0` and say so.
6. `description` must say what the number is: scheme, step and effective date. It is shown under the pay figure on the country page.

`deductions_percent` for **untaxed** stipends is 0 unless contributions are deducted. Poland (pension and disability, 11.26%) and Italy (the holder's third of the INPS Gestione Separata rate, 11.68%) are examples where they are. Cite the source with `topic: deductions`.

If the pay doesn't cover the living-cost estimate, that is reported, not "fixed". The site automatically adds a plain warning to the country page and quiz results. Never nudge a figure to make a country look liveable; if you know more (typical top-ups, side jobs), say so in `description`.

**Weaker sources are fine; hiding them is not.** A best-fit figure from a news report or a job ad beats no figure, as long as the `sources` entry says exactly where it comes from (and `note:` says what to double-check). Notes are shown on the country page.

## Yearly refresh checklist

Do this once a year, ideally in **October**. Most pay tables change between January and October, and the UK, Swedish and Danish rates change in August to October.

1. **Automated figures**

   ```bash
   npm run data:refresh -- --dry-run   # preview what would change
   npm run data:refresh                # write it
   ```

   Every three to five years, add `--climate` to also refresh temperatures. It downloads ten years of daily weather for 30 cities and can hit Open-Meteo's free rate limit. The script waits and retries, but expect about 5 minutes.

2. **Check the links**

   ```bash
   npm run data:check-links
   ```

   Lines marked `CHECK IN A BROWSER` are sites that block scripts (403) or have certificate quirks. Open them by hand. `BROKEN` lines need a new source.

3. **Pay, country by country.** Open the `pay` source in each YAML file (the table below says what to look for). Update `stipend.local.amount`, its `description` and the source's `accessed` date. Then run `npm run data:refresh` again to convert to EUR. For untaxed stipends, check whether the contribution rate changed.

4. **Visa rules.** Check the `visa` sources, especially for countries in the news: the UK Graduate Route and anything that transposes the 2016/801 directive differently. The EMN table is from 2022, so a newer EMN report on international researchers or students should replace it when one appears.

5. **See what's left**

   ```bash
   npm run report
   ```

6. **Ship it**

   ```bash
   npm run validate && npm test && npm run build && npm run test:e2e
   ```

## Where to look, per country

| Country | Pay: what to check | Post-PhD stay |
| --- | --- | --- |
| Austria | Universitäten-KV salary table, group B1, at 30 h/week, 14× | EMN (12) |
| Belgium | FWO PhD fellowship (net amount, 0 years seniority) | EMN (9; 12-month search year for students) |
| Bulgaria | Council of Ministers decree on doctoral scholarships (EUR since 2026) | EMN (9) |
| Croatia | Assistant coefficient (2.01) × public-sector salary base | EMN (12) |
| Cyprus | University of Cyprus full PhD scholarship | EMN (12) |
| Czechia | Minimum doctoral income (1.2× minimum wage) | EMN (9) |
| Denmark | AC agreement PhD pay (Aarhus University pay sheet), pay scale 4 + PhD supplement | nyidanmark.dk (36) |
| Estonia | Junior research fellow minimum salary | EMN (9) |
| Finland | University salary system, level 2 starting salary in current ads | Migri (24) |
| France | Arrêté on the contrat doctoral minimum (Légifrance) | EMN (12) |
| Germany | TV-L E13 step 1 at 65% + Jahressonderzahlung | Make it in Germany (18) |
| Greece | HFRI doctoral scholarship call | EMN (12) |
| Hungary | State doctoral scholarship (and whether the 2026 increase passed) | EMN (9) |
| Ireland | Research Ireland stipend | Irish Immigration, Stamp 1G (24) |
| Italy | MUR minimum scholarship + the yearly INPS Gestione Separata circular | National rule (12), not re-verified |
| Latvia | Minimum state salary under the new doctoral model | EMN (9) |
| Lithuania | Basic social benefit (BSI) value × 19 | EMN (12) |
| Luxembourg | University of Luxembourg doctoral researcher ads | EMN (9) |
| Malta | University of Malta Research Support Officer II rate; MTCA tax bands | EMN (9) |
| Netherlands | CAO NU PhD scale, year 1, + 8% + 8.3% | EMN (12) |
| Norway | NTNU/UiO code 1017 ads (no central minimum since May 2026) | UDI (12) |
| Poland | Professor base salary × 37% (pre-evaluation); university top-ups | EMN (9) |
| Portugal | FCT doctoral scholarship (BD) allowance table | AIMA, art. 122 p (12) |
| Romania | Ministry order on scholarship amounts | Directive minimum (9) |
| Slovakia | Ministry doctoral scholarship (before the dissertation exam) | EMN (9) |
| Slovenia | Young researcher, salary grade 22 | EMN (9) |
| Spain | FPU call: minimum salary per contract year | EMN (12) |
| Sweden | Uppsala University local doctoral salary agreement, starting step | EMN (12) |
| Switzerland | SNSF minimum doctoral salary | SEM rule via ETH Zurich (6) |
| United Kingdom | UKRI minimum stipend (outside London) | Graduate Route (36 for PhDs) |

## Known gaps

Honest list of what is **not** properly sourced yet:

- **Living costs.** These are the author's estimates. A credible replacement would be a consistent per-city source (for example official university cost-of-living guidance, or student-visa proof-of-funds amounts as a floor), documented with `topic: living_costs`.
- **Tuition fees, typical duration, required ECTS, funding rate and funder lists.** Hand-compiled; each needs a source with the matching `topic`.
- **One pay figure per country.** Real pay varies by field, funder, contract percentage and city. The site says so, and the overview text gives ranges where known.
- **Untaxed stipends with partial contributions** (Czechia's mixed stipend + salary, for example) are approximations.
- `languages[].english_friendly` and `visa_and_work_rights.work_hours_limit_per_week` are not used on the site and are not sourced.
