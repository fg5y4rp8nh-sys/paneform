/* Tempo — app logic for the dashboard (index.html) and the public booking page (book.html).
   Vanilla JS + GSAP (free for commercial use). Data is saved in localStorage and shared by both pages. */
(() => {
'use strict';
const PUBLIC = document.body.classList.contains('public');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ini = s => String(s).split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const mq = matchMedia('(max-width:720px)');
gsap.registerPlugin(CustomEase);
CustomEase.create('soft', '0.25,1,0.4,1');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.globalTimeline.timeScale(20);

/* ---------- Icons ---------- */
const svg = p => `<svg class="ic" viewBox="0 0 24 24">${p}</svg>`;
const I = {
  cal: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  list: svg('<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17.5" r="1"/>'),
  users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>'),
  cut: svg('<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.6 8.4 20 17M8.6 15.6 20 7"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  l: svg('<path d="m15 6-6 6 6 6"/>'), r: svg('<path d="m9 6 6 6-6 6"/>'),
  down: svg('<path d="m6 9 6 6 6-6"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  door: svg('<path d="M5 20.5h14M7 20.5V4.5h8.5v16M12.5 12.5h.01"/>'),
  back: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>'),
  vol: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'),
  dl: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>'),
  save: svg('<path d="M5 4.5h11l3.5 3.5v11.5h-15z"/><path d="M8 4.5v5h7v-5M8 19.5v-6h8v6"/>'),
  ban: svg('<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>'),
  redo: svg('<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>')
};

/* ---------- Sound ---------- */
const SFX = (() => {
  let ctx = null, on = true, last = -1e9; const bufs = {};
  try { const st = localStorage.getItem('tempo-sound'); if (st) on = st !== 'off'; } catch (e) { }
  function init() {
    if (ctx || typeof SOUNDS === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    Object.keys(SOUNDS).forEach(k => {
      const bin = atob(SOUNDS[k]), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      ctx.decodeAudioData(u.buffer).then(b => { bufs[k] = b; }).catch(() => { });
    });
  }
  addEventListener('pointerdown', init, { once: true, capture: true });
  addEventListener('keydown', init, { once: true, capture: true });
  function play(name, vol = 1) {
    last = performance.now();
    if (!on) return;
    if (!ctx || !bufs[name]) return;
    if (ctx.state === 'suspended') ctx.resume();
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = bufs[name]; g.gain.value = vol; src.connect(g).connect(ctx.destination); src.start();
  }
  return { play, recent: () => performance.now() - last < 40, isOn: () => on, set(v) { on = v; try { localStorage.setItem('tempo-sound', v ? 'on' : 'off'); } catch (e) { } } };
})();

/* ---------- Dates & times (minutes from midnight) ---------- */
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const todayISO = iso(TODAY);
const dt = s => new Date(s + 'T00:00');
const addDays = (s, n) => { const d = dt(s); d.setDate(d.getDate() + n); return iso(d); };
const NOW = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const tm = m => { const h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1; return `${h12}:${pad(mm)} ${h < 12 ? 'AM' : 'PM'}`; };
const tmS = m => { const h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1; return mm ? `${h12}:${pad(mm)}` : `${h12}`; };
const hr = h => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;
const fdo = (s, o) => dt(s).toLocaleDateString('en-US', o);
const fLong = s => fdo(s, { weekday: 'long', month: 'long', day: 'numeric' });
const fShort = s => fdo(s, { weekday: 'short', month: 'short', day: 'numeric' });
const fMD = s => fdo(s, { month: 'short', day: 'numeric' });
const rel = s => s === todayISO ? 'Today' : s === addDays(todayISO, 1) ? 'Tomorrow' : s === addDays(todayISO, -1) ? 'Yesterday' : fShort(s);
const durT = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`;

/* ---------- Store ---------- */
const KEY = 'tempo-data-v1';
function seed() {
  const svcs = DATA.services.map(s => ({ ...s, online: true }));
  const now = NOW();
  return {
    business: { ...DATA.business }, settings: { ...DATA.settings },
    services: svcs, staff: DATA.staff.map(s => ({ ...s })), clients: DATA.clients.map(c => ({ ...c })),
    appointments: DATA.appointments.map(([off, t, staff, service, client, st], i) => {
      const s = svcs.find(x => x.id === service), start = toMin(t), end = start + s.dur;
      const status = st || (off < 0 || (off === 0 && end <= now) ? 'completed' : off === 0 && start <= now ? 'arrived' : 'confirmed');
      return { id: 'a' + (i + 1), date: addDays(todayISO, off), start, dur: s.dur, staff, service, client, status, price: s.price, source: i % 3 === 0 ? 'online' : 'desk', note: '' };
    })
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || !S.appointments) S = seed();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
// keep the dashboard and the booking page in sync across tabs
addEventListener('storage', e => { if (e.key !== KEY || !e.newValue) return; try { S = JSON.parse(e.newValue); rerender(); } catch (er) { } });

const money = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: S.settings.currency || 'USD', maximumFractionDigits: 0 }).format(v || 0);
const svc = id => S.services.find(s => s.id === id) || { name: 'Service', dur: 30, price: 0, cat: '' };
const stf = id => S.staff.find(s => s.id === id) || { name: 'Anyone', tone: 'lilac', hours: [9, 17], services: [] };
const cli = id => S.clients.find(c => c.id === id) || { name: 'Walk-in', phone: '', email: '' };
const first = n => n.split(' ')[0];
const live = a => a.status !== 'cancelled';
const LABEL = { booked: 'New', confirmed: 'Confirmed', arrived: 'In salon', completed: 'Done', cancelled: 'Cancelled', 'no-show': 'No-show' };
const CAT = { Hair: ['lilac', '<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.6 8.4 20 17M8.6 15.6 20 7"/>'], Nails: ['mint', '<path d="M9 21h6M10 21V11h4v10M10.5 11 11 3.5h2l.5 7.5"/>'], Brows: ['butter', '<path d="M3 12c3-4 6-5 9-5s6 1 9 5"/><path d="M5.5 15.5c2-1.5 4-2 6.5-2s4.5.5 6.5 2"/>'] };
const catIco = c => { const x = CAT[c] || ['peach', '<circle cx="12" cy="12" r="4"/>']; return [x[0], svg(x[1])]; };
const pill = s => `<span class="pill ${s}">${LABEL[s]}</span>`;
const byTime = (a, b) => a.date.localeCompare(b.date) || a.start - b.start;
const isPast = a => a.date < todayISO || (a.date === todayISO && a.start + a.dur <= NOW());

/* ---------- Availability ---------- */
function isFree(staff, date, start, dur, ignore) {
  return !S.appointments.some(a => a.id !== ignore && a.staff === staff && a.date === date && live(a) && a.start < start + dur && start < a.start + a.dur);
}
function slots(date, serviceId, staffId) {
  const s = svc(serviceId), T = S.settings, out = new Map();
  const team = S.staff.filter(p => p.services.includes(serviceId) && (staffId === 'any' || p.id === staffId));
  const min = date === todayISO ? NOW() + T.notice * 60 : -1;
  if (date < todayISO || date > addDays(todayISO, T.ahead)) return [];
  team.forEach(p => {
    const from = Math.max(T.open, p.hours[0]) * 60, to = Math.min(T.close, p.hours[1]) * 60 - s.dur;
    for (let t = from; t <= to; t += T.step) if (t >= min && !out.has(t) && isFree(p.id, date, t, s.dur)) out.set(t, p.id);
  });
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([t, staff]) => ({ t, staff }));
}
function nextFree(serviceId, staffId) {
  for (let i = 0; i < 14; i++) { const d = addDays(todayISO, i), s = slots(d, serviceId, staffId); if (s.length) return { date: d, t: s[0].t }; }
  return null;
}

/* ---------- Toast ---------- */
const toastEl = $('#toast'); let undoFn = null, toastT;
const ty = () => mq.matches ? -30 : 30;
gsap.set(toastEl, { xPercent: -50, y: ty(), autoAlpha: 0 });
function toast(msg, undo) {
  SFX.play('ding', .7);
  $('#toastT').textContent = msg; undoFn = undo; $('#undo').style.display = undo ? '' : 'none';
  gsap.fromTo(toastEl, { y: +gsap.getProperty(toastEl, 'opacity') > .5 ? 0 : ty() }, { y: 0, autoAlpha: 1, duration: .4, ease: 'soft' });
  toastT && toastT.kill(); toastT = gsap.delayedCall(3.4, hideToast);
}
const hideToast = () => gsap.to(toastEl, { y: ty(), autoAlpha: 0, duration: .3, ease: 'power2.in' });
$('#undo').addEventListener('click', () => { const f = undoFn; undoFn = null; toastT && toastT.kill(); hideToast(); f && f(); });

/* ---------- Menu ---------- */
const menu = $('#menu'); let menuPick = null, menuFor = null;
function openMenu(anchor, items, onPick, current) {
  menuPick = onPick; menuFor = anchor;
  menu.innerHTML = items.map((it, i) => `<button data-i="${i}" class="${it.v === current ? 'on' : ''}">${it.html || esc(it.label)}</button>`).join('');
  const r = anchor.getBoundingClientRect(), w = Math.max(r.width, 230);
  menu.style.width = w + 'px'; menu.style.left = Math.min(r.left, innerWidth - w - 10) + 'px';
  const below = innerHeight - r.bottom > 270;
  menu.style.top = below ? r.bottom + 6 + 'px' : ''; menu.style.bottom = below ? '' : innerHeight - r.top + 6 + 'px';
  menu._items = items; SFX.play('open', .6);
  gsap.fromTo(menu, { autoAlpha: 0, y: below ? -6 : 6 }, { autoAlpha: 1, y: 0, duration: .22, ease: 'soft' });
}
function closeMenu() { if (!menuFor) return; menuFor = null; gsap.to(menu, { autoAlpha: 0, duration: .15 }); }
menu.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const it = menu._items[+b.dataset.i]; SFX.play('tick'); closeMenu(); menuPick && menuPick(it.v); });
document.addEventListener('pointerdown', e => { if (menuFor && !menu.contains(e.target) && !menuFor.contains(e.target)) closeMenu(); }, true);
addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeDrawer(); } });

/* ---------- Drawer ---------- */
const drawer = $('#drawer'), scrim = $('#scrim'); let drawerOpen = false;
gsap.set(drawer, { xPercent: 104 });
function openDrawer(html) {
  drawer.innerHTML = html;
  if (!drawerOpen) {
    drawerOpen = true; SFX.play('open'); drawer.setAttribute('aria-hidden', 'false');
    gsap.to(scrim, { autoAlpha: 1, duration: .3 });
    if (mq.matches) { gsap.set(drawer, { xPercent: 0, yPercent: 104, autoAlpha: 1 }); gsap.to(drawer, { yPercent: 0, duration: .45, ease: 'soft' }); }
    else { gsap.set(drawer, { autoAlpha: 1, yPercent: 0 }); gsap.to(drawer, { xPercent: 0, duration: .45, ease: 'soft' }); }
  }
}
function closeDrawer(quiet) {
  if (!drawerOpen) return; drawerOpen = false; if (!quiet) SFX.play('close'); drawer.setAttribute('aria-hidden', 'true');
  gsap.to(scrim, { autoAlpha: 0, duration: .25 });
  gsap.to(drawer, mq.matches ? { yPercent: 104, duration: .35, ease: 'power2.in' } : { xPercent: 104, duration: .35, ease: 'power2.in' });
}
scrim.addEventListener('click', () => closeDrawer());

/* ============ DASHBOARD ============ */
const PAGES = [['calendar', 'Calendar', I.cal], ['appointments', 'Appointments', I.list], ['clients', 'Clients', I.users], ['services', 'Services', I.cut], ['settings', 'Settings', I.gear]];
const H = {};
const CAL = { view: 'day', date: todayISO, hide: new Set(), month: null };
let HL = null;
const weekStart = s => { const d = dt(s), w = (d.getDay() + 6) % 7; return addDays(s, -w); };

H.calendar = () => {
  const d = CAL.date, list = S.appointments.filter(a => a.date === d && live(a));
  const exp = list.filter(a => a.status !== 'no-show').reduce((s, a) => s + a.price, 0);
  const hrs = list.reduce((s, a) => s + a.dur, 0) / 60;
  return `<div class="cal">
    <aside class="cal-side">
      <div class="today"><span class="kick">${d === todayISO ? 'Today' : rel(d)}</span><h2>${fdo(d, { weekday: 'long' })}<span>${fdo(d, { month: 'long', day: 'numeric' })}</span></h2></div>
      <div class="stats"><div class="stat wide"><small>Expected ${d === todayISO ? 'today' : 'this day'}</small><b class="tn" data-n="${exp}">$0</b></div>
        <div class="stat"><small>Appointments</small><b class="tn">${list.length}</b></div><div class="stat"><small>Booked hours</small><b class="tn">${hrs % 1 ? hrs.toFixed(1) : hrs}</b></div></div>
      <div class="mini" id="mini"></div>
      <div class="c" style="padding:14px"><div class="who-f" id="whoF">${S.staff.map(p => `<button class="t-${p.tone}${CAL.hide.has(p.id) ? ' off' : ''}" data-who="${p.id}"><span class="av sm tone t-${p.tone}" style="width:30px;height:30px">${ini(p.name)}</span><div><b>${esc(first(p.name))}</b><span>${esc(p.role)}</span></div><em>${list.filter(a => a.staff === p.id).length}</em></button>`).join('')}</div></div>
    </aside>
    <div class="cal-main">
      <div class="cal-bar"><div class="l"><button class="ib" data-nav="-1" aria-label="Previous">${I.l}</button><button class="ib" data-nav="1" aria-label="Next">${I.r}</button><button class="btn sm" data-nav="0">Today</button><h3>${CAL.view === 'day' ? fLong(d) : `${fMD(weekStart(d))} – ${fMD(addDays(weekStart(d), 6))}`}</h3></div>
        <div class="r"><div class="seg" id="viewSeg"><span class="u"></span><button data-view="day" class="${CAL.view === 'day' ? 'on' : ''}">Day</button><button data-view="week" class="${CAL.view === 'week' ? 'on' : ''}">Week</button></div><button class="btn ink sm" data-act="newAppt">${I.plus}New</button></div></div>
      <div class="grid" id="grid"></div>
    </div>
  </div>`;
};
function miniCal() {
  const m = CAL.month || CAL.date.slice(0, 7), d1 = m + '-01', start = weekStart(d1);
  const has = new Set(S.appointments.filter(live).map(a => a.date));
  let cells = '';
  for (let i = 0; i < 42; i++) { const d = addDays(start, i); if (i >= 35 && d.slice(0, 7) !== m) break; cells += `<button data-day="${d}" class="${d.slice(0, 7) !== m ? 'out ' : ''}${has.has(d) ? 'has ' : ''}${d === todayISO ? 'is-today ' : ''}${d === CAL.date ? 'sel' : ''}">${+d.slice(8)}</button>`; }
  $('#mini').innerHTML = `<div class="mini-h"><b>${fdo(d1, { month: 'long', year: 'numeric' })}</b><div><button class="ib" data-mon="-1" aria-label="Previous month">${I.l}</button><button class="ib" data-mon="1" aria-label="Next month">${I.r}</button></div></div>
    <div class="mini-g">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}${cells}</div>`;
}
function apptHTML(a, style, lanes) {
  const p = stf(a.staff), short = a.dur <= 30, mid = a.dur < 60, c = cli(a.client), s = svc(a.service);
  const info = short ? `<span class="tm">${tm(a.start)}</span>` : mid || lanes > 1 ? `<span><span class="tm">${tm(a.start)}</span>${lanes > 1 ? '' : ' · ' + esc(s.name)}</span>` : `<span class="tm">${tm(a.start)} – ${tm(a.start + a.dur)}</span><span>${esc(s.name)}</span>`;
  return `<button class="appt t-${p.tone} ${a.status}${short ? ' short' : ''}" data-appt="${a.id}" style="${style}"><b>${esc(c.name)}</b>${info}</button>`;
}
function drawGrid() {
  const g = $('#grid'); if (!g) return;
  const T = S.settings, H0 = T.open, H1 = T.close, HOUR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour')) || 76, total = (H1 - H0) * HOUR;
  const y = m => (m - H0 * 60) / 60 * HOUR;
  const lines = `background-image:linear-gradient(to bottom,var(--line) 1px,transparent 1px);background-size:100% ${HOUR}px`;
  const now = NOW(), nowY = y(now), showNow = now > H0 * 60 && now < H1 * 60;
  const nowHere = showNow && (CAL.view === 'day' ? CAL.date === todayISO : true);
  const times = Array.from({ length: H1 - H0 }, (_, i) => i && !(nowHere && CAL.view === 'day' && Math.abs((H0 + i) * 60 - now) < 18) ? `<span style="top:${i * HOUR}px">${hr(H0 + i)}</span>` : '').join('');
  let head, body, cols;
  if (CAL.view === 'day') {
    const team = S.staff.filter(p => !CAL.hide.has(p.id)), d = CAL.date;
    cols = `64px repeat(${team.length || 1},minmax(0,1fr))`;
    head = `<div class="gh"></div>` + team.map(p => { const n = S.appointments.filter(a => a.date === d && a.staff === p.id && live(a)).length; return `<div class="gh"><span class="av tone t-${p.tone}">${ini(p.name)}</span><div><b>${esc(first(p.name))}</b><span>${n} booking${n === 1 ? '' : 's'}</span></div></div>`; }).join('');
    body = `<div class="g-times" style="height:${total}px">${times}</div>` + team.map(p => {
      const off = [p.hours[0] > H0 ? `<div style="position:absolute;left:0;right:0;top:0;height:${y(p.hours[0] * 60)}px;background:#F8F6F1"></div>` : '', p.hours[1] < H1 ? `<div style="position:absolute;left:0;right:0;top:${y(p.hours[1] * 60)}px;bottom:0;background:#F8F6F1"></div>` : ''].join('');
      return `<div class="g-col" data-col="${p.id}" data-date="${d}" style="height:${total}px;${lines}">${off}<div class="ghost-slot"></div>${S.appointments.filter(a => a.date === d && a.staff === p.id && live(a)).map(a => apptHTML(a, `top:${y(a.start) + 2}px;height:${a.dur / 60 * HOUR - 4}px`)).join('')}</div>`;
    }).join('') + (d === todayISO && showNow ? `<div class="now" style="top:${nowY}px;left:64px"><i>${tmS(now)}</i></div>` : '');
  } else {
    const ws = weekStart(CAL.date), days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    cols = `repeat(7,minmax(0,1fr))`;
    head = days.map(d => { const n = S.appointments.filter(a => a.date === d && live(a) && !CAL.hide.has(a.staff)).length; return `<div class="gh dayh${d === todayISO ? ' is-today' : ''}" data-day="${d}" style="cursor:pointer"><span>${fdo(d, { weekday: 'short' })} · ${n}</span><b>${+d.slice(8)}</b></div>`; }).join('');
    body = days.map(d => {
      const list = S.appointments.filter(a => a.date === d && live(a) && !CAL.hide.has(a.staff)).sort((a, b) => a.start - b.start);
      return `<div class="g-col wk-col${d === todayISO ? ' is-today' : ''}" data-col="week" data-date="${d}">${list.map(a => { const p = stf(a.staff); return `<button class="wk t-${p.tone} ${a.status}" data-appt="${a.id}"><small>${tm(a.start)}</small><b>${esc(cli(a.client).name)}</b><span>${esc(svc(a.service).name)}</span></button>`; }).join('') || '<span class="wk-empty">No bookings</span>'}<span class="wk-add">${I.plus}</span></div>`;
    }).join('');
  }
  g.innerHTML = `<div class="g-head" style="grid-template-columns:${cols}">${head}</div><div class="g-body" style="grid-template-columns:${cols}">${body}</div>`;
  if (HL) { const el = $(`[data-appt="${HL}"]`, g); HL = null; if (el) gsap.fromTo(el, { scale: .6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .6, ease: 'back.out(2)', delay: .25, clearProps: 'opacity,visibility,transform' }); }
}
function slotFromEvent(col, e) {
  const T = S.settings, HOUR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour')) || 76;
  const r = col.getBoundingClientRect(), m = T.open * 60 + Math.floor((e.clientY - r.top) / HOUR * 60 / 15) * 15;
  return Math.max(T.open * 60, Math.min(m, T.close * 60 - 15));
}
document.addEventListener('mousemove', e => {
  const col = e.target.closest && e.target.closest('.g-col'); if (!col || col.dataset.col === 'week') return;
  const gs = $('.ghost-slot', col);
  if (e.target.closest('.appt')) { gs.classList.remove('on'); return; }
  const HOUR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour')) || 76, m = slotFromEvent(col, e);
  // the ghost only covers free time: inside working hours, never under or over another booking
  const p = stf(col.dataset.col), d = col.dataset.date, end = Math.min(S.settings.close, p.hours[1]) * 60;
  const busy = S.appointments.filter(a => a.date === d && a.staff === p.id && live(a));
  const inside = m < p.hours[0] * 60 || m >= end || busy.some(a => a.start <= m && m < a.start + a.dur);
  if (inside) { gs.classList.remove('on'); return; }
  const next = Math.min(end, ...busy.filter(a => a.start > m).map(a => a.start)), len = Math.min(30, next - m);
  gs.style.top = (m - S.settings.open * 60) / 60 * HOUR + 2 + 'px'; gs.style.height = len / 60 * HOUR - 4 + 'px';
  gs.classList.toggle('sm', len < 30); gs.textContent = '+ ' + tm(m); gs.classList.add('on');
});

/* ----- appointment drawer ----- */
function apptDrawer(id) {
  const a = S.appointments.find(x => x.id === id); if (!a) return;
  const p = stf(a.staff), c = cli(a.client), s = svc(a.service), past = isPast(a);
  const hist = S.appointments.filter(x => x.client === a.client && x.id !== a.id && x.status === 'completed').sort(byTime).reverse().slice(0, 3);
  let acts;
  if (a.status === 'booked') acts = `<button class="btn" data-st="cancelled">${I.ban}Cancel</button><button class="btn ink" data-st="confirmed">${I.check}Confirm</button>`;
  else if (a.status === 'confirmed') acts = `<button class="btn" data-st="cancelled">${I.ban}Cancel</button>${past ? `<button class="btn" data-st="no-show">No-show</button>` : ''}<button class="btn ink" data-st="arrived">${I.door}Check in</button>`;
  else if (a.status === 'arrived') acts = `<button class="btn ink" data-st="completed">${I.check}Complete · ${money(a.price)}</button>`;
  else acts = `<button class="btn ink" data-rebook="${a.id}">${I.redo}${a.status === 'completed' ? 'Book again' : 'Rebook'}</button>`;
  openDrawer(`<div class="dr-h"><h3>${esc(c.name)}</h3><div style="display:flex;align-items:center;gap:8px">${pill(a.status)}<button class="ib" data-close aria-label="Close">${I.x}</button></div></div>
    <div class="dr-b"><div class="ticket t-${p.tone}"><small>${['Today', 'Tomorrow', 'Yesterday'].includes(rel(a.date)) ? rel(a.date) + ' · ' + fMD(a.date) : fLong(a.date)}</small><span class="big">${tm(a.start)}</span><span class="sub">${durT(a.dur)} · ${esc(s.name)} · until ${tm(a.start + a.dur)}</span></div>
      <div class="kv"><div><span>Specialist</span><b>${esc(p.name)}</b></div><div><span>Price</span><b>${money(a.price)}</b></div><div><span>Phone</span><b>${esc(c.phone) || '—'}</b></div><div><span>Booked</span><b>${a.source === 'online' ? 'Online booking page' : 'Front desk'}</b></div>${a.note ? `<div><span>Note</span><b>${esc(a.note)}</b></div>` : ''}</div>
      <div class="c" style="padding:16px 18px"><div class="ch" style="margin-bottom:6px"><h3>Past visits</h3></div><ul class="hist">${hist.length ? hist.map(h => `<li><b>${esc(svc(h.service).name)}</b><span>${fMD(h.date)} · ${esc(first(stf(h.staff).name))}</span></li>`).join('') : '<li><span>First visit</span></li>'}</ul></div></div>
    <div class="dr-f" data-for="${a.id}">${acts}</div>`);
}
function setStatus(id, st) {
  const a = S.appointments.find(x => x.id === id), was = a.status; a.status = st; save();
  apptDrawer(id); rerender();
  const p = $('.dr-h .pill'); p && gsap.fromTo(p, { scale: .7 }, { scale: 1, duration: .45, ease: 'back.out(2.5)' });
  const name = first(cli(a.client).name);
  const msg = { confirmed: `${name}'s booking confirmed`, arrived: `${name} checked in`, completed: `Visit completed · ${money(a.price)}`, cancelled: `${name}'s booking cancelled`, 'no-show': `${name} marked as no-show` }[st];
  toast(msg, () => { a.status = was; save(); apptDrawer(id); rerender(); });
  if (st === 'cancelled') closeDrawer(true);
}

/* ----- new appointment drawer ----- */
let N = null;
function newDrawer(pre = {}) {
  const svcId = pre.service || S.services[0].id;
  N = { service: svcId, staff: pre.staff && stf(pre.staff).services.includes(svcId) ? pre.staff : (S.staff.find(p => p.services.includes(svcId)) || {}).id, date: pre.date || CAL.date, t: pre.t ?? null, client: pre.client || null, newClient: false };
  if (pre.staff && !stf(pre.staff).services.includes(svcId)) { const s2 = S.services.find(s => stf(pre.staff).services.includes(s.id)); if (s2) { N.service = s2.id; N.staff = pre.staff; } }
  drawNew();
}
function drawNew() {
  const s = svc(N.service), p = stf(N.staff), sl = slots(N.date, N.service, N.staff), c = N.client ? cli(N.client) : null;
  if (N.t != null && !sl.some(x => x.t === N.t)) N.t = sl.length ? (sl.find(x => x.t >= N.t) || sl[0]).t : null;
  openDrawer(`<div class="dr-h"><h3>New appointment</h3><button class="ib" data-close aria-label="Close">${I.x}</button></div>
    <div class="dr-b"><div class="form">
      <div class="fld"><span class="lb">Service</span><button class="inp sel" data-pick="service"><span>${esc(s.name)} · ${durT(s.dur)} · ${money(s.price)}</span>${I.down}</button></div>
      <div class="row2"><div class="fld"><span class="lb">Specialist</span><button class="inp sel" data-pick="staff"><span>${esc(p.name)}</span>${I.down}</button></div>
        <div class="fld"><label for="n-date">Date</label><input class="inp" id="n-date" type="date" value="${N.date}" min="${todayISO}"></div></div>
      <div class="fld"><span class="lb">Time · ${sl.length} free</span><div class="slots" id="nSlots">${sl.length ? sl.map(x => `<button data-nt="${x.t}" class="${x.t === N.t ? 'on' : ''}">${tm(x.t)}</button>`).join('') : '<span class="mut">No free time on this day — try another date or specialist.</span>'}</div></div>
      <div class="fld"><span class="lb">Client</span>${N.newClient ? `<div class="row2"><input class="inp" id="n-name" placeholder="Full name"><input class="inp" id="n-phone" placeholder="Phone" inputmode="tel"></div>` : `<button class="inp sel${c ? '' : ' unset'}" data-pick="client"><span>${c ? esc(c.name) + ' · ' + esc(c.phone) : 'Choose a client'}</span>${I.down}</button>`}</div>
      <div class="fld"><label for="n-note">Note <span style="color:var(--dim)">(optional)</span></label><textarea class="inp" id="n-note" rows="2" placeholder="Allergies, preferences…"></textarea></div>
    </div></div>
    <div class="dr-f"><button class="btn" data-close>Cancel</button><button class="btn ink" data-act="saveNew">${I.check}Book appointment</button></div>`);
}
function bookIt(o) {
  const s = svc(o.service), id = 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1e3);
  const a = { id, date: o.date, start: o.t, dur: s.dur, staff: o.staff, service: o.service, client: o.client, status: o.status, price: s.price, source: o.source, note: o.note || '' };
  S.appointments.push(a); save(); return a;
}
function findOrAddClient(name, phone, email) {
  const digits = v => String(v || '').replace(/\D/g, '');
  let c = phone && S.clients.find(x => digits(x.phone) && digits(x.phone) === digits(phone));
  if (!c) { c = { id: 'c' + Date.now().toString(36), name: name.trim(), phone: phone.trim(), email: (email || '').trim() }; S.clients.push(c); }
  return c;
}

/* ----- lists ----- */
const AP_TABS = [['upcoming', 'Upcoming'], ['today', 'Today'], ['past', 'Past'], ['cancelled', 'Cancelled']];
const LIST = { tab: 'upcoming', q: '' };
H.appointments = () => {
  const n = k => apFilter(k).length;
  return `<div class="ph"><div><h1>Appointments</h1><p>Every booking from the front desk and the online page.</p></div><div class="acts"><button class="btn ink" data-act="newAppt">${I.plus}New appointment</button></div></div>
  <div class="tools"><div class="tabs" id="apTabs"><span class="u"></span>${AP_TABS.map(([k, l]) => `<button data-t="${k}" class="${LIST.tab === k ? 'on' : ''}">${l}<small>${n(k)}</small></button>`).join('')}</div>
    <label class="search">${I.search}<input id="apQ" placeholder="Search client or service" value="${esc(LIST.q)}"></label></div>
  <div class="tbl"><div class="tr th ap-g"><span>When</span><span>Client</span><span>Service</span><span class="c-staff">Specialist</span><span class="r">Price</span><span>Status</span></div><div id="apRows"></div></div>`;
};
function apFilter(k) {
  const L = S.appointments;
  if (k === 'today') return L.filter(a => a.date === todayISO && live(a)).sort(byTime);
  if (k === 'past') return L.filter(a => live(a) && isPast(a)).sort(byTime).reverse();
  if (k === 'cancelled') return L.filter(a => !live(a)).sort(byTime).reverse();
  return L.filter(a => live(a) && !isPast(a)).sort(byTime);
}
function apRows() {
  const s = LIST.q.toLowerCase(), rows = apFilter(LIST.tab).filter(a => !s || (cli(a.client).name + svc(a.service).name).toLowerCase().includes(s));
  $('#apRows').innerHTML = rows.length ? rows.map(a => { const c = cli(a.client), sv = svc(a.service), p = stf(a.staff); return `<div class="tr row ap-g" data-appt="${a.id}">
    <div class="when"><b>${tm(a.start)}</b><span>${rel(a.date)}</span></div>
    <div class="who x1"><span class="av tone t-${p.tone}">${ini(c.name)}</span><div><b>${esc(c.name)}</b><span>${esc(c.phone)}</span></div></div>
    <div class="mut">${esc(sv.name)} · ${durT(a.dur)}</div><div class="c-staff"><span class="chip t-${p.tone}">${esc(first(p.name))}</span></div>
    <div class="amt x2">${money(a.price)}</div><div class="x4">${pill(a.status)}</div>
    <span class="meta-m">${rel(a.date)} · ${tm(a.start)} · ${esc(sv.name)}</span></div>`; }).join('') : '<div class="empty">Nothing here yet</div>';
}
H.clients = () => {
  const rows = S.clients.map(c => {
    const mine = S.appointments.filter(a => a.client === c.id), done = mine.filter(a => a.status === 'completed');
    const last = done.sort(byTime).slice(-1)[0], next = mine.filter(a => live(a) && !isPast(a)).sort(byTime)[0];
    return { c, visits: done.length, spent: done.reduce((s, a) => s + a.price, 0), last, next };
  }).sort((a, b) => b.spent - a.spent);
  return `<div class="ph"><div><h1>Clients</h1><p>${S.clients.length} clients · visits, spend and what is coming up.</p></div><div class="acts"><button class="btn ink" data-act="newAppt">${I.plus}New appointment</button></div></div>
  <div class="tbl"><div class="tr th cl-g"><span>Client</span><span class="c-ph">Phone</span><span class="r">Visits</span><span>Last visit</span><span>Next visit</span><span class="r">Spent</span></div>
  ${rows.map(r => `<div class="tr row cl-g" data-client="${r.c.id}"><div class="who x1"><span class="av">${ini(r.c.name)}</span><div><b>${esc(r.c.name)}</b><span>${esc(r.c.email || '')}</span></div></div>
    <span class="mut c-ph">${esc(r.c.phone)}</span><span class="amt">${r.visits}</span><span class="mut">${r.last ? fMD(r.last.date) : '—'}</span><span class="mut x4">${r.next ? rel(r.next.date) + ', ' + tm(r.next.start) : '—'}</span><span class="amt x2">${money(r.spent)}<span class="m-only" style="font-weight:500;color:var(--muted)"> spent</span></span>
    <span class="meta-m">${r.visits} visit${r.visits === 1 ? '' : 's'}${r.last ? ' · last ' + fMD(r.last.date) : ''}</span></div>`).join('')}</div>`;
};
function clientDrawer(id) {
  const c = cli(id), mine = S.appointments.filter(a => a.client === id).sort(byTime).reverse();
  const spent = mine.filter(a => a.status === 'completed').reduce((s, a) => s + a.price, 0);
  openDrawer(`<div class="dr-h"><h3>${esc(c.name)}</h3><button class="ib" data-close aria-label="Close">${I.x}</button></div>
    <div class="dr-b"><div class="kv"><div><span>Phone</span><b>${esc(c.phone)}</b></div><div><span>Email</span><b>${esc(c.email || '—')}</b></div><div><span>Visits</span><b>${mine.filter(a => a.status === 'completed').length}</b></div><div><span>Spent</span><b>${money(spent)}</b></div></div>
      <div class="c" style="padding:16px 18px"><div class="ch" style="margin-bottom:6px"><h3>History</h3></div><ul class="hist">${mine.map(a => `<li class="clk" data-appt="${a.id}" style="cursor:pointer"><div><b>${esc(svc(a.service).name)}</b><br><span>${fShort(a.date)} · ${tm(a.start)} · ${esc(first(stf(a.staff).name))}</span></div>${pill(a.status)}</li>`).join('')}</ul></div></div>
    <div class="dr-f"><button class="btn ink" data-newfor="${id}">${I.plus}Book appointment</button></div>`);
}
H.services = () => {
  const d = todayISO;
  return `<div class="ph"><div><h1>Services & team</h1><p>What you offer, how long it takes and who does it.</p></div></div>
  <div class="two">
    <div><div class="tbl"><div class="tr th sv-g"><span>Service</span><span>Category</span><span class="r">Minutes</span><span class="r">Price</span><span class="r">Online</span></div>
      ${S.services.map(s => `<div class="tr sv-g"><div class="who x1"><div><b>${esc(s.name)}</b><span>${esc(s.note || '')}</span></div></div><span><span class="chip">${esc(s.cat)}</span></span>
        <span class="r"><input class="inl" data-sv="${s.id}:dur" value="${s.dur}" inputmode="numeric" aria-label="Minutes"></span><span class="r x2"><input class="inl" data-sv="${s.id}:price" value="${s.price}" inputmode="decimal" aria-label="Price"></span>
        <span class="r x4"><button class="sw${s.online ? ' on' : ''}" data-online="${s.id}" role="switch" aria-checked="${s.online}" aria-label="Bookable online"><i></i></button></span>
        <span class="meta-m">${esc(s.cat)} · ${durT(s.dur)}</span></div>`).join('')}</div></div>
    <div class="team">${S.staff.map(p => {
      const mins = S.appointments.filter(a => a.date === d && a.staff === p.id && live(a)).reduce((s, a) => s + a.dur, 0), work = (p.hours[1] - p.hours[0]) * 60;
      return `<div class="tm-c t-${p.tone}"><div class="top-l"><span class="av lg tone t-${p.tone}">${ini(p.name)}</span><div><b>${esc(p.name)}</b><span>${esc(p.role)}</span></div></div>
        <div><div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--muted);margin-bottom:6px"><span>Booked today</span><b style="color:var(--ink);font-weight:600">${Math.round(mins / work * 100)}%</b></div><div class="load"><i style="width:${Math.min(100, mins / work * 100)}%"></i></div></div>
        <div class="chips">${p.services.map(id => `<span class="chip t-${p.tone}">${esc(svc(id).name)}</span>`).join('')}</div>
        <div class="hrs"><span>Working hours</span><b>${hr(p.hours[0])} – ${hr(p.hours[1])}</b></div></div>`; }).join('')}</div>
  </div>`;
};
H.settings = () => {
  const B = S.business, T = S.settings;
  const f = (k, l, v) => `<div class="fld"><label for="s-${k}">${l}</label><input class="inp" id="s-${k}" data-s="${k}" value="${esc(v)}"></div>`;
  const n = (k, l, v) => `<div class="fld"><label for="t-${k}">${l}</label><input class="inp" id="t-${k}" data-t="${k}" value="${v}" inputmode="numeric"></div>`;
  return `<div class="ph"><div><h1>Settings</h1><p>Your studio, booking rules and the booking page.</p></div><div class="acts"><button class="btn" data-go="book">${I.eye}Open booking page</button><button class="btn ink" data-act="saveSettings">${I.save}Save changes</button></div></div>
  <div class="two"><div class="c form"><div class="ch"><div><h3>Your studio</h3><p>Shown on the booking page</p></div></div>
      <div class="row2">${f('name', 'Name', B.name)}${f('kind', 'What you do', B.kind)}</div>${f('address', 'Address', B.address)}<div class="row2">${f('phone', 'Phone', B.phone)}${f('email', 'Email', B.email)}</div></div>
    <div style="display:flex;flex-direction:column;gap:22px"><div class="c form"><div class="ch"><div><h3>Booking rules</h3><p>What clients can pick online</p></div></div>
      <div class="fld"><span class="lb">Time slots every</span><div class="seg" id="stepSeg"><span class="u"></span>${[15, 30, 60].map(m => `<button data-step="${m}" class="${T.step === m ? 'on' : ''}">${m} min</button>`).join('')}</div></div>
      <div class="row2">${n('notice', 'Minimum notice (hours)', T.notice)}${n('ahead', 'Book up to (days ahead)', T.ahead)}</div>
      <div class="row2">${n('open', 'Opens at (hour, 24h)', T.open)}${n('close', 'Closes at (hour, 24h)', T.close)}</div></div>
      <div class="c"><div class="set"><div><b>Sounds</b><span>Soft clicks when you work</span></div><button class="sw${SFX.isOn() ? ' on' : ''}" data-sw="sound" role="switch" aria-checked="${SFX.isOn()}"><i></i></button></div>
        <div class="set"><div><b>Sample data</b><span>Clear everything and load the demo again</span></div><button class="btn xs" data-act="reset">Reset</button></div></div></div></div>`;
};

/* ============ BOOKING PAGE ============ */
let B = { step: 0, service: null, staff: 'any', date: todayISO, t: null, at: null, done: null };
const STEP_T = ['Choose a service', 'Choose a specialist', 'Pick a time', 'Your details'];
H.book = () => {
  const Bz = S.business, T = S.settings;
  return `<div class="bk">
    <div class="bk-hero"><div class="who"><span class="lgo">${ini(Bz.name)}</span><div><h1>${esc(Bz.name)}</h1><p>${esc(Bz.kind)} · ${esc(Bz.address)}</p></div></div><span class="open">Open today ${hr(T.open)} – ${hr(T.close)}</span></div>
    <div><div class="steps" id="bkSteps">${[0, 1, 2, 3].map(() => '<span><i></i></span>').join('')}</div><div class="bk-card" id="bkCard"></div></div>
    <aside class="sum" id="bkSum"></aside>
  </div>`;
};
function bkDraw(dir = 1) {
  const card = $('#bkCard'); if (!card) return;
  const s = B.service && svc(B.service);
  let h = '';
  if (B.done) {
    const a = S.appointments.find(x => x.id === B.done), p = stf(a.staff);
    h = `<div class="done"><span class="chk"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><h2>You're booked!</h2><p>We sent the details to your phone. See you at ${esc(S.business.name)}.</p>
      <div class="ticket t-${p.tone}"><small>${fLong(a.date)}</small><span class="big">${tm(a.start)}</span><span class="sub">${esc(svc(a.service).name)} with ${esc(first(p.name))} · ${durT(a.dur)}</span></div>
      <div class="acts"><button class="btn" data-act="ics">${I.dl}Add to calendar</button><button class="btn ink" data-act="bookAgain">${I.plus}Book another</button></div></div>`;
  } else if (B.step === 0) {
    const cats = [...new Set(S.services.filter(x => x.online).map(x => x.cat))];
    h = `<div class="sh"><div><h2>${STEP_T[0]}</h2><p>Prices include everything. Pay at the studio.</p></div></div>` + cats.map(c => `<div class="cat">${esc(c)}</div>` + S.services.filter(x => x.online && x.cat === c).map(x => `<button class="opt t-${catIco(x.cat)[0]}${B.service === x.id ? ' on' : ''}" data-bs="${x.id}"><span class="ico">${catIco(x.cat)[1]}</span><span class="t"><b>${esc(x.name)}</b><span>${esc(x.note)}</span></span><span class="p"><b>${money(x.price)}</b><span>${durT(x.dur)}</span></span></button>`).join('')).join('');
  } else if (B.step === 1) {
    const team = S.staff.filter(p => p.services.includes(B.service)), nf = id => { const n = nextFree(B.service, id); return n ? `Next free: ${rel(n.date)}, ${tm(n.t)}` : 'Fully booked'; };
    h = `<div class="sh"><div><h2>${STEP_T[1]}</h2><p>${esc(s.name)} · ${durT(s.dur)}</p></div><button class="btn sm" data-bk="back">${I.l}Back</button></div>
      <button class="opt${B.staff === 'any' ? ' on' : ''}" data-bp="any"><span class="ico" style="background:var(--ink);color:#fff">${I.users}</span><span class="t"><b>Anyone available</b><span>${nf('any')}</span></span></button>` +
      team.map(p => `<button class="opt t-${p.tone}${B.staff === p.id ? ' on' : ''}" data-bp="${p.id}"><span class="ico">${ini(p.name)}</span><span class="t"><b>${esc(p.name)}</b><span>${esc(p.role)} · ${nf(p.id)}</span></span></button>`).join('');
  } else if (B.step === 2) {
    const days = Array.from({ length: 14 }, (_, i) => addDays(todayISO, i)).map(d => ({ d, n: slots(d, B.service, B.staff).length }));
    if (!days.find(x => x.d === B.date && x.n)) B.date = (days.find(x => x.n) || days[0]).d;
    const sl = slots(B.date, B.service, B.staff), grp = [['Morning', 0, 720], ['Afternoon', 720, 1020], ['Evening', 1020, 1440]];
    h = `<div class="sh"><div><h2>${STEP_T[2]}</h2><p>${esc(s.name)} · ${B.staff === 'any' ? 'any specialist' : 'with ' + esc(first(stf(B.staff).name))}</p></div><button class="btn sm" data-bk="back">${I.l}Back</button></div>
      <div class="days">${days.map(x => `<button data-bd="${x.d}" class="${x.d === B.date ? 'on' : ''}"${x.n ? '' : ' disabled'}><small>${x.d === todayISO ? 'Today' : fdo(x.d, { weekday: 'short' })}</small><b>${+x.d.slice(8)}</b><span>${x.n ? x.n + ' free' : 'Full'}</span></button>`).join('')}</div>
      ${grp.map(([l, a, b]) => { const g = sl.filter(x => x.t >= a && x.t < b); return g.length ? `<div class="tgrp"><small>${l}</small><div class="slots">${g.map(x => `<button data-bt="${x.t}" data-bst="${x.staff}" class="${B.t === x.t && B.at === B.date ? 'on' : ''}">${tm(x.t)}</button>`).join('')}</div></div>` : ''; }).join('') || '<p class="mut" style="margin-top:14px">No free times this day.</p>'}`;
  } else {
    h = `<div class="sh"><div><h2>${STEP_T[3]}</h2><p>${fLong(B.date)} at ${tm(B.t)}</p></div><button class="btn sm" data-bk="back">${I.l}Back</button></div>
      <div class="form"><div class="fld"><label for="b-name">Your name</label><input class="inp" id="b-name" autocomplete="name" placeholder="First and last name"></div>
        <div class="row2"><div class="fld"><label for="b-phone">Phone</label><input class="inp" id="b-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+1 555 123 4567"></div><div class="fld"><label for="b-email">Email <span style="color:var(--dim)">(optional)</span></label><input class="inp" id="b-email" type="email" autocomplete="email" placeholder="you@mail.com"></div></div>
        <div class="fld"><label for="b-note">Anything we should know? <span style="color:var(--dim)">(optional)</span></label><textarea class="inp" id="b-note" rows="2" placeholder="Allergies, hair length, preferences…"></textarea></div>
        <button class="btn hot" style="height:52px;font-size:15px" data-act="confirmBook">${I.check}Confirm booking</button>
        <p class="mut" style="font-size:12.5px;text-align:center">Free cancellation up to 24 hours before your visit.</p></div>`;
  }
  card.innerHTML = h;
  const done = B.done ? 4 : B.step;
  $$('#bkSteps i').forEach((el, i) => gsap.to(el, { scaleX: i < done ? 1 : i === done ? .35 : 0, duration: .5, ease: 'soft' }));
  gsap.fromTo(card.children, { autoAlpha: 0, x: 14 * dir }, { autoAlpha: 1, x: 0, duration: .45, stagger: .03, ease: 'soft', clearProps: 'transform,opacity,visibility' });
  bkSum();
}
function bkSum() {
  const el = $('#bkSum'); if (!el) return;
  const s = B.service && svc(B.service), p = B.staff !== 'any' ? stf(B.staff) : null, ph = t => `<b class="nil">${t}</b>`;
  el.innerHTML = `<h3>Your booking</h3>
    <div><div class="ln"><span>Service</span>${s ? `<b>${esc(s.name)}</b>` : ph('Not chosen')}</div>
    <div class="ln"><span>Specialist</span>${B.step >= 1 || B.done ? `<b>${p ? esc(p.name) : B.t != null && B.res ? esc(stf(B.res).name) : 'Anyone available'}</b>` : ph('—')}</div>
    <div class="ln"><span>Date</span>${B.t != null ? `<b>${fShort(B.date)}</b>` : ph('—')}</div>
    <div class="ln"><span>Time</span>${B.t != null ? `<b>${tm(B.t)}${s ? ' – ' + tm(B.t + s.dur) : ''}</b>` : ph('—')}</div>
    <div class="ln"><span>Duration</span>${s ? `<b>${durT(s.dur)}</b>` : ph('—')}</div></div>
    <div class="tot"><span>Total</span><b>${s ? money(s.price) : '$0'}</b></div>
    <p class="note">${esc(S.business.address)} · ${esc(S.business.phone)}</p>`;
}
function ics(a) {
  const d = a.date.replace(/-/g, ''), t = m => pad(Math.floor(m / 60)) + pad(m % 60) + '00', s = svc(a.service);
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tempo//Booking//EN', 'BEGIN:VEVENT', `UID:${a.id}@tempo`, `DTSTAMP:${d}T000000`, `DTSTART:${d}T${t(a.start)}`, `DTEND:${d}T${t(a.start + a.dur)}`, `SUMMARY:${s.name} at ${S.business.name}`, `LOCATION:${S.business.address.replace(/,/g, '\\,')}`, `DESCRIPTION:With ${stf(a.staff).name}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); el.download = 'appointment.ics'; el.click(); setTimeout(() => URL.revokeObjectURL(el.href), 1000);
  toast('Calendar file downloaded');
}

/* ---------- Clicks ---------- */
const flash = el => el && gsap.fromTo(el, { boxShadow: '0 0 0 2px rgba(194,58,43,.55)' }, { boxShadow: '0 0 0 0px rgba(194,58,43,0)', duration: 1.2, clearProps: 'boxShadow' });
document.addEventListener('click', e => {
  const t = e.target, el = s => t.closest(s); let x;
  if (el('[data-close]')) return closeDrawer();
  if ((x = el('[data-go]'))) { e.preventDefault(); return go(x.dataset.go); }
  // booking page
  if ((x = el('[data-bs]'))) { B.service = x.dataset.bs; B.staff = 'any'; B.t = null; B.step = 1; SFX.play('tick'); return bkDraw(); }
  if ((x = el('[data-bp]'))) { B.staff = x.dataset.bp; B.t = null; B.step = 2; SFX.play('tick'); return bkDraw(); }
  if ((x = el('[data-bd]'))) { B.date = x.dataset.bd; B.t = null; SFX.play('tick'); bkDraw(0); return; }
  if ((x = el('[data-bt]'))) { B.t = +x.dataset.bt; B.at = B.date; B.res = x.dataset.bst; B.step = 3; SFX.play('tick'); return bkDraw(); }
  if (el('[data-bk="back"]')) { B.step = Math.max(0, B.step - 1); return bkDraw(-1); }
  // dashboard
  if ((x = el('[data-appt]'))) return apptDrawer(x.dataset.appt);
  if ((x = el('[data-client]'))) return clientDrawer(x.dataset.client);
  if ((x = el('[data-st]'))) return setStatus(el('[data-for]').dataset.for, x.dataset.st);
  if ((x = el('[data-rebook]'))) { const a = S.appointments.find(y => y.id === x.dataset.rebook); return newDrawer({ service: a.service, staff: a.staff, client: a.client, date: CAL.date < todayISO ? todayISO : CAL.date }); }
  if ((x = el('[data-newfor]'))) return newDrawer({ client: x.dataset.newfor, date: todayISO < CAL.date ? CAL.date : todayISO });
  if ((x = el('[data-nt]'))) { N.t = +x.dataset.nt; $$('#nSlots button').forEach(b => b.classList.toggle('on', b === x)); return; }
  if ((x = el('[data-pick]'))) return pick(x);
  if ((x = el('[data-who]'))) { const id = x.dataset.who; CAL.hide.has(id) ? CAL.hide.delete(id) : CAL.hide.add(id); if (CAL.hide.size === S.staff.length) CAL.hide.delete(id); x.classList.toggle('off', CAL.hide.has(id)); return drawGrid(); }
  if ((x = el('[data-nav]'))) { const n = +x.dataset.nav; CAL.date = n === 0 ? todayISO : addDays(CAL.date, n * (CAL.view === 'week' ? 7 : 1)); CAL.month = null; return rerender(true); }
  if ((x = el('[data-view]'))) { if (x.classList.contains('on')) return; CAL.view = x.dataset.view; return rerender(true); }
  if ((x = el('.mini-g [data-day], .gh[data-day]'))) { CAL.date = x.dataset.day; if (x.classList.contains('gh')) CAL.view = 'day'; CAL.month = null; return rerender(true); }
  if ((x = el('[data-mon]'))) { const m = CAL.month || CAL.date.slice(0, 7), d = dt(m + '-01'); d.setMonth(d.getMonth() + +x.dataset.mon); CAL.month = iso(d).slice(0, 7); return miniCal(); }
  if ((x = el('.g-col'))) { if (x.dataset.col === 'week') return newDrawer({ date: x.dataset.date < todayISO ? todayISO : x.dataset.date }); const m = slotFromEvent(x, e); const staff = x.dataset.col === 'week' ? (S.staff.find(p => isFree(p.id, x.dataset.date, m, 30)) || S.staff[0]).id : x.dataset.col; return newDrawer({ staff, date: x.dataset.date < todayISO ? todayISO : x.dataset.date, t: m }); }
  if ((x = el('#apTabs button'))) { LIST.tab = x.dataset.t; $$('#apTabs button').forEach(b => b.classList.toggle('on', b === x)); moveU($('#apTabs')); return apRows(); }
  if ((x = el('[data-online]'))) { const s = svc(x.dataset.online); s.online = !s.online; setSw(x, s.online); save(); return toast(`${s.name} ${s.online ? 'is bookable online' : 'hidden from the booking page'}`); }
  if ((x = el('[data-step]'))) { S.settings.step = +x.dataset.step; $$('#stepSeg button').forEach(b => b.classList.toggle('on', b === x)); moveU($('#stepSeg')); return; }
  if ((x = el('[data-sw="sound"]'))) { const on = !x.classList.contains('on'); setSw(x, on); SFX.set(on); soundIcon(); SFX.play(on ? 'on' : 'off'); return; }
  if ((x = el('[data-act]'))) return ACT[x.dataset.act]?.(x);
});
function setSw(b, on) { b.classList.toggle('on', on); b.setAttribute('aria-checked', on); gsap.fromTo($('i', b), { x: on ? -18 : 18 }, { x: 0, duration: .3, ease: 'soft' }); }
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'apQ') { LIST.q = t.value; apRows(); }
  if (t.dataset.sv) { const [id, k] = t.dataset.sv.split(':'), v = +t.value.replace(/[^\d.]/g, ''); if (v > 0) { svc(id)[k] = k === 'dur' ? Math.round(v) : v; save(); } }
});
document.addEventListener('change', e => { if (e.target.id === 'n-date' && N) { N.date = e.target.value || todayISO; drawNew(); } });

