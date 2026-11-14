/* Tempo — sample data.
   Appointment days are offsets from today (0 = today, -1 = yesterday), so the demo always looks current.
   Bookings you make are saved in the browser (localStorage) and shared by the dashboard and the booking page. */
const DATA = {
  business: {
    name: 'Maison Lune',
    kind: 'Hair & beauty studio',
    address: '82 Mercer Street, New York, NY 10012',
    phone: '+1 (212) 555-0187',
    email: 'hello@maisonlune.studio',
    owner: 'Clara Bloom'
  },
  settings: { currency: 'USD', step: 15, notice: 2, ahead: 30, open: 9, close: 19 },
  // dur in minutes, price in the store currency
  services: [
    { id: 'cut', name: 'Haircut & style', cat: 'Hair', dur: 45, price: 65, note: 'Wash, cut and finish' },
    { id: 'blow', name: 'Blowout', cat: 'Hair', dur: 30, price: 45, note: 'Wash and blow-dry' },
    { id: 'color', name: 'Color & gloss', cat: 'Hair', dur: 120, price: 180, note: 'Single process with gloss' },
    { id: 'mani', name: 'Gel manicure', cat: 'Nails', dur: 45, price: 40, note: 'Shape, cuticles, gel polish' },
    { id: 'pedi', name: 'Spa pedicure', cat: 'Nails', dur: 60, price: 55, note: 'Soak, scrub and polish' },
    { id: 'brow', name: 'Brow shape & tint', cat: 'Brows', dur: 30, price: 35, note: 'Wax, tweeze and tint' }
  ],
  // hours: [start, end] in 24h; tone is the pastel used in the calendar
  staff: [
    { id: 'ava', name: 'Ava Laurent', role: 'Senior stylist', tone: 'lilac', services: ['cut', 'blow', 'color'], hours: [9, 17] },
    { id: 'leo', name: 'Leo Marsh', role: 'Colorist', tone: 'peach', services: ['color', 'cut', 'blow'], hours: [10, 19] },
    { id: 'nora', name: 'Nora Kim', role: 'Nail artist', tone: 'mint', services: ['mani', 'pedi'], hours: [9, 17] },
    { id: 'iris', name: 'Iris Vega', role: 'Brows & nails', tone: 'butter', services: ['brow', 'mani'], hours: [11, 19] }
  ],
  clients: [
    { id: 'c1', name: 'Sophie Turner', phone: '+1 (917) 555-0134', email: 'sophie.t@mail.com' },
    { id: 'c2', name: 'Maya Patel', phone: '+1 (646) 555-0178', email: 'maya.patel@mail.com' },
    { id: 'c3', name: 'Emma Wright', phone: '+1 (917) 555-0152', email: 'emmaw@mail.com' },
    { id: 'c4', name: 'Olivia Chen', phone: '+1 (347) 555-0110', email: 'olivia.chen@mail.com' },
    { id: 'c5', name: 'Hannah Lee', phone: '+1 (212) 555-0199', email: 'hannah.lee@mail.com' },
    { id: 'c6', name: 'Grace Miller', phone: '+1 (646) 555-0123', email: 'grace.m@mail.com' },
    { id: 'c7', name: 'Zoe Adams', phone: '+1 (917) 555-0167', email: 'zoe.adams@mail.com' },
    { id: 'c8', name: 'Isla Brooks', phone: '+1 (347) 555-0145', email: 'isla.b@mail.com' },
    { id: 'c9', name: 'Ruby Hayes', phone: '+1 (212) 555-0181', email: 'ruby.hayes@mail.com' },
    { id: 'c10', name: 'Lucy Ward', phone: '+1 (646) 555-0102', email: 'lucy.ward@mail.com' }
  ],
  // [day offset, start time, staff, service, client, status (optional: cancelled / no-show / booked)]
  appointments: [
    [0, '09:00', 'ava', 'cut', 'c1'], [0, '10:00', 'ava', 'blow', 'c4'], [0, '11:00', 'ava', 'color', 'c6'], [0, '14:30', 'ava', 'cut', 'c9', 'booked'],
    [0, '10:30', 'leo', 'cut', 'c2'], [0, '12:00', 'leo', 'color', 'c3'], [0, '15:00', 'leo', 'blow', 'c10'], [0, '16:00', 'leo', 'cut', 'c7', 'booked'],
    [0, '09:30', 'nora', 'mani', 'c5'], [0, '11:00', 'nora', 'pedi', 'c8'], [0, '13:30', 'nora', 'mani', 'c2'], [0, '15:30', 'nora', 'pedi', 'c6'],
    [0, '11:30', 'iris', 'brow', 'c7'], [0, '13:00', 'iris', 'mani', 'c9'], [0, '16:30', 'iris', 'brow', 'c4', 'booked'],
    [1, '09:30', 'ava', 'cut', 'c3'], [1, '11:00', 'leo', 'color', 'c5'], [1, '10:00', 'nora', 'mani', 'c1'], [1, '12:00', 'iris', 'brow', 'c8'], [1, '15:00', 'ava', 'blow', 'c10', 'booked'],
    [2, '10:00', 'ava', 'color', 'c2'], [2, '13:00', 'leo', 'cut', 'c6'], [2, '11:30', 'nora', 'pedi', 'c9'], [2, '14:00', 'iris', 'mani', 'c3'],
    [3, '09:00', 'ava', 'cut', 'c8'], [3, '12:30', 'leo', 'blow', 'c1'], [3, '10:30', 'nora', 'mani', 'c7'],
    [4, '11:00', 'ava', 'blow', 'c5'], [4, '14:00', 'leo', 'color', 'c4'], [4, '15:00', 'iris', 'brow', 'c2'],
    [5, '10:00', 'nora', 'pedi', 'c10'], [5, '12:00', 'ava', 'cut', 'c6'], [6, '13:00', 'leo', 'cut', 'c9'],
    [-1, '10:00', 'ava', 'cut', 'c7'], [-1, '12:00', 'leo', 'color', 'c1'], [-1, '11:00', 'nora', 'mani', 'c3'], [-1, '14:00', 'iris', 'brow', 'c5', 'no-show'],
    [-2, '09:30', 'ava', 'color', 'c8'], [-2, '13:00', 'nora', 'pedi', 'c4'], [-2, '15:00', 'leo', 'blow', 'c2', 'cancelled'],
    [-4, '10:00', 'leo', 'cut', 'c6'], [-4, '11:30', 'iris', 'mani', 'c10'], [-5, '12:00', 'ava', 'blow', 'c9'], [-6, '10:30', 'nora', 'mani', 'c6'],
    [-8, '11:00', 'ava', 'cut', 'c2'], [-9, '14:00', 'leo', 'color', 'c7'], [-11, '10:00', 'nora', 'pedi', 'c1'], [-13, '12:00', 'iris', 'brow', 'c3']
  ]
};
