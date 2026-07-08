export const countries = [
  {
    id: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    contractType: "Employee",
    contractDetails: "Full employee status under the Dutch Universities Collective Agreement (CAO-NU). Paid pension contributions, holiday allowance (8%), and year-end bonus (8.3%). Candidates are standard salary-earning staff.",
    typicalDuration: "4 Years",
    netSalaryRange: "€2,200 - €2,750 / month",
    baseNetSalary: 2400,
    tuitionFees: "None (Fully funded)",
    englishProficiency: "Very High",
    nonEuStayBack: "1-year Search Year (Zoekjaar)",
    teachingRequirement: "Light (typically 10% of contract hours)",
    courseworkStructure: "Structured (typically 30 ECTS, Graduate School courses)",
    costOfLiving: "High",
    housingDifficulty: "Severe",
    socialSafetyNet: "Outstanding",
    climateStyle: "Cool / Maritime (Rainy)",
    overallUncertainty: "Medium (highly standard CAO, but work environment depends on the institute)",
    pros: [
      "Excellent, legally protected employee rights & social benefits",
      "No local language barrier in research or daily life",
      "Solid, structured 4-year timeline provides stability"
    ],
    cons: [
      "Severe housing crisis makes finding a flat extremely difficult and expensive",
      "High inflation and daily cost of living in university towns",
      "Flat hierarchy requires high autonomy; some find it hard to adapt"
    ],
    realityCheck: "The CAO-NU guarantees your salary and rights, which is great. However, the housing market is a bottleneck: expect to spend €800–€1,500/month on rent alone, and start searching months before arrival. Additionally, the Dutch 'directness' in communication can be a cultural shock for some.",
    officialPortal: {
      name: "AcademicTransfer",
      url: "https://www.academictransfer.com"
    }
  },
  {
    id: "DE",
    name: "Germany",
    flag: "🇩🇪",
    contractType: "Mixed",
    contractDetails: "Varies. Typically an employee contract (TV-L E13) at 50%, 65%, 75%, or 100% working hours depending on the field. Alternatively, some are funded by tax-free scholarships (stipends) which lack pension contributions.",
    typicalDuration: "3 - 5 Years",
    netSalaryRange: "€1,450 - €2,800 / month",
    baseNetSalary: 1950,
    tuitionFees: "None (only a small semester fee of ~€300)",
    englishProficiency: "High",
    nonEuStayBack: "18-month Job Seeker Visa",
    teachingRequirement: "Moderate (often 2-4 hours/week on employee contracts)",
    courseworkStructure: "Independent (individual model; some structured graduate schools exist)",
    costOfLiving: "Moderate",
    housingDifficulty: "High",
    socialSafetyNet: "Excellent",
    climateStyle: "Central European (Variable)",
    overallUncertainty: "High (salary percent depends heavily on STEM vs. Humanities; supervisor power is high)",
    pros: [
      "No tuition fees and relatively low cost of living compared to NL/CH",
      "Long 18-month stay-back visa is very generous for non-EU students",
      "Widespread research funding and rich industrial ecosystem"
    ],
    cons: [
      "Humanities & Social Sciences are often funded on 50% or 65% contracts (~€1,400-€1,700 net) while working full-time",
      "Heavy administrative bureaucracy (often in German only)",
      "Traditional 'Master-Disciple' model gives supervisors immense, unchecked power"
    ],
    realityCheck: "Always ask about your contract percentage *before* accepting. A 50% TV-L contract means you get half-salary but will likely work 50+ hours/week. German language skills are essential for dealing with local government (Ausländerbehörde) and daily integration.",
    officialPortal: {
      name: "Research in Germany (DAAD)",
      url: "https://www.research-in-germany.org"
    }
  },
  {
    id: "SE",
    name: "Sweden",
    flag: "🇸🇪",
    contractType: "Employee",
    contractDetails: "Fully salaried employee status (Doktorandtjänst). Comprehensive social security, generous parental leave, sick leave, and pension contributions. Governed by strong university union agreements.",
    typicalDuration: "4 Years",
    netSalaryRange: "€2,000 - €2,400 / month",
    baseNetSalary: 2150,
    tuitionFees: "None (Fully funded)",
    englishProficiency: "Very High",
    nonEuStayBack: "Permanent Residency potential after 4 years",
    teachingRequirement: "Light to Moderate (typically up to 20%; extends contract to 5 years)",
    courseworkStructure: "Structured (mandatory coursework, credits, & thesis)",
    costOfLiving: "High",
    housingDifficulty: "High",
    socialSafetyNet: "Outstanding",
    climateStyle: "Nordic (Dark/Cold Winters)",
    overallUncertainty: "Low (highly unionized and regulated system with clear stages)",
    pros: [
      "Clear pathway to permanent residency for non-EU candidates (after 4 years)",
      "World-leading work-life balance, parental leave, and equality focus",
      "Almost zero English barrier in academic or social life"
    ],
    cons: [
      "Winters are exceptionally long, dark, and cold, affecting mental health",
      "High taxes and strict rent-control queues make urban housing hard to secure",
      "Social integration can feel slow; locals are polite but keep to themselves"
    ],
    realityCheck: "Sweden has one of the most progressive PhD frameworks in the world, and the PR pathway is a major benefit for non-EU researchers. However, do not underestimate the Nordic winter: from November to February, daylight is scarce, and seasonal affective disorder is a real factor to prepare for.",
    officialPortal: {
      name: "Study in Sweden",
      url: "https://studyinsweden.se/study-options/phd-studies/"
    }
  },
  {
    id: "CH",
    name: "Switzerland",
    flag: "🇨🇭",
    contractType: "Employee",
    contractDetails: "Employment contract. Salaries are set by the Swiss National Science Foundation (SNSF) or individual cantonal universities (e.g., ETH Zurich / EPFL). Includes full benefits, pension, and accident insurance.",
    typicalDuration: "4 Years",
    netSalaryRange: "€3,400 - €5,200 / month",
    baseNetSalary: 4200,
    tuitionFees: "Very Low (typically €300 - €800 / semester)",
    englishProficiency: "High",
    nonEuStayBack: "6-month search period (highly restricted quota)",
    teachingRequirement: "Moderate to High (frequent teaching assistantships at major institutions)",
    courseworkStructure: "Mixed (coursework required, but main focus is lab research)",
    costOfLiving: "Very High",
    housingDifficulty: "High",
    socialSafetyNet: "Excellent",
    climateStyle: "Alpine (Sunny/Snowy/Variable)",
    overallUncertainty: "Medium (high work pressure; ETH/EPFL systems can be intense)",
    pros: [
      "Highest PhD salaries in the world, allowing substantial monthly savings",
      "World-class laboratory equipment, funding, and global prestige",
      "Stunning nature, clean cities, and efficient infrastructure"
    ],
    cons: [
      "Extremely high cost of living (rent, groceries, mandatory health insurance)",
      "Non-EU citizens face strict hiring quotas and short post-graduation visa search times",
      "High-pressure environment with high performance expectations"
    ],
    realityCheck: "While a salary of CHF 4,000+ net sounds astronomical, basic mandatory health insurance costs ~CHF 350/month, a simple room is CHF 800–1,200, and dining out is a luxury. Non-EU applicants must know that Swiss employers face a legal hurdle to hire them post-PhD over Swiss/EU citizens.",
    officialPortal: {
      name: "myScience.ch",
      url: "https://www.myscience.ch/jobs"
    }
  },
  {
    id: "DK",
    name: "Denmark",
    flag: "🇩🇰",
    contractType: "Employee",
    contractDetails: "Fully salaried employee status. Very high starting salaries, pension scheme (approx. 17% contributed by university), and collective bargaining agreements. Treated as professional academic staff.",
    typicalDuration: "3 Years",
    netSalaryRange: "€2,500 - €3,000 / month",
    baseNetSalary: 2750,
    tuitionFees: "None (Fully funded)",
    englishProficiency: "Very High",
    nonEuStayBack: "6-month Search Card (automatically included in visa)",
    teachingRequirement: "Moderate (duty of 840 hours of work/teaching over 3 years)",
    courseworkStructure: "Structured (30 ECTS courses, regular progress reviews)",
    costOfLiving: "Very High",
    housingDifficulty: "High",
    socialSafetyNet: "Outstanding",
    climateStyle: "Cool / Maritime (Rainy)",
    overallUncertainty: "Low (very structured, clear rules, and transparent salary agreements)",
    pros: [
      "Very high net salaries and outstanding pension contributions",
      "Extremely flat hierarchy and collaborative research culture",
      "English is universally spoken with near-native fluency"
    ],
    cons: [
      "Strict 3-year duration (extensions are rare and stressful to secure)",
      "Very high cost of living and steep personal income taxes",
      "Danish culture is highly insular, making deep social connections difficult"
    ],
    realityCheck: "The Danish 3-year model is fast. Unlike the 4-year Dutch/Swedish models, you are expected to hit the ground running immediately and complete your thesis on time. The high salary is offset by some of the highest grocery and utility prices in Europe.",
    officialPortal: {
      name: "Work in Denmark",
      url: "https://www.workindenmark.dk"
    }
  },
  {
    id: "FR",
    name: "France",
    flag: "🇫🇷",
    contractType: "Employee",
    contractDetails: "Usually a 'Contrat Doctoral' (3-year employment contract with full benefits). Alternatively, industrial PhDs (CIFRE) or regional grants. Full healthcare and social security are standard.",
    typicalDuration: "3 Years",
    netSalaryRange: "€1,650 - €2,200 / month",
    baseNetSalary: 1750,
    tuitionFees: "None (or nominal university registration fee of ~€380)",
    englishProficiency: "Moderate",
    nonEuStayBack: "1-year RECE Visa (post-Master/PhD job search)",
    teachingRequirement: "Optional (paid extra as an teaching addon - Moniteur)",
    courseworkStructure: "Structured (Doctoral school courses, training hours, ECTS)",
    costOfLiving: "Moderate (except Paris which is Very High)",
    housingDifficulty: "High (Severe in Paris)",
    socialSafetyNet: "Excellent",
    climateStyle: "Central European / Mediterranean (Variable)",
    overallUncertainty: "Medium (standard national contract rates, but administrative paths are complex)",
    pros: [
      "Strong employee rights, subsidized university lunches, and transport discounts",
      "Excellent industrial PhD options (CIFRE) with higher pay",
      "Rich cultural life, historical academic institutions, and central location"
    ],
    cons: [
      "Strict 3-year deadline is heavily enforced; writing beyond 3 years requires complex waivers",
      "French language is often essential for daily administrative tasks and university operations",
      "Bureaucracy is notoriously slow, complex, and paper-based"
    ],
    realityCheck: "French labs are internationally competitive, but university administration is run almost entirely in French. If you don't speak French, simple tasks like getting health cover (Sécu), renting a flat, or opening a bank account will be challenging. The 3-year deadline is strict: start writing early.",
    officialPortal: {
      name: "Campus France",
      url: "https://www.campusfrance.org/en/funding-doctoral-studies"
    }
  },
  {
    id: "UK",
    name: "United Kingdom",
    flag: "🇬🇧",
    contractType: "Student",
    contractDetails: "Registered as a student. Funding is typically a tax-free stipend (usually UKRI rate) which does not carry employee benefits, pension contributions, or formal labor laws. Health coverage via the NHS.",
    typicalDuration: "3 - 3.5 Years",
    netSalaryRange: "€1,700 - €2,100 / month",
    baseNetSalary: 1850,
    tuitionFees: "High (International fees apply unless covered by a scholarship)",
    englishProficiency: "Native",
    nonEuStayBack: "3-year Graduate Route Visa (highly flexible)",
    teachingRequirement: "Optional (paid hourly as a Graduate Teaching Assistant)",
    courseworkStructure: "Independent (minimal coursework; focus on immediate research)",
    costOfLiving: "High (Very High in London/Oxford/Cambridge)",
    housingDifficulty: "High",
    socialSafetyNet: "Basic",
    climateStyle: "Cool / Maritime (Rainy)",
    overallUncertainty: "High (international fee waivers are competitive; funding length varies)",
    pros: [
      "Native English environment, globally prestigious universities, and short duration",
      "Generous 3-year stay-back visa specifically for PhD graduates",
      "No coursework requirements: start researching on day one"
    ],
    cons: [
      "No employment rights, pension, or official status (registered as a student)",
      "Non-EU students face massive visa costs & NHS surcharge fees upfront",
      "International tuition fees can exceed £25,000/year if not explicitly waived"
    ],
    realityCheck: "In the UK, you are a student. There are no employer pension contributions, and you have no unionized employee benefits. If you are non-EU, check carefully if your funding covers 'International Fees' or just 'Home Fees'. If it only covers home fees, you may have to pay the difference out of pocket.",
    officialPortal: {
      name: "FindAPhD",
      url: "https://www.findaphd.com"
    }
  },
  {
    id: "IT",
    name: "Italy",
    flag: "🇮🇹",
    contractType: "Student",
    contractDetails: "PhD students are funded via a scholarship ('Borsa di Studio'). While tax-free, it has no standard employee benefits. Basic social security contributions are paid to INPS under a special scheme.",
    typicalDuration: "3 Years",
    netSalaryRange: "€1,200 - €1,400 / month",
    baseNetSalary: 1250,
    tuitionFees: "None (or nominal fee of ~€150)",
    englishProficiency: "Moderate",
    nonEuStayBack: "1-year Search Visa (Permesso per ricerca lavoro)",
    teachingRequirement: "Optional (up to 40 hours/year allowed, paid)",
    courseworkStructure: "Mixed (some doctoral school seminars, but thesis-heavy)",
    costOfLiving: "Low to Moderate",
    housingDifficulty: "Moderate",
    socialSafetyNet: "Basic",
    climateStyle: "Mediterranean (Sunny/Warm)",
    overallUncertainty: "Medium (salaries are nationally capped; research budgets vary wildly)",
    pros: [
      "Lower cost of living in most university towns (excluding Milan/Rome)",
      "Rich cultural heritage, excellent food, and Mediterranean climate",
      "Fast 3-year timeline with minimal coursework overhead"
    ],
    cons: [
      "Very low monthly income compared to Northern Europe, making saving difficult",
      "Italian language is essential for daily life, rental contracts, and university admin",
      "Bureaucracy is slow and research budgets for materials/travel can be limited"
    ],
    realityCheck: "A net stipend of €1,200/month is sufficient to live on in smaller cities (like Pisa or Padua), but will be very tight in Milan or Rome where rents are high. Lab research funding is often modest: ask prospective groups about their travel and equipment budgets.",
    officialPortal: {
      name: "Universitaly",
      url: "https://www.universitaly.it"
    }
  },
  {
    id: "ES",
    name: "Spain",
    flag: "🇪🇸",
    contractType: "Employee",
    contractDetails: "Predoctoral contract ('Contrato Predoctoral') governed by national law (EPIF). Combines employee rights, health insurance, and social security. Salaries increase progressively over the 4 years.",
    typicalDuration: "3 - 4 Years",
    netSalaryRange: "€1,100 - €1,450 / month",
    baseNetSalary: 1200,
    tuitionFees: "Low (nominal tuition of ~€400/year)",
    englishProficiency: "Moderate",
    nonEuStayBack: "1-year Job Search Visa",
    teachingRequirement: "Light (up to 60 hours/year max on predoctoral contracts)",
    courseworkStructure: "Mixed (some training activities, but thesis-focused)",
    costOfLiving: "Low to Moderate",
    housingDifficulty: "High (in Madrid/Barcelona)",
    socialSafetyNet: "Good",
    climateStyle: "Mediterranean (Sunny/Warm)",
    overallUncertainty: "Medium (wages are standardized by EPIF, but contract availability depends on grants)",
    pros: [
      "Combines employee status with a relaxed, sunny Mediterranean lifestyle",
      "Progressive pay scale (increases in 3rd and 4th years)",
      "Relatively low cost of living, especially outside Madrid and Barcelona"
    ],
    cons: [
      "Wages are low compared to Northern Europe, leaving little room for savings",
      "High local unemployment makes finding a post-PhD job in Spain challenging",
      "Degree validation ('homologación') for entry can take up to a year of bureaucracy"
    ],
    realityCheck: "The 'Contrato Predoctoral' ensures you have health insurance and unemployment rights when you finish. However, salaries start around €1,100 net. While coffee and tapas are cheap, renting a room in Barcelona can take 50% of your salary. Validate your bachelor/master degrees early.",
    officialPortal: {
      name: "Euraxess Spain",
      url: "https://www.euraxess.es"
    }
  }
];

