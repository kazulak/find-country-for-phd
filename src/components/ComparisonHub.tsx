import React, { useState, useEffect, useMemo } from 'react';
import { countries, type Country } from '../data/countries';

export default function ComparisonHub() {
  const [select1, setSelect1] = useState('germany');
  const [select2, setSelect2] = useState('netherlands');
  const [select3, setSelect3] = useState('none');

  // Custom event listener to add country to comparison list
  useEffect(() => {
    const handleAddCompare = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail && customEvent.detail.id) {
        const countryId = customEvent.detail.id;

        if (select3 === 'none' && select1 !== countryId && select2 !== countryId) {
          setSelect3(countryId);
        } else if (select1 !== countryId && select2 !== countryId) {
          // Shift values
          setSelect1(select2);
          setSelect2(countryId);
        }
      }
    };

    window.addEventListener('add-compare-country', handleAddCompare);
    return () => {
      window.removeEventListener('add-compare-country', handleAddCompare);
    };
  }, [select1, select2, select3]);

  // Find country objects
  const c1 = useMemo(() => countries.find((c) => c.id === select1), [select1]);
  const c2 = useMemo(() => countries.find((c) => c.id === select2), [select2]);
  const c3 = useMemo(() => (select3 !== 'none' ? countries.find((c) => c.id === select3) : null), [select3]);

  // Calculations for highlights
  const salaries = [c1?.netIncome, c2?.netIncome, c3?.netIncome].filter(Boolean) as number[];
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;

  const costOfLivings = [c1?.costOfLiving, c2?.costOfLiving, c3?.costOfLiving].filter(Boolean) as number[];
  const minCOL = costOfLivings.length > 0 ? Math.min(...costOfLivings) : 99999;

  const happinesses = [c1?.happinessIndex, c2?.happinessIndex, c3?.happinessIndex].filter(Boolean) as number[];
  const maxHappiness = happinesses.length > 0 ? Math.max(...happinesses) : 0;

  const renderBadge = (status?: string) => {
    if (!status) return '';
    let cls = 'badge-secondary';
    if (status === 'Employed') cls = 'badge-success';
    if (status === 'Fellowship') cls = 'badge-primary';
    if (status === 'Student') cls = 'badge-warning';

    return <span className={`badge ${cls}`}>{status}</span>;
  };

  const renderHeader = (country?: Country | null) => {
    if (country) {
      return (
        <div className="country-header-block">
          <span className="c-flag" aria-hidden="true">
            {country.flag}
          </span>
          <span className="c-name">{country.name}</span>
        </div>
      );
    }
    return (
      <div className="country-header-block empty-header">
        <span className="c-flag" style={{ opacity: 0.1 }}>
          🇪🇺
        </span>
        <span className="c-name" style={{ color: 'var(--text-muted)' }}>
          None
        </span>
      </div>
    );
  };

  return (
    <div className="comparison-panel glass">
      <div className="comparison-header-row">
        <div>
          <h2 className="compare-title">Comparison Hub</h2>
          <p className="compare-subtitle">
            Compare up to three PhD systems side-by-side to review financial, practical, and academic differences.
          </p>
        </div>
      </div>

      {/* Selector Dropdowns Grid */}
      <div className="selectors-grid">
        <div className="selector-box select-slot-1">
          <div className="color-dot dot-1"></div>
          <label htmlFor="compare-select-1" className="control-label">Candidate 1</label>
          <select
            id="compare-select-1"
            className="form-select"
            value={select1}
            onChange={(e) => setSelect1(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-box select-slot-2">
          <div className="color-dot dot-2"></div>
          <label htmlFor="compare-select-2" className="control-label">Candidate 2</label>
          <select
            id="compare-select-2"
            className="form-select"
            value={select2}
            onChange={(e) => setSelect2(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-box select-slot-3">
          <div className="color-dot dot-3"></div>
          <label htmlFor="compare-select-3" className="control-label">Candidate 3 (Optional)</label>
          <select
            id="compare-select-3"
            className="form-select"
            value={select3}
            onChange={(e) => setSelect3(e.target.value)}
          >
            <option value="none">— None Selected —</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="table-wrapper">
        <table className="compare-table">
          <thead>
            <tr className="header-tr">
              <th className="feature-col">PhD Parameters</th>
              <th id="col-header-1" className="country-col">
                {renderHeader(c1)}
              </th>
              <th id="col-header-2" className="country-col">
                {renderHeader(c2)}
              </th>
              <th id="col-header-3" className="country-col">
                {renderHeader(c3)}
              </th>
            </tr>
          </thead>
          <tbody id="compare-table-body">
            {/* Academic Framework Section */}
            <tr className="section-row">
              <td colSpan={4}>Academic Framework</td>
            </tr>
            <tr>
              <td className="param-name">PhD Duration</td>
              <td className="param-val">{c1?.duration}</td>
              <td className="param-val">{c2?.duration}</td>
              <td className="param-val">{c3 ? c3.duration : <span className="empty-cell-text">—</span>}</td>
            </tr>
            <tr>
              <td className="param-name">Candidate Status</td>
              <td className="param-val">{renderBadge(c1?.status)}</td>
              <td className="param-val">{renderBadge(c2?.status)}</td>
              <td className="param-val">{c3 ? renderBadge(c3.status) : <span className="empty-cell-text">—</span>}</td>
            </tr>
            <tr>
              <td className="param-name">Standard Model</td>
              <td className="param-val">{c1?.structure}</td>
              <td className="param-val">{c2?.structure}</td>
              <td className="param-val">{c3 ? c3.structure : <span className="empty-cell-text">—</span>}</td>
            </tr>

            {/* Financial Framework Section */}
            <tr className="section-row">
              <td colSpan={4}>Financial Framework</td>
            </tr>
            <tr>
              <td className="param-name">Avg. Net Income</td>
              <td className={`param-val ${c1?.netIncome === maxSalary ? 'highlight-cell-green' : ''}`}>
                €{c1?.netIncome.toLocaleString()}/mo
              </td>
              <td className={`param-val ${c2?.netIncome === maxSalary ? 'highlight-cell-green' : ''}`}>
                €{c2?.netIncome.toLocaleString()}/mo
              </td>
              <td className={`param-val ${c3 && c3.netIncome === maxSalary ? 'highlight-cell-green' : ''}`}>
                {c3 ? `€${c3.netIncome.toLocaleString()}/mo` : <span className="empty-cell-text">—</span>}
              </td>
            </tr>
            <tr>
              <td className="param-name">Living Cost Estimate</td>
              <td className={`param-val ${c1?.costOfLiving === minCOL ? 'highlight-cell-green' : ''}`}>
                ~€{c1?.costOfLiving.toLocaleString()}/mo
              </td>
              <td className={`param-val ${c2?.costOfLiving === minCOL ? 'highlight-cell-green' : ''}`}>
                ~€{c2?.costOfLiving.toLocaleString()}/mo
              </td>
              <td className={`param-val ${c3 && c3.costOfLiving === minCOL ? 'highlight-cell-green' : ''}`}>
                {c3 ? `~€${c3.costOfLiving.toLocaleString()}/mo` : <span className="empty-cell-text">—</span>}
              </td>
            </tr>
            <tr>
              <td className="param-name">Yearly Tuition (EU)</td>
              <td className={`param-val ${c1?.tuitionFeesEU === 0 ? 'highlight-cell-green' : ''}`}>
                {c1?.tuitionFeesEU === 0 ? 'Free' : `€${c1?.tuitionFeesEU.toLocaleString()}`}
              </td>
              <td className={`param-val ${c2?.tuitionFeesEU === 0 ? 'highlight-cell-green' : ''}`}>
                {c2?.tuitionFeesEU === 0 ? 'Free' : `€${c2?.tuitionFeesEU.toLocaleString()}`}
              </td>
              <td className={`param-val ${c3 && c3.tuitionFeesEU === 0 ? 'highlight-cell-green' : ''}`}>
                {c3 ? (c3.tuitionFeesEU === 0 ? 'Free' : `€${c3.tuitionFeesEU.toLocaleString()}`) : <span className="empty-cell-text">—</span>}
              </td>
            </tr>
            <tr>
              <td className="param-name">Yearly Tuition (Non-EU)</td>
              <td className={`param-val ${c1?.tuitionFeesNonEU === 0 ? 'highlight-cell-green' : ''}`}>
                {c1?.tuitionFeesNonEU === 0 ? 'Free' : `€${c1?.tuitionFeesNonEU.toLocaleString()}`}
              </td>
              <td className={`param-val ${c2?.tuitionFeesNonEU === 0 ? 'highlight-cell-green' : ''}`}>
                {c2?.tuitionFeesNonEU === 0 ? 'Free' : `€${c2?.tuitionFeesNonEU.toLocaleString()}`}
              </td>
              <td className={`param-val ${c3 && c3.tuitionFeesNonEU === 0 ? 'highlight-cell-green' : ''}`}>
                {c3 ? (c3.tuitionFeesNonEU === 0 ? 'Free' : `€${c3.tuitionFeesNonEU.toLocaleString()}`) : <span className="empty-cell-text">—</span>}
              </td>
            </tr>

            {/* Practical Life Section */}
            <tr className="section-row">
              <td colSpan={4}>Practical Life</td>
            </tr>
            <tr>
              <td className="param-name">English Friendly</td>
              <td className={`param-val ${c1 && c1.englishFriendly >= 9 ? 'highlight-cell-green' : ''}`}>
                {c1?.englishFriendly} / 10
              </td>
              <td className={`param-val ${c2 && c2.englishFriendly >= 9 ? 'highlight-cell-green' : ''}`}>
                {c2?.englishFriendly} / 10
              </td>
              <td className={`param-val ${c3 && c3.englishFriendly >= 9 ? 'highlight-cell-green' : ''}`}>
                {c3 ? `${c3.englishFriendly} / 10` : <span className="empty-cell-text">—</span>}
              </td>
            </tr>
            <tr>
              <td className="param-name">Visa Complexity</td>
              <td className={`param-val ${c1?.visaComplexityNonEU === 'Hard' ? 'highlight-cell-red' : ''}`}>
                {c1?.visaComplexityNonEU}
              </td>
              <td className={`param-val ${c2?.visaComplexityNonEU === 'Hard' ? 'highlight-cell-red' : ''}`}>
                {c2?.visaComplexityNonEU}
              </td>
              <td className={`param-val ${c3 && c3.visaComplexityNonEU === 'Hard' ? 'highlight-cell-red' : ''}`}>
                {c3 ? c3.visaComplexityNonEU : <span className="empty-cell-text">—</span>}
              </td>
            </tr>
            <tr>
              <td className="param-name">Housing Pressure</td>
              <td className={`param-val ${c1 && (c1.housingCrisis === 'Critical' || c1.housingCrisis === 'High') ? 'highlight-cell-red' : ''}`}>
                {c1?.housingCrisis}
              </td>
              <td className={`param-val ${c2 && (c2.housingCrisis === 'Critical' || c2.housingCrisis === 'High') ? 'highlight-cell-red' : ''}`}>
                {c2?.housingCrisis}
              </td>
              <td className={`param-val ${c3 && (c3.housingCrisis === 'Critical' || c3.housingCrisis === 'High') ? 'highlight-cell-red' : ''}`}>
                {c3 ? c3.housingCrisis : <span className="empty-cell-text">—</span>}
              </td>
            </tr>
            <tr>
              <td className="param-name">Happiness Index</td>
              <td className={`param-val ${c1?.happinessIndex === maxHappiness ? 'highlight-cell-green' : ''}`}>
                {c1?.happinessIndex} / 10
              </td>
              <td className={`param-val ${c2?.happinessIndex === maxHappiness ? 'highlight-cell-green' : ''}`}>
                {c2?.happinessIndex} / 10
              </td>
              <td className={`param-val ${c3 && c3.happinessIndex === maxHappiness ? 'highlight-cell-green' : ''}`}>
                {c3 ? `${c3.happinessIndex} / 10` : <span className="empty-cell-text">—</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
