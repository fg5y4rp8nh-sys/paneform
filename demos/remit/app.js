/* Remit — app logic. Vanilla JS + GSAP (free for commercial use) + jsPDF (MIT). */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ini = s => String(s).replace(/[^A-Za-z& ]/g, '').split(' ').filter(w => w && w !== '&').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const mq = matchMedia('(max-width:720px)');
gsap.registerPlugin(CustomEase);
CustomEase.create('soft', '0.25,1,0.4,1');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.globalTimeline.timeScale(20);

/* ---------- Icons ---------- */
const svg = p => `<svg class="ic" viewBox="0 0 24 24">${p}</svg>`;
const I = {
  home: svg('<path d="M4 10.5 12 4l8 6.5V20a.5.5 0 0 1-.5.5H15v-6H9v6H4.5A.5.5 0 0 1 4 20z"/>'),
  inv: svg('<path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z"/><path d="M9 8.5h6M9 12h6M9 15.5h3"/>'),
  quote: svg('<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4M10 13h5M10 16.5h3"/>'),
  users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  trash: svg('<path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13"/>'),
  down: svg('<path d="m6 9 6 6 6-6"/>'),
  pdf: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  send: svg('<path d="M21 3 3 10.5l7 3 3 7.5zM10 13.5 21 3"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  bell: svg('<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9M10 20a2 2 0 0 0 4 0"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>'),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>'),
  vol: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'),
  save: svg('<path d="M5 4.5h11l3.5 3.5v11.5h-15z"/><path d="M8 4.5v5h7v-5M8 19.5v-6h8v6"/>'),
  convert: svg('<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>')
};

/* ---------- Sound ---------- */
const SFX = (() => {
  let ctx = null, on = true, last = -1e9; const bufs = {};
  try { const st = localStorage.getItem('remit-sound'); if (st) on = st !== 'off'; } catch (e) { }
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
  return { play, recent: () => performance.now() - last < 40, isOn: () => on, set(v) { on = v; try { localStorage.setItem('remit-sound', v ? 'on' : 'off'); } catch (e) { } } };
})();

/* ---------- Dates ---------- */
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const todayISO = iso(TODAY);
const addDays = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return iso(d); };
const dayDiff = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
const fd = (s, y) => new Date(s + 'T00:00').toLocaleDateString('en-US', y ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' });

/* ---------- Store ---------- */
const KEY = 'remit-data-v1';
function seed() {
  const items = a => a.map(([d, q, r]) => ({ d, q, r }));
  const S = {
    business: { ...DATA.business }, settings: { ...DATA.settings },
    clients: DATA.clients.map(c => ({ ...c })),
    invoices: DATA.invoices.map(v => {
      const issued = addDays(todayISO, v.issued);
      return { id: 'i' + v.n, n: v.n, client: v.client, issued, due: addDays(issued, v.terms), status: v.status, paidOn: v.paid != null ? addDays(todayISO, v.paid) : null, items: items(v.items), tax: v.tax || 0, discount: v.discount || 0, notes: '' };
    }),
    quotes: DATA.quotes.map(v => {
      const issued = addDays(todayISO, v.issued);
      return { id: 'q' + v.n, n: v.n, client: v.client, issued, valid: addDays(issued, v.valid), status: v.status, items: items(v.items), tax: v.tax || 0, discount: v.discount || 0, notes: '' };
    }),
    activity: DATA.activity.map(([k, n, d, text]) => ({ k, t: addDays(todayISO, d), text }))
  };
  return S;
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || !S.invoices) S = seed();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };

/* ---------- Money & documents ---------- */
const money = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: S.settings.currency || 'USD', minimumFractionDigits: 2 }).format(v || 0);
const money0 = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: S.settings.currency || 'USD', maximumFractionDigits: 0 }).format(v || 0);
const round2 = v => Math.round(v * 100) / 100;
function totals(doc) {
  const sub = round2(doc.items.reduce((s, it) => s + (+it.q || 0) * (+it.r || 0), 0));
  const disc = round2(sub * (+doc.discount || 0) / 100);
  const tax = round2((sub - disc) * (+doc.tax || 0) / 100);
  return { sub, disc, tax, total: round2(sub - disc + tax) };
}
const isQuote = d => d && 'valid' in d;
const docNo = d => (isQuote(d) ? S.settings.quotePrefix : S.settings.invoicePrefix) + String(d.n).padStart(4, '0');
const client = id => S.clients.find(c => c.id === id) || { name: 'Unknown client', contact: '', email: '' };
function status(d) {
  if (isQuote(d)) return d.status === 'sent' && d.valid < todayISO ? 'expired' : d.status;
  if (d.status === 'sent' && d.due < todayISO) return 'overdue';
  return d.status;
}
const LABEL = { draft: 'Draft', sent: 'Sent', overdue: 'Overdue', paid: 'Paid', accepted: 'Accepted', declined: 'Declined', expired: 'Expired', converted: 'Invoiced' };
const pill = s => `<span class="pill ${s}">${LABEL[s]}</span>`;
const byNewest = (a, b) => b.n - a.n;
function log(k, text) { S.activity.unshift({ k, t: todayISO, text }); S.activity = S.activity.slice(0, 30); }

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

