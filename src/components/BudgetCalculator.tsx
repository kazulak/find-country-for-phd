import React, { useState, useEffect, useMemo } from 'react';
import { countries } from '../data/countries';

interface City {
  name: string;
  costOfLiving: number;
}

const CITIES_DATA: Record<string, City[]> = {
  germany: [
    { name: 'National Average', costOfLiving: 1100 },
    { name: 'Munich (München)', costOfLiving: 1450 },
    { name: 'Berlin', costOfLiving: 1200 },
    { name: 'Hamburg', costOfLiving: 1250 },
    { name: 'Frankfurt', costOfLiving: 1300 },
    { name: 'Heidelberg', costOfLiving: 1150 },
    { name: 'Bonn / Göttingen', costOfLiving: 1000 }
  ],
  netherlands: [
    { name: 'National Average', costOfLiving: 1500 },
    { name: 'Amsterdam', costOfLiving: 1850 },
    { name: 'Utrecht', costOfLiving: 1650 },
    { name: 'Rotterdam', costOfLiving: 1550 },
    { name: 'Delft / Leiden', costOfLiving: 1500 },
    { name: 'Groningen / Enschede', costOfLiving: 1300 }
  ],
  switzerland: [
    { name: 'National Average', costOfLiving: 1850 },
    { name: 'Zurich (Zürich)', costOfLiving: 2350 },
    { name: 'Geneva (Genève)', costOfLiving: 2300 },
    { name: 'Basel', costOfLiving: 2000 },
    { name: 'Lausanne', costOfLiving: 1950 },
    { name: 'Bern', costOfLiving: 1800 }
  ],
  france: [
    { name: 'National Average', costOfLiving: 1100 },
    { name: 'Paris', costOfLiving: 1550 },
    { name: 'Lyon', costOfLiving: 1200 },
    { name: 'Nice', costOfLiving: 1150 },
    { name: 'Marseille / Toulouse', costOfLiving: 950 },
    { name: 'Grenoble / Lille', costOfLiving: 1000 }
  ],
  united_kingdom: [
    { name: 'National Average', costOfLiving: 1300 },
    { name: 'London', costOfLiving: 1850 },
    { name: 'Oxford', costOfLiving: 1500 },
    { name: 'Cambridge', costOfLiving: 1450 },
    { name: 'Edinburgh', costOfLiving: 1250 },
    { name: 'Manchester', costOfLiving: 1100 },
    { name: 'Belfast / Newcastle', costOfLiving: 950 }
  ],
  sweden: [
    { name: 'National Average', costOfLiving: 1200 },
    { name: 'Stockholm', costOfLiving: 1450 },
    { name: 'Gothenburg (Göteborg)', costOfLiving: 1300 },
    { name: 'Lund / Uppsala', costOfLiving: 1150 }
  ],
  norway: [
    { name: 'National Average', costOfLiving: 1800 },
    { name: 'Oslo', costOfLiving: 2100 },
    { name: 'Bergen', costOfLiving: 1900 },
    { name: 'Trondheim', costOfLiving: 1750 }
  ],
  denmark: [
    { name: 'National Average', costOfLiving: 1700 },
    { name: 'Copenhagen', costOfLiving: 2000 },
    { name: 'Aarhus', costOfLiving: 1750 },
    { name: 'Odense', costOfLiving: 1550 }
  ],
  italy: [
    { name: 'National Average', costOfLiving: 850 },
    { name: 'Milan (Milano)', costOfLiving: 1200 },
    { name: 'Rome (Roma)', costOfLiving: 1000 },
    { name: 'Bologna', costOfLiving: 950 },
    { name: 'Florence (Firenze)', costOfLiving: 950 },
    { name: 'Naples (Napoli) / Pisa', costOfLiving: 750 }
  ],
  spain: [
    { name: 'National Average', costOfLiving: 900 },
    { name: 'Madrid', costOfLiving: 1200 },
    { name: 'Barcelona', costOfLiving: 1200 },
    { name: 'Valencia', costOfLiving: 950 },
    { name: 'Seville (Sevilla) / Granada', costOfLiving: 750 }
  ],
  belgium: [
    { name: 'National Average', costOfLiving: 1300 },
    { name: 'Brussels', costOfLiving: 1450 },
    { name: 'Leuven', costOfLiving: 1350 },
    { name: 'Ghent', costOfLiving: 1300 },
    { name: 'Liège', costOfLiving: 1100 }
  ],
  austria: [
    { name: 'National Average', costOfLiving: 1250 },
    { name: 'Vienna (Wien)', costOfLiving: 1350 },
    { name: 'Innsbruck', costOfLiving: 1300 },
    { name: 'Graz', costOfLiving: 1150 }
  ],
  finland: [
    { name: 'National Average', costOfLiving: 1200 },
    { name: 'Helsinki', costOfLiving: 1350 },
    { name: 'Tampere', costOfLiving: 1150 },
    { name: 'Turku / Oulu', costOfLiving: 1100 }
  ],
  ireland: [
    { name: 'National Average', costOfLiving: 1750 },
    { name: 'Dublin', costOfLiving: 2100 },
    { name: 'Cork', costOfLiving: 1700 },
    { name: 'Galway', costOfLiving: 1600 }
  ]
};

