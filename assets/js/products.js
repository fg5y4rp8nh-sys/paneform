/* ============================================================
   PANEFORM — store settings and product list
   To add a template: copy one product block below, change it,
   put its images/video in assets/products/<slug>/ and its demo
   in demos/<slug>/. Nothing else needs to change.
   ============================================================ */

const STORE = {
  name: 'Paneform',
  tagline: 'Web app templates for real businesses',
  // Your Lemon Squeezy store address, e.g. "paneform" for paneform.lemonsqueezy.com
  lemonStore: 'paneform',
  email: 'hello@paneform.com',
  // Custom project form → your Telegram bot (t.me/paneform732_bot). chat = your Telegram user id.
  telegram: { bot: 'NGpyRU15WTl3NWpRajZDM2pQYVY3UUI4UzY1SkFUUGxFQUE6MzA2Mzg5OTcyOQ==', chat: '5448288818' },
  threads: 'https://www.threads.net/@paneform',
  instagram: 'https://www.instagram.com/paneform',
  refundDays: 14,
  // Store-wide sale. The site shows the old price crossed out and the sale price.
  // In Lemon Squeezy each product is priced at the SALE price already, so no discount code is used (code: '').
  // When the sale ends: set on: false here AND put the full price back in Lemon Squeezy.
  // Set on: false to hide the sale everywhere.
  // ends: 'YYYY-MM-DD' shows an end date and turns the sale off after that day; '' = no end date.
  sale: { on: true, percent: 20, code: '', label: 'Launch sale', ends: '' }
};

/* Categories shown as filters in the catalogue (order matters) */
const CATEGORIES = ['CRM', 'Finance', 'E-commerce', 'Booking', 'Operations', 'Analytics', 'HR', 'Energy'];