/* ---------- Dropdown menu ---------- */
const menu = $('#menu'); let menuPick = null, menuFor = null;
function openMenu(anchor, items, onPick, current) {
  menuPick = onPick; menuFor = anchor;
  menu.innerHTML = items.map((it, i) => `<button data-i="${i}" class="${it.v === current ? 'on' : ''}">${it.html || esc(it.label)}</button>`).join('');
  const r = anchor.getBoundingClientRect(), w = Math.max(r.width, 220);
  menu.style.width = w + 'px'; menu.style.left = Math.min(r.left, innerWidth - w - 10) + 'px';
  const below = innerHeight - r.bottom > 260;
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

/* ---------- The document (preview, drawer) ---------- */
function docHTML(d) {
  const B = S.business, c = client(d.client), t = totals(d), q = isQuote(d), st = d.id ? status(d) : 'draft';
  const rows = d.items.filter(it => it.d || +it.r).map(it => `<tr><td class="desc">${esc(it.d) || '<span style="color:var(--dim)">Item</span>'}</td><td class="r">${+it.q || 0}</td><td class="r">${money(+it.r || 0)}</td><td class="r">${money((+it.q || 0) * (+it.r || 0))}</td></tr>`).join('')
    || `<tr><td class="desc phd" colspan="4">Add a line to see it here</td></tr>`;
  return `<div class="doc">
    <div class="d-top"><div class="d-biz"><b>${esc(B.name)}</b><span>${esc(B.address)}</span><span>${esc(B.email)} · ${esc(B.phone)}</span></div>
      <div class="d-type"><h2>${q ? 'Quote' : 'Invoice'}</h2><span>${docNo(d)}</span>${st === 'paid' ? '<div class="stamp">PAID</div>' : ''}</div></div>
    <div class="d-meta"><div><small>${q ? 'Prepared for' : 'Bill to'}</small>${d.client ? `<b>${esc(c.name)}</b><span>${esc(c.contact)}</span><span>${esc(c.email)}</span>` : '<span style="color:var(--dim)">Choose a client</span>'}</div>
      <div><small>Issued</small><b>${fd(d.issued, 1)}</b></div>
      <div><small>${q ? 'Valid until' : 'Due'}</small><b>${fd(q ? d.valid : d.due, 1)}</b>${!q && st !== 'paid' && t.total > 0 ? `<span class="d-due">${money(t.total)}</span>` : ''}</div></div>
    <table class="d-items"><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="d-sum"><div><span>Subtotal</span><b>${money(t.sub)}</b></div>${t.disc ? `<div><span>Discount ${+d.discount}%</span><b>−${money(t.disc)}</b></div>` : ''}${+d.tax ? `<div><span>Tax ${+d.tax}%</span><b>${money(t.tax)}</b></div>` : ''}<div class="tot"><span>Total</span><b>${money(t.total)}</b></div></div>
    <div class="d-foot"><div><small>${q ? 'Notes' : 'Payment'}</small>${esc(q ? (d.notes || `This quote is valid until ${fd(d.valid, 1)}.`) : B.payment)}</div><div><small>${q ? 'Accept' : 'Notes'}</small>${esc(q ? 'Reply to this email or sign below to accept.' : (d.notes || 'Thank you for your business.'))}</div></div>
  </div>`;
}

/* ---------- PDF (jsPDF, built-in Helvetica) ---------- */
function pdf(d) {
  const name = docNo(d) + '.pdf';
  if (!window.jspdf) { toast('PDF library missing — check vendor/jspdf.umd.min.js'); return; }
  const { jsPDF } = window.jspdf, p = new jsPDF({ unit: 'pt', format: 'a4' });
  const B = S.business, c = client(d.client), t = totals(d), q = isQuote(d), W = 595.28, L = 56, R = W - 56;
  const ink = () => p.setTextColor(23, 23, 26), mute = () => p.setTextColor(120, 120, 126);
  let y = 64;
  p.setFillColor(27, 26, 23); p.rect(0, 0, W, 6, 'F');
  p.setFont('times', 'bold'); p.setFontSize(17); ink(); p.text(B.name, L, y);
  p.setFont('times', 'italic'); p.setFontSize(28); p.text(q ? 'Quote' : 'Invoice', R, y + 4, { align: 'right' });
  p.setFont('helvetica', 'normal'); p.setFontSize(9); mute();
  [B.address, `${B.email}  ·  ${B.phone}`, B.taxId].filter(Boolean).forEach((s, i) => p.text(s, L, y + 16 + i * 12));
  p.setFont('courier', 'normal'); p.setFontSize(9.5); p.text(docNo(d), R, y + 20, { align: 'right' }); p.setFont('helvetica', 'normal');
  if (status(d) === 'paid') { p.setTextColor(21, 127, 61); p.setFont('helvetica', 'bold'); p.text('PAID ' + fd(d.paidOn, 1), R, y + 34, { align: 'right' }); p.setFont('helvetica', 'normal'); }
  y += 72; p.setDrawColor(230, 229, 225); p.line(L, y, R, y); y += 20;
  const col = [L, L + 220, L + 350];
  p.setFontSize(8); mute(); [q ? 'PREPARED FOR' : 'BILL TO', 'ISSUED', q ? 'VALID UNTIL' : 'DUE'].forEach((s, i) => p.text(s, col[i], y));
  p.setFontSize(10); ink(); p.setFont('helvetica', 'bold');
  p.text(c.name, col[0], y + 15); p.text(fd(d.issued, 1), col[1], y + 15); p.text(fd(q ? d.valid : d.due, 1), col[2], y + 15);
  p.setFont('helvetica', 'normal'); p.setFontSize(9); mute(); p.text(c.contact || '', col[0], y + 28); p.text(c.email || '', col[0], y + 40);
  y += 58; p.line(L, y, R, y); y += 26;
  const cq = R - 190, cr = R - 95;
  p.setFontSize(8); mute(); p.text('DESCRIPTION', L, y); p.text('QTY', cq, y, { align: 'right' }); p.text('RATE', cr, y, { align: 'right' }); p.text('AMOUNT', R, y, { align: 'right' });
  y += 8; p.setFontSize(10);
  d.items.filter(it => it.d || +it.r).forEach(it => {
    const lines = p.splitTextToSize(it.d || 'Item', cq - L - 40), h = Math.max(1, lines.length) * 13 + 14;
    if (y + h > 760) { p.addPage(); y = 64; }
    p.line(L, y, R, y); ink();
    p.text(lines, L, y + 17); p.text(String(+it.q || 0), cq, y + 17, { align: 'right' });
    p.text(money(+it.r || 0), cr, y + 17, { align: 'right' }); p.text(money((+it.q || 0) * (+it.r || 0)), R, y + 17, { align: 'right' });
    y += h;
  });
  p.line(L, y, R, y); y += 22;
  if (y > 700) { p.addPage(); y = 64; }
  const sumRow = (a, b, bold) => { p.setFont(bold ? 'times' : 'helvetica', bold ? 'bold' : 'normal'); bold ? ink() : mute(); p.text(a, R - 170, y); ink(); if (bold) p.setFontSize(16); p.text(b, R, y, { align: 'right' }); y += 18; };
  sumRow('Subtotal', money(t.sub));
  if (t.disc) sumRow(`Discount ${+d.discount}%`, '-' + money(t.disc));
  if (+d.tax) sumRow(`Tax ${+d.tax}%`, money(t.tax));
  p.setDrawColor(23, 23, 26); p.line(R - 170, y - 8, R, y - 8); y += 6; p.setFontSize(12); sumRow('Total', money(t.total), true);
  y = Math.max(y + 30, 690); p.setDrawColor(230, 229, 225); p.line(L, y, R, y); y += 18;
  p.setFont('helvetica', 'normal'); p.setFontSize(8); mute(); p.text(q ? 'NOTES' : 'PAYMENT', L, y); p.text(q ? 'ACCEPT' : 'NOTES', L + 260, y);
  p.setFontSize(9); ink();
  p.text(p.splitTextToSize(q ? (d.notes || `This quote is valid until ${fd(d.valid, 1)}.`) : B.payment, 220), L, y + 14);
  p.text(p.splitTextToSize(q ? 'Reply to this email or sign below to accept.' : (d.notes || 'Thank you for your business.'), 220), L + 260, y + 14);
  p.save(name);
  toast(`${name} downloaded`);
}

/* ---------- Pages ---------- */
const PAGES = [['overview', 'Overview', I.home], ['invoices', 'Invoices', I.inv], ['quotes', 'Quotes', I.quote], ['clients', 'Clients', I.users], ['settings', 'Settings', I.gear]];
const H = {};

H.overview = () => {
  const inv = S.invoices, open = inv.filter(v => ['sent', 'overdue'].includes(status(v))), late = inv.filter(v => status(v) === 'overdue');
  const sum = a => a.reduce((s, v) => s + totals(v).total, 0);
  const paid30 = inv.filter(v => v.status === 'paid' && dayDiff(v.paidOn, todayISO) <= 30);
  const oq = S.quotes.filter(q => status(q) === 'sent');
  const ageA = sum(open.filter(v => v.due >= todayISO)), ageB = sum(late.filter(v => dayDiff(v.due, todayISO) <= 30)), ageC = sum(late.filter(v => dayDiff(v.due, todayISO) > 30));
  const ageT = ageA + ageB + ageC || 1;
  const paidAll = inv.filter(v => v.status === 'paid' && v.paidOn);
  const avgDays = paidAll.length ? Math.round(paidAll.reduce((s, v) => s + dayDiff(v.issued, v.paidOn), 0) / paidAll.length) : 0;
  const lateShare = paidAll.length ? Math.round(paidAll.filter(v => v.paidOn > v.due).length / paidAll.length * 100) : 0;
  const hr = new Date().getHours(), hi = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const first = S.business.owner.split(' ')[0];
  const act = { paid: ['green', I.check], viewed: ['blue', I.eye], accepted: ['green', I.quote], sent: ['', I.send], reminder: ['red', I.bell], created: ['', I.plus] };
  const dateLine = TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return `<div class="ph"><div><p class="eyebrow">${dateLine}</p><h1>${hi}, <em>${esc(first)}</em></h1><p>${open.length ? `${money0(sum(open))} is waiting to be paid${late.length ? `, ${late.length} invoice${late.length > 1 ? 's are' : ' is'} overdue` : ''}.` : 'Everything is paid. Nice.'}</p></div>
    <div class="acts"><button class="btn" data-act="newQuote">${I.quote}New quote</button><button class="btn ink" data-act="newInvoice">${I.plus}New invoice</button></div></div>
  <div class="g">
    <div class="hero-c s7"><div class="hc-top"><span class="eb">Outstanding</span><span class="tag">${open.length} open invoice${open.length === 1 ? '' : 's'}</span></div>
      <b class="big" data-n="${sum(open)}">$0</b>
      <p class="hc-sub">${late.length ? `<b>${money0(sum(late))}</b> of it is overdue` : 'Nothing is overdue'}</p>
      <div class="age"><i style="width:${ageA / ageT * 100}%;background:var(--mark)"></i><i style="width:${ageB / ageT * 100}%;background:#FF9D5C"></i><i style="width:${ageC / ageT * 100}%;background:#FF6B57"></i></div>
      <div class="age-leg"><div><span style="--c:var(--mark)">Not due yet</span><b>${money0(ageA)}</b></div><div><span style="--c:#FF9D5C">1–30 days late</span><b>${money0(ageB)}</b></div><div><span style="--c:#FF6B57">Over 30 days</span><b>${money0(ageC)}</b></div></div>
      <div class="avg"><span>Average time to get paid</span><b>${avgDays} days</b><span>Paid after the due date</span><b>${lateShare}%</b></div></div>
    <div class="c s5 glance">
      <div class="gl warn"><div><div class="lab"><i></i>Overdue</div><small>${late.length ? `${late.length} invoice${late.length > 1 ? 's' : ''} past due` : 'Nothing late'}</small></div><b class="num" data-n="${sum(late)}">$0</b></div>
      <div class="gl good"><div><div class="lab"><i></i>Paid · last 30 days</div><small>${paid30.length} payment${paid30.length === 1 ? '' : 's'}</small></div><b class="num" data-n="${sum(paid30)}">$0</b></div>
      <div class="gl info"><div><div class="lab"><i></i>Open quotes</div><small>${oq.length} waiting for a reply</small></div><b class="num" data-n="${sum(oq)}">$0</b></div>
    </div>
    <div class="c s7"><div class="ch"><div><h3>Recent invoices</h3><p>The latest ones you created</p></div><button class="link" data-go="invoices">View all ${I.arrow}</button></div>
      <ul class="list">${[...inv].sort(byNewest).slice(0, 6).map(v => `<li class="clk" data-open="${v.id}"><span class="av soft">${ini(client(v.client).name)}</span><div class="t"><b>${esc(client(v.client).name)}</b><span>${docNo(v)} · ${fd(v.issued)}</span></div>${pill(status(v))}<span class="amt" style="min-width:96px;text-align:right">${money(totals(v).total)}</span></li>`).join('')}</ul></div>
    <div class="s5 stack">
      <div class="c"><div class="ch"><div><h3>Needs attention</h3><p>Overdue invoices</p></div></div>
        <ul class="list">${late.length ? late.sort((a, b) => a.due.localeCompare(b.due)).map(v => `<li><span class="dotic red">${I.bell}</span><div class="t"><b>${esc(client(v.client).name)}</b><span>${docNo(v)} · ${dayDiff(v.due, todayISO)} days late</span></div><span class="amt">${money(totals(v).total)}</span><button class="btn sm" data-remind="${v.id}">Remind</button></li>`).join('') : '<li class="empty">No overdue invoices</li>'}</ul></div>
      <div class="c"><div class="ch"><div><h3>Activity</h3></div></div>
        <ul class="list">${S.activity.slice(0, 3).map(a => `<li><span class="dotic ${(act[a.k] || act.created)[0]}">${(act[a.k] || act.created)[1]}</span><div class="t"><b>${esc(a.text)}</b><span>${a.t === todayISO ? 'Today' : fd(a.t)}</span></div></li>`).join('')}</ul></div>
    </div>
  </div>`;
};

const INV_TABS = [['all', 'All'], ['draft', 'Draft'], ['sent', 'Sent'], ['overdue', 'Overdue'], ['paid', 'Paid']];
const LIST = { invoices: { tab: 'all', q: '' }, quotes: { tab: 'all', q: '' } };
let HL = null; // id of a row to highlight once
H.invoices = () => `<div class="ph"><div><h1>Invoices</h1><p>Create, send and track every invoice.</p></div><div class="acts"><button class="btn ink" data-act="newInvoice">${I.plus}New invoice</button></div></div>
  <div class="tools"><div class="tabs" id="invTabs"><span class="u"></span>${INV_TABS.map(([k, l]) => `<button data-t="${k}" class="${LIST.invoices.tab === k ? 'on' : ''}">${l}<small>${k === 'all' ? S.invoices.length : S.invoices.filter(v => status(v) === k).length}</small></button>`).join('')}</div>
    <label class="search">${I.search}<input id="invQ" placeholder="Search client or number" value="${esc(LIST.invoices.q)}"></label></div>
  <div class="tbl"><div class="tr th inv-g"><span>Number</span><span>Client</span><span class="c-iss">Issued</span><span>Due</span><span class="r">Amount</span><span>Status</span></div><div id="invRows"></div></div>`;
function invRows() {
  const { tab, q } = LIST.invoices, s = q.toLowerCase();
  const rows = [...S.invoices].sort(byNewest).filter(v => (tab === 'all' || status(v) === tab) && (!s || (docNo(v) + client(v.client).name).toLowerCase().includes(s)));
  $('#invRows').innerHTML = rows.length ? rows.map(v => {
    const st = status(v), late = st === 'overdue';
    return `<div class="tr row inv-g${HL === v.id ? ' hl' : ''}" data-open="${v.id}"><span class="num-id">${docNo(v)}</span>
      <div class="who"><span class="av soft">${ini(client(v.client).name)}</span><div><b>${esc(client(v.client).name)}</b><span>${esc(v.items[0]?.d || '')}</span></div></div>
      <span class="dt c-iss">${fd(v.issued)}</span><span class="dt${late ? ' late' : ''}">${st === 'paid' ? 'Paid ' + fd(v.paidOn) : fd(v.due)}</span>
      <span class="amt">${money(totals(v).total)}</span><span class="st">${pill(st)}</span>
      <span class="meta-m">${docNo(v)} · ${st === 'paid' ? 'paid ' + fd(v.paidOn) : 'due ' + fd(v.due)}</span></div>`;
  }).join('') : '<div class="empty">No invoices here yet</div>';
  if (HL) { const r = $(`[data-open="${HL}"]`, $('#invRows')); HL = null; if (r) gsap.to(r, { backgroundColor: 'rgba(255,251,234,0)', duration: 1.6, delay: 1.4, onComplete: () => { r.classList.remove('hl'); r.style.backgroundColor = ''; } }); }
}

const QUO_TABS = [['all', 'All'], ['draft', 'Draft'], ['sent', 'Sent'], ['accepted', 'Accepted'], ['declined', 'Declined']];
H.quotes = () => `<div class="ph"><div><h1>Quotes</h1><p>Send a price first. Turn it into an invoice in one click.</p></div><div class="acts"><button class="btn ink" data-act="newQuote">${I.plus}New quote</button></div></div>
  <div class="tools"><div class="tabs" id="quoTabs"><span class="u"></span>${QUO_TABS.map(([k, l]) => `<button data-t="${k}" class="${LIST.quotes.tab === k ? 'on' : ''}">${l}<small>${k === 'all' ? S.quotes.length : S.quotes.filter(v => status(v) === k).length}</small></button>`).join('')}</div></div>
  <div class="tbl"><div class="tr th quo-g"><span>Number</span><span>Client</span><span class="c-iss">Issued</span><span>Valid until</span><span class="r">Amount</span><span>Status</span></div><div id="quoRows"></div></div>`;
function quoRows() {
  const { tab } = LIST.quotes;
  const rows = [...S.quotes].sort(byNewest).filter(v => tab === 'all' || status(v) === tab);
  $('#quoRows').innerHTML = rows.length ? rows.map(v => {
    const st = status(v);
    return `<div class="tr row quo-g" data-open="${v.id}"><span class="num-id">${docNo(v)}</span>
      <div class="who"><span class="av soft">${ini(client(v.client).name)}</span><div><b>${esc(client(v.client).name)}</b><span>${esc(v.items[0]?.d || '')}</span></div></div>
      <span class="dt c-iss">${fd(v.issued)}</span><span class="dt">${fd(v.valid)}</span><span class="amt">${money(totals(v).total)}</span>
      <span class="st">${st === 'accepted' ? `<button class="btn sm ink" data-convert="${v.id}">${I.convert}Invoice it</button>` : pill(st)}</span>
      <span class="meta-m">${docNo(v)} · valid until ${fd(v.valid)}</span></div>`;
  }).join('') : '<div class="empty">No quotes here yet</div>';
}

H.clients = () => {
  const rows = S.clients.map(c => {
    const mine = S.invoices.filter(v => v.client === c.id);
    return { c, n: mine.length, billed: mine.filter(v => v.status === 'paid').reduce((s, v) => s + totals(v).total, 0), open: mine.filter(v => ['sent', 'overdue'].includes(status(v))).reduce((s, v) => s + totals(v).total, 0) };
  }).sort((a, b) => b.billed - a.billed);
  return `<div class="ph"><div><h1>Clients</h1><p>${S.clients.length} clients · who you bill and how much is open.</p></div><div class="acts"><button class="btn ink" data-act="addClient">${I.plus}Add client</button></div></div>
  <div class="tbl"><div class="tr th cli-g"><span>Client</span><span>Email</span><span class="r">Invoices</span><span class="r">Paid</span><span class="r">Open</span></div>
  ${rows.map(r => `<div class="tr row cli-g" data-client="${r.c.id}"><div class="who"><span class="av soft">${ini(r.c.name)}</span><div><b>${esc(r.c.name)}</b><span>${esc(r.c.contact)} · ${esc(r.c.city || '')}</span></div></div>
    <span class="dt">${esc(r.c.email)}</span><span class="amt c-n">${r.n}</span><span class="amt">${money0(r.billed)}<small class="m-only"> paid</small></span><span class="amt st" style="${r.open ? '' : 'color:var(--dim)'}">${money0(r.open)}<small class="m-only"> open</small></span>
    <span class="meta-m">${r.n} invoice${r.n === 1 ? '' : 's'}</span></div>`).join('')}</div>`;
};

H.settings = () => {
  const B = S.business, T = S.settings;
  const f = (k, l, v, o = {}) => `<div class="fld"><label for="s-${k}">${l}</label>${o.area ? `<textarea class="inp" id="s-${k}" data-s="${k}" rows="2">${esc(v)}</textarea>` : `<input class="inp" id="s-${k}" data-s="${k}" value="${esc(v)}"${o.num ? ' inputmode="numeric"' : ''}>`}</div>`;
  return `<div class="ph"><div><h1>Settings</h1><p>What appears on your invoices, and the defaults for new ones.</p></div><div class="acts"><button class="btn ink" data-act="saveSettings">${I.save}Save changes</button></div></div>
  <div class="g">
    <div class="c s7 form"><div class="ch"><div><h3>Your business</h3><p>Shown at the top of every invoice and quote</p></div></div>
      <div class="row2">${f('name', 'Business name', B.name)}${f('owner', 'Your name', B.owner)}</div>
      <div class="row2">${f('email', 'Email', B.email)}${f('phone', 'Phone', B.phone)}</div>
      ${f('address', 'Address', B.address)}${f('taxId', 'Tax ID (optional)', B.taxId)}${f('payment', 'Payment details', B.payment, { area: 1 })}</div>
    <div class="s5" style="display:flex;flex-direction:column;gap:16px">
      <div class="c form"><div class="ch"><div><h3>Defaults</h3><p>Used for every new document</p></div></div>
        <div class="row2"><div class="fld"><span class="lb">Currency</span><button class="inp sel" id="curSel" data-pick="currency"><span>${T.currency}</span>${I.down}</button></div><div class="fld"><span class="lb">Payment terms</span><button class="inp sel" id="termSel" data-pick="terms"><span>Net ${T.terms} days</span>${I.down}</button></div></div>
        <div class="row3">${f('invoicePrefix', 'Invoice prefix', T.invoicePrefix)}${f('nextInvoice', 'Next number', T.nextInvoice, { num: 1 })}${f('tax', 'Tax %', T.tax, { num: 1 })}</div></div>
      <div class="c"><div class="set"><div><b>Sounds</b><span>Soft clicks when you work</span></div><button class="sw${SFX.isOn() ? ' on' : ''}" data-sw="sound" role="switch" aria-checked="${SFX.isOn()}"><i></i></button></div>
        <div class="set"><div><b>Backup</b><span>Download all your data as a JSON file</span></div><button class="btn sm" data-act="backup">Download</button></div>
        <div class="set"><div><b>Sample data</b><span>Clear everything and load the demo again</span></div><button class="btn sm" data-act="reset">Reset</button></div></div>
    </div></div>`;
};

/* ---------- Editor ---------- */
let E = null;
function blank(type, clientId) {
  const T = S.settings, q = type === 'quote';
  return q ? { type, id: null, n: T.nextQuote, client: clientId || null, issued: todayISO, valid: addDays(todayISO, T.quoteValid), items: [{ d: '', q: 1, r: 0 }], tax: +T.tax || 0, discount: 0, notes: '' }
    : { type, id: null, n: T.nextInvoice, client: clientId || null, issued: todayISO, due: addDays(todayISO, T.terms), terms: T.terms, items: [{ d: '', q: 1, r: 0 }], tax: +T.tax || 0, discount: 0, notes: '' };
}
H.editor = () => {
  const q = E.type === 'quote', c = E.client ? client(E.client) : null;
  return `<div class="ph"><div><h1>${E.id ? 'Edit ' + docNo(E) : q ? 'New quote' : 'New invoice'}</h1><p>${q ? 'Send a price first — turn it into an invoice when they say yes.' : 'Fill in the left side, the invoice builds itself on the right.'}</p></div>
    ${E.id ? '' : `<div class="seg" id="typeSeg"><span class="u"></span><button data-type="invoice" class="${q ? '' : 'on'}">Invoice</button><button data-type="quote" class="${q ? 'on' : ''}">Quote</button></div>`}</div>
  <div class="ed">
    <div class="form">
      <div class="c"><div class="step"><i>1</i>Who is it for</div>
        <div class="fld"><span class="lb">Client</span><button class="inp sel${c ? '' : ' unset'}" id="clientSel" data-pick="client"><span>${c ? esc(c.name) + ' · ' + esc(c.contact) : 'Choose a client'}</span>${I.down}</button></div>
        <div class="row3"><div class="fld"><label>Number</label><input class="inp mono" value="${docNo(E)}" readonly tabindex="-1"></div>
          <div class="fld"><label for="e-issued">Issued</label><input class="inp" id="e-issued" type="date" data-e="issued" value="${E.issued}"></div>
          ${q ? `<div class="fld"><label for="e-valid">Valid until</label><input class="inp" id="e-valid" type="date" data-e="valid" value="${E.valid}"></div>`
            : `<div class="fld"><span class="lb">Due</span><button class="inp sel" id="termsSel" data-pick="eterms"><span>${E.terms ? 'Net ' + E.terms + ' · ' + fd(E.due) : fd(E.due)}</span>${I.down}</button></div>`}</div>
      </div>
      <div class="c"><div class="step"><i>2</i>What you did</div><div class="items" id="items"></div>
        <button class="btn sm ghost add-line" data-act="addLine">${I.plus}Add line</button>
        <div class="row2"><div class="fld"><label for="e-discount">Discount %</label><input class="inp mono" id="e-discount" data-e="discount" inputmode="decimal" value="${E.discount || ''}" placeholder="0"></div>
          <div class="fld"><label for="e-tax">Tax %</label><input class="inp mono" id="e-tax" data-e="tax" inputmode="decimal" value="${E.tax || ''}" placeholder="0"></div></div>
        <div class="sums" id="sums"></div></div>
      <div class="c"><div class="step"><i>3</i>A note</div><div class="fld"><label for="e-notes">Notes for the client <span style="color:var(--dim)">(optional)</span></label><textarea class="inp" id="e-notes" data-e="notes" rows="2" placeholder="${q ? 'What is included, timelines…' : 'Thank you for your business.'}">${esc(E.notes)}</textarea></div></div>
      <div class="ed-bar"><button class="btn ghost" data-act="cancelEdit">Cancel</button><button class="btn" data-act="saveDraft">${I.save}Save draft</button><button class="btn" data-act="pdfEdit">${I.pdf}PDF</button><button class="btn ink" data-act="sendDoc">${I.send}Send ${q ? 'quote' : 'invoice'}</button></div>
    </div>
    <div class="pv-wrap"><div class="pv-head"><span>Live preview</span><span class="mono">${docNo(E)}.pdf</span></div><div id="preview"></div></div>
  </div>`;
};
function itemsHTML() {
  return `<div class="it th"><span>Description</span><span style="text-align:right">Qty</span><span style="text-align:right">Rate</span><span style="text-align:right">Amount</span><span></span></div>` +
    E.items.map((it, i) => `<div class="it" data-row="${i}"><input class="inp d" data-i="${i}" data-k="d" value="${esc(it.d)}" placeholder="What did you do?"><input class="inp n q" data-i="${i}" data-k="q" inputmode="decimal" value="${it.q}"><input class="inp n rt" data-i="${i}" data-k="r" inputmode="decimal" value="${it.r || ''}" placeholder="0.00"><span class="lt" data-lt="${i}">${money((+it.q || 0) * (+it.r || 0))}</span><button class="rm" data-rm="${i}" aria-label="Remove line">${I.trash}</button></div>`).join('');
}
function edRefresh() {
  const t = totals(E);
  $('#sums').innerHTML = `<div><span>Subtotal</span><b>${money(t.sub)}</b></div>${t.disc ? `<div><span>Discount</span><b>−${money(t.disc)}</b></div>` : ''}${t.tax ? `<div><span>Tax</span><b>${money(t.tax)}</b></div>` : ''}<div class="tot"><span>Total</span><b>${money(t.total)}</b></div>`;
  E.items.forEach((it, i) => { const el = $(`[data-lt="${i}"]`); if (el) el.textContent = money((+it.q || 0) * (+it.r || 0)); });
  $('#preview').innerHTML = docHTML(E);
}
function edInit() { $('#items').innerHTML = itemsHTML(); edRefresh(); }
function startEdit(type, opts = {}) {
  E = opts.from ? JSON.parse(JSON.stringify(opts.from)) : blank(type, opts.client);
  if (opts.from) { E.type = isQuote(opts.from) ? 'quote' : 'invoice'; E.terms = E.due ? dayDiff(E.issued, E.due) : undefined; }
  closeDrawer(true); cur = null; go('editor');
}
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.k && E) { const it = E.items[+t.dataset.i]; it[t.dataset.k] = t.dataset.k === 'd' ? t.value : t.value.replace(/[^\d.]/g, ''); edRefresh(); }
  else if (t.dataset.e && E) { E[t.dataset.e] = t.value; if (t.dataset.e === 'issued' && E.terms) E.due = addDays(E.issued, E.terms); edRefresh(); }
  else if (t.id === 'invQ') { LIST.invoices.q = t.value; invRows(); }
});

