/* Linden — app logic. Vanilla JS + GSAP (free for commercial use). */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (v, d = 2) => (v < 0 ? '−' : '') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (v, d = 2) => (v > 0 ? '+' : '') + money(v, d);
const kfmt = v => '$' + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1).replace('.0', '') + 'k' : Math.round(v));
const initials = s => s.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const lerp = (a, b, p) => a + (b - a) * p;
const rnd = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
const mq = matchMedia('(max-width:760px)');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PHOTO = ''; // optional: path to a blurred background photo, e.g. 'bg.jpg'

gsap.registerPlugin(Draggable, CustomEase);
CustomEase.create('glide', '0.22,1,0.36,1');
if (REDUCE) gsap.globalTimeline.timeScale(20);

/* ---------- Icons ---------- */
const svg = (p, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24">${p}</svg>`;
const I = {
  grid: svg('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
  card: svg('<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6.5 15h4"/>'),
  swap: svg('<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>'),
  bars: svg('<path d="M3 20.5h18M6 16.5v-5M11 16.5V6M16 16.5v-8M20.5 16.5v-3"/>'),
  pie: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.4 6.4"/>'),
  target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
  people: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'),
  snow: svg('<path d="M12 2.5v19M4 7l16 10M20 7 4 17M9 4l3 2.5L15 4M9 20l3-2.5 3 2.5"/>'),
  eye: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  sliders: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>'),
  wave: svg('<path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M5 11a1.5 1.5 0 0 1 0 2"/>'),
  cart: svg('<path d="M3 4h2l2.4 11h10.2L20 7.5H6.2"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  shield: svg('<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  bell: svg('<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9M10 20a2 2 0 0 0 4 0"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  vol: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'),
  coin: svg('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.5-.8-1.5-1.3-2.8-1.3-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2.1 2.8.9 2.8 2.1-1.2 2-2.8 2c-1.3 0-2.4-.5-2.9-1.4M12 6.3v1.6M12 16.1v1.6"/>')
};

/* ---------- Sound ---------- */
// Short synthesised UI sounds (sounds.js). Off switch in the top bar; the choice is remembered.
const SFX = (() => {
  let ctx = null, on = true, last = -1e9; const bufs = {};
  try { on = localStorage.getItem('linden-sound') !== 'off'; } catch (e) { }
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
    src.buffer = bufs[name]; g.gain.value = vol * .9; src.connect(g).connect(ctx.destination); src.start();
  }
  return { play, recent: () => performance.now() - last < 40, isOn: () => on, set(v) { on = v; try { localStorage.setItem('linden-sound', v ? 'on' : 'off'); } catch (e) { } } };
})();

/* ---------- Pages ---------- */
const PAGES = [
  ['overview', 'Overview', I.grid, 'Money'], ['cards', 'Cards', I.card], ['payments', 'Payments', I.swap, null, 3],
  ['insights', 'Insights', I.bars, 'Plan'], ['budgets', 'Budgets', I.pie], ['goals', 'Goals', I.target],
  ['household', 'Household', I.people, 'Home'], ['settings', 'Settings', I.gear]
];
const TABS = ['overview', 'cards', 'payments', 'insights', 'goals'];
const TOTAL = DATA.cards.reduce((a, c) => a + c.avail, 0);
const sw = (on, key = '') => `<button class="sw${on ? ' on' : ''}" role="switch" aria-checked="${on}" ${key ? `data-sw="${key}"` : ''}><i></i></button>`;
const row = (name, sub, val, c, extra = '') => `<li ${extra}><span class="mono" style="--c:${c}">${initials(name)}</span><div class="t"><b>${name}</b><span>${sub}</span></div>${val}</li>`;
const txRows = (items, key) => items.map((t, i) => row(t[0], t[1], `<div class="v${t[2] > 0 ? ' in' : ''}">${signed(t[2])}<small>${t[4]}</small></div>`, t[3], `class="click" data-tx="${key}-${i}"`)).join('');

const netLogo = n => n === 'visa' ? '<b class="visa">VISA</b>' : '<span class="mcl"><i></i><i></i></span>';
const FULL = { every: '4929 1180 2266 4821', joint: '5412 7790 3105 0937', groc: '4024 0071 8843 6650' };
const cardHTML = c => `<div class="card${c.dark ? ' dk' : ''}" data-id="${c.id}">
  <div class="face front" style="background:${c.bg}"><span class="shine"></span>
    <div class="ct"><span>${c.name}<small>Linden ${c.net === 'visa' ? 'Visa' : 'Mastercard'} debit</small></span>${netLogo(c.net)}</div>
    <div class="chip"></div>
    <div class="cnum">•••• •••• •••• ${c.last4}</div>
    <div class="cb"><span>Card holder<b>${c.owner}</b></span><span>Expires<b>${c.exp}</b></span><span class="r">Available<b class="num">${money(c.avail)}</b></span></div>
    <div class="frost">${I.snow}<span>Card frozen</span></div><i class="dim"></i>
  </div>
  <div class="face back" style="background:${c.bg}">
    <div class="stripe"></div>
    <div class="sig"><i></i><b>${c.cvv}</b></div>
    <div class="cnum full">${FULL[c.id]}</div>
    <div class="cb"><span>Valid thru<b>${c.exp}</b></span><span class="r">Card support<b>+1 (800) 555-0142</b></span></div>
  </div></div>`;

const spendTotal = DATA.spend.reduce((a, s) => a + s[1], 0);
const H = {};

H.overview = () => `
<div class="ph"><div><h1>Good evening, <em>Ada</em></h1><p>Thursday, November 12 · you’re on track for payday.</p></div>
  <div class="acts"><button class="btn" data-go="budgets">${I.pie}Budgets</button><button class="btn mint" data-go="goals">${I.plus}Add to a pot</button></div></div>
<div class="g">
  <div class="c s5" id="walletC"><div class="ch"><div><h3>Wallet</h3><p>Tap the card to switch · ${DATA.cards.length} cards</p></div><a class="link" data-go="cards">Manage</a></div>
    <div class="stack" id="stack"></div><div class="cdots" id="cdots">${DATA.cards.map((c, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>
    <div class="cacts"><button class="cact" id="aFreeze">${I.snow}<span>Freeze</span></button><button class="cact" id="aFlip">${I.eye}<span>Details</span></button><button class="cact" data-go="cards">${I.sliders}<span>Limits</span></button></div>
  </div>
  <div class="c s7" id="balC"><div class="ch"><div><h3>Household balance</h3><p>All accounts · forecast to the end of the period</p></div>
    <div class="seg" id="balSeg"><span class="p"></span><button class="on" data-r="month">Month</button><button data-r="quarter">Quarter</button><button data-r="year">Year</button></div></div>
    <div class="balrow"><b class="big num" data-n="${TOTAL}">$0.00</b><span class="delta" id="balDelta"></span></div>
    <div class="legend"><span style="--c:var(--mint)"><i></i>Actual</span><span style="--c:rgba(166,240,196,.4)"><i></i>Forecast · rent and salary included</span></div>
    <div class="chart yax" id="balChart" style="height:228px;margin:18px 0 22px 44px"></div>
  </div>
  <div class="c s4"><div class="ch"><div><h3>Spent in November</h3><p>12 days in · on pace for ${money(spendTotal / 12 * 30, 0)}</p></div><span class="delta">−8% vs Oct 12</span></div>
    <b class="statb num" data-n="${spendTotal}" data-d="0">$0</b>
    <div class="sbar">${DATA.spend.map(s => `<i style="background:${s[2]}" data-w="${(s[1] / spendTotal * 100).toFixed(2)}"></i>`).join('')}</div>
    <ul class="cats">${DATA.spend.map(s => `<li style="--c:${s[2]}"><i></i>${s[0]}<b>${money(s[1], 0)}</b></li>`).join('')}</ul></div>
  <div class="c s4"><div class="ch"><div><h3>Coming up</h3><p>Bills in the next three weeks</p></div><span class="pill">${money(DATA.upcoming.reduce((a, u) => a + u[2], 0))}</span></div>
    <ul class="rows">${DATA.upcoming.map(u => row(u[0], u[1], `<div class="v">${money(-u[2])}</div>`, u[3])).join('')}</ul></div>
  <div class="c s4 tint"><div class="ch"><div><h3>Pots</h3><p>${money(DATA.goals.reduce((a, g) => a + g.saved, 0), 0)} saved across ${DATA.goals.length} goals</p></div><a class="link" data-go="goals">All pots</a></div>
    ${DATA.goals.slice(0, 3).map(g => `<div class="mini-goal"><div><b>${g.name}</b><span class="num">${money(g.saved, 0)} <small>of ${money(g.target, 0)}</small></span></div><div class="pbar"><i style="--c:${g.c}" data-w="${(g.saved / g.target * 100).toFixed(1)}"></i></div></div>`).join('')}</div>
  <div class="c s8"><div class="ch"><div><h3>Recent payments</h3><p>Tap one for details or to split it</p></div><a class="link" data-go="payments">See all</a></div>
    <div class="tx2"><div><div class="day">Today</div><ul class="rows">${txRows(DATA.payments[0].items, 0)}</ul></div><div><div class="day">Yesterday</div><ul class="rows">${txRows(DATA.payments[1].items, 1)}</ul></div></div></div>
  <div class="c s4"><div class="ch"><div><h3>Who spent what</h3><p>This month, by person</p></div></div>
    <div class="duo">${DATA.members.map(m => `<i style="background:${m.c}" data-w="${(m.spent / DATA.members.reduce((a, x) => a + x.spent, 0) * 100).toFixed(2)}"></i>`).join('')}</div>
    <ul class="rows" style="margin-top:16px">${DATA.members.map(m => `<li><span class="av" style="--c:${m.c}">${initials(m.name)}</span><div class="t"><b>${m.name.split(' ')[0]}</b><span>${m.role.split(' · ')[0]}</span></div><div class="v num">${money(m.spent, 0)}</div></li>`).join('')}</ul></div>
</div>`;

H.cards = () => `
<div class="ph"><div><h1>Your <em>cards</em></h1><p>Limits, controls and details for every card in the household.</p></div><button class="btn mint" data-act="virtual">${I.plus}New virtual card</button></div>
<div class="g">
  <div class="c s5"><div class="ch"><div><h3 id="ccName"></h3><p id="ccSub"></p></div><button class="btn sm" id="ccFlip">${I.eye}<span>Show details</span></button></div>
    <div class="solo" id="solo"></div>
    <div class="picks" id="picks">${DATA.cards.map((c, i) => `<button class="pick${i ? '' : ' on'}" data-card="${c.id}"><i style="background:${c.bg}"></i><span><b>${c.name}</b><small>··${c.last4}</small></span></button>`).join('')}</div>
    <div class="split" id="cStats" style="margin-top:14px"></div></div>
  <div class="c s7"><div class="ch"><div><h3>Monthly spending limit</h3><p>Payments above the limit are declined and you get a notification.</p></div></div>
    <div class="limv"><b class="big num" id="limV"></b><span id="limS"></span></div>
    <div class="slider" id="slider"><div class="tr"></div><div class="fl"></div><div class="mk"></div><div class="kn" role="slider" aria-label="Monthly limit" tabindex="0"></div></div>
    <div class="sl-l"><span>$250</span><span>$5,000</span></div>
    <ul class="ctl" id="ctl"></ul></div>
  <div class="c s8"><div class="ch"><div><h3>Spent on this card</h3><p>Last six months against the current limit</p></div><span class="pill" id="avgP"></span></div>
    <div class="chart yax" id="cardBars" style="height:200px;margin:8px 0 22px 44px"></div></div>
  <div class="c s4"><div class="ch"><div><h3>Card details</h3><p>Only visible to you</p></div></div>
    <dl class="dl" id="cdl"></dl></div>
</div>`;

H.payments = () => `
<div class="ph"><div><h1>Payments</h1><p>Everything in and out of the Hale household.</p></div>
  <div class="seg" id="paySeg"><span class="p"></span><button class="on" data-f="all">All</button><button data-f="in">Money in</button><button data-f="out">Money out</button></div></div>
<div class="g">
  <div class="c s8" id="payC"><div id="payList"></div></div>
  <div class="s4 col">
    <div class="c tint"><div class="ch"><div><h3>Send money</h3><p>To people you pay often</p></div></div>
      <div class="who-r">${[['Tom Hale', '#A6F0C4'], ['Maya Hale', '#FFC59A'], ['Oak St Lettings', '#9ED0FF'], ['Nina Park', '#DCF58A']].map((p, i) => `<button class="who${i ? '' : ' on'}" data-who="${p[0]}"><span class="av" style="--c:${p[1]}">${initials(p[0])}</span>${p[0].split(' ')[0]}</button>`).join('')}</div>
      <div class="chips">${[20, 40, 60, 100].map((v, i) => `<button${i === 1 ? ' class="on"' : ''} data-amt="${v}">$${v}</button>`).join('')}</div>
      <button class="btn mint w100" id="sendB">${I.arrow}<span>Send $40.00 to Tom</span></button></div>
    <div class="c"><div class="ch"><div><h3>Scheduled</h3><p>Direct debits and transfers</p></div></div>
      <ul class="rows">${DATA.upcoming.map(u => row(u[0], u[1], `<div class="v">${money(-u[2])}</div>`, u[3])).join('')}</ul></div>
  </div>
</div>`;

const io = DATA.inout, full = io.in.length - 1;
const avgIn = io.in.slice(0, full).reduce((a, b) => a + b, 0) / full;
const avgOut = io.out.slice(0, full).reduce((a, b) => a + b, 0) / full;
const savedYr = io.in.slice(0, full).reduce((a, v, i) => a + v - io.out[i], 0);
H.insights = () => `
<div class="ph"><div><h1>Where the money <em>goes</em></h1><p>Patterns across the last year, updated with every payment.</p></div>
  <div class="seg" id="ioSeg"><span class="p"></span><button data-m="6">6 months</button><button class="on" data-m="12">12 months</button></div></div>
<div class="g">
  <div class="c s3 stat"><span>Average money in</span><b class="num" data-n="${avgIn}" data-d="0">$0</b><small>per month, two salaries</small></div>
  <div class="c s3 stat"><span>Average money out</span><b class="num" data-n="${avgOut}" data-d="0">$0</b><small>per month, rent included</small></div>
  <div class="c s3 stat tint"><span>Saved this year</span><b class="num" data-n="${savedYr}" data-d="0">$0</b><small>Dec 2025 – Oct 2026</small></div>
  <div class="c s3 stat"><span>Savings rate</span><b class="num" data-n="${savedYr / (avgIn * full) * 100}" data-d="1" data-f="pct">0%</b><small>of everything earned</small></div>
  <div class="c s8"><div class="ch"><div><h3>Money in vs money out</h3><p>November is month-to-date</p></div>
    <div class="legend"><span style="--c:var(--mint)"><i></i>In</span><span style="--c:var(--peach)"><i></i>Out</span></div></div>
    <div class="chart yax" id="ioChart" style="height:296px;margin:8px 0 22px 44px"></div></div>
  <div class="c s4"><div class="ch"><div><h3>Top merchants</h3><p>Last 90 days</p></div></div>
    <ul class="rows">${[['Costco', 'Groceries · 6 visits', 612, '#6FD69E'], ['Whole Foods Market', 'Groceries · 9 visits', 498, '#6FD69E'], ['Trader Joe’s', 'Groceries · 7 visits', 341, '#6FD69E'], ['Shell', 'Fuel · 5 fill-ups', 264, '#FFC59A'], ['Uber', 'Transport · 11 rides', 188, '#9ED0FF']].map(m => `<li><span class="mono" style="--c:${m[3]}">${initials(m[0])}</span><div class="t"><b>${m[0]}</b><span>${m[1]}</span><div class="pbar"><i style="--c:${m[3]}" data-w="${(m[2] / 612 * 100).toFixed(1)}"></i></div></div><div class="v num">${money(m[2], 0)}</div></li>`).join('')}</ul></div>
  <div class="c s7"><div class="ch"><div><h3>When you spend</h3><p>Card payments by weekday, last 12 weeks</p></div><span class="pill">Saturdays cost the most</span></div>
    <div class="heat" id="heat">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, r) => `<span>${d}</span>` + Array.from({ length: 12 }, (_, c) => { const w = [.35, .3, .38, .42, .62, .9, .7][r]; const v = Math.min(1, w * (.55 + rnd(r * 12 + c) * .8)); return `<i data-v="${v.toFixed(2)}" title="${d}, week ${c + 1}: ${money(Math.round(v * 240), 0)}"></i>`; }).join('')).join('')}</div>
    <div class="hl2"><span>Less</span>${[.12, .35, .6, .85, 1].map(o => `<i style="opacity:${o}"></i>`).join('')}<span>More</span></div></div>
  <div class="c s5"><div class="ch"><div><h3>Compared with October</h3><p>Same 12 days, by category</p></div></div>
    <ul class="rows">${[['Eating out', 386, 302, '#FFC59A'], ['Groceries', 412, 468, '#6FD69E'], ['Transport', 164, 191, '#9ED0FF'], ['Kids', 236, 214, '#DCF58A'], ['Home & bills', 486, 540, '#A6F0C4']].map(r => { const d = (r[1] - r[2]) / r[2] * 100; return `<li><span class="mono" style="--c:${r[3]}">${initials(r[0])}</span><div class="t"><b>${r[0]}</b><span>${money(r[2], 0)} last month</span></div><span class="delta${d > 0 ? ' bad' : ''}">${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(0)}%</span><div class="v num" style="min-width:58px">${money(r[1], 0)}</div></li>`; }).join('')}</ul></div>
</div>`;

const bTot = DATA.budgets.reduce((a, b) => a + b[1], 0), bLim = DATA.budgets.reduce((a, b) => a + b[2], 0);
const ring = (pct, c, size, sw2, inner) => { const r = (size - sw2) / 2, C = 2 * Math.PI * r; return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="${sw2}"/><circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw2}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-c="${C}" data-p="${Math.min(1, pct)}"/></svg><div class="in">${inner}</div></div>`; };
H.budgets = () => `
<div class="ph"><div><h1>November <em>budgets</em></h1><p>Everyday spending, rent and bills excluded. Resets on Dec 1.</p></div><button class="btn mint" data-act="newbudget">${I.plus}New budget</button></div>
<div class="g">
  <div class="c s5 tint ringc">${ring(bTot / bLim, 'url(#rg)', 172, 15, `<div><b class="num" data-n="${bTot}" data-d="0">$0</b><span>of ${money(bLim, 0)}</span></div>`)}
    <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCF58A"/><stop offset="1" stop-color="#6FD69E"/></linearGradient></defs></svg>
    <div class="ringt"><h3>${Math.round(bTot / bLim * 100)}% used, 40% of the month gone</h3><p>You’re a little ahead of plan. Eating out is the only budget that’s over.</p>
      <div class="split"><div>Left to spend<b class="num">${money(bLim - bTot, 0)}</b></div><div>Per day<b class="num">${money((bLim - bTot) / 18, 0)}</b></div><div>Days left<b>18</b></div></div></div></div>
  <div class="c s7"><div class="ch"><div><h3>Pace this month</h3><p>Cumulative spending against an even plan</p></div><span class="delta bad">${money(DATA.pace[11] - bLim * 12 / 30, 0)} ahead of plan</span></div>
    <div class="legend" style="margin-bottom:4px"><span style="--c:var(--lime)"><i></i>Spent</span><span style="--c:rgba(226,242,233,.4)"><i></i>Even plan to ${money(bLim, 0)}</span></div>
    <div class="chart yax" id="paceChart" style="height:190px;margin:12px 0 22px 44px"></div></div>
  ${DATA.budgets.map((b, i) => { const p = b[1] / b[2], over = b[1] > b[2]; return `<div class="c s4 bud${over ? ' over' : ''}"><div class="hd"><span class="mono" style="--c:${b[3]}">${initials(b[0])}</span><div><b>${b[0]}</b><small>${over ? `Over by ${money(b[1] - b[2], 0)}` : `${money(b[2] - b[1], 0)} left · ${money((b[2] - b[1]) / 18, 0)}/day`}</small></div><span class="pct num">${Math.round(p * 100)}%</span></div>
    <div class="amt num"><b data-n="${b[1]}" data-d="0">$0</b><small>of ${money(b[2], 0)}</small></div><div class="pbar"><i style="--c:${over ? 'var(--rose)' : b[3]}" data-w="${Math.min(100, p * 100).toFixed(1)}"></i></div></div>`; }).join('')}
</div>`;

H.goals = () => `
<div class="ph"><div><h1>Savings <em>pots</em></h1><p>${money(DATA.goals.reduce((a, g) => a + g.auto, 0), 0)} goes in automatically every payday.</p></div><button class="btn mint" data-act="newpot">${I.plus}New pot</button></div>
<div class="g">
  ${DATA.goals.map((g, i) => `<div class="c s3 pot" data-goal="${i}"><div class="top2"><div><b>${g.name}</b><small>${g.note}</small></div></div>
    <div class="jar"><svg viewBox="0 0 100 200" preserveAspectRatio="none"><defs><linearGradient id="jg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g.c}" stop-opacity=".95"/><stop offset="1" stop-color="${g.c}" stop-opacity=".45"/></linearGradient></defs>
      <g class="lvl"><path class="w2" fill="${g.c}" opacity=".35" d="M0 8 Q12.5 0 25 8 T50 8 T75 8 T100 8 T125 8 T150 8 T175 8 T200 8 V230 H0Z"/><path class="w1" fill="url(#jg${i})" d="M0 10 Q12.5 3 25 10 T50 10 T75 10 T100 10 T125 10 T150 10 T175 10 T200 10 V230 H0Z"/></g></svg>
      <span class="pct num">0%</span></div>
    <div class="amt num">${money(g.saved, 0)}<small>of ${money(g.target, 0)}</small></div>
    <div class="pa"><button class="btn sm mint" data-add="${i}">${I.plus}$50</button><button class="btn sm" data-act="auto">${money(g.auto, 0)}/mo</button></div></div>`).join('')}
  <div class="c s7"><div class="ch"><div><h3>When you’ll get there</h3><p>At your current automatic transfers</p></div></div>
    <ul class="rows tl">${DATA.goals.map(g => { const m = Math.ceil((g.target - g.saved) / g.auto); const d = new Date(2026, 10 + m, 1); return `<li><span class="dotc" style="--c:${g.c}"></span><div class="t"><b>${g.name}</b><span>${money(g.target - g.saved, 0)} to go · ${m} payday${m > 1 ? 's' : ''}</span></div>${(() => { const late = g.due && d > new Date(g.due); return `<span class="pill${g.due ? (late ? ' late' : ' ok') : ''}">${d.toLocaleString('en-US', { month: 'short', year: 'numeric' })}${g.due ? (late ? ' · late' : ' · on time') : ''}</span>`; })()}</li>`; }).join('')}</ul></div>
  <div class="c s5 tint"><div class="ch"><div><h3>Round-ups</h3><p>Card payments rounded up to the nearest dollar</p></div>${sw(true)}</div>
    <b class="big num" data-n="38.62">$0.00</b><p class="muted" style="margin:8px 0 16px">rounded up this month from 64 payments, going to <b>Rainy-day fund</b>.</p>
    <div class="split"><div>October<b>$41.18</b></div><div>September<b>$36.95</b></div><div>This year<b>$402.30</b></div></div></div>
</div>`;

H.household = () => `
<div class="ph"><div><h1>The <em>Hale</em> household</h1><p>Three people, one shared view. Each person controls their own card.</p></div><button class="btn mint" data-act="invite">${I.plus}Invite someone</button></div>
<div class="g">
  ${DATA.members.map((m, i) => `<div class="c s4 mem"><div class="hd"><span class="av" style="--c:${m.c}">${initials(m.name)}</span><div><b>${m.name}</b><small>${m.role}</small></div></div>
    <div class="stat"><span>Spent this month</span><b class="num" data-n="${m.spent}" data-d="0">$0</b></div>
    <div>${m.perms.map(p => `<div class="perm"><span>${p[0]}</span>${sw(p[1])}</div>`).join('')}</div>
    ${m.allowance ? `<div class="perm allow"><span>Weekly pocket money</span><div class="step"><button data-step="-1" aria-label="Less">−</button><b class="num" id="allow">$${m.allowance}</b><button data-step="1" aria-label="More">+</button></div></div>` : ''}</div>`).join('')}
  <div class="c s7"><div class="ch"><div><h3>Shared costs</h3><p>How the joint account was used in November</p></div></div>
    ${[['Rent & bills', 486, 486, 0], ['Groceries', 412, 186, 226], ['Kids', 236, 128, 108], ['Eating out', 386, 238, 148]].map(r => `<div class="share"><div class="sh"><span>${r[0]}</span><b class="num">${money(r[1], 0)}</b></div><div class="duo"><i style="background:var(--lime)" data-w="${(r[2] / r[1] * 100).toFixed(1)}"></i><i style="background:var(--mint)" data-w="${(r[3] / r[1] * 100).toFixed(1)}"></i></div></div>`).join('')}
    <div class="legend" style="margin-top:14px"><span style="--c:var(--lime)"><i></i>Ada</span><span style="--c:var(--mint)"><i></i>Tom</span></div></div>
  <div class="c s5 warm"><div class="ch"><div><h3>Maya this week</h3><p>Limit $40 · resets Monday</p></div><span class="pill">$25.50 left</span></div>
    <div class="chart" id="mayaBars" style="height:150px;margin:6px 0 24px"></div></div>
</div>`;

H.settings = () => `
<div class="ph"><div><h1>Settings</h1><p>Profile, security and how Linden talks to you.</p></div></div>
<div class="g">
  <div class="c s6"><div class="ch"><div><h3>Profile</h3><p>Shown to people in your household</p></div><button class="btn sm">Edit</button></div>
    <dl class="dl">${[['Name', 'Ada Hale'], ['Email', 'ada@halehome.net'], ['Phone', '+1 (415) 555-0186'], ['Address', '2140 Linden Ave, Oakland CA'], ['Member since', 'March 2023']].map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')}</dl></div>
  <div class="c s6"><div class="ch"><div><h3>Security</h3><p>Two layers on everything</p></div><span class="pill ok">${I.shield}Strong</span></div>
    ${[['Two-step sign in', 'Authenticator app', true], ['Face ID for payments', 'Over $100', true], ['Lock new devices', 'Ask Ada first', true], ['Hide balances on launch', 'Tap to reveal', false]].map(r => `<div class="perm"><span><b>${r[0]}</b><small>${r[1]}</small></span>${sw(r[2])}</div>`).join('')}</div>
  <div class="c s6"><div class="ch"><div><h3>Notifications</h3><p>Only the ones that matter</p></div></div>
    ${[['Every card payment', true], ['Budget at 80%', true], ['Bills due tomorrow', true], ['Weekly summary on Sunday', false], ['Pocket money spent', true]].map(r => `<div class="perm"><span>${r[0]}</span>${sw(r[1])}</div>`).join('')}</div>
  <div class="c s6"><div class="ch"><div><h3>Linked accounts</h3><p>Balances sync every 15 minutes</p></div><button class="btn sm">${I.link}Link</button></div>
    <ul class="rows">${[['Northfield Credit Union', 'Checking ··2210 · synced 4 min ago', '#9ED0FF'], ['Brightline payroll', 'Salary deposits', '#A6F0C4'], ['Harbor Retirement', 'Read-only · 401(k)', '#DCF58A']].map(r => row(r[0], r[1], '<span class="pill ok">Connected</span>', r[2])).join('')}</ul></div>
</div>`;

/* ---------- Build shell ---------- */
const nav = $('#nav'), view = $('#view'), hl = $('#hl');
nav.insertAdjacentHTML('beforeend', PAGES.map(p => `${p[3] ? `<p>${p[3]}</p>` : ''}<a href="#${p[0]}" data-page="${p[0]}">${p[2]}<span>${p[1]}</span>${p[4] ? `<em>${p[4]}</em>` : ''}</a>`).join(''));
$('#tabbar').innerHTML = TABS.map(id => { const p = PAGES.find(x => x[0] === id); return `<a href="#${id}" data-page="${id}">${p[2]}${p[1]}</a>`; }).join('');
view.innerHTML = PAGES.map(p => `<section class="page" id="p-${p[0]}" aria-label="${p[1]}">${H[p[0]]()}</section>`).join('');
const pageEl = id => $('#p-' + id);
gsap.set('.page', { autoAlpha: 0 });

/* ---------- Scene ---------- */
(function scene() {
  const sc = $('#scene'), grain = $('.grain', sc);
  if (PHOTO) $('#photo').style.backgroundImage = `url(${PHOTO})`;
  const add = (cls, css, html = '') => { const e = document.createElement('div'); e.className = cls; Object.assign(e.style, css); e.innerHTML = html; sc.insertBefore(e, grain); return e; };
  [['#2E8A5B', 30, 22, 38], ['#7BC96F', 74, 70, 26], ['#145C3B', 82, 18, 42], ['#C9E86B', 58, 92, 20], ['#0E3E2A', 8, 70, 34], ['#3FA67A', 52, 40, 22]].forEach(([c, x, y, s], i) => {
    const b = add('blob', { left: x + '%', top: y + '%', width: s * 1.6 + 'vw', height: s * 1.6 + 'vw', marginLeft: -s * .8 + 'vw', marginTop: -s * .8 + 'vw', background: `radial-gradient(closest-side, ${c} 0%, ${c}cc 35%, ${c}00 100%)` });
    gsap.to(b, { x: (rnd(i) - .5) * 220, y: (rnd(i + 9) - .5) * 160, scale: .85 + rnd(i + 3) * .4, duration: 10 + rnd(i + 5) * 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
  // Leaves are blurred once into a bitmap, so the moving scene costs almost nothing per frame.
  function bake(svgStr, el, blur) {
    const w = Math.max(40, el.offsetWidth || innerWidth * .3), h = w * 1.2, pad = blur * 3, img = new Image(), cv = document.createElement('canvas');
    cv.width = w + pad * 2; cv.height = h + pad * 2; Object.assign(cv.style, { position: 'absolute', left: -pad + 'px', top: -pad + 'px', width: cv.width + 'px', height: cv.height + 'px' });
    el.appendChild(cv);
    img.onload = () => { const x = cv.getContext('2d'); x.filter = `blur(${blur}px)`; x.drawImage(img, pad, pad, w, h); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  }
  const leaf = c => `<svg viewBox="0 0 100 120" width="100%" height="100%"><path d="M50 4C82 24 96 58 84 88 74 112 30 116 16 92 0 64 16 26 50 4z" fill="${c}"/><path d="M50 8C52 50 50 80 40 116" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none"/></svg>`;
  [[-6, -10, 30, -32, '#0A2A1B'], [82, 58, 34, 148, '#0C301F'], [74, -14, 20, 40, '#164A30'], [-4, 64, 22, -120, '#12422B'], [40, 84, 16, 200, '#1C5A3A']].forEach(([x, y, s, r, c], i) => {
    const l = add('leaf', { left: x + '%', top: y + '%', width: s + 'vw', height: s * 1.2 + 'vw' });
    bake(leaf(c), l, 14);
    gsap.set(l, { rotation: r });
    gsap.to(l, { rotation: r + (i % 2 ? 6 : -6), x: (i % 2 ? 14 : -14), duration: 7 + i, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
  for (let i = 0; i < 16; i++) {
    const s = 10 + rnd(i + 40) * 46;
    const b = add('bok', { left: rnd(i + 20) * 100 + '%', top: rnd(i + 60) * 100 + '%', width: s + 'px', height: s + 'px', opacity: .18 + rnd(i + 80) * .35, background: `radial-gradient(closest-side, ${i % 3 ? '#E9FFC2' : '#A6F0C4'} 30%, transparent)` });
    gsap.to(b, { y: -30 - rnd(i) * 50, x: (rnd(i + 7) - .5) * 40, opacity: '+=.15', duration: 6 + rnd(i + 2) * 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
})();

/* ---------- Counters ---------- */
function count(el, to, dec = 2, dur = 1.2, fmt) {
  const o = { v: 0 }; fmt = fmt || (el.dataset.f === 'pct' ? (v, d) => v.toFixed(d) + '%' : money);
  return gsap.to(o, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v, dec); } });
}

/* ---------- Line chart (shared) ---------- */
function mono(ys) {
  const n = ys.length; if (n < 2) return () => ys[0];
  const d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = ys[i + 1] - ys[i];
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return t => {
    const x = Math.max(0, Math.min(1, t)) * (n - 1), i = Math.min(n - 2, Math.floor(x)), h = x - i, h2 = h * h, h3 = h2 * h;
    return (2 * h3 - 3 * h2 + 1) * ys[i] + (h3 - 2 * h2 + h) * m[i] + (-2 * h3 + 3 * h2) * ys[i + 1] + (h3 - h2) * m[i + 1];
  };
}
function niceTicks(min, max, n = 4) {
  const raw = (max - min) / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p, out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-6; v += step) out.push(v);
  return out;
}
let UID = 0;
function drawLine(el, cfg) {
  if (!el._init) {
    el._init = 1; el._uid = ++UID;
    el.innerHTML = '<div class="plot"></div><div class="yl"></div><div class="xl"></div><div class="halo"></div><div class="hdot"></div><div class="tip"></div><div class="endlab"></div>';
    el.addEventListener('mousemove', e => {
      const c = el._cfg, r = el.getBoundingClientRect(), t = (e.clientX - r.left) / r.width; if (t < 0 || t > 1 || !c.tip) return;
      const s = c.series.find(s => t >= s.from - 1e-6 && t <= s.to + 1e-6); if (!s) return;
      const v = s.fn(t), x = t * el.clientWidth, y = el._Y(v);
      gsap.set($('.hdot', el), { x, y, autoAlpha: 1 });
      const tip = $('.tip', el); tip.innerHTML = c.tip(t, v); gsap.set(tip, { left: x, top: y - 10, autoAlpha: 1 });
    });
    el.addEventListener('mouseleave', () => gsap.to($$('.tip,.hdot', el), { autoAlpha: 0, duration: .2 }));
  }
  el._cfg = cfg;
  const W = el.clientWidth, Ht = el.clientHeight; if (!W) return;
  const { min, max } = cfg, Y = v => Ht - (v - min) / (max - min) * Ht; el._Y = Y;
  const ticks = niceTicks(min, max), u = el._uid;
  let s = `<svg viewBox="0 0 ${W} ${Ht}"><defs>${cfg.series.map((sr, i) => sr.fill ? `<linearGradient id="lg${u}_${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sr.fill}" stop-opacity="${sr.fo ?? .32}"/><stop offset="1" stop-color="${sr.fill}" stop-opacity="0"/></linearGradient>` : '').join('')}</defs>
    <g class="gl">${ticks.map(v => `<line x1="0" x2="${W}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/>`).join('')}</g>`;
  cfg.series.forEach((sr, i) => {
    const N = Math.max(2, Math.round((sr.to - sr.from) * 160)), pts = [];
    for (let k = 0; k <= N; k++) { const t = sr.from + (sr.to - sr.from) * k / N; pts.push((t * W).toFixed(1) + ',' + Y(sr.fn(t)).toFixed(1)); }
    const line = 'M' + pts.join('L');
    if (sr.fill) s += `<path d="${line}L${(sr.to * W).toFixed(1)},${Ht}L${(sr.from * W).toFixed(1)},${Ht}Z" fill="url(#lg${u}_${i})"/>`;
    s += `<path d="${line}" fill="none" stroke="${sr.stroke}" stroke-width="${sr.w || 2.2}" stroke-linecap="round" stroke-linejoin="round" opacity="${sr.o ?? 1}"/>`;
  });
  if (cfg.marker) {
    const mx = cfg.marker.t * W, my = Y(cfg.marker.v);
    s += `<line x1="${mx}" x2="${mx}" y1="0" y2="${Ht}" stroke="rgba(255,255,255,.12)"/><circle cx="${mx}" cy="${my}" r="5" fill="#EEF6F1" stroke="${cfg.marker.c}" stroke-width="3"/>`;
    gsap.set($('.halo', el), { x: mx, y: my, display: 'block' });
  } else $('.halo', el).style.display = 'none';
  s += '</svg>';
  $('.plot', el).innerHTML = s;
  $('.yl', el).innerHTML = ticks.map(v => `<span style="top:${Y(v).toFixed(1)}px">${(cfg.yfmt || kfmt)(v)}</span>`).join('');
  $('.xl', el).innerHTML = cfg.xl.map(([t, f]) => `<span style="left:${(f * 100).toFixed(2)}%;${f === 0 ? 'transform:none' : f === 1 ? 'transform:translateX(-100%)' : ''}">${t}</span>`).join('');
  const end = $('.endlab', el);
  if (cfg.end) {
    // Keep the label clear of the line: look at the curve under the label and sit above it, or below if there is no room.
    end.style.display = 'block'; end.textContent = cfg.end.text;
    const lw = end.offsetWidth + 8, lh = end.offsetHeight; let lo = Infinity, hi = -Infinity;
    for (let k = 0; k <= 24; k++) {
      const t = 1 - (lw * k / 24) / W, sr = cfg.series.find(q => t >= q.from - 1e-6 && t <= q.to + 1e-6); if (!sr) continue;
      const y = Y(sr.fn(t)); lo = Math.min(lo, y); hi = Math.max(hi, y);
    }
    end.style.top = (lo - lh - 12 >= -4 ? lo - lh - 12 : hi + 12) + 'px';
  } else end.style.display = 'none';
}
function revealLine(el, delay = .15) {
  gsap.fromTo($('.plot', el), { clipPath: 'inset(-10% 100% -10% 0)' }, { clipPath: 'inset(-10% 0% -10% 0)', duration: 1.5, delay, ease: 'power2.inOut' });
  gsap.fromTo($$('.yl span, .xl span', el), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .03, delay });
  const h = $('.halo', el); gsap.killTweensOf(h);
  gsap.fromTo(h, { scale: .4, autoAlpha: .7 }, { scale: 2.6, autoAlpha: 0, duration: 1.8, repeat: -1, ease: 'power2.out', delay: delay + 1.3 });
  gsap.fromTo($('.endlab', el), { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: .5, delay: delay + 1.3 });
}

/* ---------- Bar chart (shared) ---------- */
function drawBars(el, cfg, grow) {
  el._cfg = cfg;
  const W = el.clientWidth, Ht = el.clientHeight; if (!W) return;
  const n = cfg.labels.length, ns = cfg.series.length, slot = W / n;
  const bw = Math.min(cfg.maxW || 36, slot * .72 / ns - (ns > 1 ? 3 : 0)), gap = ns > 1 ? 5 : 0, gw = ns * bw + (ns - 1) * gap;
  const max = cfg.max, Y = v => Ht - v / max * Ht, ticks = niceTicks(0, max);
  let s = `<svg viewBox="0 0 ${W} ${Ht}"><g class="gl">${ticks.map(v => `<line x1="0" x2="${W}" y1="${Y(v)}" y2="${Y(v)}"/>`).join('')}</g>`;
  for (let i = 0; i < n; i++) {
    const x0 = slot * i + (slot - gw) / 2;
    cfg.series.forEach((sr, j) => {
      const v = sr.vals[i], h = Math.max(2, Ht - Y(v)), c = typeof sr.color === 'function' ? sr.color(v, i) : sr.color;
      s += `<rect class="bar" data-i="${i}" x="${(x0 + j * (bw + gap)).toFixed(1)}" y="${(Ht - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(8, bw / 3).toFixed(1)}" fill="${c}" opacity="${sr.op ? sr.op(i) : 1}"/>`;
    });
  }
  if (cfg.ref) s += `<line class="ref" x1="0" x2="${W}" y1="${Y(cfg.ref.v)}" y2="${Y(cfg.ref.v)}" stroke="rgba(255,154,139,.55)" stroke-width="1.5"/>`;
  s += '</svg>';
  el.innerHTML = `<div class="plot">${s}</div><div class="yl">${cfg.noY ? '' : ticks.map(v => `<span style="top:${Y(v)}px">${(cfg.yfmt || kfmt)(v)}</span>`).join('')}</div>
    <div class="xl">${cfg.labels.map((l, i) => slot < 36 && i % 2 ? '' : `<span style="left:${((i + .5) / n * 100).toFixed(2)}%">${l}</span>`).join('')}</div>
    ${cfg.ref ? `<div class="reflab" style="top:${Y(cfg.ref.v)}px">${cfg.ref.label}</div>` : ''}<div class="tip"></div>`;
  if (cfg.tip) {
    $$('.bar', el).forEach(b => b.addEventListener('mouseenter', () => {
      const i = +b.dataset.i, tip = $('.tip', el); tip.innerHTML = cfg.tip(i);
      gsap.set(tip, { left: (i + .5) * slot, top: Math.min(...$$(`.bar[data-i="${i}"]`, el).map(r => +r.getAttribute('y'))) - 8, autoAlpha: 1 });
    }));
    el.onmouseleave = () => gsap.to($('.tip', el), { autoAlpha: 0, duration: .2 });
  }
  if (grow) {
    gsap.from($$('.bar', el), { scaleY: 0, transformOrigin: '50% 100%', duration: .9, ease: 'back.out(1.3)', stagger: { each: .035 }, delay: .15 });
    gsap.from($$('.xl span, .yl span, .reflab', el), { autoAlpha: 0, duration: .5, stagger: .02, delay: .1 });
  }
}

/* ---------- Wallet stack (overview) ---------- */
const frozen = new Set();
const W8 = (() => {
  const root = $('#stack'); root.innerHTML = DATA.cards.map(cardHTML).join('');
  const els = Object.fromEntries($$('.card', root).map(e => [e.dataset.id, e]));
  const order = DATA.cards.map(c => c.id); let flipped = false, busy = false;
  const lay = (d = .6) => order.forEach((id, i) => {
    gsap.set(els[id], { zIndex: 10 - i });
    gsap.to(els[id], { y: -i * 24, scale: 1 - i * .055, rotationX: 0, rotationZ: 0, '--b': 1 - i * .22, duration: d, ease: 'glide', overwrite: 'auto' });
  });
  const dots = () => $$('#cdots i').forEach((d, i) => d.classList.toggle('on', DATA.cards[i].id === order[0]));
  const syncFreeze = () => $('#aFreeze').classList.toggle('on', frozen.has(order[0]));
  const shine = id => gsap.fromTo($('.front .shine', els[id]), { left: '-60%' }, { left: '140%', duration: 1.1, ease: 'power2.inOut' });
  function flip(force) {
    const on = force ?? !flipped; if (on === flipped) return gsap.timeline();
    flipped = on; $('#aFlip').classList.toggle('on', on); SFX.play('flip');
    return gsap.timeline().to(els[order[0]], { rotationY: on ? 180 : 0, duration: .9, ease: 'power3.inOut' }).to(els[order[0]], { y: -14, duration: .45, ease: 'power2.out', yoyo: true, repeat: 1 }, 0);
  }
  function cycle() {
    if (busy) return; busy = true; SFX.play('swipe');
    const tl = gsap.timeline({ onComplete: () => { busy = false; } });
    if (flipped) tl.add(flip(false));
    const front = els[order[0]];
    tl.to(front, { y: 70, rotationX: -14, rotationZ: -3, scale: .97, duration: .32, ease: 'power2.in' })
      .add(() => { order.push(order.shift()); gsap.set(front, { zIndex: 0 }); lay(.7); dots(); syncFreeze(); shine(order[0]); })
      .to({}, { duration: .5 });
    return tl;
  }
  root.addEventListener('click', () => cycle());
  $('#aFlip').addEventListener('click', () => flip());
  $('#aFreeze').addEventListener('click', () => setFreeze(order[0], !frozen.has(order[0])));
  return {
    lay, cycle, flip, front: () => order[0], syncFreeze,
    intro() {
      order.forEach((id, i) => gsap.set(els[id], { zIndex: 10 - i, rotationY: 0 }));
      flipped = false; $('#aFlip').classList.remove('on');
      gsap.fromTo(order.map(id => els[id]).reverse(), { y: 140, autoAlpha: 0, rotationX: -30 }, { y: (i) => -(order.length - 1 - i) * 24, autoAlpha: 1, rotationX: 0, duration: 1, ease: 'glide', stagger: .09, delay: .2, onComplete: () => { lay(.01); shine(order[0]); } });
      order.forEach((id, i) => gsap.set(els[id], { scale: 1 - i * .055, '--b': 1 - i * .22 }));
    }
  };
})();
function setFreeze(id, on, quiet) {
  on ? frozen.add(id) : frozen.delete(id); SFX.play(on ? 'freeze' : 'off', on ? 1 : .8);
  $$(`.card[data-id="${id}"] .frost`).forEach(f => {
    gsap.to(f, { autoAlpha: on ? 1 : 0, duration: .5, ease: 'power2.out' });
    gsap.fromTo($('svg', f), { rotation: on ? -90 : 0, scale: on ? .4 : 1 }, { rotation: 0, scale: 1, duration: .7, ease: 'back.out(2)' });
  });
  W8.syncFreeze(); CARDS.sync();
  if (!quiet) toast(on ? `${DATA.cards.find(c => c.id === id).name} card frozen` : `${DATA.cards.find(c => c.id === id).name} card unfrozen`, () => setFreeze(id, !on, true));
}

/* ---------- Balance chart ---------- */
const BAL = (() => {
  const el = $('#balChart');
  const build = key => {
    const r = DATA.balance[key], k = TOTAL / r.past[r.past.length - 1];
    const p = mono(r.past.map(v => v * k)), fu = mono(r.future.map(v => v * k));
    const fn = t => t <= r.f ? p(t / r.f) : fu((t - r.f) / (1 - r.f));
    const all = []; for (let i = 0; i <= 100; i++) all.push(fn(i / 100));
    const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * .12;
    return { key, fn, f: r.f, min: lo - pad, max: hi + pad, xl: r.labels, r, k, delta: TOTAL - r.past[0] * k, endV: r.future[r.future.length - 1] * k };
  };
  let cur = build('month');
  const cfgOf = (fn, f, min, max, xl, endV, r) => ({
    min, max, xl,
    series: [{ fn, from: 0, to: f, stroke: '#A6F0C4', fill: '#A6F0C4', w: 2.4 }, { fn, from: f, to: 1, stroke: '#A6F0C4', fill: '#A6F0C4', fo: .07, w: 2, o: .4 }],
    marker: { t: f, v: fn(f), c: '#A6F0C4' },
    end: { v: endV, text: `${r.key === 'year' ? 'Dec 1' : 'Nov 30'} · ${money(endV, 0)}` },
    tip: (t, v) => { const d = new Date(r.start + 'T12:00:00'); d.setDate(d.getDate() + Math.round(t * r.days)); return `${money(v, 0)}<small>${d.toLocaleString('en-US', { month: 'short', day: 'numeric' })}${t > f + .005 ? ' · forecast' : ''}</small>`; }
  });
  const delta = () => { $('#balDelta').textContent = `${signed(cur.delta, 0)} ${cur.r.since}`; };
  const draw = () => drawLine(el, cfgOf(cur.fn, cur.f, cur.min, cur.max, cur.xl, cur.endV, { ...cur.r, key: cur.key }));
  function set(key) {
    if (key === cur.key) return;
    const A = cur, B = build(key), o = { p: 0 };
    gsap.to($('.xl', el), { autoAlpha: 0, duration: .25 });
    gsap.to(o, {
      p: 1, duration: 1, ease: 'power3.inOut',
      onUpdate: () => {
        const p = o.p, fn = t => lerp(A.fn(t), B.fn(t), p);
        drawLine(el, cfgOf(fn, lerp(A.f, B.f, p), lerp(A.min, B.min, p), lerp(A.max, B.max, p), p < .5 ? A.xl : B.xl, lerp(A.endV, B.endV, p), { ...(p < .5 ? A.r : B.r), key: p < .5 ? A.key : B.key }));
      },
      onComplete: () => { cur = B; draw(); gsap.fromTo($('.xl', el), { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 }); }
    });
    const d = { v: A.delta }; gsap.to(d, { v: B.delta, duration: 1, ease: 'power3.inOut', onUpdate: () => { $('#balDelta').textContent = `${signed(d.v, 0)} ${B.r.since}`; } });
  }
  return { draw, set, reveal() { draw(); delta(); revealLine(el); } };
})();

/* ---------- Segmented controls ---------- */
function seg(root, onPick) {
  const pill = $('.p', root);
  const place = (b, d = .5) => gsap.to(pill, { x: b.offsetLeft - 3, width: b.offsetWidth, duration: d, ease: 'glide' });
  $$('button', root).forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('on')) return;
    $$('button', root).forEach(x => x.classList.toggle('on', x === b)); place(b); SFX.play('seg'); onPick(b);
  }));
  const init = () => { const b = $('button.on', root); if (b && b.offsetWidth) gsap.set(pill, { x: b.offsetLeft - 3, width: b.offsetWidth }); };
  init(); return { init };
}
const SEGS = [seg($('#balSeg'), b => BAL.set(b.dataset.r))];