export default function BudgetCalculator() {
  const [selectedCountryId, setSelectedCountryId] = useState(countries[0].id);
  const [citizenship, setCitizenship] = useState<'eu' | 'noneu'>('eu');
  const [selectedCityName, setSelectedCityName] = useState('National Average');

  // Sliders State
  const [stipend, setStipend] = useState(0);
  const [savings, setSavings] = useState(0);
  const [living, setLiving] = useState(0);
  const [tuition, setTuition] = useState(0);
  const [other, setOther] = useState(200);

  const country = useMemo(() => {
    return countries.find((c) => c.id === selectedCountryId) || countries[0];
  }, [selectedCountryId]);

  // Get available cities for selected country
  const availableCities = useMemo(() => {
    if (CITIES_DATA[selectedCountryId]) {
      return CITIES_DATA[selectedCountryId];
    }
    // Fallback dynamic options using capital
    return [
      { name: 'National Average', costOfLiving: country.costOfLiving },
      { name: `${country.capital || 'Capital'} (Capital)`, costOfLiving: Math.round(country.costOfLiving * 1.2) }
    ];
  }, [selectedCountryId, country]);

  // Load defaults when country or citizenship changes
  useEffect(() => {
    const isEU = citizenship === 'eu';
    const defaultTuition = isEU ? country.tuitionFeesEU : country.tuitionFeesNonEU;

    setStipend(country.netIncome);
    
    // Default to National Average cost of living
    setSelectedCityName('National Average');
    const defaultCityCost = availableCities.find(c => c.name === 'National Average')?.costOfLiving ?? country.costOfLiving;
    setLiving(defaultCityCost);
    
    setTuition(defaultTuition);
    setSavings(0);
    setOther(200);
  }, [country, citizenship, availableCities]);

  // City dropdown selection handler
  const handleCityChange = (cityName: string) => {
    setSelectedCityName(cityName);
    const city = availableCities.find(c => c.name === cityName);
    if (city) {
      setLiving(city.costOfLiving);
    }
  };

  // Slider adjustment updates city dropdown selection to "Custom" if it doesn't match any preset
  const handleLivingSliderChange = (val: number) => {
    setLiving(val);
    const matchingCity = availableCities.find(c => c.costOfLiving === val);
    if (matchingCity) {
      setSelectedCityName(matchingCity.name);
    } else {
      setSelectedCityName('Custom');
    }
  };

  const dropdownOptions = useMemo(() => {
    const options = [...availableCities];
    if (selectedCityName === 'Custom') {
      options.push({ name: 'Custom (User Adjusted)', costOfLiving: living });
    }
    return options;
  }, [availableCities, selectedCityName, living]);

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

          {/* City Selection */}
          <div className="form-group">
            <label htmlFor="calc-city-select" className="control-label">Select City Base</label>
            <select
              id="calc-city-select"
              className="form-select"
              value={selectedCityName === 'Custom' ? 'Custom (User Adjusted)' : selectedCityName}
              onChange={(e) => {
                if (e.target.value === 'Custom (User Adjusted)') {
                  setSelectedCityName('Custom');
                } else {
                  handleCityChange(e.target.value);
                }
              }}
            >
              {dropdownOptions.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name} (~€{city.costOfLiving.toLocaleString()}/mo)
                </option>
              ))}
            </select>
            <span className="slider-hint">Quickly adjust base living costs to specific academic hubs.</span>
          </div>

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
              onChange={(e) => handleLivingSliderChange(Number(e.target.value))}
              className="calc-slider"
            />
            <span className="slider-hint">Basic local student expenses. Can override manually.</span>
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