/* ---------- Upsert helpers ---------- */
function commit(statusTo) {
  const q = E.type === 'quote', list = q ? S.quotes : S.invoices;
  const clean = { n: E.n, client: E.client, issued: E.issued, items: E.items.filter(it => it.d || +it.r).map(it => ({ d: it.d, q: +it.q || 0, r: +it.r || 0 })), tax: +E.tax || 0, discount: +E.discount || 0, notes: E.notes || '' };
  if (q) clean.valid = E.valid; else clean.due = E.due;
  let doc = E.id && list.find(d => d.id === E.id);
  if (doc) Object.assign(doc, clean, { status: statusTo });
  else {
    doc = { id: (q ? 'q' : 'i') + E.n + '-' + Date.now().toString(36), ...clean, status: statusTo, paidOn: null };
    list.push(doc);
    if (q) S.settings.nextQuote = Math.max(S.settings.nextQuote, E.n + 1); else S.settings.nextInvoice = Math.max(S.settings.nextInvoice, E.n + 1);
  }
  return doc;
}
function canSend() {
  if (!E.client) { toast('Choose a client first'); flash($('#clientSel')); return false; }
  if (!E.items.some(it => (+it.q || 0) * (+it.r || 0) > 0)) { toast('Add at least one line with a price'); flash($('.it[data-row] .rt')); return false; }
  return true;
}
const flash = el => el && gsap.fromTo(el, { boxShadow: '0 0 0 2px rgba(201,48,44,.5)' }, { boxShadow: '0 0 0 0px rgba(201,48,44,0)', duration: 1.2, clearProps: 'boxShadow' });