/* ---------- Cards page ---------- */
const CARDS = (() => {
  let sel = DATA.cards[0].id, flipped = false;
  const solo = $('#solo'), slider = $('#slider'), kn = $('.kn', slider), fl = $('.fl', slider), mk = $('.mk', slider);
  const MIN = 250, MAX = 5000;
  const card = () => DATA.cards.find(c => c.id === sel);
  const hist = c => [.82, .94, 1.08, .9, 1.12, 0].map((f, i) => i === 5 ? c.spent : Math.round(c.limit * f * (c.id === 'joint' ? .45 : c.id === 'groc' ? .78 : .7)));
  const toX = v => (v - MIN) / (MAX - MIN) * slider.clientWidth;
  let bucket = null;
  function ratchet(v) { const k = Math.round(v / 100); if (bucket !== null && k !== bucket) SFX.play('tick', .45); bucket = k; }
  function limText(v) {
    const c = card(); $('#limV').textContent = money(v, 0);
    $('#limS').textContent = `${money(c.spent, 0)} spent so far · ${Math.round(c.spent / v * 100)}%`;
  }
  function place(v) { gsap.set(kn, { x: toX(v) }); fl.style.width = toX(v) + 'px'; mk.style.left = toX(card().spent) + 'px'; limText(v); }
  function bars(grow) {
    const c = card(), h = hist(c), max = Math.max(c.limit, ...h) * 1.15;
    drawBars($('#cardBars'), {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], max, maxW: 48,
      series: [{ vals: h, color: (v, i) => v > c.limit ? 'var(--rose)' : i === 5 ? 'var(--lime)' : 'rgba(166,240,196,.75)' }],
      ref: { v: c.limit, label: `Limit ${money(c.limit, 0)}` }, tip: i => `${money(h[i], 0)}<small>${['June', 'July', 'August', 'September', 'October', 'November so far'][i]}</small>`
    }, grow);
    $('#avgP').textContent = `Avg ${money(h.slice(0, 5).reduce((a, b) => a + b, 0) / 5, 0)}/mo`;
  }
  const drag = Draggable.create(kn, {
    type: 'x', bounds: { minX: 0, maxX: 1 },
    onPress() { this.applyBounds({ minX: 0, maxX: slider.clientWidth }); gsap.to(kn, { scale: 1.15, duration: .2 }); },
    onRelease() { gsap.to(kn, { scale: 1, duration: .3, ease: 'back.out(3)' }); },
    onDrag() { const v = Math.round((MIN + this.x / slider.clientWidth * (MAX - MIN)) / 50) * 50; card().limit = v; fl.style.width = this.x + 'px'; limText(v); ratchet(v); bars(false); }
  })[0];
  slider.addEventListener('click', e => { if (e.target === kn) return; const r = slider.getBoundingClientRect(); setLimit(MIN + (e.clientX - r.left) / r.width * (MAX - MIN), .5); });
  kn.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setLimit(card().limit + (e.key === 'ArrowRight' ? 50 : -50), .2); } });
  function setLimit(v, dur = 1.2) {
    v = Math.max(MIN, Math.min(MAX, Math.round(v / 50) * 50));
    const c = card(), o = { v: c.limit };
    return gsap.to(o, { v, duration: dur, ease: 'power2.inOut', onUpdate: () => { c.limit = Math.round(o.v / 10) * 10; place(o.v); ratchet(o.v); bars(false); }, onComplete: () => { c.limit = v; place(v); bars(false); drag.update(); } });
  }
  function ctl() {
    const c = card();
    $('#ctl').innerHTML = [['online', I.cart, 'Online payments', 'Shops, apps and subscriptions'], ['abroad', I.globe, 'Use abroad', 'Card works outside the US'], ['contactless', I.wave, 'Contactless', 'Tap to pay up to $200'], ['freeze', I.snow, 'Freeze card', 'Blocks every new payment until you unfreeze']]
      .map(([k, ic, t, s]) => `<li><span class="ii">${ic}</span><div class="t"><b>${t}</b><span>${s}</span></div>${sw(k === 'freeze' ? frozen.has(c.id) : c[k], 'card:' + k)}</li>`).join('');
  }
  function details() {
    const c = card();
    $('#ccName').textContent = c.name; $('#ccSub').textContent = `Linden ${c.net === 'visa' ? 'Visa' : 'Mastercard'} debit · ${c.owner}`;
    $('#cdl').innerHTML = [['Number', flipped ? FULL[c.id] : '•••• ' + c.last4], ['Expires', c.exp], ['Security code', flipped ? c.cvv : '•••'], ['Available', money(c.avail)], ['Billing ZIP', '94610']].map(r => `<dt>${r[0]}</dt><dd class="num">${r[1]}</dd>`).join('');
  }
  function render(grow) {
    solo.innerHTML = cardHTML(card()); flipped = false; $('#ccFlip span').textContent = 'Show details';
    if (frozen.has(sel)) gsap.set($('.frost', solo), { autoAlpha: 1 });
    details(); ctl(); place(card().limit); bars(grow);
    const n = { every: 23, joint: 4, groc: 9 }[sel];
    $('#cStats').innerHTML = `<div>This month<b class="num">${money(card().spent, 0)}</b></div><div>Payments<b>${n}</b></div><div>Average<b class="num">${money(card().spent / n, 0)}</b></div>`;
  }
  function pick(id) {
    if (id === sel) return;
    const old = $('.card', solo); SFX.play('swipe');
    $$('.pick').forEach(p => p.classList.toggle('on', p.dataset.card === id));
    gsap.timeline().to(old, { x: -60, rotationY: 35, autoAlpha: 0, duration: .35, ease: 'power2.in' })
      .add(() => { sel = id; render(false); gsap.from($('.card', solo), { x: 70, rotationY: -35, autoAlpha: 0, duration: .7, ease: 'glide' }); gsap.from('#limV,#limS', { y: 8, autoAlpha: 0, duration: .5, stagger: .05 }); });
  }
  function flip() {
    flipped = !flipped; SFX.play('flip'); $('#ccFlip span').textContent = flipped ? 'Hide details' : 'Show details';
    gsap.to($('.card', solo), { rotationY: flipped ? 180 : 0, duration: .9, ease: 'power3.inOut' }); details();
    gsap.from('#cdl dd', { autoAlpha: 0, x: 8, duration: .4, stagger: .04, delay: .3 });
  }
  $('#picks').addEventListener('click', e => { const b = e.target.closest('.pick'); if (b) pick(b.dataset.card); });
  $('#ccFlip').addEventListener('click', flip);
  return {
    render, pick, flip, setLimit, sync() { if (pageEl('cards')) { const s = $('[data-sw="card:freeze"]'); if (s) setSw(s, frozen.has(sel), true); gsap.to($('.frost', solo), { autoAlpha: frozen.has(sel) ? 1 : 0, duration: .4 }); } },
    enter() {
      render(true);
      gsap.from($('.card', solo), { rotationY: -28, rotationX: 10, y: 30, autoAlpha: 0, duration: 1.1, ease: 'glide', delay: .15 });
      const c = card(), o = { v: MIN }; gsap.to(o, { v: c.limit, duration: 1.3, ease: 'power3.out', delay: .3, onUpdate: () => place(o.v) });
    },
    sel: () => sel
  };
})();