const PRODUCTS = [
  {
    slug: 'tempo',
    name: 'Tempo',
    title: 'Salon & clinic booking',
    short: 'A booking page for clients and a team calendar for salons, studios and clinics',
    category: 'Booking',
    tags: ['Booking', 'Calendar', 'Salon'],
    price: 60,
    checkout: 'https://paneform.lemonsqueezy.com/checkout/buy/e6418292-a10f-44f4-b212-be51c001719a',
    demo: 'demos/tempo/index.html',
    video: 'assets/products/tempo/reel.mp4',
    poster: 'assets/products/tempo/poster.webp',
    cover: 'assets/products/tempo/cover.webp',
    images: [
      'assets/products/tempo/cover.webp',
      'assets/products/tempo/book.webp',
      'assets/products/tempo/week.webp',
      'assets/products/tempo/appt.webp',
      'assets/products/tempo/services.webp',
      'assets/products/tempo/mobile.webp'
    ],
    pages: 6,
    version: '1.0.2',
    released: '2026-11-13',
    size: '289 KB',
    stack: 'HTML, CSS, JavaScript, GSAP',
    goodFor: 'Hair and beauty salons, barbers, nail and brow studios, clinics and anyone who takes appointments.',
    description: 'Tempo is online booking in two parts that share one set of data. Clients book on a clean four-step page: pick a service, a specialist or anyone available, a day and a free time, then leave a name and phone and get an add-to-calendar file. Your team works in a calendar with a column per specialist, working hours, a now line and a week view. Confirm, check in, complete or mark no-shows with Undo, see client history and spend, and edit services, prices and booking rules. Free times come from each specialist\'s hours and existing bookings, so double bookings cannot happen.',
    features: [
      'Client booking page: service, specialist or anyone available, day and time, details',
      'Confirmation screen with an add-to-calendar (.ics) file',
      'Day calendar with a column per specialist, working hours and a now line; week view',
      'Click an empty slot to book it; free times respect hours, service length and other bookings',
      'Appointment panel: confirm, check in, complete, cancel or no-show, all with Undo',
      'Appointments list, clients with visits and spend, and full client history',
      'Services and team: edit minutes and prices inline, hide services from online booking',
      'Booking rules in settings, shared data between both pages, sounds, tablet and phone layouts'
    ],
    files: ['index.html', 'book.html', 'style.css', 'data.js', 'app.js', 'sounds.js', 'vendor/', 'fonts/', 'sfx/', 'README.md', 'LICENSE.txt', 'package.json', 'vite.config.js'],
    changelog: [{ v: '1.0.2', date: '2026-11-15', text: 'Phone layout: two specialists per screen, pinned time column, times never cut off.' }, { v: '1.0.1', date: '2026-11-15', text: 'Mini calendar: round, centred day marker. Calendar: the "+ time" hint only covers free time and never overlaps a booking. Header and sidebar fixed on tablets.' }, { v: '1.0.0', date: '2026-11-13', text: 'First release.' }]
  },
  {
    slug: 'remit',
    name: 'Remit',
    title: 'Invoices & quotes app',
    short: 'A working invoicing app: clients, invoices, quotes, payment tracking and a real PDF in one click',
    category: 'Finance',
    tags: ['Finance', 'Invoices', 'PDF'],
    price: 60,
    checkout: 'https://paneform.lemonsqueezy.com/checkout/buy/c70d033e-5f9d-4528-84e9-1df315a44c2e',
    demo: 'demos/remit/index.html',
    video: 'assets/products/remit/reel.mp4',
    poster: 'assets/products/remit/poster.webp',
    cover: 'assets/products/remit/cover.webp',
    images: [
      'assets/products/remit/cover.webp',
      'assets/products/remit/editor.webp',
      'assets/products/remit/invoices.webp',
      'assets/products/remit/invoice.webp',
      'assets/products/remit/quotes.webp',
      'assets/products/remit/mobile.webp'
    ],
    pages: 6,
    version: '1.0.1',
    released: '2026-11-13',
    size: '478 KB',
    stack: 'HTML, CSS, JavaScript, GSAP, jsPDF',
    goodFor: 'Freelancers, studios and small businesses who want their own invoicing tool, and developers building one for a client.',
    description: 'Remit is a complete invoicing app that works as soon as you open it. The overview shows what is outstanding, how late it is and how long clients take to pay. Create an invoice or a quote with a live preview of the document, then download a real PDF in one click. Track every invoice as draft, sent, overdue or paid, mark payments with Undo, send reminders and turn an accepted quote into an invoice. Everything is saved in the browser, with a JSON backup in settings.',
    features: [
      'Invoice and quote editor with a live preview of the document',
      'Real PDF download in one click, built in the browser with jsPDF',
      'Draft, sent, overdue and paid tabs with search and a document side panel',
      'Mark as paid with Undo, payment reminders and duplicate',
      'Quotes with accepted and declined states, converted to an invoice in one click',
      'Overview with outstanding, overdue by age and average time to get paid',
      'Clients with paid and open totals; business details, currency, tax and numbering in settings',
      'Saves in the browser with JSON backup, soft UI sounds, tablet and phone layouts'
    ],
    files: ['index.html', 'style.css', 'data.js', 'app.js', 'sounds.js', 'vendor/', 'fonts/', 'sfx/', 'README.md', 'LICENSE.txt', 'package.json', 'vite.config.js'],
    changelog: [{ v: '1.0.1', date: '2026-11-15', text: 'Tablet tables: long client names truncate cleanly. Phone settings: one field per row.' }, { v: '1.0.0', date: '2026-11-13', text: 'First release.' }]
  },
  {
    slug: 'vettra',
    name: 'Vettra',
    title: 'Hiring dashboard',
    short: 'A dark five-page hiring desk for time to hire, open roles, a candidate pipeline and interviews',
    category: 'HR',
    tags: ['HR', 'Recruiting', 'Dark'],
    price: 50,
    checkout: 'https://paneform.lemonsqueezy.com/checkout/buy/9b388d5f-0cd8-433e-b1e0-1fd26af63fcd',
    demo: 'demos/vettra/index.html',
    video: 'assets/products/vettra/reel.mp4',
    poster: 'assets/products/vettra/poster.webp',
    cover: 'assets/products/vettra/cover.webp',
    images: [
      'assets/products/vettra/cover.webp',
      'assets/products/vettra/jobs.webp',
      'assets/products/vettra/candidates.webp',
      'assets/products/vettra/interviews.webp',
      'assets/products/vettra/mobile.webp'
    ],
    pages: 5,
    version: '1.0.0',
    released: '2026-11-13',
    size: '216 KB',
    stack: 'HTML, CSS, JavaScript, GSAP',
    goodFor: 'In-house talent teams, recruiting agencies and HR tech startups building a hiring dashboard on top of their ATS.',
    description: 'Vettra is a dark hiring dashboard in black and blue. The overview shows time to hire as a ring split by stage, applicants and reply time, the pipeline by stage, four KPI cards, today\'s interviews and where hires come from. Jobs lists every open role with a department filter that reorders the cards smoothly. Candidates is a pipeline board where one click moves a person to the next stage, with Undo. Interviews pairs today\'s schedule with a scorecard panel, and settings cover the team, stages, integrations and notifications.',
    features: [
      'Time to hire ring split by stage, with a highlight when you hover a stage',
      'Pipeline by stage, offer rate and four KPI cards with mini bars',
      'Open roles with tabs and a department filter that reorders the cards with GSAP Flip',
      'Candidate board: move a person to the next stage in one click, Undo from the toast',
      'Interview schedule with a scorecard and recruiter note for each candidate',
      'Hiring team, stages, integrations and notification settings',
      'Counters and staggered page entrances with GSAP',
      'Soft UI clicks with an on/off switch, tablet sidebar and phone layout with a tab bar'
    ],
    files: ['index.html', 'style.css', 'data.js', 'app.js', 'sounds.js', 'vendor/', 'fonts/', 'sfx/', 'README.md', 'LICENSE.txt', 'package.json', 'vite.config.js'],
    changelog: [{ v: '1.0.0', date: '2026-11-13', text: 'First release.' }]
  },
  {
    slug: 'revora',
    name: 'Revora',
    title: 'SaaS metrics dashboard',
    short: 'A five-page SaaS dashboard for MRR, churn, cohorts, customers and plans',
    category: 'Analytics',
    tags: ['SaaS', 'Analytics', 'Light'],
    price: 50,
    checkout: 'https://paneform.lemonsqueezy.com/checkout/buy/95ceb925-2fe5-4f94-9e7a-07fb20779683',
    demo: 'demos/revora/index.html',
    video: 'assets/products/revora/reel.mp4',
    poster: 'assets/products/revora/poster.webp',
    cover: 'assets/products/revora/cover.webp',
    images: [
      'assets/products/revora/cover.webp',
      'assets/products/revora/revenue.webp',
      'assets/products/revora/customers.webp',
      'assets/products/revora/plans.webp',
      'assets/products/revora/mobile.webp'
    ],
    pages: 5,
    version: '1.0.0',
    released: '2026-11-13',
    size: '316 KB',
    stack: 'HTML, CSS, JavaScript, GSAP',
    goodFor: 'SaaS founders, subscription businesses and agencies building revenue dashboards on top of Stripe or Paddle.',
    description: 'Revora is a clean SaaS metrics dashboard. The overview shows MRR, paying customers, churn and revenue per customer, an MRR growth chart that morphs between 30 days, 90 days and 12 months, MRR movement, plan mix, the latest sign-ups and customers by country. Revenue adds run rate, retention, lifetime value, a stacked MRR-by-plan chart, a trial funnel and a cohort retention heatmap. A customers table with a detail panel, a plans page with a monthly / yearly switch and settings complete the set.',
    features: [
      'MRR growth chart that morphs between 30 days, 90 days and 12 months, with a target line',
      'MRR movement: new, expansion, contraction and churn, with the quick ratio',
      'Stacked MRR by plan, trial funnel and cohort retention heatmap',
      'Customers table with search, status filter, sorting and a detail panel with a health score',
      'Plan cards with a monthly / yearly switch that re-counts the prices',
      'Team, integrations, alerts and billing settings',
      'Counters, sparklines and staggered page entrances with GSAP',
      'Soft UI clicks with an on/off switch, phone layout with a tab bar'
    ],
    files: ['index.html', 'style.css', 'data.js', 'app.js', 'sounds.js', 'vendor/', 'fonts/', 'sfx/', 'README.md', 'LICENSE.txt', 'package.json', 'vite.config.js'],
    changelog: [{ v: '1.0.0', date: '2026-11-13', text: 'First release.' }]
  },
  {
    slug: 'linden',
    name: 'Linden',
    title: 'Household money app',
    short: 'An eight-page family finance app in green glass, with a card wallet and liquid savings pots',
    category: 'Finance',
    tags: ['Finance', 'Fintech', 'Animated'],
    price: 60,
    checkout: 'https://paneform.lemonsqueezy.com/checkout/buy/a389decb-94b6-4ae5-9422-10a2511490b7',
    demo: 'demos/linden/index.html',
    video: 'assets/products/linden/reel.mp4',
    poster: 'assets/products/linden/poster.webp',
    cover: 'assets/products/linden/cover.webp',
    images: [
      'assets/products/linden/cover.webp',
      'assets/products/linden/cards.webp',
      'assets/products/linden/goals.webp',
      'assets/products/linden/insights.webp',
      'assets/products/linden/mobile.webp'
    ],
    pages: 8,
    version: '1.0.2',
    released: '2026-11-13',
    size: '611 KB',
    stack: 'HTML, CSS, JavaScript, GSAP',
    goodFor: 'Fintech start-ups, neobanks, budgeting apps and family finance products.',
    description: 'Linden is a household money app in smoked green glass over a soft leafy background. The overview has a card stack you can throw, flip and freeze, and a household balance with a forecast that morphs between month, quarter and year. Cards, payments, insights, budgets, savings goals, household members and settings complete the app. Every page enters with smooth GSAP motion, and soft UI sounds can be switched off with one tap.',
    features: [
      'Card wallet with real card proportions: throw a card to the back, flip it for details, freeze it under frost',
      'Balance chart with a forecast that morphs between Month, Quarter and Year',
      'Monthly limit slider (drag or arrow keys) with a live spend-vs-limit chart',
      'Payments by day with filters and a side panel to split a payment',
      'Insights: money in vs out, weekday heatmap, top merchants',
      'Budgets with a progress ring, spending pace and over-budget states',
      'Savings pots that fill with liquid, + $50 with Undo, payoff dates',
      'Soft UI sounds with a remembered on/off switch, phone layout with a tab bar'
    ],
    files: ['index.html', 'style.css', 'data.js', 'app.js', 'sounds.js', 'vendor/', 'fonts/', 'sfx/', 'README.md', 'LICENSE.txt', 'package.json', 'vite.config.js'],
    changelog: [{ v: '1.0.2', date: '2026-11-15', text: 'Phone: search placeholder and balance badge no longer wrap or clip.' }, { v: '1.0.1', date: '2026-11-15', text: 'Tablet layout: wallet and balance cards use the full width.' }, { v: '1.0.0', date: '2026-11-13', text: 'First release.' }]
  },
  {
    slug: 'quorra',
    name: 'Quorra',
    title: 'Sales CRM',
    short: 'A six-page sales CRM with a drag-and-drop deal board',
    category: 'CRM',
    tags: ['CRM', 'Sales', 'Light & dark'],
    price: 60,
    // Paste the "Share" link of the product from Lemon Squeezy (Products → … → Share)
    checkout: 'https://paneform.lemonsqueezy.com/checkout/buy/dc7536c9-d5b8-43b8-88cf-ed483f92429a',
    demo: 'demos/quorra/index.html',
    video: 'assets/products/quorra/reel.mp4',
    poster: 'assets/products/quorra/poster.webp',
    cover: 'assets/products/quorra/cover.webp',
    images: [
      'assets/products/quorra/cover.webp',
      'assets/products/quorra/deals-dark.webp',
      'assets/products/quorra/reports.webp',
      'assets/products/quorra/tasks-dark.webp',
      'assets/products/quorra/mobile.webp'
    ],
    pages: 6,
    version: '1.0.1',
    released: '2026-11-12',
    size: '37 KB',
    stack: 'HTML, CSS, JavaScript',
    goodFor: 'Sales teams, agencies and B2B companies that track deals, clients and follow-ups.',
    description: 'Quorra is a complete sales CRM front end. The overview shows the pipeline, revenue against target, today’s tasks, team activity and a leaderboard. Deals move across a five-stage board by drag and drop, and every deal opens in a side panel with its stage, contact, next step and timeline. Contacts, a weekly task calendar, reports and settings complete the set.',
    features: [
      'Drag-and-drop deal board with five stages, column totals and a weighted pipeline',
      'Deal side panel: change the stage, add notes, mark as won or lost',
      'Revenue vs. target chart that morphs between 12 months, 6 months and quarters',
      'Sortable, filterable contacts table with bulk actions',
      'Week calendar with a live “now” line and Mine / Team views',
      'Reports: forecast, pipeline by source, lost reasons, team performance',
      'Light and dark theme, ⌘K search, toasts and a new-deal form',
      'Phone layout with a slide-out menu and a bottom tab bar'
    ],
    files: ['index.html', 'app.css', 'theme.js', 'data.js', 'core.js', 'pages.js', 'app.js', 'README.md', 'LICENSE.txt', 'package.json', 'vite.config.js'],
    changelog: [{ v: '1.0.1', date: '2026-11-15', text: 'Phone: contacts table fits the screen, week calendar scrolls by day. Event labels no longer clip.' }, { v: '1.0.0', date: '2026-11-12', text: 'First release.' }]
  }
];