/* ---------- Drawer views ---------- */
function findDoc(id) { return S.invoices.find(d => d.id === id) || S.quotes.find(d => d.id === id); }
function docDrawer(id) {
  const d = findDoc(id); if (!d) return; const st = status(d), q = isQuote(d), t = totals(d), c = client(d.client);
  let acts;
  if (q) acts = st === 'accepted' ? `<button class="btn" data-pdf="${d.id}">${I.pdf}PDF</button><button class="btn ink" data-convert="${d.id}">${I.convert}Turn into invoice</button>`
    : st === 'draft' ? `<button class="btn" data-edit="${d.id}">${I.edit}Edit</button><button class="btn ink" data-send="${d.id}">${I.send}Send quote</button>`
    : st === 'sent' ? `<button class="btn" data-qs="declined:${d.id}">Mark declined</button><button class="btn ink" data-qs="accepted:${d.id}">${I.check}Mark accepted</button>`
    : `<button class="btn" data-pdf="${d.id}">${I.pdf}PDF</button><button class="btn" data-dup="${d.id}">${I.copy}Duplicate</button>`;
  else acts = st === 'draft' ? `<button class="btn" data-del="${d.id}">${I.trash}Delete</button><button class="btn" data-edit="${d.id}">${I.edit}Edit</button><button class="btn ink" data-send="${d.id}">${I.send}Send</button>`
    : st === 'paid' ? `<button class="btn" data-pdf="${d.id}">${I.pdf}Download PDF</button><button class="btn" data-dup="${d.id}">${I.copy}Duplicate</button>`
    : `<button class="btn" data-pdf="${d.id}">${I.pdf}PDF</button><button class="btn" data-remind="${d.id}">${I.bell}Remind</button><button class="btn ink" data-paid="${d.id}">${I.check}Mark as paid</button>`;
  const third = q ? ['Valid until', fd(d.valid)] : st === 'paid' ? ['Paid on', fd(d.paidOn)] : st === 'overdue' ? ['Late by', dayDiff(d.due, todayISO) + ' days'] : ['Due', fd(d.due)];
  openDrawer(`<div class="dr-h"><div><b>${esc(c.name)}</b><span class="num-id">${docNo(d)}</span></div><div style="display:flex;align-items:center;gap:8px">${pill(st)}<button class="ib" data-close aria-label="Close">${I.x}</button></div></div>
    <div class="dr-b"><div class="kv"><div><small>Total</small><b>${money(t.total)}</b></div><div><small>Issued</small><b>${fd(d.issued)}</b></div><div><small>${third[0]}</small><b style="${st === 'overdue' ? 'color:var(--red)' : ''}">${third[1]}</b></div></div>${docHTML(d)}</div>
    <div class="dr-f">${acts}</div>`);
  drawer.dataset.doc = id;
}
function clientDrawer(id) {
  const c = client(id), mine = S.invoices.filter(v => v.client === id).sort(byNewest);
  const paid = mine.filter(v => v.status === 'paid').reduce((s, v) => s + totals(v).total, 0), open = mine.filter(v => ['sent', 'overdue'].includes(status(v))).reduce((s, v) => s + totals(v).total, 0);
  openDrawer(`<div class="dr-h"><div style="display:flex;align-items:center;gap:10px"><span class="av soft">${ini(c.name)}</span><div><b>${esc(c.name)}</b><div style="font-size:12.5px;color:var(--muted)">${esc(c.contact)} · ${esc(c.email)}</div></div></div><button class="ib" data-close aria-label="Close">${I.x}</button></div>
    <div class="dr-b"><div class="kv"><div><small>Paid</small><b>${money0(paid)}</b></div><div><small>Open</small><b>${money0(open)}</b></div><div><small>Invoices</small><b>${mine.length}</b></div></div>
      <div class="c"><div class="ch"><h3>Invoices</h3></div><ul class="list">${mine.length ? mine.map(v => `<li class="clk" data-open="${v.id}"><div class="t"><b>${docNo(v)}</b><span>${esc(v.items[0]?.d || '')}</span></div>${pill(status(v))}<span class="amt">${money(totals(v).total)}</span></li>`).join('') : '<li class="empty">No invoices yet</li>'}</ul></div></div>
    <div class="dr-f"><button class="btn" data-newq="${id}">${I.quote}New quote</button><button class="btn ink" data-newi="${id}">${I.plus}New invoice</button></div>`);
}
function addClientDrawer() {
  openDrawer(`<div class="dr-h"><b>Add client</b><button class="ib" data-close aria-label="Close">${I.x}</button></div>
    <div class="dr-b"><div class="c form" style="display:flex;flex-direction:column;gap:14px">
      ${[['name', 'Company or person', 'Acme Studio'], ['contact', 'Contact name', 'Jordan Lee'], ['email', 'Email', 'jordan@acme.com'], ['city', 'City (optional)', 'Denver, CO']].map(([k, l, p]) => `<div class="fld"><label for="c-${k}">${l}</label><input class="inp" id="c-${k}" data-c="${k}" placeholder="${p}"${k === 'email' ? ' type="email"' : ''}></div>`).join('')}
    </div></div>
    <div class="dr-f"><button class="btn" data-close>Cancel</button><button class="btn ink" data-act="saveClient">${I.check}Save client</button></div>`);
}