/* ---------- Switches ---------- */
function setSw(b, on, quiet) {
  b.classList.toggle('on', on); b.setAttribute('aria-checked', on);
  gsap.to($('i', b), { x: on ? 18 : 0, duration: .45, ease: 'back.out(2.2)' });
  gsap.fromTo($('i', b), { scaleX: 1.3 }, { scaleX: 1, duration: .45, ease: 'power2.out' });
}
document.addEventListener('click', e => {
  const b = e.target.closest('.sw'); if (!b) return;
  const on = !b.classList.contains('on'); setSw(b, on); SFX.play(on ? 'on' : 'off');
  const k = b.dataset.sw;
  if (k && k.startsWith('card:')) {
    const f = k.split(':')[1], c = DATA.cards.find(x => x.id === CARDS.sel());
    if (f === 'freeze') setFreeze(c.id, on); else { c[f] = on; toast(`${({ online: 'Online payments', abroad: 'Use abroad', contactless: 'Contactless' })[f]} ${on ? 'on' : 'off'} for ${c.name}`, () => { c[f] = !on; setSw(b, !on); }); }
  }
});

/* ---------- Payments ---------- */
const PAY = (() => {
  let filter = 'all';
  function render(anim = true) {
    const html = DATA.payments.map((d, di) => {
      const items = d.items.map((t, i) => [t, i]).filter(([t]) => filter === 'all' || (filter === 'in' ? t[2] > 0 : t[2] < 0));
      if (!items.length) return '';
      return `<div class="day">${d.day}<span>${signed(items.reduce((a, [t]) => a + t[2], 0))}</span></div><ul class="rows">${items.map(([t, i]) => row(t[0], t[1], `<div class="v${t[2] > 0 ? ' in' : ''}">${signed(t[2])}<small>${t[4]}</small></div>`, t[3], `class="click" data-tx="${di}-${i}"`)).join('')}</ul>`;
    }).join('') || '<p class="muted">Nothing here yet.</p>';
    $('#payList').innerHTML = html;
    if (anim) gsap.from($$('#payList .day, #payList li'), { autoAlpha: 0, x: 18, duration: .55, stagger: .035, ease: 'glide' });
  }
  const s = seg($('#paySeg'), b => {
    gsap.to($$('#payList .day, #payList li'), { autoAlpha: 0, x: -12, duration: .2, stagger: .01, onComplete: () => { filter = b.dataset.f; render(); } });
  });
  SEGS.push(s);
  let who = 'Tom Hale', amt = 40;
  const label = () => { $('#sendB span').textContent = `Send ${money(amt)} to ${who.split(' ')[0] === 'Oak' ? 'Oak St' : who.split(' ')[0]}`; };
  $$('.who').forEach(b => b.addEventListener('click', () => { who = b.dataset.who; $$('.who').forEach(x => x.classList.toggle('on', x === b)); gsap.fromTo($('.av', b), { scale: .8 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); label(); }));
  $$('.chips button').forEach(b => b.addEventListener('click', () => { amt = +b.dataset.amt; $$('.chips button').forEach(x => x.classList.toggle('on', x === b)); label(); }));
  $('#sendB').addEventListener('click', () => {
    const w = who, a = amt; SFX.play('coin'); DATA.payments[0].items.unshift([w, 'Transfer · just now', -a, '#A6F0C4', 'Now']); render();
    gsap.fromTo('#sendB', { scale: .96 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    toast(`Sent ${money(a)} to ${w.split(' ')[0]}`, () => { DATA.payments[0].items.shift(); render(); });
  });
  return { render, enter() { render(); } };
})();

/* ---------- Drawer ---------- */
const drawer = $('#drawer'); gsap.set(drawer, { xPercent: 115, x: 0, y: 0, autoAlpha: 0 });
let openKey = null;
function openTx(key) {
  const [d, i] = key.split('-').map(Number), t = DATA.payments[d].items[i]; if (!t) return;
  openKey = key; $$('li[data-tx]').forEach(l => l.classList.toggle('sel', l.dataset.tx === key));
  const out = t[2] < 0, half = Math.abs(t[2]) / 2, [cat, card] = t[1].split(' · ');
  drawer.innerHTML = `<button class="ib x" data-act="close" aria-label="Close">${I.x}</button>
    <div class="hero"><span class="mono" style="--c:${t[3]}">${initials(t[0])}</span><span>${t[0]}</span><b class="num">${signed(t[2])}</b><span class="pill ok">Settled</span></div>
    <dl><dt>Date</dt><dd>${DATA.payments[d].day}, ${t[4]}</dd><dt>Category</dt><dd>${cat}</dd><dt>${out ? 'Paid with' : 'Paid into'}</dt><dd>${card || 'Linden'}</dd><dt>Reference</dt><dd class="num">LND-${(7300 + d * 97 + i * 13).toString(36).toUpperCase()}-${2291 + d * 40 + i}</dd></dl>
    ${out ? `<div class="ch"><div><h3>Split with Tom</h3><p>Send a request for half</p></div></div><div class="split"><div>You<b class="num">${money(half)}</b></div><div>Tom<b class="num">${money(half)}</b></div></div>
    <button class="btn mint w100" data-act="split" style="margin-top:14px">Request ${money(half)} from Tom</button>` : `<div class="note">${I.coin}<span>Salary detected. ${money(DATA.goals.reduce((a, g) => a + g.auto, 0), 0)} moved into pots automatically.</span></div>`}
    <button class="btn w100" style="margin-top:8px" data-act="report">Report a problem</button>`;
  SFX.play('drawer');
  gsap.to(drawer, { xPercent: 0, autoAlpha: 1, duration: .6, ease: 'glide' });
  gsap.from(drawer.children, { y: 16, autoAlpha: 0, duration: .5, stagger: .05, delay: .15, ease: 'glide' });
  const amt = $('.hero b', drawer); count(amt, t[2], 2, .9, signed);
}
function closeDrawer(quiet) { if (!openKey) return; openKey = null; if (!quiet) SFX.play('whoosh', .6); $$('li.sel').forEach(l => l.classList.remove('sel')); gsap.to(drawer, { xPercent: 115, autoAlpha: 0, duration: .45, ease: 'power3.in' }); }
document.addEventListener('click', e => {
  const tx = e.target.closest('[data-tx]'); if (tx) { openTx(tx.dataset.tx); return; }
  if (openKey && !e.target.closest('#drawer') && !e.target.closest('.toast')) closeDrawer();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

/* ---------- Toast ---------- */
const toastEl = $('#toast'); let undoFn = null, toastT;
gsap.set(toastEl, { xPercent: -50, yPercent: 160, x: 0, y: 0, autoAlpha: 0 });
function toast(msg, undo) {
  if (!SFX.recent()) SFX.play('chime', .8);
  $('#toastT').textContent = msg; undoFn = undo; $('#undo').style.display = undo ? '' : 'none';
  gsap.to(toastEl, { yPercent: 0, autoAlpha: 1, duration: .55, ease: 'back.out(1.6)' });
  toastT && toastT.kill(); toastT = gsap.delayedCall(3.6, hideToast);
}
function hideToast() { gsap.to(toastEl, { yPercent: 160, autoAlpha: 0, duration: .4, ease: 'power2.in' }); }
$('#undo').addEventListener('click', () => { SFX.play('off', .8); undoFn && undoFn(); undoFn = null; hideToast(); });

/* ---------- Actions ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act;
  if (act === 'close') closeDrawer();
  else if (act === 'split') { toast('Request sent to Tom', () => { }); closeDrawer(); }
  else if (act === 'report') toast('We’ll look into it within a day');
  else if (act === 'auto') toast('Automatic transfer runs on payday');
  else if (act === 'virtual') toast('Virtual card created · ··8193');
  else if (act === 'newbudget' || act === 'newpot' || act === 'invite') toast('That’s a demo action in this template');
});

/* ---------- Insights ---------- */
const INS = (() => {
  let months = 12;
  function draw(grow) {
    const s = io.in.length - months, lab = io.months.slice(s), vin = io.in.slice(s), vout = io.out.slice(s), last = lab.length - 1;
    drawBars($('#ioChart'), {
      labels: lab, max: Math.max(...vin, ...vout) * 1.12, maxW: 30,
      series: [{ vals: vin, color: '#A6F0C4', op: i => i === last ? .55 : 1 }, { vals: vout, color: '#FFC59A', op: i => i === last ? .55 : 1 }],
      tip: i => `In ${money(vin[i], 0)} · Out ${money(vout[i], 0)}<small>${lab[i]}${i === last ? ' so far' : ''} · kept ${money(vin[i] - vout[i], 0)}</small>`
    }, grow);
  }
  SEGS.push(seg($('#ioSeg'), b => { months = +b.dataset.m; draw(true); }));
  return {
    draw, enter() {
      draw(true);
      gsap.fromTo($$('#heat i'), { autoAlpha: 0, scale: .4 }, { autoAlpha: (i, el) => .1 + +el.dataset.v * .9, scale: 1, duration: .5, ease: 'back.out(2)', stagger: { each: .006, grid: [7, 12], from: 'start', axis: null }, delay: .3 });
    }
  };
})();

/* ---------- Budgets ---------- */
function paceDraw(reveal) {
  const el = $('#paceChart'), f = 11 / 29, p = mono(DATA.pace), lim = bLim;
  drawLine(el, {
    min: 0, max: lim * 1.05, yfmt: kfmt,
    xl: [['Nov 1', 0], ['Nov 8', 7 / 29], ['Nov 15', 14 / 29], ['Nov 22', 21 / 29], ['Nov 30', 1]],
    series: [{ fn: t => t * lim, from: 0, to: 1, stroke: 'rgba(226,242,233,.4)', w: 1.6 }, { fn: t => p(t / f), from: 0, to: f, stroke: '#DCF58A', fill: '#DCF58A', fo: .28, w: 2.6 }],
    marker: { t: f, v: DATA.pace[11], c: '#DCF58A' },
    tip: (t, v) => `${money(v, 0)}<small>Nov ${Math.round(t * 29) + 1}</small>`
  });
  if (reveal) revealLine(el, .25);
}
function ringsIn(p) { $$('.arc', p).forEach((a, i) => gsap.to(a, { strokeDashoffset: +a.dataset.c * (1 - +a.dataset.p), duration: 1.6, ease: 'power3.out', delay: .2 + i * .05 })); }

/* ---------- Goals (liquid pots) ---------- */
const POTS = (() => {
  $$('.pot').forEach((p, i) => {
    gsap.to($('.w1', p), { x: -100, duration: 2.6 + i * .3, repeat: -1, ease: 'none' });
    gsap.fromTo($('.w2', p), { x: -100 }, { x: 0, duration: 3.6 + i * .3, repeat: -1, ease: 'none' });
  });
  const level = (p, pct, dur = 1.6, delay = 0) => {
    const g = DATA.goals[+p.dataset.goal], o = { v: +p.dataset.pv || 0 };
    p.dataset.pv = pct;
    gsap.to($('.lvl', p), { y: 200 * (1 - pct) - 4, duration: dur, delay, ease: 'power3.out' });
    const lab = $('.pct', p), jar = $('.jar', p);
    const put = () => {
      // The percentage always sits inside the liquid, just under the wave, and fades in once there is room for it.
      const Hj = jar.clientHeight, surf = Hj * (1 - Math.min(1, o.v)) - 4 * Hj / 200;
      lab.textContent = Math.round(o.v * 100) + '%';
      gsap.set(lab, { y: Math.min(Hj - 30, surf + 17), autoAlpha: Math.max(0, Math.min(1, (Hj - surf - 30) / 14)) });
    };
    gsap.to(o, { v: pct, duration: dur, delay, ease: 'power3.out', onUpdate: put, onStart: put });
  };
  function add(i, amt = 50, quiet) {
    const g = DATA.goals[i], p = $(`.pot[data-goal="${i}"]`), from = g.saved; g.saved = Math.max(0, g.saved + amt);
    if (!quiet) SFX.play('coin');
    level(p, g.saved / g.target, 1.2);
    const o = { v: from }; gsap.to(o, { v: g.saved, duration: 1.1, ease: 'power3.out', onUpdate: () => { $('.amt', p).firstChild.textContent = money(o.v, 0); } });
    gsap.fromTo($('.jar', p), { scaleY: .98, scaleX: 1.02 }, { scaleY: 1, scaleX: 1, duration: .8, ease: 'elastic.out(1,.4)' });
    if (!quiet) toast(`Added ${money(amt, 0)} to ${g.name}`, () => add(i, -amt, true));
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b) add(+b.dataset.add); });
  return {
    add, enter() {
      gsap.delayedCall(.3, () => SFX.play('rise'));
      $$('.pot').forEach((p, i) => { gsap.set($('.lvl', p), { y: 204 }); p.dataset.pv = 0; const g = DATA.goals[i]; level(p, g.saved / g.target, 2, .3 + i * .12); });
    }
  };
})();

/* ---------- Household ---------- */
let allowance = DATA.members[2].allowance;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-step]'); if (!b) return;
  allowance = Math.max(0, Math.min(50, allowance + +b.dataset.step * 5)); const el = $('#allow'); SFX.play('tick');
  gsap.timeline().to(el, { y: -8, autoAlpha: 0, duration: .15 }).add(() => { el.textContent = '$' + allowance; }).fromTo(el, { y: 8 }, { y: 0, autoAlpha: 1, duration: .25 });
});
function mayaDraw(grow) {
  const v = [4.5, 0, 6.2, 3.8, 0, 0, 0];
  drawBars($('#mayaBars'), { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], max: 10, maxW: 34, noY: true, series: [{ vals: v, color: (x, i) => i === 3 ? 'var(--peach)' : 'rgba(255,197,154,.5)' }], tip: i => `${money(v[i])}<small>${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}</small>` }, grow);
}

