/* Linden — sample data. Replace with responses from your bank or accounting API (same shape). */
const DATA = {
  cards: [
    { id: 'every', name: 'Everyday', owner: 'Ada Hale', last4: '4821', exp: '08/29', cvv: '317', net: 'visa', bg: 'linear-gradient(140deg,#3BA872 0%,#17603F 52%,#0B3524 100%)', avail: 4812.36, spent: 1288, limit: 3000, online: true, abroad: false, contactless: true },
    { id: 'joint', name: 'Joint savings', owner: 'Ada & Tom Hale', last4: '0937', exp: '02/28', cvv: '904', net: 'mc', bg: 'linear-gradient(140deg,#39433D 0%,#1A201C 58%,#0B0F0D 100%)', avail: 13880, spent: 410, limit: 1500, online: false, abroad: false, contactless: true },
    { id: 'groc', name: 'Groceries', owner: 'Tom Hale', last4: '6650', exp: '11/27', cvv: '558', net: 'visa', bg: 'linear-gradient(140deg,#E2F79A 0%,#9AD38A 48%,#3F8E61 100%)', dark: true, avail: 384.9, spent: 412, limit: 1000, online: true, abroad: false, contactless: true }
  ],
  payments: [
    { day: 'Today', items: [['Whole Foods Market', 'Groceries · Everyday ··4821', -86.4, '#6FD69E', '18:42'], ['Netflix', 'Subscriptions · Everyday ··4821', -15.49, '#FF9A8B', '09:00'], ['Ada’s laptop pot', 'Transfer to goal', -250, '#DCF58A', '08:15']] },
    { day: 'Yesterday', items: [['Brightline Studio', 'Salary · Joint ··0937', 4710, '#A6F0C4', '07:02'], ['Shell', 'Fuel · Everyday ··4821', -58.2, '#FFC59A', '19:30'], ['Blue Bottle Coffee', 'Eating out · Everyday ··4821', -6.75, '#9ED0FF', '08:41']] },
    { day: 'Tuesday, Nov 10', items: [['Trader Joe’s', 'Groceries · Groceries ··6650', -72.18, '#6FD69E', '17:55'], ['Con Edison', 'Bills · Joint ··0937', -138.4, '#FFC59A', '10:00'], ['Maya — pocket money', 'Family · Weekly', -15, '#DCF58A', '08:00']] },
    { day: 'Monday, Nov 9', items: [['Costco', 'Groceries · Groceries ··6650', -164.55, '#6FD69E', '12:12'], ['Spotify Family', 'Subscriptions', -16.99, '#FF9A8B', '09:00'], ['Uber', 'Transport · Everyday ··4821', -21.4, '#9ED0FF', '23:10']] }
  ],
  // Joint balance: past days, then forecast to month end
  balance: {
    month: { f: 11 / 29, past: [11620, 11480, 11260, 11170, 10980, 10760, 10650, 10480, 10310, 9962, 14672, 14320], future: [14320, 13900, 13480, 13060, 12700, 10050, 9700, 9420], labels: [['Nov 1', 0], ['Nov 8', 7 / 29], ['Nov 15', 14 / 29], ['Nov 22', 21 / 29], ['Nov 30', 1]], start: '2026-11-01', days: 29, since: 'since Nov 1' },
    quarter: { f: 72 / 91, past: [10140, 10620, 11380, 11020, 11890, 12340, 12110, 12960, 13480, 13210, 14320], future: [14320, 14760, 14100], labels: [['Sep', 0], ['Oct', 30 / 91], ['Nov', 61 / 91], ['Nov 30', 1]], start: '2026-09-01', days: 91, since: 'since Sep 1' },
    year: { f: 346 / 365, past: [7410, 7980, 8320, 8110, 8840, 9420, 9180, 9960, 10560, 11240, 12410, 14320], future: [14320, 15210], labels: [['Dec', 0], ['Feb', 62 / 365], ['Apr', 121 / 365], ['Jun', 182 / 365], ['Aug', 243 / 365], ['Oct', 304 / 365], ['Dec', 1]], start: '2025-12-01', days: 365, since: 'since Dec 1, 2025' }
  },
  inout: {
    months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    in: [9420, 9380, 9380, 9610, 9610, 9610, 10240, 9840, 9840, 9840, 9840, 4710],
    out: [8710, 7620, 7480, 7920, 7590, 7850, 9130, 8040, 7610, 7680, 7920, 1918]
  },
  spend: [['Home & bills', 486, '#A6F0C4'], ['Groceries', 412, '#6FD69E'], ['Eating out', 386, '#FFC59A'], ['Kids', 236, '#DCF58A'], ['Transport', 164, '#9ED0FF'], ['Other', 234, 'rgba(226,242,233,.35)']],
  budgets: [['Groceries', 412, 1100, '#6FD69E'], ['Eating out', 386, 350, '#FFC59A'], ['Kids & school', 236, 600, '#DCF58A'], ['Transport', 164, 400, '#9ED0FF'], ['Fun money', 160, 250, '#A6F0C4'], ['Subscriptions', 74, 90, '#FF9A8B']],
  pace: [96, 188, 262, 371, 455, 560, 688, 790, 905, 1032, 1240, 1432],
  goals: [
    { name: 'Lisbon in May', note: 'by Apr 20, 2027', due: '2027-04-20', saved: 3263, target: 4000, c: '#A6F0C4', auto: 300 },
    { name: 'Rainy-day fund', note: '3 months of bills', saved: 10384, target: 15000, c: '#9ED0FF', auto: 600 },
    { name: 'Ada’s laptop', note: 'by Jan 15, 2027', due: '2027-01-15', saved: 902, target: 1800, c: '#DCF58A', auto: 150 },
    { name: 'New boiler', note: 'by next autumn', saved: 1117, target: 4500, c: '#FFC59A', auto: 200 }
  ],
  upcoming: [['Rent', 'Nov 25 · Joint', 2450, '#A6F0C4'], ['Electricity', 'Nov 28 · direct debit', 138.4, '#FFC59A'], ['Internet', 'Dec 2', 64.99, '#9ED0FF'], ['Car insurance', 'Dec 5', 112, '#FF9A8B']],
  members: [
    { name: 'Ada Hale', role: 'Owner · Everyday ··4821', c: '#DCF58A', spent: 812, perms: [['Approve large payments', true], ['See all accounts', true], ['Manage pots', true]] },
    { name: 'Tom Hale', role: 'Partner · Groceries ··6650', c: '#A6F0C4', spent: 694, perms: [['Approve large payments', true], ['See all accounts', true], ['Manage pots', false]] },
    { name: 'Maya Hale', role: 'Teen · age 14', c: '#FFC59A', spent: 62, perms: [['Online shopping', false], ['Spend limit $40 / week', true], ['Round-ups to savings', true]], allowance: 15 }
  ]
};
