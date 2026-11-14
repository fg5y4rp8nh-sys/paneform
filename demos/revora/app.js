/* Revora — app logic. Vanilla JS + GSAP (free for commercial use). */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (v, d = 0) => (v < 0 ? '−' : '') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (v, d = 0) => (v > 0 ? '+' : '') + money(v, d);
const kfmt = v => '$' + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1).replace('.0', '') + 'k' : Math.round(v));
const lerp = (a, b, p) => a + (b - a) * p;
const ini = s => s.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const mq = matchMedia('(max-width:760px)');
gsap.registerPlugin(CustomEase);
CustomEase.create('glide', '0.22,1,0.36,1');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.globalTimeline.timeScale(20);

/* ---------- Icons ---------- */
const svg = p => `<svg class="ic" viewBox="0 0 24 24">${p}</svg>`;
const I = {
  home: svg('<path d="M3 11 12 4l9 7M5 10v10h14V10"/>'),
  rev: svg('<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>'),
  users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>'),
  plans: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M8 14h3"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'),
  vol: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  dl: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
  ext: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>'),
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* ---------- Sound ---------- */
// Short, soft UI clicks (sounds.js). Off switch in the top bar; the choice is remembered.
const SFX = (() => {
  let ctx = null, on = true, last = -1e9; const bufs = {};
  try { on = localStorage.getItem('revora-sound') !== 'off'; } catch (e) { }
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
  return { play, recent: () => performance.now() - last < 40, isOn: () => on, set(v) { on = v; try { localStorage.setItem('revora-sound', v ? 'on' : 'off'); } catch (e) { } } };
})();

/* ---------- Helpers ---------- */
const sw = on => `<button class="sw${on ? ' on' : ''}" role="switch" aria-checked="${on}"><i></i></button>`;
const D = DATA, mrr = D.mrr12[11], mrrPrev = D.mrr12[10];
const custTotal = D.plans.reduce((a, p) => a + p.customers, 0);
const arpu = mrr / custTotal;
const spark = (vals, color, fill) => {
  const W = 200, Hh = 36, mn = Math.min(...vals), mx = Math.max(...vals), f = mono(vals);
  const pts = []; for (let k = 0; k <= 60; k++) { const t = k / 60; pts.push((t * W).toFixed(1) + ',' + (Hh - (f(t) - mn) / (mx - mn || 1) * Hh).toFixed(1)); }
  const gid = 'sp' + Math.random().toString(36).slice(2, 7);
  return `<svg class="spark" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${fill ? `<path d="M${pts.join('L')}L${W},${Hh}L0,${Hh}Z" fill="url(#${gid})"/>` : ''}<path d="M${pts.join('L')}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>`;
};
const statusPill = s => `<span class="pill ${({ Active: 'ok', Trial: 'trial', 'Past due': 'due', Churned: 'off' })[s]}"><i></i>${s}</span>`;
const planColor = p => (D.plans.find(x => x.name === p) || {}).color || '#ccc';

/* ---------- Pages ---------- */
const PAGES = [['overview', 'Overview', I.home], ['revenue', 'Revenue', I.rev], ['customers', 'Customers', I.users], ['plans', 'Plans', I.plans], ['settings', 'Settings', I.gear]];
const H = {};

H.overview = () => `
<div class="ph"><div><div class="eyebrow">Thursday, November 12 · live from Stripe</div><h1>Revenue is up <span>${((mrr / mrrPrev - 1) * 100).toFixed(1)}%</span> this month</h1></div>
  <div class="acts"><button class="btn" data-act="export">${I.dl}Export</button><button class="btn dark" data-go="revenue">Open revenue</button></div></div>
<div class="g">
  <div class="c ink kpi s3" id="kMrr"><div class="lab">Monthly recurring revenue <span class="delta">+${((mrr / mrrPrev - 1) * 100).toFixed(1)}%</span></div><b class="num" data-n="${mrr}">$0</b><small>${signed(mrr - mrrPrev)} vs October</small>${spark(D.mrr12, '#FF5A1F', true)}</div>
  <div class="c kpi s3"><div class="lab">Paying customers <span class="delta">+38</span></div><b class="num" data-n="${custTotal}" data-f="int">0</b><small>412 new this month · 31 churned</small>${spark([902, 941, 968, 1004, 1032, 1050, 1081, 1102, 1121, 1139, 1150, 1188], '#16140F')}</div>
  <div class="c kpi s3"><div class="lab">Customer churn <span class="delta">−0.3 pts</span></div><b class="num" data-n="2.1" data-d="1" data-f="pct">0%</b><small>Revenue churn 1.4% · NRR 108%</small>${spark([3.4, 3.1, 3.2, 2.9, 2.8, 2.7, 2.6, 2.6, 2.5, 2.4, 2.4, 2.1], '#178A5E')}</div>
  <div class="c kpi s3"><div class="lab">Avg. revenue per customer <span class="delta">+$1.80</span></div><b class="num" data-n="${arpu}" data-d="2">$0</b><small>Lifetime value ≈ ${money(arpu / .021)}</small>${spark([58.1, 58.6, 59.8, 60.0, 60.8, 61.9, 63.3, 64.6, 66.0, 68.0, 69.2, 70.97], '#FF9B6B')}</div>
  <div class="c s8" id="mrrC"><div class="ch"><div><h3>MRR growth</h3><p>All plans, after discounts</p></div>
    <div class="seg" id="mrrSeg"><span class="p"></span><button data-r="30">30D</button><button data-r="90">90D</button><button class="on" data-r="12">12M</button></div></div>
    <div class="legend" style="margin-bottom:6px"><span style="--c:var(--accent)"><i></i>MRR</span><span id="tgtLeg" style="--c:#16140F;opacity:.6"><i></i>Target ${kfmt(90000)} by Dec 31</span></div>
    <div class="chart yax" id="mrrChart" style="height:250px;margin:16px 0 26px 50px"></div></div>
  <div class="c s4" id="mvC"><div class="ch"><div><h3>MRR movement</h3><p>November so far</p></div></div>
    <div class="mv">${D.movement.map(m => `<div class="row"><span>${m[0]}</span><div class="tr"><i style="--c:${m[2]}" data-w="${(Math.abs(m[1]) / 5840 * 100).toFixed(1)}"></i></div><b class="${m[1] < 0 ? '' : ''}">${signed(m[1])}</b></div>`).join('')}
      <div class="net"><span>Net new MRR</span><b class="num" data-n="${D.movement.reduce((a, m) => a + m[1], 0)}" data-f="signed">$0</b></div></div>
    <p class="mono" style="margin-top:16px;color:var(--muted)">Quick ratio ${((5840 + 2960) / (1180 + 3900)).toFixed(2)} · healthy above 1.5</p></div>
  <div class="c s4" id="mixC"><div class="ch"><div><h3>Plan mix</h3><p>Share of MRR</p></div><a class="link" data-go="plans">Plans</a></div>
    <div class="donut" id="donut"></div>
    <ul class="dl">${D.plans.map(p => `<li style="--c:${p.color}"><i></i>${p.name}<b>${money(p.price * p.customers)}</b><em>${(p.price * p.customers / mrr * 100).toFixed(0)}%</em></li>`).join('')}</ul></div>
  <div class="c s4"><div class="ch"><div><h3>New customers</h3><p>Latest paid sign-ups</p></div><a class="link" data-go="customers">All</a></div>
    <ul class="rows">${D.signups.map(s => `<li><span class="logo-b" style="--c:${planColor(s[1]) === '#FFC9B3' ? '#F08A5D' : planColor(s[1])}">${ini(s[0])}</span><div class="t"><b>${s[0]}</b><span>${s[1]} · ${s[4]}</span></div><div class="v">+${money(s[2])}<small>${s[3]}</small></div></li>`).join('')}</ul></div>
  <div class="c s4"><div class="ch"><div><h3>Customers by country</h3><p>Share of paying accounts</p></div></div>
    <div class="bars">${D.countries.map((c, i) => `<div class="b"><span>${c[0]}</span><div class="pbar"><i style="--c:${i ? 'var(--accent-2)' : 'var(--accent)'}" data-w="${(c[1] / 38 * 100).toFixed(1)}"></i></div><em>${c[1]}%</em></div>`).join('')}</div></div>
</div>`;

const ltv = arpu / .021;
H.revenue = () => `
<div class="ph"><div><div class="eyebrow">Revenue · last 12 months</div><h1>Annual run rate <span>${money(mrr * 12)}</span></h1></div>
  <div class="acts"><button class="btn" data-act="export">${I.dl}Export CSV</button></div></div>
<div class="g">
  <div class="c kpi s3"><div class="lab">Annual run rate</div><b class="num" data-n="${mrr * 12}">$0</b><small>MRR × 12</small></div>
  <div class="c kpi s3"><div class="lab">Net revenue retention</div><b class="num" data-n="108" data-f="pct0">0%</b><small>Expansion outpaces churn</small></div>
  <div class="c kpi s3"><div class="lab">Customer lifetime value</div><b class="num" data-n="${ltv}">$0</b><small>ARPU ÷ monthly churn</small></div>
  <div class="c ink kpi s3"><div class="lab">CAC payback</div><b class="num" data-n="7.2" data-d="1" data-f="mo">0</b><small>Blended paid + organic</small></div>
  <div class="c s8"><div class="ch"><div><h3>MRR by plan</h3><p>Stacked, month end</p></div>
    <div class="legend">${D.plans.map(p => `<span style="--c:${p.color}"><i></i>${p.name}</span>`).join('')}</div></div>
    <div class="chart yax" id="stackChart" style="height:280px;margin:12px 0 26px 50px"></div></div>
  <div class="c s4"><div class="ch"><div><h3>Trial funnel</h3><p>Last 30 days</p></div></div>
    <div class="fun">${D.funnel.map((f, i) => `<div class="st"><i style="--c:${['#FFE1D4', '#FFC2A8', '#FF9A72', '#FF5A1F'][i]}" data-w="${[100, 80, 66, 52][i]}"></i><div><span>${f[0]}</span><b class="num" data-n="${f[1]}" data-f="int">0</b></div></div>${i < 3 ? `<div class="cv">↓ ${(D.funnel[i + 1][1] / f[1] * 100).toFixed(1)}% convert</div>` : ''}`).join('')}</div></div>
  <div class="c s12" id="cohC"><div class="ch"><div><h3>Retention by cohort</h3><p>Share of customers still paying, by month they signed up</p></div>
    <div class="legend"><span style="--c:#FFE6DA"><i></i>Lower</span><span style="--c:#FF5A1F"><i></i>Higher</span></div></div>
    <div class="coh" id="coh"><div class="h">Cohort</div>${Array.from({ length: 8 }, (_, i) => `<div class="h">M${i}</div>`).join('')}
    ${D.cohorts.map(r => `<div class="lab"><b>${r[0]} 2026</b><span>${r[1]} customers</span></div>` + Array.from({ length: 8 }, (_, i) => { const v = r[2][i]; if (v === undefined) return '<div class="empty"></div>'; const t = (v - 76) / 24; const bg = `color-mix(in srgb, #FF5A1F ${Math.round(18 + Math.max(0, Math.min(1, t)) * 82)}%, #FFF4EE)`; return `<div class="cell" style="background:${bg};color:${t > .55 ? '#fff' : 'var(--ink)'}">${v}%</div>`; }).join('')).join('')}</div></div>
</div>`;

H.customers = () => `
<div class="ph"><div><div class="eyebrow">${D.customers.length} accounts shown · ${custTotal.toLocaleString('en-US')} paying in total</div><h1>Customers</h1></div>
  <div class="acts"><button class="btn" data-act="export">${I.dl}Export</button><button class="btn acc" data-act="invite">${I.plus}Add customer</button></div></div>
<div class="c">
  <div class="tools"><label class="search"><svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></svg><input id="cq" placeholder="Search name or email"></label>
    <div class="seg" id="custSeg"><span class="p"></span>${['All', 'Active', 'Trial', 'Past due', 'Churned'].map((s, i) => `<button${i ? '' : ' class="on"'} data-s="${s}">${s}</button>`).join('')}</div>
    <span class="mono" id="ccount" style="margin-left:auto;color:var(--muted)"></span></div>
  <div class="tblwrap"><table class="tbl"><thead><tr>
    <th data-k="name">Customer</th><th data-k="plan">Plan</th><th data-k="mrr" class="r sorted">MRR ↓</th><th data-k="seats" class="r">Seats</th><th data-k="health">Health</th><th data-k="status">Status</th><th data-k="country">Country</th><th data-k="since">Since</th>
  </tr></thead><tbody id="ctb"></tbody></table></div>
</div>`;

H.plans = () => `
<div class="ph"><div><div class="eyebrow">Pricing · ${custTotal.toLocaleString('en-US')} paying customers</div><h1>Plans</h1></div>
  <div class="acts"><div class="bill">Monthly ${sw(false).replace('class="sw', 'id="billSw" class="sw')} Yearly <em>save 17%</em></div></div></div>
<div class="plans">${D.plans.map((p, i) => `<div class="plan${p.popular ? ' pop' : ''}">${p.popular ? '<span class="pill trial tag" style="background:var(--accent);color:#fff">Most popular</span>' : ''}
  <h4>${p.name}</h4><div class="pr"><b class="num" data-price="${i}">$${p.price}</b><span>per month</span></div><span class="mono" style="opacity:.7">${p.seats}</span>
  <ul>${p.feats.map(f => `<li>${I.check}${f}</li>`).join('')}</ul>
  <div class="stats"><div>Customers<b class="num" data-n="${p.customers}" data-f="int">0</b></div><div>MRR<b class="num" data-n="${p.price * p.customers}">$0</b></div><div>Share<b class="num">${(p.price * p.customers / mrr * 100).toFixed(0)}%</b></div></div></div>`).join('')}</div>
<div class="g" style="margin-top:16px">
  <div class="c s6"><div class="ch"><div><h3>Plan changes</h3><p>Last 30 days</p></div></div>
    <ul class="rows">${[['Halden Freight', 'Growth → Business', 240, 1], ['Marlowe & Finch', 'Starter → Growth', 100, 1], ['Vela Robotics', 'Growth → Business', 120, 1], ['Quillstone', 'Business → Growth', -120, 0], ['Oakmere Legal', 'Growth → Starter', -50, 0]].map(r => `<li><span class="logo-b" style="--c:${r[3] ? '#FF5A1F' : '#16140F'}">${ini(r[0])}</span><div class="t"><b>${r[0]}</b><span>${r[1]}</span></div><div class="v" style="color:${r[2] > 0 ? 'var(--green)' : 'var(--red)'}">${signed(r[2])}<small>MRR</small></div></li>`).join('')}</ul></div>
  <div class="c s6"><div class="ch"><div><h3>Trial to paid</h3><p>By plan chosen at sign-up</p></div></div>
    <div class="bars">${[['Starter', 31], ['Growth', 27], ['Business', 19]].map((r, i) => `<div class="b"><span>${r[0]}</span><div class="pbar"><i style="--c:${D.plans[i].color}" data-w="${(r[1] / 31 * 100).toFixed(1)}"></i></div><em>${r[1]}%</em></div>`).join('')}</div>
    <div class="minis">${[['Trials started', '1,520'], ['Converted', '412'], ['Time to convert', '9 days']].map(m => `<div><span>${m[0]}</span><b>${m[1]}</b></div>`).join('')}</div>
    <p class="mono" style="margin-top:14px;color:var(--muted)">14-day free trial · no card required</p></div>
</div>`;

H.settings = () => `
<div class="ph"><div><div class="eyebrow">Workspace · Revora Inc.</div><h1>Settings</h1></div></div>
<div class="g">
  <div class="c s6"><div class="ch"><div><h3>Team</h3><p>${D.team.length} members</p></div><button class="btn sm" data-act="invite">${I.plus}Invite</button></div>
    <ul class="rows">${D.team.map((t, i) => `<li><span class="logo-b" style="--c:${['#FF5A1F', '#16140F', '#FF9B6B', '#A49E92'][i]};border-radius:50%">${ini(t[0])}</span><div class="t"><b>${t[0]}</b><span>${t[2]}</span></div><span class="pill${i ? '' : ' ink'}">${t[1]}</span></li>`).join('')}</ul></div>
  <div class="c s6"><div class="ch"><div><h3>Integrations</h3><p>Where Revora gets its data</p></div></div>
    ${D.integrations.map(t => `<div class="set"><span class="int" style="--c:${t[3]}">${t[0][0]}</span><span style="flex:1"><b>${t[0]}</b><small>${t[1]}</small></span>${sw(t[2])}</div>`).join('')}</div>
  <div class="c s6"><div class="ch"><div><h3>Alerts</h3><p>Sent to email and Slack</p></div></div>
    ${[['Payment failed', 'Retry in 3 days, then email the customer', true], ['Churn risk', 'Health score drops below 40', true], ['Large upgrade', 'Any change above $200 MRR', true], ['Weekly summary', 'Monday 9:00', false]].map(t => `<div class="set"><span><b>${t[0]}</b><small>${t[1]}</small></span>${sw(t[2])}</div>`).join('')}</div>
  <div class="c s6"><div class="ch"><div><h3>Billing</h3><p>Your Revora subscription</p></div><span class="pill ok"><i></i>Active</span></div>
    ${[['Plan', 'Business · yearly'], ['Next invoice', 'Jan 4, 2027 · $1,990'], ['Payment method', 'Visa ending 4242'], ['Billing email', 'finance@revora.io']].map(t => `<div class="set"><small>${t[0]}</small><b>${t[1]}</b></div>`).join('')}</div>
</div>`;

/* ---------- Build shell ---------- */
const nav = $('#nav'), view = $('#view'), hl = $('#hl');
nav.insertAdjacentHTML('beforeend', PAGES.map(p => `<a href="#${p[0]}" data-page="${p[0]}">${p[2]}<span>${p[1]}</span></a>`).join(''));
$('#tabbar').innerHTML = PAGES.map(p => `<a href="#${p[0]}" data-page="${p[0]}">${p[2]}${p[1]}</a>`).join('');
view.innerHTML = PAGES.map(p => `<section class="page" id="p-${p[0]}" aria-label="${p[1]}">${H[p[0]]()}</section>`).join('');
const pageEl = id => $('#p-' + id);
gsap.set('.page', { autoAlpha: 0 });

/* ---------- Counters ---------- */
const FMT = { int: v => Math.round(v).toLocaleString('en-US'), pct: (v, d) => v.toFixed(d) + '%', pct0: v => Math.round(v) + '%', signed: v => signed(v), mo: v => v.toFixed(1) + ' mo' };
function count(el, to, dec = 0, dur = 1.3) {
  const o = { v: 0 }, f = FMT[el.dataset.f] || money;
  return gsap.to(o, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = f(o.v, dec); } });
}

/* ---------- Line chart ---------- */
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
      const c = el._cfg, r = el.getBoundingClientRect(), t = (e.clientX - r.left) / (r.width - (c.padR || 0) * r.width / el.clientWidth); if (t < 0 || t > 1 || !c.tip) return;
      const s = c.series.find(s => t >= s.from - 1e-6 && t <= s.to + 1e-6); if (!s) return;
      const v = s.fn(t), x = t * (el.clientWidth - (c.padR || 0)), y = el._Y(v);
      gsap.set($('.hdot', el), { x, y, autoAlpha: 1 });
      const tip = $('.tip', el); tip.innerHTML = c.tip(t, v); gsap.set(tip, { left: x, top: y - 10, autoAlpha: 1 });
    });
    el.addEventListener('mouseleave', () => gsap.to($$('.tip,.hdot', el), { autoAlpha: 0, duration: .2 }));
  }
  el._cfg = cfg;
  const W = el.clientWidth, Ht = el.clientHeight; if (!W) return;
  const Wp = W - (cfg.padR || 0);
  const { min, max } = cfg, Y = v => Ht - (v - min) / (max - min) * Ht; el._Y = Y;
  const ticks = niceTicks(min, max), u = el._uid;
  let s = `<svg viewBox="0 0 ${W} ${Ht}"><defs>${cfg.series.map((sr, i) => sr.fill ? `<linearGradient id="lg${u}_${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sr.fill}" stop-opacity="${sr.fo ?? .32}"/><stop offset="1" stop-color="${sr.fill}" stop-opacity="0"/></linearGradient>` : '').join('')}</defs>
    <g class="gl">${ticks.map(v => `<line x1="0" x2="${W}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/>`).join('')}<line x1="0" x2="${W}" y1="${Ht - .5}" y2="${Ht - .5}"/></g>`;
  cfg.series.forEach((sr, i) => {
    const N = Math.max(2, Math.round((sr.to - sr.from) * 160)), pts = [];
    for (let k = 0; k <= N; k++) { const t = sr.from + (sr.to - sr.from) * k / N; pts.push((t * Wp).toFixed(1) + ',' + Y(sr.fn(t)).toFixed(1)); }
    const line = 'M' + pts.join('L');
    if (sr.fill) s += `<path d="${line}L${(sr.to * Wp).toFixed(1)},${Ht}L${(sr.from * Wp).toFixed(1)},${Ht}Z" fill="url(#lg${u}_${i})"/>`;
    s += `<path d="${line}" fill="none" stroke="${sr.stroke}" stroke-width="${sr.w || 2.2}" stroke-linecap="round" stroke-linejoin="round" opacity="${sr.o ?? 1}"/>`;
  });
  if (cfg.marker) {
    const mx = cfg.marker.t * Wp, my = Y(cfg.marker.v);
    s += `<line x1="${mx}" x2="${mx}" y1="${my}" y2="${Ht}" stroke="${cfg.marker.c}" stroke-opacity=".25" stroke-width="1.5"/><circle cx="${mx}" cy="${my}" r="5.5" fill="#fff" stroke="${cfg.marker.c}" stroke-width="3"/>`;
    gsap.set($('.halo', el), { x: mx, y: my, display: 'block' });
  } else $('.halo', el).style.display = 'none';
  s += '</svg>';
  $('.plot', el).innerHTML = s;
  $('.yl', el).innerHTML = ticks.map(v => `<span style="top:${Y(v).toFixed(1)}px">${(cfg.yfmt || kfmt)(v)}</span>`).join('');
  $('.xl', el).innerHTML = cfg.xl.map(([t, f]) => `<span style="left:${(f * Wp).toFixed(1)}px;${f === 0 ? 'transform:none' : f === 1 ? 'transform:translateX(-100%)' : ''}">${t}</span>`).join('');
  const end = $('.endlab', el);
  if (cfg.end) {
    // Keep the label clear of the line: look at the curve under the label and sit above it, or below if there is no room.
    end.style.display = 'block'; end.textContent = cfg.end.text;
    const lw = end.offsetWidth + 8, lh = end.offsetHeight; let lo = Infinity, hi = -Infinity;
    for (let k = 0; k <= 24; k++) {
      const t = 1 - (lw * k / 24) / Wp, sr = cfg.series.find(q => t >= q.from - 1e-6 && t <= q.to + 1e-6); if (!sr) continue;
      const y = Y(sr.fn(t)); lo = Math.min(lo, y); hi = Math.max(hi, y);
    }
    end.style.right = (W - Wp + 12) + 'px';
    const av = (cfg.end.avoid || []).map(Y), clash = top => av.some(y => y > top - 6 && y < top + lh + 6);
    let top = lo - lh - 14;
    if (top < -4 || clash(top)) top = hi + 14;
    end.style.top = top + 'px';
  } else end.style.display = 'none';
}
function revealLine(el, delay = .15) {
  gsap.fromTo($('.plot', el), { clipPath: 'inset(-10% 100% -10% 0)' }, { clipPath: 'inset(-10% 0% -10% 0)', duration: 1.5, delay, ease: 'power2.inOut' });
  gsap.fromTo($$('.yl span, .xl span', el), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .03, delay });
  const h = $('.halo', el); gsap.killTweensOf(h);
  gsap.fromTo(h, { scale: .4, autoAlpha: .7 }, { scale: 2.6, autoAlpha: 0, duration: 1.8, repeat: -1, ease: 'power2.out', delay: delay + 1.3 });
  gsap.fromTo($('.endlab', el), { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: .5, delay: delay + 1.3 });
}




/* ---------- Stacked bars ---------- */
function drawStack(el, grow) {
  const W = el.clientWidth, Ht = el.clientHeight; if (!W) return;
  const n = D.months.length, slot = W / n, bw = Math.min(40, slot * .62), max = 100000, Y = v => Ht - v / max * Ht, ticks = niceTicks(0, max);
  let s = `<svg viewBox="0 0 ${W} ${Ht}"><g class="gl">${ticks.map(v => `<line x1="0" x2="${W}" y1="${Y(v)}" y2="${Y(v)}"/>`).join('')}</g>`;
  D.byPlan.forEach((row, i) => {
    let acc = 0; const x = slot * i + (slot - bw) / 2;
    s += `<g class="col" data-i="${i}">`;
    row.forEach((v, j) => {
      const y1 = Y(acc + v), h = Y(acc) - y1; acc += v;
      const top = j === row.length - 1;
      const yb = j ? y1 + h + 1.2 : y1 + h; // each segment tucks 1px under the one below, so no hairline seams
      s += top ? `<path fill="${D.plans[j].color}" d="M${x},${yb}V${y1 + 8}Q${x},${y1} ${x + 8},${y1}H${x + bw - 8}Q${x + bw},${y1} ${x + bw},${y1 + 8}V${yb}Z"/>` : `<rect fill="${D.plans[j].color}" x="${x}" y="${y1}" width="${bw}" height="${yb - y1}"/>`;
    });
    s += '</g>';
  });
  s += '</svg>';
  el.innerHTML = `<div class="plot">${s}</div><div class="yl">${ticks.map(v => `<span style="top:${Y(v)}px">${kfmt(v)}</span>`).join('')}</div>
    <div class="xl">${D.months.map((m, i) => slot < 34 && i % 2 ? '' : `<span style="left:${((i + .5) / n * 100).toFixed(2)}%">${m}</span>`).join('')}</div><div class="tip"></div>`;
  $$('.col', el).forEach(g => g.addEventListener('mouseenter', () => {
    const i = +g.dataset.i, r = D.byPlan[i], tip = $('.tip', el);
    tip.innerHTML = `${money(r[0] + r[1] + r[2])}<small>${D.months[i]} · ${D.plans.map((p, j) => p.name[0] + ' ' + kfmt(r[j])).join(' · ')}</small>`;
    gsap.set(tip, { left: (i + .5) * slot, top: Y(r[0] + r[1] + r[2]) - 8, autoAlpha: 1 });
  }));
  el.onmouseleave = () => gsap.to($('.tip', el), { autoAlpha: 0, duration: .2 });
  if (grow) {
    gsap.from($$('.col', el), { scaleY: 0, transformOrigin: '50% 100%', duration: 1, ease: 'expo.out', stagger: .05, delay: .2 });
    gsap.from($$('.xl span, .yl span', el), { autoAlpha: 0, duration: .5, stagger: .02, delay: .1 });
  }
}

/* ---------- MRR chart ---------- */
const MRR = (() => {
  const el = $('#mrrChart');
  const meta = {
    12: { vals: D.mrr12, xl: [0, 2, 4, 6, 8, 11].map(i => [D.months[i], i / 11]), tip: t => D.months[Math.round(t * 11)] + ' 2026' },
    90: { vals: D.mrr90, xl: [['Aug 14', 0], ['Sep 11', 4 / 12], ['Oct 9', 8 / 12], ['Nov 12', 1]], tip: t => 'Week ' + (Math.round(t * 12) + 1) },
    30: { vals: D.mrr30, xl: [['Oct 14', 0], ['Oct 21', 7 / 29], ['Oct 28', 14 / 29], ['Nov 4', 21 / 29], ['Nov 12', 1]], tip: t => { const d = new Date(2026, 9, 14 + Math.round(t * 29)); return d.toLocaleString('en-US', { month: 'short', day: 'numeric' }); } }
  };
  const build = k => { const m = meta[k], f = mono(m.vals), lo = Math.min(...m.vals), hi = Math.max(...m.vals), pad = (hi - lo) * .14; return { k, f, min: lo - pad, max: Math.max(hi + pad, k === '12' ? 92000 : 0), m }; };
  let cur = build('12');
  const cfg = (f, min, max, m) => ({
    min, max, xl: m.xl,
    padR: 18,
    series: [{ fn: f, from: 0, to: 1, stroke: '#FF5A1F', fill: '#FF5A1F', fo: .2, w: 2.6 }],
    marker: { t: 1, v: f(1), c: '#FF5A1F' },
    end: { v: f(1), text: money(f(1)), avoid: m === meta[12] ? [90000] : [] },
    tip: (t, v) => `${money(v)}<small>${m.tip(t)}</small>`
  });
  const target = () => { /* target line, 12-month view only */ $('#tgtLeg').style.visibility = cur.k === '12' ? 'visible' : 'hidden'; const svgEl = $('svg', el); if (!svgEl || cur.k !== '12') return; const Ht = el.clientHeight, W = el.clientWidth, y = Ht - (90000 - cur.min) / (cur.max - cur.min) * Ht; svgEl.querySelector('.gl').insertAdjacentHTML('beforeend', `<line x1="0" x2="${W}" y1="${y}" y2="${y}" style="stroke:#16140F;stroke-opacity:.35;stroke-width:1.5"/>`); };
  const draw = () => { drawLine(el, cfg(cur.f, cur.min, cur.max, cur.m)); target(); };
  function set(k) {
    if (k === cur.k) return;
    const A = cur, B = build(k), o = { p: 0 };
    gsap.to($('.xl', el), { autoAlpha: 0, duration: .25 });
    gsap.to(o, {
      p: 1, duration: 1, ease: 'power3.inOut',
      onUpdate: () => { const p = o.p, f = t => lerp(A.f(t), B.f(t), p); drawLine(el, cfg(f, lerp(A.min, B.min, p), lerp(A.max, B.max, p), p < .5 ? A.m : B.m)); },
      onStart: () => { $('#tgtLeg').style.visibility = 'hidden'; }, onComplete: () => { cur = B; draw(); gsap.fromTo($('.xl', el), { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 }); }
    });
  }
  return { draw, set, reveal() { draw(); revealLine(el); } };
})();

/* ---------- Donut ---------- */
function donut(grow) {
  const el = $('#donut'), r = 70, C = 2 * Math.PI * r, tot = D.plans.reduce((a, p) => a + p.price * p.customers, 0);
  let off = 0;
  el.innerHTML = `<svg viewBox="0 0 170 170">${D.plans.map(p => { const len = p.price * p.customers / tot * C, gapL = 4; const s = `<circle cx="85" cy="85" r="${r}" fill="none" stroke="${p.color}" stroke-width="22" stroke-dasharray="${Math.max(0, len - gapL)} ${C}" stroke-dashoffset="${-off}" data-len="${Math.max(0, len - gapL)}" stroke-linecap="butt"/>`; off += len; return s; }).join('')}</svg>
    <div class="in"><div><b class="num">${money(tot)}</b><span>MRR</span></div></div>`;
  if (grow) $$('circle', el).forEach((c, i) => gsap.fromTo(c, { attr: { 'stroke-dasharray': `0 ${C}` } }, { attr: { 'stroke-dasharray': `${c.dataset.len} ${C}` }, duration: 1.1, delay: .3 + i * .18, ease: 'power3.out' }));
}

/* ---------- Segmented controls ---------- */
const SEGS = [];
function seg(root, onPick) {
  const pill = $('.p', root);
  const place = (b, d = .5) => gsap.to(pill, { x: b.offsetLeft - 3, width: b.offsetWidth, duration: d, ease: 'glide' });
  $$('button', root).forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('on')) return;
    $$('button', root).forEach(x => x.classList.toggle('on', x === b)); place(b); SFX.play('tick'); onPick(b);
  }));
  const s = { init() { const b = $('button.on', root); if (b && b.offsetWidth) gsap.set(pill, { x: b.offsetLeft - 3, width: b.offsetWidth }); } };
  SEGS.push(s); s.init(); return s;
}
seg($('#mrrSeg'), b => MRR.set(b.dataset.r));

/* ---------- Customers table ---------- */
const CUST = (() => {
  let filter = 'All', q = '', key = 'mrr', dir = -1, selName = null;
  function rows() {
    let list = D.customers.filter(c => (filter === 'All' || c.status === filter) && (c.name + c.email).toLowerCase().includes(q));
    list.sort((a, b) => { const x = a[key], y = b[key]; return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * dir; });
    return list;
  }
  function render(anim = true) {
    const list = rows();
    $('#ctb').innerHTML = list.map(c => `<tr data-c="${c.name}"${c.name === selName ? ' class="sel"' : ''}><td><div class="who"><span class="logo-b" style="--c:${planColor(c.plan) === '#FFC9B3' ? '#F08A5D' : planColor(c.plan)}">${ini(c.name)}</span><div><b>${c.name}</b><span>${c.email}</span></div></div></td>
      <td>${c.plan}</td><td class="r num"><b>${money(c.mrr)}</b></td><td class="r num">${c.seats}</td>
      <td><div class="hbar"><div class="pbar"><i style="width:${c.health}%;--c:${c.health > 70 ? 'var(--green)' : c.health > 45 ? 'var(--amber)' : 'var(--red)'}"></i></div><span class="mono">${c.health}</span></div></td>
      <td>${statusPill(c.status)}</td><td>${c.country}</td><td class="mono">${c.since}</td></tr>`).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:40px">No customers match</td></tr>`;
    $('#ccount').textContent = `${list.length} of ${D.customers.length}`;
    if (anim) gsap.from($$('#ctb tr'), { autoAlpha: 0, y: 10, duration: .45, stagger: .03, ease: 'glide' });
  }
  seg($('#custSeg'), b => { filter = b.dataset.s; render(); });
  $('#cq').addEventListener('input', e => { q = e.target.value.toLowerCase(); render(false); });
  $$('.tbl th').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.k; if (key === k) dir *= -1; else { key = k; dir = ['mrr', 'seats', 'health'].includes(k) ? -1 : 1; }
    $$('.tbl th').forEach(t => { t.classList.toggle('sorted', t === th); t.textContent = t.textContent.replace(/ [↑↓]$/, ''); });
    th.textContent += dir < 0 ? ' ↓' : ' ↑'; SFX.play('tick'); render();
  }));
  $('#ctb').addEventListener('click', e => { const tr = e.target.closest('tr[data-c]'); if (tr) openCust(tr.dataset.c); });
  return { render, sel: n => { selName = n; $$('#ctb tr').forEach(t => t.classList.toggle('sel', t.dataset.c === n)); } };
})();