export const questions = [
  {
    id: "employment",
    title: "Employment Rights vs. Student Status",
    description: "European systems treat PhD candidates either as professional staff on salary (employee model) or as students on tax-free scholarships (student model). What do you prioritize?",
    options: [
      {
        id: "employee",
        text: "Legally protected contract: I want pension contributions, parental leave, and union rights, even if it means higher taxes.",
        weights: { NL: 10, SE: 10, DK: 10, CH: 10, FR: 8, ES: 8, DE: 6, UK: 1, IT: 2 }
      },
      {
        id: "stipend",
        text: "Stipend / Tax-Free: I don't mind student status if it means lower taxes, less admin/teaching work, or fewer entrance requirements.",
        weights: { UK: 10, IT: 10, DE: 7, FR: 4, ES: 4, NL: 2, SE: 1, DK: 1, CH: 1 }
      },
      {
        id: "savings",
        text: "Absolute pay: Show me the countries with the highest absolute net pay and savings potential, regardless of the status.",
        weights: { CH: 10, DK: 9, NL: 8, SE: 7, DE: 6, UK: 5, FR: 4, ES: 2, IT: 1 }
      }
    ]
  },
  {
    id: "salary",
    title: "Minimum Net Salary Expectation",
    description: "Living costs vary, but what is the minimum monthly net income you require to feel comfortable doing research?",
    options: [
      {
        id: "high",
        text: "At least €2,300/month net (Requires high-paying systems like Switzerland, Denmark, or Netherlands).",
        weights: { CH: 10, DK: 10, NL: 8, SE: 6, DE: 4, UK: 1, FR: 1, ES: 0, IT: 0 }
      },
      {
        id: "medium",
        text: "At least €1,600/month net (Opens up Germany, Sweden, France, and standard UK stipends).",
        weights: { CH: 10, DK: 10, NL: 10, SE: 10, DE: 8, FR: 8, UK: 7, ES: 2, IT: 2 }
      },
      {
        id: "any",
        text: "Any basic stipend (>= €1,100/mo net) is fine, if the local cost of living matches.",
        weights: { CH: 6, DK: 6, NL: 7, SE: 8, DE: 9, FR: 9, UK: 9, ES: 10, IT: 10 }
      }
    ]
  },
  {
    id: "duration",
    title: "PhD Duration & Time Limits",
    description: "Do you want to finish as fast as possible, or do you prefer a longer timeline to publish more work and reduce stress?",
    options: [
      {
        id: "fast",
        text: "Strictly 3 years: I want to finish quickly and move on to my career.",
        weights: { UK: 10, FR: 10, IT: 10, DK: 9, ES: 7, DE: 4, NL: 2, SE: 2, CH: 4 }
      },
      {
        id: "standard",
        text: "4 years: The sweet spot for writing a solid thesis, taking courses, and publishing.",
        weights: { NL: 10, SE: 10, CH: 10, ES: 8, DE: 8, DK: 4, FR: 3, UK: 3, IT: 2 }
      },
      {
        id: "flexible",
        text: "Flexible (3 to 5+ years): I want time to explore my topic, even if it requires funding renewals.",
        weights: { DE: 10, CH: 8, SE: 6, NL: 5, ES: 5, FR: 2, UK: 2, DK: 1, IT: 1 }
      }
    ]
  },
  {
    id: "language",
    title: "Language & Daily Life Integration",
    description: "Some countries allow you to live and work entirely in English; others require local language skills for daily life or teaching.",
    options: [
      {
        id: "english_only",
        text: "English only: I want near-perfect English communication in my lab, city, and administration.",
        weights: { UK: 10, NL: 10, SE: 10, DK: 10, CH: 7, DE: 5, FR: 3, ES: 2, IT: 2 }
      },
      {
        id: "english_research_local_life",
        text: "English at work, local language for life: I will research in English but don't mind learning local words for groceries and bureaucracy.",
        weights: { DE: 10, CH: 9, NL: 8, SE: 8, DK: 8, FR: 7, ES: 6, IT: 6, UK: 4 }
      },
      {
        id: "local_language",
        text: "Local language integration: I want to teach, take courses, or write in French, German, Spanish, or Italian.",
        weights: { FR: 10, DE: 9, ES: 10, IT: 10, CH: 8, NL: 2, SE: 1, DK: 1, UK: 1 }
      }
    ]
  },
  {
    id: "visa",
    title: "Visa Requirements & Stay-Back Goals",
    description: "Citizenship dictates your visa needs. Non-EU/EEA candidates often need job-search options or permanent residency pathways post-PhD.",
    options: [
      {
        id: "non_eu_pr",
        text: "Non-EU Citizen: I want the absolute easiest pathway to permanent residency or a long stay-back visa.",
        weights: { SE: 10, DE: 9, UK: 8, NL: 7, FR: 6, DK: 6, ES: 5, IT: 5, CH: 2 }
      },
      {
        id: "no_priority",
        text: "EU Citizen (or Visa status is not a primary concern for my match).",
        weights: { NL: 8, DE: 8, SE: 8, CH: 8, DK: 8, FR: 8, UK: 8, IT: 8, ES: 8 }
      }
    ]
  },
  {
    id: "structure",
    title: "Coursework & Program Structure",
    description: "Do you prefer a US-style structured graduate school (with credits, mandatory classes, and regular exams) or an independent model?",
    options: [
      {
        id: "structured",
        text: "Structured: I want mandatory courses, ECTS requirements, and structured thesis milestones.",
        weights: { NL: 10, SE: 10, DK: 10, FR: 8, ES: 6, CH: 6, DE: 4, IT: 3, UK: 1 }
      },
      {
        id: "independent",
        text: "Independent: I want to focus 100% on my research project from day one with minimal coursework overhead.",
        weights: { UK: 10, DE: 9, IT: 9, FR: 5, CH: 6, ES: 6, NL: 3, SE: 2, DK: 2 }
      }
    ]
  },
  {
    id: "culture",
    title: "Work-Life Balance vs. Cultural Climate",
    description: "Do you prioritize strict labor hours, extensive welfare, and a collaborative structure, or are you drawn to warm climate and lifestyle?",
    options: [
      {
        id: "nordic_safety",
        text: "High welfare/welfare state: Outstanding parental benefits, flat hierarchies, and protected hours, even if winters are dark.",
        weights: { SE: 10, DK: 10, NL: 9, DE: 8, CH: 7, FR: 6, UK: 4, ES: 3, IT: 2 }
      },
      {
        id: "south_sunny",
        text: "Southern European lifestyle: Warm weather, vibrant social life, and Mediterranean climate, even if funding is lower.",
        weights: { ES: 10, IT: 10, FR: 8, CH: 5, DE: 3, NL: 2, UK: 2, SE: 1, DK: 1 }
      }
    ]
  }
];