/* ---------- Router ---------- */
const ENTER = {
  overview: () => { W8.intro(); BAL.reveal(); },
  cards: () => CARDS.enter(),
  payments: () => PAY.enter(),
  insights: () => INS.enter(),
  budgets: p => { paceDraw(true); ringsIn(p); },
  goals: () => POTS.enter(),
  household: () => mayaDraw(true)
};
const REDRAW = { overview: () => BAL.draw(), cards: () => CARDS.render(false), insights: () => INS.draw(false), budgets: () => paceDraw(false), household: () => mayaDraw(false) };
let cur = null;
function moveHl(id, d = .55) {
  const a = $(`.nav a[data-page="${id}"]`); if (!a) return;
  $$('.nav a, .tabbar a').forEach(x => x.classList.toggle('on', x.dataset.page === id));
  gsap.to(hl, { y: a.offsetTop, duration: d, ease: 'glide' });
}
function go(id, first) {
  if (!H[id]) id = 'overview';
  if (id === cur) return;
  closeDrawer(true);
  if (!first) SFX.play('whoosh');
  const prev = cur && pageEl(cur), next = pageEl(id); cur = id;
  moveHl(id, first ? 0 : .55);
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  document.title = `${PAGES.find(p => p[0] === id)[1]} · Linden`;
  if (prev) { prev.classList.remove('cur'); gsap.to(prev, { autoAlpha: 0, y: -10, duration: .2, ease: 'power2.in', onComplete: () => gsap.set(prev, { y: 0 }) }); }
  next.classList.add('cur'); next.scrollTop = 0; if (mq.matches) window.scrollTo(0, 0);
  gsap.set(next, { autoAlpha: 1, y: 0 });
  const items = $$(':scope > .ph, :scope > .g > *', next);
  gsap.fromTo(items, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .055, ease: 'glide', delay: prev ? .2 : 0, clearProps: 'transform' });
  SEGS.forEach(s => s.init());
  $$('[data-n]', next).forEach(el => count(el, +el.dataset.n, +(el.dataset.d ?? 2), 1.4));
  $$('.pbar i, .sbar i, .duo i', next).forEach((el, i) => gsap.fromTo(el, { width: 0 }, { width: el.dataset.w + '%', duration: 1.2, delay: .3 + i * .04, ease: 'glide' }));
  ENTER[id] && ENTER[id](next);
}
$$('.nav a, .tabbar a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.dataset.page); }));
addEventListener('hashchange', () => go(location.hash.slice(1)));
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { moveHl(cur, 0); SEGS.forEach(s => s.init()); REDRAW[cur] && REDRAW[cur](); }, 120); });

