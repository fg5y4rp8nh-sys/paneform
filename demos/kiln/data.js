/* Kiln — sample data.
   Replace these objects with data from your Stripe account or your own API.
   Every page, chart and total is calculated from here: change a tier price
   and every bill in the app updates. */

const DATA = {
  company: { name: 'Kiln', product: 'Image generation API', currency: 'USD', today: '2026-11-20', periodStart: '2026-11-01', periodEnd: '2026-11-30' },

  /* Graduated (tiered) pricing per generated image — the same model as Stripe "graduated" prices.
     upTo = the last image in this tier; null = no upper limit. */
  tiers: [
    { upTo: 10000, price: 0.040 },
    { upTo: 100000, price: 0.032 },
    { upTo: null, price: 0.024 }
  ],

  /* Base fee per plan, billed monthly on top of usage */
  plans: [
    { id: 'starter', name: 'Starter', base: 29, limit: 500, note: 'For side projects and prototypes' },
    { id: 'pro', name: 'Pro', base: 99, limit: 3000, note: 'For products in production' },
    { id: 'scale', name: 'Scale', base: 499, limit: 15000, note: 'For high volume and SLAs' }
  ],

  models: [
    { id: 'photo-2', name: 'kiln-photo-2', color: '#5B3DF5' },
    { id: 'sketch', name: 'kiln-sketch', color: '#B9A9FF' },
    { id: 'upscale', name: 'upscale-4x', color: '#FF7A45' }
  ],

  /* Prepaid credit packs. bonus = extra % added to the balance */
  packs: [
    { amount: 500, bonus: 0 },
    { amount: 1000, bonus: 5 },
    { amount: 5000, bonus: 10 }
  ],

  /* Whole platform, month to date (all 2,318 accounts) */
  platform: {
    revenue: 186420, revenueLast: 157710, images: 5905000, prepaid: 412900, accounts: 2318, meterEventsToday: 418205,
    // images per day, in thousands, Nov 1 → Nov 20
    daily: [262, 281, 270, 248, 231, 296, 312, 305, 318, 301, 274, 259, 322, 341, 329, 336, 318, 290, 276, 336],
    mix: [0.59, 0.23, 0.18] // share of photo-2, sketch, upscale
  },

  /* Largest accounts. images = month to date, mix = share per model */
  customers: [
    { id: 'cus_R8mPixel', name: 'Pixelharbor', plan: 'scale', images: 412300, limit: 12000, balance: 1920, auto: true, country: 'NL', since: '2025-03-14', color: '#0E0B1A', mix: [0.71, 0.08, 0.21] },
    { id: 'cus_Q2nMosaic', name: 'Mosaic Labs', plan: 'scale', images: 228150, limit: 11200, balance: 8400, auto: true, country: 'US', since: '2025-06-02', color: '#5B3DF5', mix: [0.52, 0.31, 0.17] },
    { id: 'cus_P7kNorth', name: 'Northwind Studio', plan: 'pro', images: 64820, limit: 3000, balance: 1280.40, auto: true, country: 'DE', since: '2025-09-21', color: '#FF7A45', mix: [38410 / 64820, 14920 / 64820, 11490 / 64820] },
    { id: 'cus_M4tLuma', name: 'Lumacraft', plan: 'pro', images: 38900, limit: 3000, balance: 3050, auto: false, country: 'GB', since: '2026-01-08', color: '#16A36A', mix: [0.44, 0.40, 0.16] },
    { id: 'cus_K9sFable', name: 'Fable & Frame', plan: 'pro', images: 31260, limit: 1200, balance: 210, auto: false, country: 'CA', since: '2026-02-17', color: '#C2410C', mix: [0.62, 0.18, 0.20] },
    { id: 'cus_J3wOrbit', name: 'Orbit Retail', plan: 'pro', images: 22740, limit: 2000, balance: 640, auto: true, country: 'AU', since: '2026-04-30', color: '#2563EB', mix: [0.80, 0.05, 0.15] },
    { id: 'cus_H6qCanvas', name: 'Canvasly', plan: 'starter', images: 9840, limit: 500, balance: 45, auto: false, country: 'FR', since: '2026-07-11', color: '#7C3AED', mix: [0.30, 0.65, 0.05] },
    { id: 'cus_G1zBright', name: 'Brightfold', plan: 'starter', images: 7450, limit: 500, balance: 120, auto: true, country: 'ES', since: '2026-08-03', color: '#0F766E', mix: [0.55, 0.30, 0.15] },
    { id: 'cus_F5vPetal', name: 'Petal Print Co.', plan: 'starter', images: 4120, limit: 300, balance: 15, auto: false, country: 'US', since: '2026-09-25', color: '#DB2777', mix: [0.20, 0.70, 0.10] },
    { id: 'cus_D8rAtlas', name: 'Atlas Interiors', plan: 'pro', images: 18630, limit: 1500, balance: 960, auto: true, country: 'IT', since: '2026-05-19', color: '#A16207', mix: [0.68, 0.12, 0.20] }
  ],

  /* The account you see in "Customer view" */
  me: 'cus_P7kNorth',
  // Northwind Studio — images per day, Nov 1 → Nov 20 (adds up to 64,820)
  myDaily: [3010, 3320, 3160, 2410, 1980, 3550, 3670, 3410, 3620, 3390, 2870, 2240, 3710, 3880, 3740, 3690, 3310, 2650, 2460, 4750],
  keys: [
    { name: 'production', key: 'kl_live_9c2e••••8Fq2', images: 52300, last: '12 sec ago', live: true },
    { name: 'staging', key: 'kl_live_31aa••••c71A', images: 9870, last: '4 min ago', live: true },
    { name: 'ci-tests', key: 'kl_test_07bd••••02Lm', images: 2650, last: '1 h ago', live: false }
  ],
  topUp: { below: 200, add: 1000 },
  payments: [
    { date: 'Nov 1, 2026', what: 'October usage · 58,210 images', amount: 2041.72, status: 'Paid' },
    { date: 'Oct 14, 2026', what: 'Auto top-up · credits', amount: 1000, status: 'Paid' },
    { date: 'Oct 1, 2026', what: 'September usage · 49,880 images', amount: 1775.16, status: 'Paid' }
  ]
};
