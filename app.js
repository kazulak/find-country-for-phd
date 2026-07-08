import { countries, questions } from './data.js';

// Application State
const state = {
  currentView: 'landing',
  currentQuestionIndex: 0,
  answers: {}, // questionId -> option
  compareList: [] // Array of country IDs (max 3)
};

// DOM Elements
const views = {
  landing: document.getElementById('view-landing'),
  quiz: document.getElementById('view-quiz'),
  results: document.getElementById('view-results'),
  explorer: document.getElementById('view-explorer')
};

const navLinks = {
  landing: document.getElementById('nav-landing'),
  explorer: document.getElementById('nav-explorer')
};

// Init application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupQuizButtons();
  setupCompareDrawer();
  setupCountryExplorer();
  
  // Handle initial route if hash is present
  handleHashRoute();
  window.addEventListener('hashchange', handleHashRoute);
});

// Route based on URL hash
function handleHashRoute() {
  const hash = window.location.hash;
  if (hash === '#quiz') {
    startQuiz();
  } else if (hash === '#explorer') {
    switchView('explorer');
  } else if (hash === '#results') {
    if (Object.keys(state.answers).length === questions.length) {
      switchView('results');
    } else {
      window.location.hash = '';
      switchView('landing');
    }
  } else {
    switchView('landing');
  }
}

// Navigation helpers
function setupNavigation() {
  navLinks.landing.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
  });
  
  navLinks.explorer.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = 'explorer';
  });

  document.querySelectorAll('.btn-start-quiz').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = 'quiz';
    });
  });
}

function switchView(viewName) {
  state.currentView = viewName;
  
  // Toggle active views
  Object.keys(views).forEach(name => {
    if (name === viewName) {
      views[name].classList.add('active');
    } else {
      views[name].classList.remove('active');
    }
  });

  // Toggle active nav links
  Object.keys(navLinks).forEach(name => {
    if (name === viewName) {
      navLinks[name].classList.add('active');
    } else {
      navLinks[name].classList.remove('active');
    }
  });

  // Smooth scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Quiz Logic
function startQuiz() {
  state.currentQuestionIndex = 0;
  state.answers = {};
  switchView('quiz');
  renderQuestion();
}

function setupQuizButtons() {
  document.getElementById('quiz-btn-prev').addEventListener('click', prevQuestion);
  document.getElementById('quiz-btn-next').addEventListener('click', nextQuestion);
}

function renderQuestion() {
  const question = questions[state.currentQuestionIndex];
  
  // Update Progress
  const progressPercent = Math.round(((state.currentQuestionIndex + 1) / questions.length) * 100);
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('quiz-progress-text').textContent = `${state.currentQuestionIndex + 1} / ${questions.length}`;

  // Update Question details
  document.getElementById('question-title').textContent = question.title;
  document.getElementById('question-description').textContent = question.description;

  // Render Options
  const optionsList = document.getElementById('quiz-options-list');
  optionsList.innerHTML = '';

  question.options.forEach(option => {
    const isSelected = state.answers[question.id]?.id === option.id;
    
    const card = document.createElement('div');
    card.className = `option-card ${isSelected ? 'selected' : ''}`;
    card.id = `option-${option.id}`;
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    card.tabIndex = 0;
    
    card.innerHTML = `
      <div class="option-selector"></div>
      <div class="option-text">${option.text}</div>
    `;

    card.addEventListener('click', () => selectOption(question, option));
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectOption(question, option);
      }
    });

    optionsList.appendChild(card);
  });

  // Enable/Disable buttons
  document.getElementById('quiz-btn-prev').style.visibility = state.currentQuestionIndex === 0 ? 'hidden' : 'visible';
  
  const nextBtn = document.getElementById('quiz-btn-next');
  const hasAnswer = !!state.answers[question.id];
  nextBtn.disabled = !hasAnswer;
  nextBtn.textContent = state.currentQuestionIndex === questions.length - 1 ? 'Show Matches' : 'Next Question';
}

function selectOption(question, option) {
  state.answers[question.id] = option;
  
  // Highlight selection in UI
  question.options.forEach(opt => {
    const card = document.getElementById(`option-${opt.id}`);
    if (card) {
      if (opt.id === option.id) {
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
      } else {
        card.classList.remove('selected');
        card.setAttribute('aria-checked', 'false');
      }
    }
  });

  // Enable Next button
  document.getElementById('quiz-btn-next').disabled = false;
  
  // Auto-advance with a slight delay for smoother UX
  setTimeout(() => {
    if (state.currentView === 'quiz' && state.answers[question.id] === option) {
      nextQuestion();
    }
  }, 350);
}

