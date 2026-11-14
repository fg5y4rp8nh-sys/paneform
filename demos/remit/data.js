/* Remit — sample data.
   Dates are stored as day offsets from today (negative = in the past), so the demo
   always looks current. Your own invoices are saved in the browser (localStorage). */
const DATA = {
  business: {
    name: 'Mason & Reid Studio',
    owner: 'Sam Mason',
    email: 'billing@masonreid.studio',
    phone: '+1 (718) 555-0142',
    address: '214 Pearl Street, Brooklyn, NY 11201',
    taxId: 'EIN 84-2197310',
    payment: 'Bank transfer · Account ending 4821 · Please include the invoice number'
  },
  settings: { currency: 'USD', invoicePrefix: 'INV-', quotePrefix: 'Q-', nextInvoice: 49, nextQuote: 17, terms: 14, tax: 0, quoteValid: 30 },
  clients: [
    { id: 'harbor', name: 'Harbor & Co Coffee', contact: 'Ethan Brooks', email: 'ethan@harborco.coffee', city: 'Portland, OR' },
    { id: 'northline', name: 'Northline Fitness', contact: 'Lily Nguyen', email: 'lily@northlinefit.com', city: 'Miami, FL' },
    { id: 'lumen', name: 'Lumen Dental', contact: 'Grace Whitfield', email: 'grace@lumendental.com', city: 'Austin, TX' },
    { id: 'fable', name: 'Fable Books', contact: 'Noah Bennett', email: 'noah@fablebooks.co', city: 'Seattle, WA' },
    { id: 'tidewater', name: 'Tidewater Hotels', contact: 'Ava Thompson', email: 'ava.t@tidewaterhotels.com', city: 'Charleston, SC' },
    { id: 'copper', name: 'Copper Kettle Bakery', contact: 'Ruby Coleman', email: 'ruby@copperkettle.co', city: 'Savannah, GA' },
    { id: 'orbit', name: 'Orbit Legal', contact: 'Chloe Martin', email: 'chloe@orbitlegal.com', city: 'Boston, MA' },
    { id: 'wildflower', name: 'Wildflower Florist', contact: 'Mia Russo', email: 'mia@wildflowerflorist.com', city: 'San Diego, CA' }
  ],
  // items: [description, quantity, rate]
  invoices: [
    { n: 48, client: 'tidewater', issued: -2, terms: 30, status: 'draft', items: [['Booking flow redesign — discovery', 1, 2400]] },
    { n: 47, client: 'harbor', issued: -4, terms: 14, status: 'sent', items: [['Monthly retainer — November', 1, 1800], ['Product photography edit (24 images)', 24, 15]] },
    { n: 46, client: 'lumen', issued: -9, terms: 14, status: 'sent', items: [['Website redesign — milestone 2 of 3', 1, 3200]] },
    { n: 45, client: 'northline', issued: -24, terms: 14, status: 'sent', items: [['Class booking app — design', 1, 1950], ['Icon set (32 icons)', 1, 400]] },
    { n: 44, client: 'copper', issued: -36, terms: 30, status: 'sent', items: [['Menu boards and price cards', 6, 135]] },
    { n: 43, client: 'fable', issued: -12, terms: 14, status: 'paid', paid: -3, items: [['Newsletter template', 1, 850], ['Copywriting (4 emails)', 4, 120]] },
    { n: 42, client: 'orbit', issued: -18, terms: 14, status: 'paid', paid: -6, items: [['Landing page', 1, 2600], ['Hosting and maintenance — Q4', 1, 360]] },
    { n: 41, client: 'harbor', issued: -34, terms: 14, status: 'paid', paid: -22, items: [['Monthly retainer — October', 1, 1800]] },
    { n: 40, client: 'tidewater', issued: -41, terms: 30, status: 'paid', paid: -14, items: [['Brand guidelines', 1, 4200]], discount: 5 },
    { n: 39, client: 'wildflower', issued: -47, terms: 14, status: 'paid', paid: -38, items: [['Online shop setup', 1, 1450], ['Product listings', 40, 9]] },
    { n: 38, client: 'lumen', issued: -55, terms: 14, status: 'paid', paid: -36, items: [['Website redesign — milestone 1 of 3', 1, 3200]] },
    { n: 37, client: 'northline', issued: -63, terms: 14, status: 'paid', paid: -50, items: [['Social media templates', 12, 60]] }
  ],
  quotes: [
    { n: 16, client: 'fable', issued: -1, valid: 30, status: 'draft', items: [['Author pages — 12 templates', 12, 95]] },
    { n: 15, client: 'copper', issued: -5, valid: 30, status: 'sent', items: [['Online ordering page', 1, 1600], ['Photography day', 1, 900]] },
    { n: 14, client: 'orbit', issued: -8, valid: 21, status: 'accepted', items: [['Client intake portal — design and build', 1, 5400]] },
    { n: 13, client: 'wildflower', issued: -15, valid: 30, status: 'sent', items: [['Wedding catalogue (print)', 1, 1250]] },
    { n: 12, client: 'northline', issued: -27, valid: 14, status: 'declined', items: [['Video editing — 6 reels', 6, 220]] }
  ],
  activity: [
    ['paid', 43, -3, 'Fable Books paid INV-0043'],
    ['viewed', 47, -1, 'Harbor & Co Coffee opened INV-0047'],
    ['accepted', 14, -2, 'Orbit Legal accepted Q-0014'],
    ['paid', 42, -6, 'Orbit Legal paid INV-0042'],
    ['sent', 46, -9, 'INV-0046 sent to Lumen Dental']
  ]
};
