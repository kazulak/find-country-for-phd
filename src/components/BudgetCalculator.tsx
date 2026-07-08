import React, { useState, useEffect, useMemo } from 'react';
import { countries } from '../data/countries';

export default function BudgetCalculator() {
  const [selectedCountryId, setSelectedCountryId] = useState(countries[0].id);
  const [citizenship, setCitizenship] = useState<'eu' | 'noneu'>('eu');

  // Sliders State
  const [stipend, setStipend] = useState(0);
  const [savings, setSavings] = useState(0);
  const [living, setLiving] = useState(0);
  const [tuition, setTuition] = useState(0);
  const [other, setOther] = useState(200);

  const country = useMemo(() => {
    return countries.find((c) => c.id === selectedCountryId) || countries[0];
  }, [selectedCountryId]);

  // Load defaults when country or citizenship changes
  useEffect(() => {
    const isEU = citizenship === 'eu';
    const defaultTuition = isEU ? country.tuitionFeesEU : country.tuitionFeesNonEU;

    setStipend(country.netIncome);
    setLiving(country.costOfLiving);
    setTuition(defaultTuition);
    setSavings(0);
    setOther(200);
  }, [country, citizenship]);

  // Custom event listener for external triggers (e.g. from the explorer modal)
  useEffect(() => {
    const handleSelectCountry = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail && customEvent.detail.id) {
        setSelectedCountryId(customEvent.detail.id);
      }
    };
    window.addEventListener('select-calc-country', handleSelectCountry);
    return () => {
      window.removeEventListener('select-calc-country', handleSelectCountry);
    };
  }, []);

  // Calculations
  const tuitionMonthly = Math.round(tuition / 12);
  const totalInflow = stipend + savings;
  const totalOutflow = living + tuitionMonthly + other;
  const netBalance = totalInflow - totalOutflow;

  const consumptionPercent = totalInflow > 0 ? Math.round((totalOutflow / totalInflow) * 100) : 100;

  // Visualizer bar details
  let barColorClass = 'fill-success';
  if (consumptionPercent > 100) {
    barColorClass = 'fill-danger';
  } else if (consumptionPercent > 80) {
    barColorClass = 'fill-warning';
  }

  // Balance status card details
  let balanceCardClass = 'state-sustainable';
  let balanceLabel = 'Sustainable';
  let badgeClass = 'badge badge-success';

  if (netBalance > 400) {
    balanceCardClass = 'state-sustainable';
    balanceLabel = 'Sustainable';
    badgeClass = 'badge badge-success';
  } else if (netBalance >= 0) {
    balanceCardClass = 'state-tight';
    balanceLabel = 'Tight Budget';
    badgeClass = 'badge badge-warning';
  } else {
    balanceCardClass = 'state-deficit';
    balanceLabel = 'Deficit';
    badgeClass = 'badge badge-danger';
  }

  return (
    <div className="calculator-panel glass">
      <div className="calc-grid">
        {/* Input Section */}
        <div className="calc-inputs">
          <h2 className="calc-title">Affordability & Budget Calculator</h2>
          <p className="calc-subtitle">
            Simulate your PhD budget in real-time. Select a country to load average data, then customize your expenses and income.
          </p>

          {/* Country & Citizenship Selection */}
          <div className="input-row-grid">
            <div className="form-group">
              <label htmlFor="calc-country-select" className="control-label">Select Country</label>
              <select
                id="calc-country-select"
                className="form-select"
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="calc-citizenship" className="control-label">Your Citizenship</label>
              <select
                id="calc-citizenship"
                className="form-select"
                value={citizenship}
                onChange={(e) => setCitizenship(e.target.value as 'eu' | 'noneu')}
              >
                <option value="eu">EU / EEA Citizen</option>
                <option value="noneu">Non-EU / International</option>
              </select>
            </div>
          </div>

          {/* Financial Inflows */}
          <div className="calc-section-divider">Income & Inflows</div>

          <div className="form-group">
            <div className="slider-label-row">
              <label htmlFor="input-stipend" className="control-label">Monthly Net Stipend/Salary</label>
              <span className="slider-display-val">€{stipend.toLocaleString()}</span>
            </div>
            <input
              type="range"
              id="input-stipend"
              min="0"
              max="6000"
              step="50"
              value={stipend}
              onChange={(e) => setStipend(Number(e.target.value))}
              className="calc-slider"
            />
            <span className="slider-hint">Pre-filled with country average.</span>
          </div>

          <div className="form-group">
            <div className="slider-label-row">
              <label htmlFor="input-savings" className="control-label">Additional Monthly Support</label>
              <span className="slider-display-val">€{savings.toLocaleString()}</span>
            </div>
            <input
              type="range"
              id="input-savings"
              min="0"
              max="2000"
              step="50"
              value={savings}
              onChange={(e) => setSavings(Number(e.target.value))}
              className="calc-slider"
            />
            <span className="slider-hint">Savings, family support, or second jobs.</span>
          </div>

          {/* Financial Outflows */}
          <div className="calc-section-divider">Expenses & Outflows</div>

          <div className="form-group">
            <div className="slider-label-row">
              <label htmlFor="input-living" className="control-label">Estimated Living Cost (Rent + Food)</label>
              <span className="slider-display-val">€{living.toLocaleString()}</span>
            </div>
            <input
              type="range"
              id="input-living"
              min="300"
              max="3500"
              step="50"
              value={living}
              onChange={(e) => setLiving(Number(e.target.value))}
              className="calc-slider"
            />
            <span className="slider-hint">Basic local student expenses.</span>
          </div>

          <div className="form-group">
            <div className="slider-label-row">
              <label htmlFor="input-tuition" className="control-label">Tuition Fees (Yearly)</label>
              <span className="slider-display-val">€{tuition.toLocaleString()}</span>
            </div>
            <input
              type="range"
              id="input-tuition"
              min="0"
              max="30000"
              step="250"
              value={tuition}
              onChange={(e) => setTuition(Number(e.target.value))}
              className="calc-slider"
            />
            <span className="slider-hint">
              Automatically calculated monthly:{' '}
              <strong className="text-glow-secondary">€{tuitionMonthly.toLocaleString()}/mo</strong>
            </span>
          </div>

          <div className="form-group">
            <div className="slider-label-row">
              <label htmlFor="input-other" className="control-label">Other Expenses (Insurance, Leisure)</label>
              <span className="slider-display-val">€{other.toLocaleString()}</span>
            </div>
            <input
              type="range"
              id="input-other"
              min="0"
              max="1500"
              step="50"
              value={other}
              onChange={(e) => setOther(Number(e.target.value))}
              className="calc-slider"
            />
            <span className="slider-hint">Gym, subscriptions, health cover.</span>
          </div>
        </div>

        {/* Results Section */}
        <div className="calc-results glass">
          <div className="results-sticky">
            <h3 className="results-title">Monthly Balance Sheet</h3>

            {/* Status Indicator Card */}
            <div className={`balance-card ${balanceCardClass}`} id="balance-status-card">
              <span className="balance-title">Net Balance</span>
              <span className="balance-val" id="results-net-balance">
                {netBalance >= 0 ? `€${netBalance.toLocaleString()}` : `-€${Math.abs(netBalance).toLocaleString()}`}
              </span>
              <span className={badgeClass} id="balance-badge">
                {balanceLabel}
              </span>
            </div>

            <div className="breakdown-list">
              <div className="breakdown-item text-success">
                <span>Total Inflow</span>
                <span id="lbl-total-inflow">+€{totalInflow.toLocaleString()}</span>
              </div>
              <div className="breakdown-item text-danger">
                <span>Total Outflow</span>
                <span id="lbl-total-outflow">-€{totalOutflow.toLocaleString()}</span>
              </div>
            </div>

            {/* Budget Visualizer */}
            <div className="visualizer-wrapper">
              <div className="visualizer-label-row">
                <span>Budget Consumption</span>
                <span id="visualizer-pct">{consumptionPercent}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${barColorClass}`}
                  id="visualizer-bar"
                  style={{ width: `${Math.min(consumptionPercent, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Warning Panel */}
            <div className="calculator-warnings" id="calc-warnings-panel">
              {netBalance < 0 && (
                <div className="alert-box alert-box-danger">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ flexShrink: 0, marginTop: '2px' }}><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <div>
                    <strong>Negative Monthly Cashflow!</strong> Your expenses exceed your funding. You must secure additional scholarships or family support to cover the difference of €{Math.abs(netBalance).toLocaleString()}/month.
                  </div>
                </div>
              )}

              {country.housingCrisis === 'Critical' && (
                <div className="alert-box alert-box-danger">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ flexShrink: 0, marginTop: '2px' }}><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <div>
                    <strong>Critical Housing Shortage in {country.name}:</strong> Average rents might be significantly higher than budgeted if you can only find temporary listings. Budget at least 20-30% more for lodging to remain safe.
                  </div>
                </div>
              )}

              {country.housingCrisis === 'High' && (
                <div className="alert-box alert-box-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <div>
                    <strong>Tight Housing Market:</strong> Rents in major university cities here are highly competitive. Start searching at least 4-6 months before your contract starts.
                  </div>
                </div>
              )}

              {country.warnings.map((warn, index) => (
                <div key={index} className="alert-box alert-box-info">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                  <div>
                    <strong>Notice:</strong> {warn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