function prevQuestion() {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex--;
    renderQuestion();
  }
}

function nextQuestion() {
  const question = questions[state.currentQuestionIndex];
  if (!state.answers[question.id]) return; // Guard clause

  if (state.currentQuestionIndex < questions.length - 1) {
    state.currentQuestionIndex++;
    renderQuestion();
  } else {
    // End of quiz, compute results
    computeMatches();
    window.location.hash = 'results';
  }
}

// Matching Algorithm
function computeMatches() {
  const scoredCountries = countries.map(country => {
    let score = 0;
    let maxPossibleScore = 0;

    questions.forEach(q => {
      const selectedOption = state.answers[q.id];
      if (selectedOption && selectedOption.weights[country.id] !== undefined) {
        score += selectedOption.weights[country.id];
      }

      // Calculate the maximum weight this country could get for this question
      const weightsForCountry = q.options.map(opt => opt.weights[country.id] || 0);
      maxPossibleScore += Math.max(...weightsForCountry);
    });

    const matchPercentage = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;

    return {
      ...country,
      matchPercentage
    };
  });

  // Sort by match percentage descending
  scoredCountries.sort((a, b) => b.matchPercentage - a.matchPercentage);

  renderResults(scoredCountries);
}

function renderResults(scoredCountries) {
  const cardsContainer = document.getElementById('results-cards-list');
  cardsContainer.innerHTML = '';

  scoredCountries.forEach(country => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.id = `match-card-${country.id}`;

    // Contract type CSS class
    const contractClass = country.contractType.toLowerCase();

    // Map out the top pros and cons related to their answers
    const prosHTML = country.pros.map(pro => `<li>${pro}</li>`).join('');
    const consHTML = country.cons.map(con => `<li>${con}</li>`).join('');
    
    // Check if currently selected for comparison
    const isCompared = state.compareList.includes(country.id);

    card.innerHTML = `
      <div class="card-top">
        <div class="country-identity">
          <span class="country-flag" aria-hidden="true">${country.flag}</span>
          <h3 class="country-name">${country.name}</h3>
        </div>
        <div class="match-score-badge" aria-label="Compatibility score: ${country.matchPercentage}%">
          <span>${country.matchPercentage}%</span> Fit
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Status Model</span>
          <span class="detail-value">
            <span class="badge-contract ${contractClass}">${country.contractType}</span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Net Monthly Salary</span>
          <span class="detail-value">${country.netSalaryRange}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Standard Duration</span>
          <span class="detail-value">${country.typicalDuration}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">English in Research</span>
          <span class="detail-value">${country.englishProficiency}</span>
        </div>
      </div>

      <div class="card-pros-cons">
        <div class="pro-section">
          <h5>Structural Pros</h5>
          <ul class="bullet-list">${prosHTML}</ul>
        </div>
        <div class="con-section">
          <h5>Reality Warnings</h5>
          <ul class="bullet-list">${consHTML}</ul>
        </div>
      </div>

      <div class="card-reality-check">
        <div class="reality-title">
          <span>⚠️</span> Decision Reality Check (Caveats)
        </div>
        <div class="reality-text">${country.realityCheck}</div>
      </div>

      <div class="card-actions">
        <label class="compare-checkbox-label" for="chk-compare-${country.id}">
          <input type="checkbox" id="chk-compare-${country.id}" ${isCompared ? 'checked' : ''}>
          <span>Add to Compare</span>
        </label>
        
        <a href="${country.officialPortal.url}" target="_blank" rel="noopener noreferrer" class="card-btn-link" id="portal-btn-${country.id}">
          Visit ${country.officialPortal.name} ↗
        </a>
      </div>
    `;

    // Hook up comparison checkbox
    const chk = card.querySelector(`#chk-compare-${country.id}`);
    chk.addEventListener('change', (e) => {
      toggleCompareCountry(country.id, e.target.checked);
    });

    cardsContainer.appendChild(card);
  });
}