/* ---------- Clicks ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const el = sel => t.closest(sel);
  let x;
  if (el('[data-close]')) return closeDrawer();
  if ((x = el('[data-go]'))) { e.preventDefault(); return go(x.dataset.go); }
  if ((x = el('[data-remind]'))) { const d = findDoc(x.dataset.remind), c = client(d.client); log('reminder', `Reminder sent for ${docNo(d)}`); save(); return toast(`Reminder sent to ${c.contact || c.name}`); }
  if ((x = el('[data-convert]'))) return convert(x.dataset.convert);
  if ((x = el('[data-paid]'))) return markPaid(x.dataset.paid);
  if ((x = el('[data-pdf]'))) return pdf(findDoc(x.dataset.pdf));
  if ((x = el('[data-edit]'))) return startEdit(null, { from: findDoc(x.dataset.edit) });
  if ((x = el('[data-dup]'))) { const d = findDoc(x.dataset.dup), q = isQuote(d); const copy = { ...JSON.parse(JSON.stringify(d)), id: null, n: q ? S.settings.nextQuote : S.settings.nextInvoice, issued: todayISO, status: 'draft' }; if (q) copy.valid = addDays(todayISO, S.settings.quoteValid); else { copy.due = addDays(todayISO, S.settings.terms); copy.paidOn = null; } return startEdit(null, { from: copy }); }
  if ((x = el('[data-send]'))) { const d = findDoc(x.dataset.send); d.status = 'sent'; log('sent', `${docNo(d)} sent to ${client(d.client).name}`); save(); closeDrawer(true); refresh(); return toast(`${docNo(d)} sent to ${client(d.client).contact}`); }
  if ((x = el('[data-del]'))) { const d = findDoc(x.dataset.del), list = isQuote(d) ? S.quotes : S.invoices, i = list.indexOf(d); list.splice(i, 1); save(); closeDrawer(true); refresh(); return toast(`${docNo(d)} deleted`, () => { list.splice(i, 0, d); save(); refresh(); }); }
  if ((x = el('[data-qs]'))) { const [s, id] = x.dataset.qs.split(':'), d = findDoc(id), was = d.status; d.status = s; if (s === 'accepted') log('accepted', `${client(d.client).name} accepted ${docNo(d)}`); save(); docDrawer(id); refresh(); return toast(`${docNo(d)} marked as ${s}`, () => { d.status = was; save(); docDrawer(id); refresh(); }); }
  if ((x = el('[data-open]'))) return docDrawer(x.dataset.open);
  if ((x = el('[data-client]'))) return clientDrawer(x.dataset.client);
  if ((x = el('[data-newi]'))) return startEdit('invoice', { client: x.dataset.newi });
  if ((x = el('[data-newq]'))) return startEdit('quote', { client: x.dataset.newq });
  if ((x = el('[data-rm]'))) { if (E.items.length === 1) { E.items[0] = { d: '', q: 1, r: 0 }; } else E.items.splice(+x.dataset.rm, 1); SFX.play('close', .6); return edInit(); }
  if ((x = el('[data-type]'))) { if (x.classList.contains('on')) return; E = blank(x.dataset.type, E.client); cur = null; SFX.play('tick'); go('editor', false, true); return; }
  if ((x = el('[data-pick]'))) return pick(x);
  if ((x = el('[data-sw]'))) { const on = !x.classList.contains('on'); setSw(x, on); SFX.set(on); soundIcon(); SFX.play(on ? 'on' : 'off'); return; }
  if ((x = el('#invTabs button'))) { LIST.invoices.tab = x.dataset.t; $$('#invTabs button').forEach(b => b.classList.toggle('on', b === x)); moveU($('#invTabs')); return invRows(); }
  if ((x = el('#quoTabs button'))) { LIST.quotes.tab = x.dataset.t; $$('#quoTabs button').forEach(b => b.classList.toggle('on', b === x)); moveU($('#quoTabs')); return quoRows(); }
  if ((x = el('[data-act]'))) return ACT[x.dataset.act]?.(x);
});
function setSw(b, on) { b.classList.toggle('on', on); b.setAttribute('aria-checked', on); gsap.to($('i', b), { x: on ? 16 : 0, duration: .3, ease: 'soft' }); }

function markPaid(id) {
  const d = findDoc(id), was = { status: d.status, paidOn: d.paidOn };
  d.status = 'paid'; d.paidOn = todayISO; log('paid', `${client(d.client).name} paid ${docNo(d)}`); save();
  docDrawer(id); refresh();
  const p = $('.dr-h .pill'); p && gsap.fromTo(p, { scale: .8 }, { scale: 1, duration: .45, ease: 'back.out(2.5)' });
  const st = $('.drawer .stamp'); st && gsap.fromTo(st, { scale: 1.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .5, ease: 'back.out(1.8)', delay: .1 });
  toast(`${docNo(d)} marked as paid · ${money(totals(d).total)}`, () => { Object.assign(d, was); S.activity.shift(); save(); docDrawer(id); refresh(); });
}
function convert(qid) {
  const q = findDoc(qid), was = q.status, n = S.settings.nextInvoice;
  const inv = { id: 'i' + n + '-' + Date.now().toString(36), n, client: q.client, issued: todayISO, due: addDays(todayISO, S.settings.terms), status: 'draft', paidOn: null, items: q.items.map(it => ({ ...it })), tax: q.tax, discount: q.discount, notes: '' };
  S.invoices.push(inv); S.settings.nextInvoice = n + 1; q.status = 'converted'; log('created', `${docNo(inv)} created from ${docNo(q)}`); save();
  closeDrawer(true); refresh();
  toast(`${docNo(q)} → ${docNo(inv)} draft created`, () => { S.invoices.splice(S.invoices.indexOf(inv), 1); S.settings.nextInvoice = n; q.status = was; S.activity.shift(); save(); refresh(); });
}
function refresh() {
  if (cur === 'invoices') { $('#p-invoices').innerHTML = H.invoices(); invRows(); moveU($('#invTabs'), 0); }
  else if (cur === 'quotes') { $('#p-quotes').innerHTML = H.quotes(); quoRows(); moveU($('#quoTabs'), 0); }
  else if (cur === 'overview' || cur === 'clients') { $('#p-' + cur).innerHTML = H[cur](); $$('[data-n]', $('#p-' + cur)).forEach(el => el.textContent = money0(+el.dataset.n)); }
  navCounts();
}

/* ---------- Pickers ---------- */
function pick(btn) {
  const k = btn.dataset.pick;
  if (k === 'client') return openMenu(btn, S.clients.map(c => ({ v: c.id, html: `<span class="av soft" style="width:26px;height:26px;font-size:10px">${ini(c.name)}</span><span><b style="font-weight:500">${esc(c.name)}</b><small>${esc(c.contact)}</small></span>` })).concat([{ v: '__new', html: `${I.plus}<span>Add a new client</span>` }]),
    v => { if (v === '__new') return addClientDrawer(); E.client = v; const c = client(v); btn.classList.remove('unset'); btn.firstElementChild.textContent = `${c.name} · ${c.contact}`; edRefresh(); }, E.client);
  if (k === 'eterms') return openMenu(btn, [0, 7, 14, 30, 45].map(n => ({ v: n, label: n ? `Net ${n} days` : 'Due on receipt' })), v => { E.terms = v; E.due = addDays(E.issued, v); btn.firstElementChild.textContent = v ? `Net ${v} · ${fd(E.due)}` : fd(E.due); edRefresh(); }, E.terms);
  if (k === 'terms') return openMenu(btn, [7, 14, 30, 45].map(n => ({ v: n, label: `Net ${n} days` })), v => { S.settings.terms = v; btn.firstElementChild.textContent = `Net ${v} days`; }, S.settings.terms);
  if (k === 'currency') return openMenu(btn, ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(v => ({ v, label: v })), v => { S.settings.currency = v; btn.firstElementChild.textContent = v; }, S.settings.currency);
}

