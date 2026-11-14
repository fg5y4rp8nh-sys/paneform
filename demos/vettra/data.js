/* Vettra — sample data. Replace with responses from your ATS or HR API (same shape). */
const DATA = {
  company: 'Northwind',
  months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  timeToHire: [38, 37, 36, 34.5, 33.5, 32.5, 31, 29.5, 28.5, 27, 25.5, 23],
  timeToHireGoal: 25,
  tthStages: [['Screening', 'CV review and phone screen', 5, '#9DB9FF'], ['Interviews', 'Panel and one-to-one', 9, '#2F5BEA'], ['Decision', 'Scorecards and sign-off', 4, '#0A0F1C'], ['Offer', 'Sent until accepted', 5, '#5C86F5']],
  stages: [['Applied', 148], ['Screened', 62], ['Interview', 31], ['Offer', 9], ['Hired', 6]],
  kpis: [
    ['New applicants', 43, 'This week', [22, 28, 25, 31, 34, 30, 38, 43]],
    ['Interviews today', 7, '3 panel · 4 one-to-one', [4, 6, 5, 8, 6, 7, 5, 7]],
    ['Offers out', 3, '2 waiting for approval', [1, 2, 2, 4, 3, 2, 4, 3]],
    ['Hired this month', 6, 'Goal 8 by Nov 30', [2, 3, 3, 4, 5, 5, 4, 6]]
  ],
  roles: [
    { id: 'ENG-214', title: 'Senior Backend Engineer', dept: 'Engineering', loc: 'Remote · EU', status: 'Live', applicants: 64, interview: 7, days: 18, owner: 'Priya Nair', fill: .62 },
    { id: 'DES-088', title: 'Product Designer', dept: 'Design', loc: 'London · Hybrid', status: 'Live', applicants: 41, interview: 5, days: 12, owner: 'Daniel Reyes', fill: .48 },
    { id: 'SAL-131', title: 'Account Executive', dept: 'Sales', loc: 'New York', status: 'Live', applicants: 37, interview: 4, days: 9, owner: 'Marcus Lee', fill: .4 },
    { id: 'ENG-219', title: 'Mobile Engineer, iOS', dept: 'Engineering', loc: 'Remote · US', status: 'Live', applicants: 29, interview: 3, days: 22, owner: 'Priya Nair', fill: .55 },
    { id: 'OPS-042', title: 'People Operations Lead', dept: 'People', loc: 'London', status: 'Paused', applicants: 18, interview: 2, days: 31, owner: 'Daniel Reyes', fill: .3 },
    { id: 'MKT-077', title: 'Growth Marketer', dept: 'Marketing', loc: 'Remote', status: 'Live', applicants: 52, interview: 6, days: 15, owner: 'Ana Costa', fill: .5 },
    { id: 'SUP-019', title: 'Customer Support Specialist', dept: 'Support', loc: 'Lisbon', status: 'Live', applicants: 88, interview: 9, days: 6, owner: 'Ana Costa', fill: .35 },
    { id: 'FIN-011', title: 'Finance Analyst', dept: 'Finance', loc: 'New York · Hybrid', status: 'Paused', applicants: 21, interview: 1, days: 27, owner: 'Marcus Lee', fill: .22 }
  ],
  // pipeline board — step = documents/stages done inside the current column (0..4)
  board: {
    applied: [['Ruth Achebe', 'Product Designer', 0, 'Portfolio review']],
    screening: [['Kieran Shaw', 'Senior Backend Engineer', 1, 'Phone screen'], ['Mei Tanaka', 'Growth Marketer', 2, 'Phone screen']],
    interview: [['Zara Patel', 'Account Executive', 2, 'Panel interview'], ['Omar Haddad', 'Mobile Engineer, iOS', 3, 'Tech interview']],
    offer: [['Elliot Moss', 'Senior Backend Engineer', 3, 'Offer approval']],
    hired: []
  },
  columns: [['applied', 'Applied', 'Review CV'], ['screening', 'Screening', 'Book interview'], ['interview', 'Interview', 'Send offer'], ['offer', 'Offer', 'Mark as hired'], ['hired', 'Hired', '']],
  interviews: [
    { time: '10:30', end: '11:15', name: 'Omar Haddad', role: 'Mobile Engineer, iOS', type: 'Tech interview', with: 'Priya Nair, Sam Okoro', mode: 'Video', score: [4, 5, 4, 3], status: 'Next' },
    { time: '11:45', end: '12:30', name: 'Zara Patel', role: 'Account Executive', type: 'Panel interview', with: 'Marcus Lee, Ana Costa', mode: 'On site', score: [5, 4, 4, 5], status: 'Upcoming' },
    { time: '13:30', end: '14:00', name: 'Mei Tanaka', role: 'Growth Marketer', type: 'Phone screen', with: 'Ana Costa', mode: 'Phone', score: [4, 4, 3, 4], status: 'Upcoming' },
    { time: '15:00', end: '15:45', name: 'Kieran Shaw', role: 'Senior Backend Engineer', type: 'System design', with: 'Priya Nair', mode: 'Video', score: [5, 5, 4, 4], status: 'Upcoming' },
    { time: '16:30', end: '17:00', name: 'Ruth Achebe', role: 'Product Designer', type: 'Portfolio review', with: 'Daniel Reyes', mode: 'Video', score: [4, 3, 5, 4], status: 'Upcoming' }
  ],
  criteria: ['Skills', 'Problem solving', 'Communication', 'Team fit'],
  team: [['Daniel Reyes', 'Head of Talent', 'Owner'], ['Priya Nair', 'Engineering Manager', 'Hiring manager'], ['Ana Costa', 'Recruiter', 'Recruiter'], ['Marcus Lee', 'Sales Director', 'Hiring manager']],
  sources: [['LinkedIn', 41], ['Referrals', 23], ['Careers page', 19], ['Job boards', 12], ['Agencies', 5]]
};