// Comparison Drawer & Table Modal
function setupCompareDrawer() {
  const btnCompare = document.getElementById('drawer-btn-compare');
  const btnClear = document.getElementById('drawer-btn-clear');
  const modalClose = document.getElementById('close-compare-modal');
  const overlay = document.getElementById('compare-modal-overlay');

  btnCompare.addEventListener('click', showCompareModal);
  
  btnClear.addEventListener('click', () => {
    state.compareList = [];
    updateCompareDrawer();
    
    // Uncheck all compare checkboxes currently on screen
    document.querySelectorAll('.compare-checkbox-label input').forEach(input => {
      input.checked = false;
    });
  });

  modalClose.addEventListener('click', () => {
    overlay.classList.remove('open');
  });

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      overlay.classList.remove('open');
    }
  });
}

function toggleCompareCountry(countryId, isChecked) {
  if (isChecked) {
    if (state.compareList.length >= 3) {
      alert("You can compare a maximum of 3 countries at once.");
      // Uncheck the input that was just checked
      const input = document.getElementById(`chk-compare-${countryId}`);
      if (input) input.checked = false;
      return;
    }
    if (!state.compareList.includes(countryId)) {
      state.compareList.push(countryId);
    }
  } else {
    state.compareList = state.compareList.filter(id => id !== countryId);
  }
  
  updateCompareDrawer();
}

function updateCompareDrawer() {
  const drawer = document.getElementById('compare-drawer');
  const badgesContainer = document.getElementById('compare-badges-container');
  const btnCompare = document.getElementById('drawer-btn-compare');

  if (state.compareList.length === 0) {
    drawer.classList.remove('open');
    return;
  }

  drawer.classList.add('open');
  badgesContainer.innerHTML = '';

  state.compareList.forEach(id => {
    const country = countries.find(c => c.id === id);
    const badge = document.createElement('div');
    badge.className = 'compare-badge';
    badge.innerHTML = `
      <span>${country.flag} ${country.name}</span>
      <button class="remove-btn" aria-label="Remove ${country.name} from comparison" id="remove-compare-${id}">×</button>
    `;

    badge.querySelector('.remove-btn').addEventListener('click', () => {
      toggleCompareCountry(id, false);
      // Update checkmark in result card or explorer card
      const chk = document.getElementById(`chk-compare-${id}`);
      if (chk) chk.checked = false;
      
      const chkExp = document.getElementById(`chk-explore-compare-${id}`);
      if (chkExp) chkExp.checked = false;
    });

    badgesContainer.appendChild(badge);
  });

  // Disable/enable compare button based on number of items
  btnCompare.disabled = state.compareList.length < 2;
  btnCompare.textContent = state.compareList.length < 2 
    ? `Select ${2 - state.compareList.length} more` 
    : 'Compare side-by-side';
}