/* ---------- Drawer ---------- */
const drawer = $('#drawer'); gsap.set(drawer, { xPercent: 110, autoAlpha: 0 });
let open = null;
function openCust(name) {
  const c = D.customers.find(x => x.name === name); if (!c) return;
  open = name; CUST.sel(name); SFX.play('open');
  const C = 2 * Math.PI * 40, col = c.health > 70 ? '#178A5E' : c.health > 45 ? '#C98A12' : '#D93F3F';
  drawer.innerHTML = `<button class="ib x" data-act="close" aria-label="Close">${I.x}</button>
    <div class="hd"><span class="logo-b" style="--c:${planColor(c.plan) === '#FFC9B3' ? '#F08A5D' : planColor(c.plan)}">${ini(c.name)}</span><div><b>${c.name}</b><span>${c.email}</span></div></div>
    <div style="display:flex;gap:8px;margin-bottom:18px">${statusPill(c.status)}<span class="pill">${c.plan} plan</span><span class="pill">${c.country}</span></div>
    <div class="stats"><div>MRR<b class="num">${money(c.mrr)}</b></div><div>Seats<b class="num">${c.seats}</b></div><div>Customer since<b>${c.since}</b></div></div>
    <div class="hl2"><div class="ring"><svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="40" fill="none" stroke="var(--line)" stroke-width="9"/><circle class="arc" cx="48" cy="48" r="40" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div class="in num" id="hNum">0</div></div>
      <p><b>Health score</b>${c.health > 70 ? 'Logs in daily and uses most features. A good candidate for an upgrade.' : c.health > 45 ? 'Usage is steady but a few seats are inactive. Worth a check-in.' : 'Usage has dropped and a payment is overdue. Reach out this week.'}</p></div>
    <div class="sub">Activity</div>
    <ul class="tl">${[['Invoice paid', c.status === 'Past due' ? 'Failed · retry Nov 15' : 'Nov 1 · ' + money(c.mrr), c.status === 'Past due' ? '#D93F3F' : '#178A5E'], ['3 new seats added', 'Oct 22', '#FF5A1F'], ['Exported a cohort report', 'Oct 18', ''], ['Upgraded to ' + c.plan, c.since, '#FF5A1F']].map(t => `<li style="--c:${t[2] || 'var(--line-2)'}"><i></i><b>${t[0]}</b><span>${t[1]}</span></li>`).join('')}</ul>
    <div style="display:flex;gap:8px"><button class="btn dark w100" data-act="email">${I.mail}Email customer</button><button class="btn w100" data-act="stripe">${I.ext}Open in Stripe</button></div>`;
  gsap.to(drawer, { xPercent: 0, autoAlpha: 1, duration: .65, ease: 'glide' });
  gsap.from(drawer.children, { y: 18, autoAlpha: 0, duration: .55, stagger: .05, delay: .12, ease: 'glide' });
  gsap.to($('.arc', drawer), { strokeDashoffset: C * (1 - c.health / 100), duration: 1.3, delay: .35, ease: 'power3.out' });
  const o = { v: 0 }; gsap.to(o, { v: c.health, duration: 1.3, delay: .35, ease: 'power3.out', onUpdate: () => { $('#hNum').textContent = Math.round(o.v); } });
}
function closeDrawer(quiet) { if (!open) return; open = null; CUST.sel(null); if (!quiet) SFX.play('close'); gsap.to(drawer, { xPercent: 110, autoAlpha: 0, duration: .45, ease: 'power3.in' }); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
document.addEventListener('click', e => { if (open && !e.target.closest('#drawer') && !e.target.closest('tr[data-c]') && !e.target.closest('.toast')) closeDrawer(); });

/* ---------- Toast ---------- */
const toastEl = $('#toast'); let undoFn = null, toastT;
gsap.set(toastEl, { xPercent: -50, yPercent: 160, autoAlpha: 0 });
function toast(msg, undo) {
  if (!SFX.recent()) SFX.play('ding', .8);
  $('#toastT').textContent = msg; undoFn = undo; $('#undo').style.display = undo ? '' : 'none';
  gsap.to(toastEl, { yPercent: 0, autoAlpha: 1, duration: .55, ease: 'back.out(1.6)' });
  toastT && toastT.kill(); toastT = gsap.delayedCall(3.4, () => gsap.to(toastEl, { yPercent: 160, autoAlpha: 0, duration: .4, ease: 'power2.in' }));
}
$('#undo').addEventListener('click', () => { undoFn && undoFn(); undoFn = null; toastT && toastT.kill(); gsap.to(toastEl, { yPercent: 160, autoAlpha: 0, duration: .4 }); });

/* ---------- Switches & billing toggle ---------- */
function setSw(b, on) {
  b.classList.toggle('on', on); b.setAttribute('aria-checked', on);
  gsap.to($('i', b), { x: on ? 18 : 0, duration: .45, ease: 'back.out(2.2)' });
  gsap.fromTo($('i', b), { scaleX: 1.3 }, { scaleX: 1, duration: .45 });
}
let yearly = false;
document.addEventListener('click', e => {
  const b = e.target.closest('.sw'); if (!b) return;
  const on = !b.classList.contains('on'); setSw(b, on); SFX.play(on ? 'on' : 'off');
  if (b.id === 'billSw') {
    yearly = on;
    $$('[data-price]').forEach(el => { const p = D.plans[+el.dataset.price], o = { v: on ? p.price : p.yearly }; gsap.to(o, { v: on ? p.yearly : p.price, duration: .8, ease: 'power3.out', onUpdate: () => { el.textContent = '$' + Math.round(o.v); } }); gsap.fromTo(el, { y: on ? 8 : -8 }, { y: 0, duration: .6, ease: 'back.out(2)' }); });
    $$('.plan .pr span').forEach(s => { s.textContent = on ? 'per month, billed yearly' : 'per month'; });
  } else {
    const label = b.closest('.set')?.querySelector('b')?.textContent || 'Setting';
    toast(`${label} ${on ? 'on' : 'off'}`, () => setSw(b, !on));
  }
});

/* ---------- Actions ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  ({
    close: () => closeDrawer(),
    export: () => toast('Export started · CSV will download shortly'),
    invite: () => toast('Invite link copied'),
    email: () => toast('Email draft opened'),
    stripe: () => toast('Opening the customer in Stripe')
  })[a.dataset.act]?.();
});

/* ---------- Router ---------- */
const ENTER = {
  overview: p => { MRR.reveal(); donut(true); $$('.kpi svg.spark path', p).forEach((s, i) => gsap.fromTo(s, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, delay: .25 + i * .06, ease: 'power2.inOut' })); },
  revenue: p => {
    drawStack($('#stackChart'), true);
    gsap.fromTo($$('#coh .cell'), { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2)', stagger: { each: .012, from: 'start' }, delay: .4 });
  },
  customers: () => CUST.render(true)
};
const REDRAW = { overview: () => { MRR.draw(); }, revenue: () => drawStack($('#stackChart'), false) };
let cur = null;
function moveHl(id, d = .55) {
  const a = $(`.nav a[data-page="${id}"]`);
  $$('.nav a, .tabbar a').forEach(x => x.classList.toggle('on', x.dataset.page === id));
  if (a) gsap.to(hl, { x: a.offsetLeft, width: a.offsetWidth, duration: d, ease: 'glide' });
}
function go(id, first) {
  if (!H[id]) id = 'overview';
  if (id === cur) return;
  closeDrawer(true);
  if (!first) SFX.play('page');
  const prev = cur && pageEl(cur), next = pageEl(id); cur = id;
  moveHl(id, first ? 0 : .55);
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  document.title = `${PAGES.find(p => p[0] === id)[1]} · Revora`;
  if (prev) { prev.classList.remove('cur'); gsap.to(prev, { autoAlpha: 0, y: -10, duration: .2, ease: 'power2.in', onComplete: () => gsap.set(prev, { y: 0 }) }); }
  next.classList.add('cur'); next.scrollTop = 0; if (mq.matches) window.scrollTo(0, 0);
  gsap.set(next, { autoAlpha: 1, y: 0 });
  const items = $$(':scope > .ph, :scope > .g > *, :scope > .c, :scope > .plans > *', next);
  gsap.fromTo(items, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .05, ease: 'glide', delay: prev ? .18 : .1, clearProps: 'transform' });
  SEGS.forEach(s => s.init());
  $$('[data-n]', next).forEach(el => count(el, +el.dataset.n, +(el.dataset.d || 0), 1.4));
  $$('[data-w]', next).forEach((el, i) => gsap.fromTo(el, { width: 0 }, { width: el.dataset.w + '%', duration: 1.2, delay: .3 + i * .04, ease: 'glide' }));
  ENTER[id] && ENTER[id](next);
}
$$('.nav a, .tabbar a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.dataset.page); }));
addEventListener('hashchange', () => go(location.hash.slice(1)));
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { moveHl(cur, 0); SEGS.forEach(s => s.init()); REDRAW[cur] && REDRAW[cur](); }, 120); });

/* ---------- Sound switch + generic click ---------- */
const soundB = $('#soundB');
const soundIcon = () => { soundB.innerHTML = SFX.isOn() ? I.vol : I.mute; soundB.setAttribute('aria-pressed', SFX.isOn()); soundB.setAttribute('aria-label', SFX.isOn() ? 'Mute sounds' : 'Turn sounds on'); };
soundB.addEventListener('click', () => { SFX.set(!SFX.isOn()); soundIcon(); SFX.play('on'); });
soundIcon();
document.addEventListener('click', e => { if (!SFX.recent() && e.target.closest('button, a, tr[data-c], th')) SFX.play('click'); });

/* ---------- Boot ---------- */
gsap.from('.top > *', { autoAlpha: 0, y: -14, duration: .7, stagger: .06, ease: 'glide' });
go(location.hash.slice(1) || 'overview', true);

/* ---------- Small public API (handy for wiring your own data and tests) ---------- */
window.REVORA = { go, openCust, closeDrawer, toast };
})();
