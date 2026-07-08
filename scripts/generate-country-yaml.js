import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const targetDir = path.join(__dirname, '../data/countries');

const countriesData = [
  {
    id: 'norway',
    name: 'Norway',
    capital: 'Oslo',
    languages: [
      { name: 'Norwegian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 54000,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 135
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 0
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1800,
      index_relative_to_eu_average: 155
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: true,
      academic_calendar: 'Semester (Aug-Dec / Jan-Jun)',
      required_ects: 30
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'high',
      main_sources: [
        'Research Council of Norway',
        'University PhD Positions (Employed)'
      ]
    },
    happiness_index: 7.39,
    climate: {
      type: 'Nordic / Temperate',
      average_temperature_summer_c: 18,
      average_temperature_winter_c: -3
    },
    contact_portals: [
      { title: 'Study in Norway', url: 'https://www.studyinnorway.no' }
    ]
  },
  {
    id: 'austria',
    name: 'Austria',
    capital: 'Vienna',
    languages: [
      { name: 'German', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 38400,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 108
    },
    tuition_fees: {
      eu_students_eur_per_year: 750,
      non_eu_students_eur_per_year: 1500
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1250,
      index_relative_to_eu_average: 110
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: true,
      academic_calendar: 'Semester (Oct-Jan / Mar-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'FWF (Austrian Science Fund)',
        'University project assistant contracts'
      ]
    },
    happiness_index: 7.21,
    climate: {
      type: 'Temperate / Alpine',
      average_temperature_summer_c: 25,
      average_temperature_winter_c: -1
    },
    contact_portals: [
      { title: 'Study in Austria', url: 'https://studyinaustria.at' }
    ]
  },
  {
    id: 'belgium',
    name: 'Belgium',
    capital: 'Brussels',
    languages: [
      { name: 'Dutch', english_friendly: false, official: true },
      { name: 'French', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 30000,
      is_taxable: false,
      is_social_security_covered: true,
      purchasing_power_index: 104
    },
    tuition_fees: {
      eu_students_eur_per_year: 900,
      non_eu_students_eur_per_year: 900
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1300,
      index_relative_to_eu_average: 112
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: true,
      academic_calendar: 'Semester (Sep-Jan / Feb-Jun)',
      required_ects: 60
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'FWO (Flanders)',
        'FNRS (Wallonia)',
        'University research assistantships'
      ]
    },
    happiness_index: 6.89,
    climate: {
      type: 'Maritime / Temperate',
      average_temperature_summer_c: 22,
      average_temperature_winter_c: 3
    },
    contact_portals: [
      { title: 'Study in Belgium', url: 'https://www.studyinbelgium.be' }
    ]
  },
  {
    id: 'denmark',
    name: 'Denmark',
    capital: 'Copenhagen',
    languages: [
      { name: 'Danish', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 52800,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 128
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 0
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1700,
      index_relative_to_eu_average: 140
    },
    phd_system: {
      typical_duration_years: 3.0,
      is_employee_status: true,
      academic_calendar: 'Semester (Sep-Jan / Feb-Jun)',
      required_ects: 30
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 36,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'high',
      main_sources: [
        'Independent Research Fund Denmark',
        'State-funded PhD positions'
      ]
    },
    happiness_index: 7.58,
    climate: {
      type: 'Maritime / Cool',
      average_temperature_summer_c: 21,
      average_temperature_winter_c: 0
    },
    contact_portals: [
      { title: 'Study in Denmark', url: 'https://studyindenmark.dk' }
    ]
  },
  {
    id: 'ireland',
    name: 'Ireland',
    capital: 'Dublin',
    languages: [
      { name: 'English', english_friendly: true, official: true },
      { name: 'Irish', english_friendly: false, official: true }
    ],
    stipend: {
      amount_eur_per_year: 22000,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 92
    },
    tuition_fees: {
      eu_students_eur_per_year: 6000,
      non_eu_students_eur_per_year: 14000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1750,
      index_relative_to_eu_average: 138
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Sep-Dec / Jan-May)',
      required_ects: 30
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 24,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'Irish Research Council (IRC)',
        'Science Foundation Ireland (SFI)'
      ]
    },
    happiness_index: 6.91,
    climate: {
      type: 'Maritime / Temperate',
      average_temperature_summer_c: 19,
      average_temperature_winter_c: 5
    },
    contact_portals: [
      { title: 'Study in Ireland', url: 'https://www.educationinireland.com' }
    ]
  },
  {
    id: 'finland',
    name: 'Finland',
    capital: 'Helsinki',
    languages: [
      { name: 'Finnish', english_friendly: false, official: true },
      { name: 'Swedish', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 30000,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 105
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 0
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1200,
      index_relative_to_eu_average: 122
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: true,
      academic_calendar: 'Semester (Sep-Dec / Jan-May)',
      required_ects: 40
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 24,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'high',
      main_sources: [
        'Academy of Finland',
        'University graduate school funding'
      ]
    },
    happiness_index: 7.80,
    climate: {
      type: 'Subarctic / Cold',
      average_temperature_summer_c: 20,
      average_temperature_winter_c: -6
    },
    contact_portals: [
      { title: 'Study in Finland', url: 'https://www.studyinfinland.fi' }
    ]
  },
  {
    id: 'portugal',
    name: 'Portugal',
    capital: 'Lisbon',
    languages: [
      { name: 'Portuguese', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 15000,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 95
    },
    tuition_fees: {
      eu_students_eur_per_year: 1000,
      non_eu_students_eur_per_year: 2500
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 900,
      index_relative_to_eu_average: 84
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Sep-Jan / Feb-Jun)',
      required_ects: 60
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'FCT (Foundation for Science and Technology)'
      ]
    },
    happiness_index: 5.96,
    climate: {
      type: 'Mediterranean / Sunny',
      average_temperature_summer_c: 28,
      average_temperature_winter_c: 10
    },
    contact_portals: [
      { title: 'Study in Portugal', url: 'https://www.studyinportugal.edu.pt' }
    ]
  },
  {
    id: 'bulgaria',
    name: 'Bulgaria',
    capital: 'Sofia',
    languages: [
      { name: 'Bulgarian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 6000,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 78
    },
    tuition_fees: {
      eu_students_eur_per_year: 500,
      non_eu_students_eur_per_year: 3000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 500,
      index_relative_to_eu_average: 55
    },
    phd_system: {
      typical_duration_years: 3.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Oct-Jan / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 9,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'low',
      main_sources: [
        'Ministry of Education and Science'
      ]
    },
    happiness_index: 5.36,
    climate: {
      type: 'Temperate / Continental',
      average_temperature_summer_c: 27,
      average_temperature_winter_c: 0
    },
    contact_portals: [
      { title: 'Ministry of Education Bulgaria', url: 'https://www.mon.bg' }
    ]
  },
  {
    id: 'croatia',
    name: 'Croatia',
    capital: 'Zagreb',
    languages: [
      { name: 'Croatian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 13200,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 85
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 3000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 700,
      index_relative_to_eu_average: 74
    },
    phd_system: {
      typical_duration_years: 3.0,
      is_employee_status: true,
      academic_calendar: 'Semester (Oct-Jan / Mar-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'low',
      main_sources: [
        'HRZZ (Croatian Science Foundation)'
      ]
    },
    happiness_index: 5.88,
    climate: {
      type: 'Mediterranean / Continental',
      average_temperature_summer_c: 26,
      average_temperature_winter_c: 2
    },
    contact_portals: [
      { title: 'Study in Croatia', url: 'https://www.studyincroatia.hr' }
    ]
  },
  {
    id: 'cyprus',
    name: 'Cyprus',
    capital: 'Nicosia',
    languages: [
      { name: 'Greek', english_friendly: false, official: true },
      { name: 'Turkish', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 12000,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 88
    },
    tuition_fees: {
      eu_students_eur_per_year: 1500,
      non_eu_students_eur_per_year: 4000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 900,
      index_relative_to_eu_average: 89
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: false,
      academic_calendar: 'Semester (Sep-Jan / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 6,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'low',
      main_sources: [
        'Research and Innovation Foundation of Cyprus'
      ]
    },
    happiness_index: 6.13,
    climate: {
      type: 'Subtropical / Sunny',
      average_temperature_summer_c: 33,
      average_temperature_winter_c: 12
    },
    contact_portals: [
      { title: 'Cyprus Ministry of Education', url: 'https://highereducation.ac.cy' }
    ]
  },
  {
    id: 'czech_republic',
    name: 'Czech Republic',
    capital: 'Prague',
    languages: [
      { name: 'Czech', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 9000,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 82
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 2000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 800,
      index_relative_to_eu_average: 80
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Oct-Jan / Feb-May)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 9,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'GACR (Czech Science Foundation)',
        'University specific grants'
      ]
    },
    happiness_index: 6.85,
    climate: {
      type: 'Continental / Temperate',
      average_temperature_summer_c: 24,
      average_temperature_winter_c: -1
    },
    contact_portals: [
      { title: 'Study in Czechia', url: 'https://www.studyin.cz' }
    ]
  },
  {
    id: 'estonia',
    name: 'Estonia',
    capital: 'Tallinn',
    languages: [
      { name: 'Estonian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 21600,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 102
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 0
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 950,
      index_relative_to_eu_average: 90
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: true,
      academic_calendar: 'Semester (Sep-Dec / Feb-May)',
      required_ects: 60
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 9,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'high',
      main_sources: [
        'Estonian Research Council',
        'University employee research grants'
      ]
    },
    happiness_index: 6.44,
    climate: {
      type: 'Maritime / Cold',
      average_temperature_summer_c: 21,
      average_temperature_winter_c: -4
    },
    contact_portals: [
      { title: 'Study in Estonia', url: 'https://studyinestonia.ee' }
    ]
  },
  {
    id: 'greece',
    name: 'Greece',
    capital: 'Athens',
    languages: [
      { name: 'Greek', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 8400,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 80
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 0
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 750,
      index_relative_to_eu_average: 78
    },
    phd_system: {
      typical_duration_years: 3.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Oct-Jan / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'low',
      main_sources: [
        'IKY (State Scholarships Foundation)',
        'ELIDEK (Hellenic Foundation for Research)'
      ]
    },
    happiness_index: 5.93,
    climate: {
      type: 'Mediterranean / Sunny',
      average_temperature_summer_c: 32,
      average_temperature_winter_c: 10
    },
    contact_portals: [
      { title: 'Study in Greece', url: 'https://studyingreece.edu.gr' }
    ]
  },
  {
    id: 'hungary',
    name: 'Hungary',
    capital: 'Budapest',
    languages: [
      { name: 'Hungarian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 7200,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 76
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 3000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 700,
      index_relative_to_eu_average: 70
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Sep-Dec / Feb-May)',
      required_ects: 240
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 9,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'Hungarian Doctoral Council',
        'Stipendium Hungaricum (international)'
      ]
    },
    happiness_index: 5.80,
    climate: {
      type: 'Continental / Temperate',
      average_temperature_summer_c: 26,
      average_temperature_winter_c: -1
    },
    contact_portals: [
      { title: 'Study in Hungary', url: 'http://www.studyinhungary.hu' }
    ]
  },
  {
    id: 'latvia',
    name: 'Latvia',
    capital: 'Riga',
    languages: [
      { name: 'Latvian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 7200,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 75
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 3500
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 700,
      index_relative_to_eu_average: 72
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: false,
      academic_calendar: 'Semester (Sep-Dec / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'low',
      main_sources: [
        'Latvian Council of Science'
      ]
    },
    happiness_index: 5.87,
    climate: {
      type: 'Maritime / Cool',
      average_temperature_summer_c: 20,
      average_temperature_winter_c: -3
    },
    contact_portals: [
      { title: 'Study in Latvia', url: 'https://www.studyinlatvia.lv' }
    ]
  },
  {
    id: 'lithuania',
    name: 'Lithuania',
    capital: 'Vilnius',
    languages: [
      { name: 'Lithuanian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 12000,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 89
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 3000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 750,
      index_relative_to_eu_average: 76
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Sep-Jan / Feb-Jun)',
      required_ects: 30
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'Research Council of Lithuania'
      ]
    },
    happiness_index: 6.21,
    climate: {
      type: 'Maritime / Continental',
      average_temperature_summer_c: 22,
      average_temperature_winter_c: -3
    },
    contact_portals: [
      { title: 'Study in Lithuania', url: 'https://www.studyin.lt' }
    ]
  },
  {
    id: 'luxembourg',
    name: 'Luxembourg',
    capital: 'Luxembourg City',
    languages: [
      { name: 'Luxembourgish', english_friendly: false, official: true },
      { name: 'French', english_friendly: false, official: true },
      { name: 'German', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 40800,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 120
    },
    tuition_fees: {
      eu_students_eur_per_year: 400,
      non_eu_students_eur_per_year: 400
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1850,
      index_relative_to_eu_average: 135
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: true,
      academic_calendar: 'Semester (Sep-Feb / Feb-Jul)',
      required_ects: 20
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 9,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'high',
      main_sources: [
        'FNR (Luxembourg National Research Fund)',
        'University of Luxembourg contracts'
      ]
    },
    happiness_index: 7.23,
    climate: {
      type: 'Temperate / Maritime',
      average_temperature_summer_c: 23,
      average_temperature_winter_c: 1
    },
    contact_portals: [
      { title: 'University of Luxembourg', url: 'https://www.uni.lu' }
    ]
  },
  {
    id: 'malta',
    name: 'Malta',
    capital: 'Valletta',
    languages: [
      { name: 'Maltese', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: true }
    ],
    stipend: {
      amount_eur_per_year: 11400,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 86
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 8500
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 1100,
      index_relative_to_eu_average: 95
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: false,
      academic_calendar: 'Semester (Oct-Jan / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 6,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'low',
      main_sources: [
        'Ministry for Education Malta',
        'University Research Grants'
      ]
    },
    happiness_index: 6.30,
    climate: {
      type: 'Subtropical / Mediterranean',
      average_temperature_summer_c: 31,
      average_temperature_winter_c: 12
    },
    contact_portals: [
      { title: 'University of Malta PhDs', url: 'https://www.um.edu.mt' }
    ]
  },
  {
    id: 'poland',
    name: 'Poland',
    capital: 'Warsaw',
    languages: [
      { name: 'Polish', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 10800,
      is_taxable: false,
      is_social_security_covered: true,
      purchasing_power_index: 94
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 0
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 750,
      index_relative_to_eu_average: 72
    },
    phd_system: {
      typical_duration_years: 4.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Oct-Feb / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'high',
      main_sources: [
        'NCN (National Science Centre Poland)',
        'State-funded Doctoral Schools'
      ]
    },
    happiness_index: 6.12,
    climate: {
      type: 'Temperate / Continental',
      average_temperature_summer_c: 24,
      average_temperature_winter_c: -2
    },
    contact_portals: [
      { title: 'Study in Poland', url: 'https://studyinpoland.pl' }
    ]
  },
  {
    id: 'romania',
    name: 'Romania',
    capital: 'Bucharest',
    languages: [
      { name: 'Romanian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 7200,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 77
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 3000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 600,
      index_relative_to_eu_average: 60
    },
    phd_system: {
      typical_duration_years: 3.0,
      is_employee_status: false,
      academic_calendar: 'Semester (Oct-Jan / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 6,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'UEFISCDI Romania',
        'State financed tuition-free spots'
      ]
    },
    happiness_index: 6.50,
    climate: {
      type: 'Temperate / Continental',
      average_temperature_summer_c: 28,
      average_temperature_winter_c: -1
    },
    contact_portals: [
      { title: 'Study in Romania', url: 'https://studyinromania.gov.ro' }
    ]
  },
  {
    id: 'slovakia',
    name: 'Slovakia',
    capital: 'Bratislava',
    languages: [
      { name: 'Slovak', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 10200,
      is_taxable: false,
      is_social_security_covered: false,
      purchasing_power_index: 82
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 2500
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 700,
      index_relative_to_eu_average: 74
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: false,
      academic_calendar: 'Semester (Sep-Jan / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 9,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'low',
      main_sources: [
        'Slovak Ministry of Education',
        'National scholarship scheme'
      ]
    },
    happiness_index: 6.25,
    climate: {
      type: 'Continental / Temperate',
      average_temperature_summer_c: 25,
      average_temperature_winter_c: -1
    },
    contact_portals: [
      { title: 'Slovak Scholarship Portal', url: 'https://www.scholarships.sk' }
    ]
  },
  {
    id: 'slovenia',
    name: 'Slovenia',
    capital: 'Ljubljana',
    languages: [
      { name: 'Slovenian', english_friendly: false, official: true },
      { name: 'English', english_friendly: true, official: false }
    ],
    stipend: {
      amount_eur_per_year: 19200,
      is_taxable: true,
      is_social_security_covered: true,
      purchasing_power_index: 94
    },
    tuition_fees: {
      eu_students_eur_per_year: 0,
      non_eu_students_eur_per_year: 3000
    },
    cost_of_living: {
      estimated_monthly_expenses_eur: 850,
      index_relative_to_eu_average: 88
    },
    phd_system: {
      typical_duration_years: 3.5,
      is_employee_status: true,
      academic_calendar: 'Semester (Oct-Jan / Feb-Jun)',
      required_ects: 0
    },
    visa_and_work_rights: {
      requires_visa_for_non_eu: true,
      post_study_work_visa_duration_months: 12,
      work_hours_limit_per_week: 20
    },
    funding_availability: {
      rate: 'medium',
      main_sources: [
        'Slovenian Research Agency (ARRS)',
        'Ministry co-funding for doctoral study'
      ]
    },
    happiness_index: 6.69,
    climate: {
      type: 'Temperate / Alpine',
      average_temperature_summer_c: 26,
      average_temperature_winter_c: 0
    },
    contact_portals: [
      { title: 'Study in Slovenia', url: 'https://www.studyinslovenia.si' }
    ]
  }
];

countriesData.forEach((c) => {
  const filePath = path.join(targetDir, `${c.id}.yaml`);
  const yamlContent = yaml.dump(c, { indent: 2, lineWidth: -1 });
  fs.writeFileSync(filePath, yamlContent, 'utf8');
  console.log(`Generated ${c.id}.yaml`);
});

console.log('All 21 missing country YAML profiles have been written to data/countries/.');