function pick(btn) {
  const k = btn.dataset.pick;
  if (k === 'service') return openMenu(btn, S.services.map(s => ({ v: s.id, html: `<span><b style="font-weight:600">${esc(s.name)}</b><small>${durT(s.dur)} · ${money(s.price)}</small></span>` })), v => { N.service = v; if (!stf(N.staff).services.includes(v)) N.staff = (S.staff.find(p => p.services.includes(v)) || {}).id; drawNew(); }, N.service);
  if (k === 'staff') return openMenu(btn, S.staff.filter(p => p.services.includes(N.service)).map(p => ({ v: p.id, html: `<span class="av sm tone t-${p.tone}">${ini(p.name)}</span><span><b style="font-weight:600">${esc(p.name)}</b><small>${esc(p.role)}</small></span>` })), v => { N.staff = v; drawNew(); }, N.staff);
  if (k === 'client') return openMenu(btn, S.clients.map(c => ({ v: c.id, html: `<span class="av sm">${ini(c.name)}</span><span><b style="font-weight:600">${esc(c.name)}</b><small>${esc(c.phone)}</small></span>` })).concat([{ v: '__new', html: `${I.plus}<span>New client</span>` }]), v => { if (v === '__new') { N.newClient = true; N.client = null; } else N.client = v; drawNew(); }, N.client);
}