function showCompareModal() {
  if (state.compareList.length < 2) return;
  
  const overlay = document.getElementById('compare-modal-overlay');
  const tableContainer = document.getElementById('compare-table-container');
  
  const selectedCountries = state.compareList.map(id => countries.find(c => c.id === id));
  
  // Generate Table Comparison headers and rows
  let tableHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th class="feature-col">Parameters</th>
          ${selectedCountries.map(c => `<th>${c.flag} ${c.name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="feature-col">Contract Type</td>
          ${selectedCountries.map(c => `<td><span class="badge-contract ${c.contractType.toLowerCase()}">${c.contractType}</span></td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Net Monthly Pay</td>
          ${selectedCountries.map(c => `<td><strong>${c.netSalaryRange}</strong></td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Standard Duration</td>
          ${selectedCountries.map(c => `<td>${c.typicalDuration}</td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">English in Daily Life</td>
          ${selectedCountries.map(c => `<td>${c.englishProficiency}</td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Teaching Requirement</td>
          ${selectedCountries.map(c => `<td>${c.teachingRequirement}</td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Program Coursework</td>
          ${selectedCountries.map(c => `<td>${c.courseworkStructure}</td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Non-EU Stay-Back Visa</td>
          ${selectedCountries.map(c => `<td>${c.nonEuStayBack}</td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Cost of Living</td>
          ${selectedCountries.map(c => `<td>${c.costOfLiving}</td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Housing Market</td>
          ${selectedCountries.map(c => `<td>${c.housingDifficulty} difficulty</td>`).join('')}
        </tr>
        <tr>
          <td class="feature-col">Official Site Link</td>
          ${selectedCountries.map(c => `<td><a href="${c.officialPortal.url}" target="_blank" rel="noopener noreferrer">${c.officialPortal.name} ↗</a></td>`).join('')}
        </tr>
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = tableHTML;
  overlay.classList.add('open');
}

// Country Explorer Logic
function setupCountryExplorer() {
  const explorerGrid = document.getElementById('explorer-grid');
  explorerGrid.innerHTML = '';

  countries.forEach(country => {
    const card = document.createElement('div');
    card.className = 'explorer-card';
    card.id = `explore-card-${country.id}`;
    card.innerHTML = `
      <div class="explorer-card-header">
        <span class="explorer-card-flag" aria-hidden="true">${country.flag}</span>
        <h4 class="explorer-card-name">${country.name}</h4>
      </div>
      <div class="explorer-card-meta">
        <span class="badge-contract ${country.contractType.toLowerCase()}">${country.contractType}</span>
        <span>• ${country.typicalDuration}</span>
      </div>
      <p class="explorer-card-desc">${country.contractDetails}</p>
    `;

    card.addEventListener('click', (e) => {
      // Ensure clicking action buttons doesn't trigger open modal
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
        openCountryDetailsModal(country);
      }
    });

    explorerGrid.appendChild(card);
  });
}

function openCountryDetailsModal(country) {
  const overlay = document.getElementById('compare-modal-overlay');
  const tableContainer = document.getElementById('compare-table-container');

  // Reuse the compare overlay modal, but format it as a detailed Country Profile
  const prosHTML = country.pros.map(pro => `<li>${pro}</li>`).join('');
  const consHTML = country.cons.map(con => `<li>${con}</li>`).join('');

  tableContainer.innerHTML = `
    <div class="country-modal-details">
      <div class="country-modal-header">
        <span class="country-modal-flag" aria-hidden="true">${country.flag}</span>
        <h2 class="country-modal-title">${country.name} PhD Ecosystem</h2>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">Status model</span>
          <span class="detail-value">
            <span class="badge-contract ${country.contractType.toLowerCase()}">${country.contractType}</span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Net Monthly Salary</span>
          <span class="detail-value">${country.netSalaryRange}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Typical Duration</span>
          <span class="detail-value">${country.typicalDuration}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Tuition Fees</span>
          <span class="detail-value">${country.tuitionFees}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">English in Daily Life</span>
          <span class="detail-value">${country.englishProficiency}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Teaching Requirement</span>
          <span class="detail-value">${country.teachingRequirement}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Program Structure</span>
          <span class="detail-value">${country.courseworkStructure}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Non-EU Stay-Back Visa</span>
          <span class="detail-value">${country.nonEuStayBack}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Cost of Living</span>
          <span class="detail-value">${country.costOfLiving}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Housing Difficulty</span>
          <span class="detail-value">${country.housingDifficulty}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Social Welfare Net</span>
          <span class="detail-value">${country.socialSafetyNet}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Climate Profile</span>
          <span class="detail-value">${country.climateStyle}</span>
        </div>
      </div>

      <div class="card-pros-cons" style="margin-bottom: 12px;">
        <div class="pro-section">
          <h3>Structural Advantages</h3>
          <ul class="bullet-list" style="margin-top: 10px;">${prosHTML}</ul>
        </div>
        <div class="con-section">
          <h3>Structural Drawbacks / Caveats</h3>
          <ul class="bullet-list" style="margin-top: 10px;">${consHTML}</ul>
        </div>
      </div>

      <div class="card-reality-check" style="margin-bottom: 24px;">
        <div class="reality-title">
          <span>⚠️</span> Detailed Reality Check (Caveats & Cost of Living)
        </div>
        <div class="reality-text" style="font-size: 0.95rem; line-height: 1.6;">
          ${country.realityCheck}
          <br><br>
          <em>Note: While this covers country-level rules, individual labs, supervisors, and funding grants can lead to different experiences.</em>
        </div>
      </div>

      <div style="display: flex; gap: 16px; align-items: center; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <a href="${country.officialPortal.url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding: 10px 24px; font-size: 0.9rem;">
          Visit Official Portal (${country.officialPortal.name}) ↗
        </a>
      </div>
    </div>
  `;

  overlay.classList.add('open');
}
