/* Revora — sample data. Replace with responses from your billing / analytics API (same shape). */
const DATA = {
  company: 'Revora',
  months: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  mrr12: [52410, 55120, 57880, 60240, 62790, 65030, 68420, 71180, 73960, 77480, 80592, 84312],
  mrr90: [74120, 74860, 75510, 76240, 77480, 78150, 78720, 79380, 80592, 81240, 82110, 83060, 84312],
  mrr30: [80592, 80710, 80820, 80790, 81050, 81240, 81310, 81420, 81690, 81820, 81760, 82010, 82240, 82380, 82310, 82560, 82730, 82890, 83020, 82960, 83210, 83380, 83460, 83610, 83790, 83880, 84010, 84150, 84230, 84312],
  movement: [['New', 5840, '#FF5A1F'], ['Expansion', 2960, '#FF9B6B'], ['Contraction', -1180, '#C9C3B6'], ['Churned', -3900, '#16140F']],
  plans: [
    { name: 'Starter', price: 29, yearly: 24, customers: 498, color: '#FFC9B3', seats: 'Up to 3 seats', feats: ['Core analytics', 'Email reports', '30-day history'] },
    { name: 'Growth', price: 79, yearly: 66, customers: 562, color: '#FF5A1F', seats: 'Up to 15 seats', feats: ['Everything in Starter', 'Cohorts & funnels', 'Slack alerts', '2-year history'], popular: true },
    { name: 'Business', price: 199, yearly: 166, customers: 128, color: '#16140F', seats: 'Unlimited seats', feats: ['Everything in Growth', 'SSO & audit log', 'API access', 'Priority support'] }
  ],
  // MRR by plan, last 12 months (Starter, Growth, Business)
  byPlan: [
    [11200, 27410, 13800], [11480, 29040, 14600], [11760, 30520, 15600], [12010, 31830, 16400], [12300, 33190, 17300], [12520, 34310, 18200],
    [12880, 36240, 19300], [13150, 37630, 20400], [13390, 38870, 21700], [13720, 40860, 22900], [14010, 42410, 24172], [14442, 44398, 25472]
  ],
  // Retention % by monthly cohort; row = signup month, col = months since signup
  cohorts: [
    ['Apr', 342, [100, 91, 86, 83, 81, 79, 78, 77]],
    ['May', 318, [100, 92, 88, 85, 82, 80, 79]],
    ['Jun', 366, [100, 90, 85, 82, 80, 79]],
    ['Jul', 401, [100, 93, 89, 86, 84]],
    ['Aug', 388, [100, 92, 88, 85]],
    ['Sep', 425, [100, 94, 90]],
    ['Oct', 437, [100, 93]],
    ['Nov', 412, [100]]
  ],
  funnel: [['Website visitors', 48200], ['Sign-ups', 2410], ['Activated trials', 1520], ['Paid customers', 412]],
  countries: [['United States', 38], ['United Kingdom', 14], ['Germany', 11], ['Canada', 8], ['Australia', 6], ['Other', 23]],
  signups: [
    ['Brightfold', 'Growth', 79, '2 min ago', 'US'],
    ['Kestrel Labs', 'Business', 199, '18 min ago', 'UK'],
    ['Nimbus Dental', 'Starter', 29, '41 min ago', 'CA'],
    ['Parcelwise', 'Growth', 79, '1 h ago', 'DE'],
    ['Tandem Studio', 'Starter', 29, '2 h ago', 'AU']
  ],
  customers: [
    { name: 'Kestrel Labs', email: 'ops@kestrellabs.io', plan: 'Business', mrr: 199, seats: 24, status: 'Active', health: 92, country: 'United Kingdom', since: 'Nov 2026' },
    { name: 'Halden Freight', email: 'it@haldenfreight.com', plan: 'Business', mrr: 398, seats: 61, status: 'Active', health: 88, country: 'Germany', since: 'Feb 2025' },
    { name: 'Brightfold', email: 'hello@brightfold.co', plan: 'Growth', mrr: 79, seats: 6, status: 'Trial', health: 74, country: 'United States', since: 'Nov 2026' },
    { name: 'Marlowe & Finch', email: 'admin@marlowefinch.com', plan: 'Growth', mrr: 158, seats: 14, status: 'Active', health: 81, country: 'United States', since: 'Jun 2025' },
    { name: 'Nimbus Dental', email: 'office@nimbusdental.ca', plan: 'Starter', mrr: 29, seats: 2, status: 'Active', health: 66, country: 'Canada', since: 'Nov 2026' },
    { name: 'Quillstone', email: 'team@quillstone.app', plan: 'Growth', mrr: 79, seats: 9, status: 'Past due', health: 38, country: 'Australia', since: 'Mar 2026' },
    { name: 'Parcelwise', email: 'founders@parcelwise.de', plan: 'Growth', mrr: 79, seats: 5, status: 'Trial', health: 70, country: 'Germany', since: 'Nov 2026' },
    { name: 'Rowan Health', email: 'it@rowanhealth.org', plan: 'Business', mrr: 597, seats: 112, status: 'Active', health: 95, country: 'United States', since: 'Sep 2024' },
    { name: 'Tandem Studio', email: 'studio@tandem.design', plan: 'Starter', mrr: 29, seats: 3, status: 'Active', health: 59, country: 'Australia', since: 'Nov 2026' },
    { name: 'Copperline', email: 'billing@copperline.io', plan: 'Growth', mrr: 0, seats: 0, status: 'Churned', health: 12, country: 'Canada', since: 'Jan 2026' },
    { name: 'Vela Robotics', email: 'ops@velarobotics.com', plan: 'Business', mrr: 199, seats: 33, status: 'Active', health: 86, country: 'United Kingdom', since: 'Jul 2025' },
    { name: 'Oakmere Legal', email: 'pa@oakmerelegal.co.uk', plan: 'Starter', mrr: 29, seats: 3, status: 'Past due', health: 44, country: 'United Kingdom', since: 'Apr 2026' }
  ],
  team: [['Maya Klein', 'Owner', 'maya@revora.io'], ['Daniel Ortiz', 'Admin', 'daniel@revora.io'], ['Priya Shah', 'Finance', 'priya@revora.io'], ['Leo Brandt', 'Viewer', 'leo@revora.io']],
  integrations: [['Stripe', 'Billing data · synced 3 min ago', true, '#635BFF'], ['HubSpot', 'Customer records', true, '#FF7A59'], ['Slack', 'Alerts to #revenue', true, '#4A154B'], ['Segment', 'Product events', false, '#52BD94']]
};