/* ---------- Actions ---------- */
const ACT = {
  newAppt: () => newDrawer({ date: CAL.date < todayISO ? todayISO : CAL.date }),
  saveNew: () => {
    if (N.t == null) { toast('Pick a time first'); return flash($('#nSlots')); }
    let client = N.client;
    if (N.newClient) { const nm = $('#n-name').value.trim(), ph = $('#n-phone').value.trim(); if (!nm) { flash($('#n-name')); return toast('Add the client name'); } client = findOrAddClient(nm, ph).id; }
    if (!client) { flash($('[data-pick="client"]')); return toast('Choose a client'); }
    const a = bookIt({ service: N.service, staff: N.staff, date: N.date, t: N.t, client, status: 'confirmed', source: 'desk', note: $('#n-note').value.trim() });
    closeDrawer(true); HL = a.id; CAL.date = a.date; CAL.month = null;
    if (cur !== 'calendar') go('calendar'); else rerender(true);
    toast(`Booked ${first(cli(client).name)} · ${rel(a.date)}, ${tm(a.start)} with ${first(stf(a.staff).name)}`, () => { S.appointments.splice(S.appointments.indexOf(a), 1); save(); rerender(); });
  },
  confirmBook: () => {
    const nm = $('#b-name').value.trim(), ph = $('#b-phone').value.trim();
    if (!nm) { flash($('#b-name')); return toast('Please add your name'); }
    if (ph.replace(/\D/g, '').length < 7) { flash($('#b-phone')); return toast('Please add a phone number'); }
    const staff = B.staff === 'any' ? B.res : B.staff;
    if (!isFree(staff, B.date, B.t, svc(B.service).dur)) { toast('That time was just taken — please pick another'); B.step = 2; return bkDraw(-1); }
    const c = findOrAddClient(nm, ph, $('#b-email').value);
    const a = bookIt({ service: B.service, staff, date: B.date, t: B.t, client: c.id, status: 'booked', source: 'online', note: $('#b-note').value.trim() });
    B.done = a.id; HL = a.id; CAL.date = a.date; CAL.view = 'day'; CAL.month = null; bkDraw();
    gsap.fromTo('.done .chk', { scale: .3, rotate: -30 }, { scale: 1, rotate: 0, duration: .7, ease: 'back.out(2.2)' });
    SFX.play('ding');
  },
  ics: () => ics(S.appointments.find(a => a.id === B.done)),
  bookAgain: () => { B = { step: 0, service: null, staff: 'any', date: todayISO, t: null, done: null }; bkDraw(-1); },
  saveSettings: () => {
    $$('[data-s]').forEach(i => { S.business[i.dataset.s] = i.value.trim(); });
    $$('[data-t]').forEach(i => { const v = +i.value; if (!isNaN(v) && i.value !== '') S.settings[i.dataset.t] = v; });
    S.settings.close = Math.max(S.settings.close, S.settings.open + 1);
    save(); brand(); toast('Settings saved');
  },
  reset: () => { const old = S; S = seed(); save(); brand(); cur = null; go('calendar'); toast('Sample data loaded', () => { S = old; save(); brand(); cur = null; go('calendar'); }); }
};

