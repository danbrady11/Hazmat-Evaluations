// ─── Edit these to match your program ───────────────────────────────────────

export const TRAINING_TYPES = [
  'Over the Road',
  'Rail',
  'Natural Gas (@SW Gas)',
  'CNG in Phoenix',
  'Sector Responsibilities',
  'City of Mesa Gas',
  ];

export const ROLES = [
  'Firefighter',
  'Engineer',
  'Company Officer',
  'Battalion Chief',
  'Non-tech',
  'Industry Partner',
];

// ─── Eval questions ──────────────────────────────────────────────────────────
// These map to q1–q5 in the sheet. Keep labels short — they become column headers.

export const QUESTIONS = [
  {
    id: 'q1',
    label: 'Training objectives were clearly communicated.',
    short: 'Clear objectives',
  },
  {
    id: 'q2',
    label: 'Content was relevant to real-world hazmat operations.',
    short: 'Operational relevance',
  },
  {
    id: 'q3',
    label: 'The instructor presented the material effectively.',
    short: 'Instructor effectiveness',
  },
  {
    id: 'q4',
    label: 'I feel better prepared after this training.',
    short: 'Preparedness gain',
  },
  {
    id: 'q5',
    label: 'I would recommend this training to others on the team.',
    short: 'Would recommend',
  },
];

export const SCALE_LABELS = {
  1: 'Strongly disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly agree',
};

// ─── Admin ───────────────────────────────────────────────────────────────────
// Change this before deploying
export const ADMIN_PASSWORD = 'hazmat2024';