/* ---------- Generic click sound + sound switch ---------- */
const soundB = $('#soundB');
const soundIcon = () => { soundB.innerHTML = SFX.isOn() ? I.vol : I.mute; soundB.setAttribute('aria-pressed', SFX.isOn()); soundB.setAttribute('aria-label', SFX.isOn() ? 'Mute sounds' : 'Turn sounds on'); };
soundB.addEventListener('click', () => { SFX.set(!SFX.isOn()); soundIcon(); SFX.play('on'); });
soundIcon();
document.addEventListener('click', e => { if (!SFX.recent() && e.target.closest('button, a, .pick, .who, li.click, .stack')) SFX.play('click'); });

/* ---------- Boot ---------- */
CARDS.render(false); PAY.render(false);
gsap.from('#win', { autoAlpha: 0, scale: .97, y: 24, duration: 1.1, ease: 'glide' });
gsap.from('.nav a, .nav p, .safe, .me', { autoAlpha: 0, x: -14, duration: .6, stagger: .04, delay: .25, ease: 'glide' });
count($('#safeN'), 91, 0, 1.6);
gsap.to('#safeBar', { width: '62%', duration: 1.6, delay: .4, ease: 'glide' });
go(location.hash.slice(1) || 'overview', true);

/* ---------- Small public API (handy for wiring your own data and tests) ---------- */
window.LINDEN = {
  go, openTx, closeDrawer, toast, setFreeze, cycle: () => W8.cycle(), flip: f => W8.flip(f),
  bal: k => $(`#balSeg button[data-r="${k}"]`).click(), cards: CARDS, pots: POTS
};
})();
