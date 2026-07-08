import countriesData from '../../public/data/countries.json';

export interface Country {
  id: string;
  name: string;
  code: string;
  region: string;
  flag: string;
  duration: string;
  status: 'Employed' | 'Student' | 'Fellowship';
  structure: 'Structured' | 'Individual' | 'Mixed';
  grossSalary: number; // EUR per month
  netIncome: number; // EUR per month
  tuitionFeesEU: number; // EUR per year
  tuitionFeesNonEU: number; // EUR per year
  costOfLiving: number; // EUR per month (basic student rent + food + insurance)
  fundingAvailability: 'High' | 'Medium' | 'Low';
  englishFriendly: number; // 1 to 10
  localLanguageImportance: 'High' | 'Medium' | 'Low';
  visaComplexityNonEU: 'Easy' | 'Medium' | 'Hard';
  happinessIndex: number; // 1 to 10
  housingCrisis: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  academicReputation: string;
  pros: string[];
  cons: string[];
  warnings: string[];
  quizTags: string[];
}

export const countries = countriesData as Country[];