/* ---------- Underline / pill sliders ---------- */
function moveU(root, d = .35) { if (!root) return; const b = $('.on', root), u = $(':scope > .u', root); if (!b || !u) return; gsap.to(u, { x: b.offsetLeft, width: b.offsetWidth, duration: d, ease: 'soft' }); }

/* ---------- Router ---------- */
const nav = $('#nav'), tabbar = $('#tabbar');
nav.insertAdjacentHTML('beforeend', PAGES.map(([id, l, ic]) => `<a href="#${id}" data-page="${id}">${ic}<span>${l}</span></a>`).join(''));
tabbar.innerHTML = PAGES.map(([id, l, ic]) => `<a href="#${id}" data-page="${id}">${ic}${l.replace('Appointments', 'Bookings')}</a>`).join('');
function brand() { $('#bizName').textContent = S.business.name; $('#meAv').textContent = ini(S.business.owner); }
let cur = null;
function count(el, to, d = 1) { const o = { v: 0 }; gsap.to(o, { v: to, duration: d, ease: 'power2.out', onUpdate: () => el.textContent = money(o.v) }); }
function after(id, page, first) {
  if (id === 'calendar') { miniCal(); drawGrid(); moveU($('#viewSeg'), 0); }
  if (id === 'appointments') { apRows(); moveU($('#apTabs'), 0); }
  if (id === 'settings') moveU($('#stepSeg'), 0);
  if (id === 'book') bkDraw();
}
function rerender(anim) {
  if (!cur || cur === 'book') return bkSum();
  const page = $('#p-' + cur), y = scrollY; page.innerHTML = H[cur](); after(cur, page); scrollTo(0, y);
  $$('[data-n]', page).forEach(el => anim ? count(el, +el.dataset.n, .6) : (el.textContent = money(+el.dataset.n)));
  if (anim && cur === 'calendar') gsap.fromTo('#grid .appt', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .012, ease: 'soft', clearProps: 'opacity,visibility,transform' });
}
function go(id, first) {
  if (PUBLIC) id = 'book';
  if (!H[id]) id = 'calendar';
  if (id === cur) return;
  if (!first) SFX.play('page');
  closeMenu(); if (drawerOpen) closeDrawer(true);
  cur = id;
  document.body.classList.toggle('preview', id === 'book' && !PUBLIC);
  $$('.nav a, .tabbar a').forEach(a => a.classList.toggle('on', a.dataset.page === id));
  moveU(nav, first ? 0 : .4);
  if (!PUBLIC && location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  document.title = PUBLIC ? `Book · ${S.business.name}` : `${id === 'book' ? 'Booking page' : PAGES.find(p => p[0] === id)[1]} · Tempo`;
  if (id === 'book' && !B.done) B.step = B.step || 0;
  if (id !== 'book' && B.done) B = { step: 0, service: null, staff: 'any', date: todayISO, t: null, done: null };
  $$('.page.cur').forEach(p => p.classList.remove('cur'));
  const page = $('#p-' + id); page.innerHTML = H[id](); page.classList.add('cur'); scrollTo(0, 0);
  after(id, page, first);
  const items = id === 'calendar' ? $$('.cal-side > *, .cal-bar, #grid', page) : id === 'book' ? $$('.bk-hero, .steps, .sum', page) : $$(':scope > .ph, :scope > .tools, :scope > .tbl, :scope > .two > *', page);
  gsap.fromTo(items, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, stagger: .04, ease: 'soft', delay: first ? .1 : 0, clearProps: 'transform,opacity,visibility' });
  if (id === 'calendar') gsap.fromTo('#grid .appt', { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: .45, stagger: .02, delay: first ? .35 : .15, ease: 'soft', clearProps: 'opacity,visibility,transform' });
  $$('[data-n]', page).forEach(el => count(el, +el.dataset.n));
}
$$('.nav a, .tabbar a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.dataset.page); }));
$('.brand').addEventListener('click', e => { e.preventDefault(); go('calendar'); });
addEventListener('hashchange', () => go(location.hash.slice(1)));
addEventListener('resize', () => { moveU(nav, 0); ['#viewSeg', '#apTabs', '#stepSeg'].forEach(s => moveU($(s), 0)); });

/* ---------- Sound button + generic click ---------- */
const soundB = $('#soundB');
function soundIcon() { soundB.innerHTML = SFX.isOn() ? I.vol : I.mute; soundB.setAttribute('aria-pressed', SFX.isOn()); soundB.setAttribute('aria-label', SFX.isOn() ? 'Mute sounds' : 'Turn sounds on'); }
soundB.addEventListener('click', () => { SFX.set(!SFX.isOn()); soundIcon(); SFX.play('on'); const s = $('[data-sw="sound"]'); s && setSw(s, SFX.isOn()); });
soundIcon();
document.addEventListener('click', e => { if (!SFX.recent() && e.target.closest('button, a, .row, .g-col')) SFX.play('click'); });

/* ---------- Boot ---------- */
brand();
if (!PUBLIC) gsap.from('.top > *', { autoAlpha: 0, y: -8, duration: .5, stagger: .06, ease: 'soft' });
go(location.hash.slice(1) || 'calendar', true);

/* ---------- Small public API (handy for scripting and tests) ---------- */
window.TEMPO = {
  go, toast, data: () => S,
  scroll: (y, d = 1) => { const o = { y: scrollY }; return gsap.to(o, { y, duration: d, ease: 'power2.inOut', onUpdate: () => scrollTo(0, o.y) }); },
  type(sel, text, d = 1) { const el = $(sel); if (!el) return; el.focus({ preventScroll: true }); const o = { i: 0 }; gsap.to(o, { i: text.length, duration: d, ease: 'none', onUpdate: () => { const v = text.slice(0, Math.round(o.i)); if (el.value !== v) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } } }); }
};
})();