/* ---------- Actions ---------- */
const ACT = {
  newInvoice: () => startEdit('invoice'),
  newQuote: () => startEdit('quote'),
  addClient: () => addClientDrawer(),
  addLine: () => { E.items.push({ d: '', q: 1, r: 0 }); SFX.play('tick'); edInit(); const r = $('.it[data-row]:last-child', $('#items')); gsap.from(r, { autoAlpha: 0, y: -6, duration: .3, ease: 'soft' }); $('.d', r).focus(); },
  cancelEdit: () => { const back = E.type === 'quote' ? 'quotes' : 'invoices'; E = null; go(back); },
  saveDraft: () => { if (!E.client) { toast('Choose a client first'); return flash($('#clientSel')); } const d = commit('draft'); save(); HL = d.id; const back = E.type === 'quote' ? 'quotes' : 'invoices'; E = null; go(back); toast(`${docNo(d)} saved as a draft`); },
  pdfEdit: () => { if (canSend()) pdf(E); },
  sendDoc: () => {
    if (!canSend()) return;
    const q = E.type === 'quote', d = commit('sent'), c = client(d.client);
    log('sent', `${docNo(d)} sent to ${c.name}`); save(); HL = d.id; E = null;
    if (!q) LIST.invoices.tab = 'all'; else LIST.quotes.tab = 'all';
    go(q ? 'quotes' : 'invoices'); toast(`${docNo(d)} sent to ${c.contact || c.name}`);
  },
  saveClient: () => {
    const v = k => ($(`[data-c="${k}"]`)?.value || '').trim();
    if (!v('name')) { flash($('[data-c="name"]')); return toast('Add a name first'); }
    const id = v('name').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    S.clients.push({ id, name: v('name'), contact: v('contact'), email: v('email'), city: v('city') }); save();
    closeDrawer(true);
    if (cur === 'editor' && E) { E.client = id; const b = $('#clientSel'); b.classList.remove('unset'); b.firstElementChild.textContent = `${v('name')} · ${v('contact')}`; edRefresh(); }
    else refresh();
    toast(`${v('name')} added`);
  },
  saveSettings: () => {
    $$('[data-s]').forEach(i => { const k = i.dataset.s; if (k in S.business) S.business[k] = i.value.trim(); else S.settings[k] = ['nextInvoice', 'tax'].includes(k) ? (+i.value || 0) : i.value.trim(); });
    save(); brand(); toast('Settings saved');
  },
  backup: () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = `remit-backup-${todayISO}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Backup downloaded');
  },
  reset: () => { const old = S; S = seed(); save(); brand(); cur = null; go('overview'); toast('Sample data loaded', () => { S = old; save(); brand(); cur = null; go('overview'); }); }
};

/* ---------- Tabs underline ---------- */
function moveU(root, d = .35) { if (!root) return; const b = $('button.on', root), u = $('.u', root); if (!b || !u) return; gsap.to(u, { x: b.offsetLeft, width: b.offsetWidth, duration: d, ease: 'soft' }); }

/* ---------- Router ---------- */
const nav = $('#nav'), tabbar = $('#tabbar');
nav.innerHTML = PAGES.map(([id, l, ic]) => `<a href="#${id}" data-page="${id}">${ic}<span>${l}</span><em id="cnt-${id}" hidden></em></a>`).join('');
tabbar.innerHTML = PAGES.map(([id, l, ic]) => `<a href="#${id}" data-page="${id}">${ic}${l}</a>`).join('');
function navCounts() {
  const late = S.invoices.filter(v => status(v) === 'overdue').length, dr = S.invoices.filter(v => v.status === 'draft').length, oq = S.quotes.filter(q => status(q) === 'sent').length;
  const set = (id, n, cls) => { const e = $('#cnt-' + id); e.hidden = !n; e.textContent = n; e.className = cls || ''; };
  set('invoices', late || dr, late ? 'red' : ''); set('quotes', oq);
  const m = todayISO.slice(0, 7), got = S.invoices.filter(v => v.status === 'paid' && v.paidOn && v.paidOn.slice(0, 7) === m);
  $('#sideNote').innerHTML = `<small>Collected in ${TODAY.toLocaleDateString('en-US', { month: 'long' })}</small><b>${money0(got.reduce((s, v) => s + totals(v).total, 0))}</b><span>${got.length} invoice${got.length === 1 ? '' : 's'} paid</span>`;
}
function brand() {
  $('#bizName').textContent = S.business.name; $('#meName').textContent = S.business.owner; $('#meAv').textContent = ini(S.business.owner);
}
const pageEl = id => $('#p-' + id);
let cur = null;
function count(el, to, d = 1.1) { const o = { v: 0 }; gsap.to(o, { v: to, duration: d, ease: 'power2.out', onUpdate: () => el.textContent = money0(o.v) }); }
function go(id, first, keep) {
  if (!H[id]) id = 'overview';
  if (id === 'editor' && !E) id = 'invoices';
  if (id === cur) return;
  if (!first && !keep) SFX.play('page');
  closeMenu(); if (drawerOpen) closeDrawer(true);
  const prev = cur && pageEl(cur), next = pageEl(id); cur = id;
  const navId = id === 'editor' ? (E.type === 'quote' ? 'quotes' : 'invoices') : id;
  $$('.nav a, .tabbar a').forEach(a => a.classList.toggle('on', a.dataset.page === navId));
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  document.title = `${id === 'editor' ? (E.type === 'quote' ? 'New quote' : 'New invoice') : PAGES.find(p => p[0] === id)[1]} · Remit`;
  if (id !== 'editor') E = null;
  $$('.page.cur').forEach(p => p !== next && p.classList.remove('cur'));
  next.innerHTML = H[id](); next.classList.add('cur'); scrollTo(0, 0);
  if (id === 'invoices') invRows(); if (id === 'quotes') quoRows(); if (id === 'editor') edInit();
  moveU($('#invTabs', next), 0); moveU($('#quoTabs', next), 0); moveU($('#typeSeg', next), 0);
  const items = $$(':scope > .ph, :scope > .tools, :scope > .g > *, :scope > .tbl, :scope > .ed > *', next);
  gsap.fromTo(items, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, stagger: .035, ease: 'soft', delay: first ? .15 : 0, clearProps: 'transform,opacity,visibility' });
  $$('[data-n]', next).forEach(el => count(el, +el.dataset.n));
  if (id === 'overview') $$('.age i', next).forEach((b, i) => gsap.from(b, { scaleX: 0, transformOrigin: '0 50%', duration: .8, delay: .25 + i * .1, ease: 'soft' }));
}
$$('.nav a, .tabbar a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.dataset.page); }));
addEventListener('hashchange', () => go(location.hash.slice(1)));
addEventListener('resize', () => { ['#invTabs', '#quoTabs', '#typeSeg'].forEach(s => moveU($(s), 0)); });

/* ---------- Sound buttons + generic click ---------- */
const soundBs = [$('#soundB'), $('#soundM')];
function soundIcon() { soundBs.forEach(b => { b.innerHTML = SFX.isOn() ? I.vol : I.mute; b.setAttribute('aria-pressed', SFX.isOn()); b.setAttribute('aria-label', SFX.isOn() ? 'Mute sounds' : 'Turn sounds on'); }); }
soundBs.forEach(b => b.addEventListener('click', () => { SFX.set(!SFX.isOn()); soundIcon(); SFX.play('on'); const s = $('[data-sw="sound"]'); s && setSw(s, SFX.isOn()); }));
soundIcon();
document.addEventListener('click', e => { if (!SFX.recent() && e.target.closest('button, a, .row, .clk')) SFX.play('click'); });

/* ---------- Boot ---------- */
brand(); navCounts();
gsap.from('.side > *', { autoAlpha: 0, x: -10, duration: .5, stagger: .05, ease: 'soft' });
go(location.hash.slice(1) === 'editor' ? 'overview' : (location.hash.slice(1) || 'overview'), true);

/* ---------- Small public API (handy for scripting and tests) ---------- */
window.REMIT = {
  go, toast, data: () => S,
  scroll: (y, d = 1) => { const o = { y: scrollY }; return gsap.to(o, { y, duration: d, ease: 'power2.inOut', onUpdate: () => scrollTo(0, o.y) }); },
  type(sel, text, d = 1) { const el = $(sel); if (!el) return; el.focus({ preventScroll: true }); const o = { i: 0 }; gsap.to(o, { i: text.length, duration: d, ease: 'none', onUpdate: () => { const v = text.slice(0, Math.round(o.i)); if (el.value !== v) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } } }); }
};
})();
