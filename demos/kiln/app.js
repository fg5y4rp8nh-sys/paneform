/* Kiln — app logic. Six pages, one router, no framework.
   Billing maths lives in bill(): change DATA.tiers or a plan's base fee and every page follows. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = n => Math.round(n).toLocaleString('en-US');
const money = (n, d = 2) => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const ini = s => { const w = s.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); };
const svg = p => `<svg class="ic" viewBox="0 0 24 24">${p}</svg>`;
const IC = {
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};

/* ---------------- state (kept in this browser) ---------------- */
const KEY = 'kiln-demo-v1';
const clone = o => JSON.parse(JSON.stringify(o));
const defaults = () => ({
  tiers: clone(DATA.tiers), plans: clone(DATA.plans), customers: clone(DATA.customers), keys: clone(DATA.keys), topUp: clone(DATA.topUp), payments: clone(DATA.payments),
  sel: DATA.me, filter: 'all', q: '', sort: 'bill', chart: 'images', calcVol: 50000, calcPlan: 'pro', pack: 1
});
let S = defaults();
try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && saved.tiers) S = Object.assign(S, saved); } catch (e) { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
const me = () => S.customers.find(c => c.id === DATA.me);
const planOf = id => S.plans.find(p => p.id === id);

/* ---------------- billing maths ---------------- */
function bill(images, planId) {
  const plan = planOf(planId);
  let left = images, from = 0;
  const lines = S.tiers.map((t, i) => {
    const cap = t.upTo === null ? Infinity : t.upTo - from;
    const count = Math.max(0, Math.min(left, cap));
    left -= count;
    const line = { i, from, to: t.upTo, count, price: t.price, amount: Math.round(count * t.price * 100) / 100 };
    from = t.upTo === null ? from : t.upTo;
    return line;
  });
  const usage = lines.reduce((a, l) => a + l.amount, 0);
  return { plan, base: plan.base, lines, usage, total: Math.round((plan.base + usage) * 100) / 100 };
}
const tierLabel = l => l.to === null ? `${num(l.from / 1000)}k+` : `${l.from === 0 ? '0' : num(l.from / 1000) + 'k'}–${num(l.to / 1000)}k`;
const TIER_COLORS = ['#5B3DF5', '#B9A9FF', '#FF7A45'];
const pct = c => Math.round(bill(c.images, c.plan).total / c.limit * 100);

/* ---------------- toast / overlays ---------------- */
let tT;
function toast(t) { const el = $('#toast'); el.innerHTML = svg(IC.check) + esc(t); el.classList.add('on'); clearTimeout(tT); tT = setTimeout(() => el.classList.remove('on'), 2400); }
function closeAll() { $$('#ovl,#drw,#modal').forEach(e => e.classList.remove('on')); }
function openModal(html) { $('#modal').innerHTML = html; $('#ovl').classList.add('on'); $('#modal').classList.add('on'); setTimeout(() => { const f = $('#modal input,#modal select'); if (f) f.focus(); }, 60); }
$('#ovl').onclick = closeAll;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeAll(); });

/* ---------------- shared pieces ---------------- */
function ladder(c) {
  const b = bill(c.images, c.plan);
  const max = Math.max(100000, c.images * 1.15);
  const w = l => l.count / max * 100;
  const mark = Math.min(100, c.images / max * 100);
  const ticks = S.tiers.filter(t => t.upTo !== null && t.upTo <= max && Math.abs(t.upTo - c.images) / max > .09).map(t => { const l = t.upTo / max * 100; return `<span class="lb" style="left:${l}%;${l > 94 ? 'transform:translateX(-100%)' : ''}">${num(t.upTo / 1000)}k</span>`; }).join('');
  return `<div class="lad"><div class="tr">${b.lines.map((l, i) => `<i style="width:${w(l)}%;background:${TIER_COLORS[i]}"></i>`).join('')}</div><div class="mk" style="left:${mark}%"></div>${ticks}<span class="lb" style="left:${mark}%;color:var(--tx);font-weight:800;${mark > 88 ? 'transform:translateX(-100%)' : ''}">${c.images >= 1000 ? (c.images / 1000).toFixed(1) + 'k' : num(c.images)}</span></div>
    <div class="rw"><i style="background:var(--tx)"></i>${b.plan.name} base fee<b>${money(b.base)}</b></div>
    ${b.lines.map((l, i) => `<div class="rw ${l.count ? '' : 'off'}"><i style="background:${l.count ? TIER_COLORS[i] : '#E6E2F3'}"></i>${tierLabel(l)} · ${num(l.count)} × ${money(l.price, 3)}<b>${money(l.amount)}</b></div>`).join('')}
    <div class="tot"><span class="mu" style="font-weight:600">Total due Dec 1</span><b>${money(b.total)}</b></div>`;
}
function limBar(c) {
  const p = pct(c), hot = p >= 90;
  return `<div class="lim"><span class="b"><i style="width:${Math.min(100, p)}%;background:${hot ? 'var(--or)' : 'var(--vi)'}"></i></span><b style="${hot ? 'color:var(--or-d)' : ''}">${p}%</b></div>`;
}
function bars(el, data, opts) {
  // data: [{label, parts:[v,v,v], hint}] ; opts: {max, colors, forecast:[{label,v}], fmt, axis}
  const small = el.clientWidth < 560, W = Math.max(300, Math.round(el.clientWidth - 28)) || 680, H = small ? Math.round((opts.h || 300) * .78) : (opts.h || 300), T = 24, B = 26, L = 40, n = data.length + (opts.forecast ? opts.forecast.length : 0), cw = (W - L) / n, Y = v => T + (1 - v / opts.max) * (H - T - B);
  let g = '';
  opts.axis.forEach(v => g += `<line x1="${L}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="#EEEBF6"/><text class="ax" x="0" y="${Y(v) + 4}">${opts.fmt(v)}</text>`);
  data.forEach((d, i) => {
    let y = Y(0);
    d.parts.forEach((v, k) => { const h = v / opts.max * (H - T - B); y -= h; g += `<rect class="bar-h" data-i="${i}" x="${L + i * cw + 2}" y="${y}" width="${cw - 5}" height="${Math.max(0, h - (k < d.parts.length - 1 ? 1.5 : 0))}" rx="${k === d.parts.length - 1 ? 4 : 1.5}" fill="${(d.colors || opts.colors)[k]}"/>`; });
  });
  (opts.forecast || []).forEach((f, j) => { const i = data.length + j, h = f.v / opts.max * (H - T - B); g += `<rect x="${L + i * cw + 2.5}" y="${Y(f.v)}" width="${cw - 6}" height="${h}" rx="4" fill="${opts.fcFill || 'none'}" ${opts.fcFill ? '' : 'stroke="#B9A9FF" stroke-dasharray="3 3"'}/>`; });
  if (opts.forecast && opts.fcLabel && !small) g += `<line x1="${L + data.length * cw - 1}" x2="${L + data.length * cw - 1}" y1="${T - 8}" y2="${H - B}" stroke="#0E0B1A" stroke-dasharray="3 3" opacity=".35"/><text x="${L + data.length * cw + 6}" y="${T + 4}" style="font:700 12px var(--sans);fill:#716B87">${opts.fcLabel}</text>`;
  (small ? opts.ticks.filter((t, i) => i % 2 === 0 || t === n) : opts.ticks).forEach(t => g += `<text class="ax" x="${L + (t - 1) * cw + cw / 2}" y="${H - 6}" text-anchor="${t === n ? 'end' : 'middle'}">${opts.tickFmt(t)}</text>`);
  if (opts.callout !== undefined) { const i = opts.callout, tot = data[i].parts.reduce((a, b) => a + b, 0); g += `<g transform="translate(${L + i * cw + cw / 2},${Y(tot) - 10})"><rect x="-38" y="-22" width="76" height="24" rx="8" fill="#0E0B1A"/><text y="-6" text-anchor="middle" style="font:700 12px var(--sans);fill:#fff">${opts.calloutFmt(tot)}</text></g>`; }
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}">${g}</svg><div class="tip"></div>`;
  el._redraw = () => bars(el, data, opts);
  const tip = $('.tip', el), sv = $('svg', el);
  $$('.bar-h', el).forEach(r => {
    r.addEventListener('mouseenter', () => { const i = +r.dataset.i, rb = r.getBoundingClientRect(), eb = el.getBoundingClientRect(); tip.innerHTML = opts.hint(i); tip.style.left = (rb.left - eb.left + rb.width / 2) + 'px'; tip.style.top = (rb.top - eb.top - 8) + 'px'; tip.style.opacity = 1; });
    r.addEventListener('mouseleave', () => tip.style.opacity = 0);
  });
  sv.addEventListener('mouseleave', () => tip.style.opacity = 0);
}

/* ---------------- page: overview ---------------- */
function pOverview() {
  const P = DATA.platform, top = [...S.customers].sort((a, b) => b.images - a.images).slice(0, 5);
  const alerts = S.customers.filter(c => pct(c) >= 90).length;
  const sel = S.customers.find(c => c.id === S.sel) || S.customers[0];
  const growth = ((P.revenue / P.revenueLast - 1) * 100).toFixed(1);
  $('#p-overview').innerHTML = `
  <div class="ph"><div><h1>Usage revenue</h1><p class="sub">November 1–20, 2026 · synced from Stripe 2 min ago</p></div>
    <div class="r"><div class="seg" id="chartMode"><button data-m="images" class="${S.chart === 'images' ? 'on' : ''}">Images</button><button data-m="revenue" class="${S.chart === 'revenue' ? 'on' : ''}">Revenue</button></div><button class="btn k" data-act="export">${svg(IC.dl)}Export CSV</button></div></div>
  <div class="kpis">
    <div class="card kpi hero"><span class="t">Usage revenue · month to date</span><b>${money(P.revenue, 0)}</b><div class="d"><span class="pill">↑ ${growth}%</span>vs October, same day</div></div>
    <div class="card kpi"><span class="t">Images billed</span><b>${(P.images / 1e6).toFixed(2)}M</b><div class="d"><span class="pill pv">↑ 11.4%</span>${num(P.images / 20 / 1000)}k a day</div></div>
    <div class="card kpi"><span class="t">Prepaid balances</span><b>$${(P.prepaid / 1000).toFixed(1)}k</b><div class="d"><span class="pill pn">${num(P.accounts)} accounts</span></div></div>
    <div class="card kpi"><span class="t">Over 90% of spend limit</span><b style="color:var(--or)">${alerts}</b><div class="d"><span class="pill po">in your top ${S.customers.length}</span></div></div>
  </div>
  <div class="g2">
    <div class="card"><div class="ch"><h3>${S.chart === 'images' ? 'Images generated per day' : 'Usage revenue per day'}</h3><div class="r lg">${DATA.models.map(m => `<span><i style="background:${m.color}"></i>${m.name.replace('kiln-', '')}</span>`).join('')}</div></div><div class="chart" id="ovChart"></div></div>
    <div class="card"><div class="ch"><h3>Invoice preview</h3><div class="r"><span class="pill pg">Draft · Dec 1</span></div></div>
      <div class="cb"><div class="who"><span class="av" style="background:${sel.color}">${ini(sel.name)}</span><div><b>${esc(sel.name)}</b><span>${planOf(sel.plan).name} plan · ${num(sel.images)} images</span></div></div>${ladder(sel)}</div></div>
  </div>
  <div class="card"><div class="ch" style="padding-bottom:4px"><h3>Top customers by usage</h3><div class="r"><span class="mu" style="font-size:13px">Click a row to preview the invoice</span><a class="btn sm" href="#customers">All customers</a></div></div>
    <div class="tw"><table><thead><tr><th>Customer</th><th>Plan</th><th class="r">Images</th><th class="r">Bill so far</th><th>Spend limit</th><th class="r hm">Balance</th></tr></thead><tbody>
    ${top.map(c => `<tr class="cl ${c.id === sel.id ? 'sel' : ''}" data-c="${c.id}"><td><div class="co"><span class="av" style="background:${c.color}">${ini(c.name)}</span><b>${esc(c.name)}</b></div></td><td><span class="pill ${c.plan === 'scale' ? 'pv' : 'pn'}">${planOf(c.plan).name}</span></td><td class="r">${num(c.images)}</td><td class="r"><b>${money(bill(c.images, c.plan).total)}</b></td><td>${limBar(c)}</td><td class="r mu hm">${money(c.balance)}</td></tr>`).join('')}
    </tbody></table></div></div>`;
  const rate = P.revenue / P.images; // blended $ per image
  const data = P.daily.map((t, i) => ({ parts: P.mix.map(m => S.chart === 'images' ? t * m : t * 1000 * m * rate / 1000) }));
  const fcV = S.chart === 'images' ? 318 : 318 * rate;
  bars($('#ovChart'), data, {
    max: S.chart === 'images' ? 420 : 14, colors: DATA.models.map(m => m.color), axis: S.chart === 'images' ? [0, 100, 200, 300, 400] : [0, 4, 8, 12], fmt: v => S.chart === 'images' ? v + 'k' : '$' + v + 'k',
    forecast: Array.from({ length: 10 }, () => ({ v: fcV })), fcLabel: S.chart === 'images' ? 'Forecast · 9.1M by Nov 30' : 'Forecast · $287k by Nov 30',
    ticks: [1, 5, 10, 15, 20, 25, 30], tickFmt: t => t,
    hint: i => { const t = P.daily[i]; return `<b>Nov ${i + 1}</b><br>${num(t * 1000)} images · ${money(t * 1000 * rate, 0)}`; }
  });
  $$('#chartMode button').forEach(b => b.onclick = () => { S.chart = b.dataset.m; save(); pOverview(); });
  $$('#p-overview tr.cl').forEach(r => r.onclick = () => { S.sel = r.dataset.c; save(); pOverview(); });
  $('[data-act="export"]').onclick = () => exportCsv();
}
function exportCsv() {
  const rows = [['customer', 'stripe_id', 'plan', 'images', 'bill_usd', 'limit_usd', 'balance_usd']].concat(S.customers.map(c => [c.name, c.id, c.plan, c.images, bill(c.images, c.plan).total.toFixed(2), c.limit, c.balance.toFixed(2)]));
  const csv = rows.map(r => r.map(v => /[",]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n');
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'kiln-usage-nov-2026.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); } catch (e) { }
  toast('kiln-usage-nov-2026.csv downloaded');
}

/* ---------------- page: customers ---------------- */
function pCustomers() {
  const counts = { all: S.customers.length }; S.customers.forEach(c => counts[c.plan] = (counts[c.plan] || 0) + 1);
  counts.alert = S.customers.filter(c => pct(c) >= 90).length;
  $('#p-customers').innerHTML = `
  <div class="ph"><div><h1>Customers</h1><p class="sub">Usage, bills and spend limits for this billing period</p></div><div class="r"><button class="btn" data-act="export">${svg(IC.dl)}Export</button></div></div>
  <div class="card"><div class="filters">${[['all', 'All'], ['scale', 'Scale'], ['pro', 'Pro'], ['starter', 'Starter'], ['alert', 'Over 90%']].map(([id, t]) => `<button class="chip ${S.filter === id ? 'on' : ''}" data-f="${id}">${t} <i>${counts[id] || 0}</i></button>`).join('')}
    <label class="search">${svg(IC.search)}<input id="cq" placeholder="Search company" value="${esc(S.q)}" aria-label="Search company"></label></div>
    <div class="tw"><table><thead><tr><th>Customer</th><th>Plan</th><th class="r s" data-s="images">Images ↓</th><th class="r s" data-s="bill">Bill so far ↓</th><th>Spend limit</th><th class="r hm">Balance</th><th class="hm">Auto top-up</th></tr></thead><tbody id="ctb"></tbody></table></div></div>`;
  fillCustomers();
  $$('#p-customers [data-f]').forEach(b => b.onclick = () => { S.filter = b.dataset.f; save(); pCustomers(); });
  $$('#p-customers th.s').forEach(t => t.onclick = () => { S.sort = t.dataset.s; save(); fillCustomers(); });
  $('#cq').oninput = e => { S.q = e.target.value; fillCustomers(); };
  $('#p-customers [data-act="export"]').onclick = exportCsv;
}
function fillCustomers() {
  let rows = S.customers.filter(c => (S.filter === 'all' || (S.filter === 'alert' ? pct(c) >= 90 : c.plan === S.filter)) && c.name.toLowerCase().includes(S.q.toLowerCase()));
  rows.sort((a, b) => S.sort === 'images' ? b.images - a.images : bill(b.images, b.plan).total - bill(a.images, a.plan).total);
  $('#ctb').innerHTML = rows.map(c => `<tr class="cl" data-c="${c.id}"><td><div class="co"><span class="av" style="background:${c.color}">${ini(c.name)}</span><div><b>${esc(c.name)}</b><small>${c.id} · ${c.country}</small></div></div></td><td><span class="pill ${c.plan === 'scale' ? 'pv' : 'pn'}">${planOf(c.plan).name}</span></td><td class="r">${num(c.images)}</td><td class="r"><b>${money(bill(c.images, c.plan).total)}</b></td><td>${limBar(c)}</td><td class="r hm ${c.balance < 100 ? '' : 'mu'}" style="${c.balance < 100 ? 'color:var(--or-d);font-weight:700' : ''}">${money(c.balance)}</td><td class="hm">${c.auto ? '<span class="pill pg">On</span>' : '<span class="pill pn">Off</span>'}</td></tr>`).join('') || `<tr><td colspan="7" class="empty">No customers match.</td></tr>`;
  $$('#ctb tr.cl').forEach(r => r.onclick = () => drawer(r.dataset.c));
}
function drawer(id) {
  const c = S.customers.find(x => x.id === id), b = bill(c.images, c.plan);
  $('#drw').innerHTML = `<div class="drw-h"><span class="av" style="background:${c.color};width:42px;height:42px;font-size:14px">${ini(c.name)}</span><div><h3>${esc(c.name)}</h3><span class="mu" style="font-size:12.5px">${c.id} · customer since ${new Date(c.since + 'T12:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></div><button class="x" data-close aria-label="Close">${svg(IC.x)}</button></div>
  <div class="drw-b">
    <div class="kv"><div><span>Bill so far</span><b>${money(b.total)}</b></div><div><span>Spend limit</span><b>${money(c.limit, 0)}</b></div><div><span>Prepaid balance</span><b>${money(c.balance)}</b></div><div><span>Images</span><b>${num(c.images)}</b></div></div>
    <p style="font-weight:700;margin-bottom:6px">Limit used</p>${limBar(c)}
    <p style="font-weight:700;margin:18px 0 0">Invoice preview</p>${ladder(c)}
    <p style="font-weight:700;margin:18px 0 4px">By model</p><div class="md">${DATA.models.map((m, i) => `<div><div class="l">${m.name}<span>${num(c.images * c.mix[i])}</span></div><div class="b"><i style="width:${c.mix[i] * 100}%;background:${m.color}"></i></div></div>`).join('')}</div>
  </div>
  <div class="drw-f"><button class="btn" data-act="limit">${svg(IC.plus)}Raise limit</button><button class="btn" data-act="grant">${svg(IC.bolt)}Grant credits</button><button class="btn k" data-act="stripe" style="margin-left:auto">Open in Stripe</button></div>`;
  $('#ovl').classList.add('on'); $('#drw').classList.add('on');
  $('#drw [data-act="limit"]').onclick = () => { c.limit += 1000; save(); refresh(); drawer(id); toast(`Spend limit for ${c.name} is now ${money(c.limit, 0)}`); };
  $('#drw [data-act="grant"]').onclick = () => grantModal(c);
  $('#drw [data-act="stripe"]').onclick = () => toast(`Opened ${c.id} in the Stripe Dashboard`);
}
function grantModal(c) {
  openModal(`<div class="modal-h"><div><h3>Grant credits</h3><p>Adds a Stripe credit grant to ${esc(c.name)}. It is used before their card.</p></div><button class="x" data-close aria-label="Close">${svg(IC.x)}</button></div>
  <div class="modal-b"><div class="fld"><label for="gAmt">Amount, USD</label><div class="money"><span>$</span><input id="gAmt" type="number" min="1" step="1" value="250"></div><div class="er">Enter an amount from $1 to $10,000.</div></div>
  <div class="fld"><label for="gWhy">Reason</label><select class="inp" id="gWhy"><option>Goodwill · API incident</option><option>Promotion</option><option>Migration from another provider</option></select></div></div>
  <div class="modal-f"><button class="btn" data-close>Cancel</button><button class="btn v" id="gOk">Grant credits</button></div>`);
  $('#gOk').onclick = () => {
    const v = +$('#gAmt').value, f = $('#gAmt').closest('.fld');
    if (!(v >= 1 && v <= 10000)) { f.classList.add('bad'); return; }
    c.balance = Math.round((c.balance + v) * 100) / 100; save(); closeAll(); refresh(); toast(`${money(v)} granted to ${c.name}`);
  };
}

/* ---------------- page: tiers & prices ---------------- */
function pPricing() {
  const examples = [8000, 50000, 250000];
  $('#p-pricing').innerHTML = `
  <div class="ph"><div><h1>Tiers &amp; prices</h1><p class="sub">Graduated pricing per image, billed monthly through a Stripe meter</p></div><div class="r"><button class="btn" data-act="reset">Reset</button><button class="btn v" data-act="publish">${svg(IC.check)}Publish to Stripe</button></div></div>
  <div class="g2">
    <div class="card"><div class="ch"><h3>Price per image</h3><div class="r"><span class="pill pn">Meter: image_generated</span></div></div><div class="cb"><div class="tiers-ed">
      ${S.tiers.map((t, i) => { const from = i ? S.tiers[i - 1].upTo : 0; return `<div class="tier"><span class="n" style="background:${TIER_COLORS[i]}">${i + 1}</span><div><b>${t.upTo === null ? `Over ${num(from)} images` : `${i === 0 ? '1' : num(from + 1)} – ${num(t.upTo)} images`}</b><span>${i === 0 ? 'Every new account starts here' : i === 1 ? 'Growing products' : 'High volume'}</span></div><label class="money"><span>$</span><input type="number" step="0.001" min="0.001" value="${t.price}" data-t="${i}" aria-label="Price for tier ${i + 1}"><span style="font-size:12px">/ image</span></label></div>`; }).join('')}
    </div>
    <p style="font-weight:700;margin:18px 0 8px">Base fee per plan</p><div class="tiers-ed">
      ${S.plans.map((p, i) => `<div class="tier"><span class="n" style="background:#0E0B1A">${p.name[0]}</span><div><b>${p.name}</b><span>${p.note}</span></div><label class="money"><span>$</span><input type="number" step="1" min="0" value="${p.base}" data-p="${i}" aria-label="${p.name} base fee"><span style="font-size:12px">/ month</span></label></div>`).join('')}
    </div></div></div>
    <div class="card"><div class="ch"><h3>What customers would pay</h3></div><div class="cb" id="exBox"></div></div>
  </div>`;
  const ex = () => {
    $('#exBox').innerHTML = examples.map(v => { const p = v > 150000 ? 'scale' : v > 9000 ? 'pro' : 'starter', b = bill(v, p); return `<div style="padding:12px 0;border-bottom:1px solid #F1EFF7"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><span><b style="font-weight:700">${num(v)} images</b> <span class="mu">· ${b.plan.name}</span></span><b class="h" style="font-size:24px">${money(b.total)}</b></div><div class="mu" style="font-size:12.5px;margin-top:2px">${money(b.base, 0)} base + ${b.lines.filter(l => l.count).map(l => `${num(l.count)} × ${money(l.price, 3)}`).join(' + ')}</div></div>`; }).join('') +
      `<p class="mu" style="font-size:12.5px;margin-top:12px">Publishing creates new Stripe prices. Customers move to them at their next billing period.</p>`;
  };
  ex();
  $$('#p-pricing [data-t]').forEach(inp => inp.oninput = () => { const v = +inp.value; if (v > 0) { S.tiers[+inp.dataset.t].price = v; save(); ex(); } });
  $$('#p-pricing [data-p]').forEach(inp => inp.oninput = () => { const v = +inp.value; if (v >= 0) { S.plans[+inp.dataset.p].base = v; save(); ex(); } });
  $('#p-pricing [data-act="publish"]').onclick = () => toast('3 tier prices and 3 base fees published to Stripe');
  $('#p-pricing [data-act="reset"]').onclick = () => { S.tiers = clone(DATA.tiers); S.plans = clone(DATA.plans); save(); pPricing(); toast('Prices reset'); };
}

/* ---------------- page: customer usage & billing ---------------- */
function pUsage() {
  const c = me(), b = bill(c.images, c.plan), p = b.total / c.limit * 100, per = c.images / 20 * (b.usage / c.images);
  const days = c.balance / per;
  $('#p-usage').innerHTML = `
  <div class="ph"><div><h1>Usage &amp; billing</h1><p class="sub">${esc(c.name)} · ${b.plan.name} plan · ${money(b.base, 0)} a month + usage · resets Dec 1</p></div><div class="r"><button class="btn" data-act="limit">Spend limit</button><a class="btn v" href="#credits">${svg(IC.plus)}Add credits</a></div></div>
  <div class="r1">
    <div class="card bal"><span class="t">Prepaid balance</span><b>${money(c.balance)}</b><p>About ${Math.max(0, Math.round(days))} days left at your current pace</p><a class="btn" href="#credits">Top up now</a></div>
    <div class="card spend"><div class="t"><span>Spent this month</span><span class="pill ${p >= 90 ? 'po' : 'pv'}">${Math.round(p)}% of limit</span></div><b class="v">${money(b.total)} <span>/ ${money(c.limit, 0)}</span></b>
      <div class="trk"><i class="${p >= 90 ? 'hot' : ''}" style="width:${Math.min(100, p)}%"></i><u></u></div><div class="trl"><span>$0</span><span style="color:var(--or-d)">Alert at 90%</span><span>${money(c.limit, 0)}</span></div></div>
    <div class="card auto"><div class="row"><b class="h" style="font-size:17px;font-weight:700;letter-spacing:-.02em">Auto top-up</b><button class="sw ${c.auto ? 'on' : ''}" id="autoSw" role="switch" aria-checked="${c.auto}" aria-label="Auto top-up"></button></div>
      <div class="rule ${c.auto ? '' : 'off'}" id="rule"><label>When balance falls below<select id="tuBelow">${[100, 200, 500].map(v => `<option value="${v}" ${S.topUp.below === v ? 'selected' : ''}>$${v}</option>`).join('')}</select></label><label>Add credits worth<select id="tuAdd">${[500, 1000, 2500].map(v => `<option value="${v}" ${S.topUp.add === v ? 'selected' : ''}>$${num(v)}</option>`).join('')}</select></label></div></div>
  </div>
  <div class="g2">
    <div class="card"><div class="ch"><h3>Images per day</h3><div class="r"><span class="pill pn">${num(c.images)} this month</span></div></div><div class="chart" id="myChart"></div></div>
    <div class="card"><div class="ch"><h3>By model</h3></div><div class="cb md">${DATA.models.map((m, i) => `<div><div class="l">${m.name}<span>${num(c.images * c.mix[i])} · ${Math.round(c.mix[i] * 100)}%</span></div><div class="b"><i style="width:${c.mix[i] * 100}%;background:${m.color}"></i></div></div>`).join('')}</div></div>
  </div>
  <div class="card"><div class="ch" style="padding-bottom:4px"><h3>API keys</h3><div class="r"><button class="btn sm" data-act="newkey">${svg(IC.plus)}Create key</button></div></div>
    <div class="tw"><table><thead><tr><th>Name</th><th>Key</th><th class="r hm">Images</th><th class="r">Cost</th><th class="hm">Last used</th><th></th></tr></thead><tbody>
    ${S.keys.map((k, i) => `<tr><td><b>${esc(k.name)}</b> ${k.live ? '' : '<span class="pill pn" style="margin-left:4px">test</span>'}</td><td><code>${esc(k.key)}</code></td><td class="r hm">${num(k.images)}</td><td class="r"><b>${money(c.images ? k.images / c.images * b.usage : 0)}</b></td><td class="hm mu">${k.last}</td><td class="r"><button class="btn sm" data-revoke="${i}">Revoke</button></td></tr>`).join('')}
    </tbody></table></div></div>
  <div class="card"><div class="ch" style="padding-bottom:4px"><h3>Payments</h3></div><div class="tw"><table><thead><tr><th>Date</th><th>Description</th><th class="r">Amount</th><th>Status</th><th class="r"></th></tr></thead><tbody>
    ${S.payments.map(p => `<tr><td>${p.date}</td><td>${esc(p.what)}</td><td class="r"><b>${money(p.amount)}</b></td><td><span class="pill pg">${p.status}</span></td><td class="r"><button class="btn sm" data-pdf="${esc(p.date)}">${svg(IC.dl)}PDF</button></td></tr>`).join('')}
    </tbody></table></div></div>`;
  bars($('#myChart'), DATA.myDaily.map(v => ({ parts: [v], colors: ['#5B3DF5'] })).map((d, i, a) => i === a.length - 1 ? { parts: d.parts, colors: ['#FF7A45'] } : d), {
    h: 240, max: 6000, axis: [0, 2000, 4000, 6000], fmt: v => v / 1000 + 'k', colors: ['#5B3DF5'],
    forecast: Array.from({ length: 10 }, () => ({ v: 3240 })), fcFill: '#F1EFF7', ticks: [1, 10, 20, 30], tickFmt: t => 'Nov ' + t,
    callout: DATA.myDaily.length - 1, calloutFmt: v => num(v), hint: i => `<b>Nov ${i + 1}</b><br>${num(DATA.myDaily[i])} images`
  });
  $('#autoSw').onclick = () => { c.auto = !c.auto; save(); pUsage(); toast(c.auto ? 'Auto top-up is on' : 'Auto top-up is off'); };
  $('#tuBelow').onchange = e => { S.topUp.below = +e.target.value; save(); toast('Auto top-up rule saved'); };
  $('#tuAdd').onchange = e => { S.topUp.add = +e.target.value; save(); toast('Auto top-up rule saved'); };
  $('#p-usage [data-act="limit"]').onclick = limitModal;
  $('#p-usage [data-act="newkey"]').onclick = keyModal;
  $$('#p-usage [data-revoke]').forEach(bt => bt.onclick = () => { const k = S.keys[+bt.dataset.revoke]; if (S.keys.length <= 1) { toast('Keep at least one key'); return; } S.keys.splice(+bt.dataset.revoke, 1); save(); pUsage(); toast(`Key “${k.name}” revoked`); });
  $$('#p-usage [data-pdf]').forEach(bt => bt.onclick = () => toast(`Invoice from ${bt.dataset.pdf} downloaded`));
}
function limitModal() {
  const c = me();
  openModal(`<div class="modal-h"><div><h3>Monthly spend limit</h3><p>We stop new requests when you reach it and email you at 90%.</p></div><button class="x" data-close aria-label="Close">${svg(IC.x)}</button></div>
  <div class="modal-b"><div class="q"><span class="mu" style="font-weight:600">Limit</span><b id="lv" style="font-size:36px">${money(c.limit, 0)}</b></div><input type="range" id="lr" min="500" max="10000" step="250" value="${c.limit}" aria-label="Spend limit"><div class="tk"><span>$500</span><span>$10,000</span></div>
  <p class="mu" style="font-size:13px;margin-top:12px">Spent so far: <b style="color:var(--tx)">${money(bill(c.images, c.plan).total)}</b></p></div>
  <div class="modal-f"><button class="btn" data-close>Cancel</button><button class="btn v" id="lOk">Save limit</button></div>`);
  const r = $('#lr'), upd = () => { $('#lv').textContent = money(+r.value, 0); r.style.setProperty('--p', ((r.value - 500) / 9500 * 100) + '%'); };
  r.oninput = upd; upd();
  $('#lOk').onclick = () => { const used = bill(c.images, c.plan).total; if (+r.value < used) { toast('The limit can’t be lower than what you spent'); return; } c.limit = +r.value; save(); closeAll(); refresh(); toast(`Spend limit set to ${money(c.limit, 0)}`); };
}
function keyModal() {
  openModal(`<div class="modal-h"><div><h3>Create API key</h3><p>Usage from this key is billed to ${esc(me().name)}.</p></div><button class="x" data-close aria-label="Close">${svg(IC.x)}</button></div>
  <div class="modal-b" id="kb"><div class="fld"><label for="kn">Key name</label><input class="inp" id="kn" placeholder="e.g. mobile-app" maxlength="24"><div class="er">Use 2–24 letters, numbers or dashes.</div></div>
  <div class="fld"><label for="km">Mode</label><select class="inp" id="km"><option value="live">Live — billed</option><option value="test">Test — free, watermarked</option></select></div></div>
  <div class="modal-f" id="kf"><button class="btn" data-close>Cancel</button><button class="btn v" id="kOk">Create key</button></div>`);
  $('#kOk').onclick = () => {
    const n = $('#kn').value.trim(), f = $('#kn').closest('.fld');
    if (!/^[a-z0-9-]{2,24}$/i.test(n)) { f.classList.add('bad'); $('#kn').classList.add('err'); return; }
    const live = $('#km').value === 'live', rnd = () => Math.random().toString(36).slice(2, 6);
    const full = `kl_${live ? 'live' : 'test'}_${rnd()}${rnd()}${rnd()}${rnd()}`;
    S.keys.push({ name: n, key: full.slice(0, 12) + '••••' + full.slice(-4), images: 0, last: 'never', live }); save();
    $('#kb').innerHTML = `<p style="margin-bottom:10px">Copy the key now. For security we show it only once.</p><div class="keybox"><span style="flex:1">${full}</span><button class="btn sm" id="kc">${svg(IC.copy)}Copy</button></div>`;
    $('#kf').innerHTML = '<button class="btn v" data-close>Done</button>';
    $('#kc').onclick = () => { try { navigator.clipboard.writeText(full); } catch (e) { } toast('Key copied'); };
    pUsage();
  };
}

/* ---------------- page: price calculator ---------------- */
const VOL = [1000, 2500, 5000, 10000, 25000, 50000, 75000, 100000, 150000, 250000, 400000, 600000];
function pCalculator() {
  $('#p-calculator').innerHTML = `
  <div class="calc-wrap">
    <div style="display:flex;flex-direction:column;gap:14px">
      <h1 class="big-h">Pay only for the images<br>you <em>actually generate</em></h1>
      <div class="card cb" style="padding:20px 22px"><div class="q"><span class="mu" style="font-weight:600">Images per month</span><b id="cv"></b></div>
        <input type="range" id="cr" min="0" max="${VOL.length - 1}" step="1" value="${Math.max(0, VOL.indexOf(S.calcVol))}" aria-label="Images per month"><div class="tk"><span>1k</span><span>10k</span><span>100k</span><span>600k</span></div>
        <div class="plans" id="cplans"></div></div>
      <div class="lg" style="font-size:13px;color:var(--tx2)"><span><i style="background:var(--vi);border-radius:50%"></i>Billed monthly by Stripe</span><span><i style="background:var(--or);border-radius:50%"></i>Spend limits &amp; alerts</span><span><i style="background:var(--ok);border-radius:50%"></i>Lower price at volume</span></div>
    </div>
    <div class="card cb" style="padding:20px 22px"><h3 class="h" style="font-size:20px;letter-spacing:-.03em">Your estimate</h3><div id="cest" style="margin-top:8px"></div></div>
  </div>`;
  const r = $('#cr');
  const upd = () => {
    S.calcVol = VOL[+r.value]; r.style.setProperty('--p', (+r.value / (VOL.length - 1) * 100) + '%');
    $('#cv').textContent = num(S.calcVol);
    $('#cplans').innerHTML = S.plans.map(p => `<button class="plan ${S.calcPlan === p.id ? 'on' : ''}" data-pl="${p.id}"><b>${p.name}</b><div class="p">$${p.base}<span> /mo</span></div><small>${p.note}</small></button>`).join('');
    $$('#cplans [data-pl]').forEach(bt => bt.onclick = () => { S.calcPlan = bt.dataset.pl; save(); upd(); });
    const b = bill(S.calcVol, S.calcPlan);
    $('#cest').innerHTML = `<div class="er-row"><span>${b.plan.name} base fee</span><b>${money(b.base)}</b></div>${b.lines.filter(l => l.count).map((l, i) => `<div class="er-row"><span class="mu">${i === 0 ? 'First' : 'Next'} ${num(l.count)} × ${money(l.price, 3)}</span><b>${money(l.amount)}</b></div>`).join('')}
      <div class="tot"><span class="mu" style="font-weight:650">Estimated per month</span><b style="font-size:34px">${money(b.total)}</b></div>
      <p class="mu" style="font-size:13px;margin-top:6px">That is ${money(b.total / S.calcVol, 4)} per image on average.</p>
      <a class="btn v lg blk" href="#credits" style="margin-top:16px">${svg(IC.bolt)}Start with ${b.plan.name}</a>`;
    save();
  };
  r.oninput = upd; upd();
}

/* ---------------- page: add credits ---------------- */
function pCredits() {
  const pk = DATA.packs[S.pack], c = me();
  $('#p-credits').innerHTML = `
  <div class="ph"><div><h1>Add prepaid credits</h1><p class="sub">Credits never expire and are used before your card. Current balance: <b style="color:var(--tx)">${money(c.balance)}</b></p></div></div>
  <div class="calc-wrap">
    <div class="card cb" style="padding:20px 22px" id="payBox">
      <div class="packs">${DATA.packs.map((p, i) => `<button class="pack ${S.pack === i ? 'on' : ''}" data-pk="${i}">${p.bonus ? `<em>+${p.bonus}%</em>` : ''}<b>$${num(p.amount)}</b><span>${num(p.amount * (1 + p.bonus / 100))} in credits</span></button>`).join('')}</div>
      <div class="ex"><button class="k" data-wallet="Apple Pay">Apple Pay</button><button data-wallet="Google Pay">Google Pay</button></div>
      <div class="or">or pay with card</div>
      <form id="pf" novalidate>
        <div class="fld"><label for="pe">Email</label><input class="inp" id="pe" type="email" placeholder="you@company.com" autocomplete="email"><div class="er">Enter a valid email.</div></div>
        <div class="fld"><label>Card information</label><div class="cardg" id="cg"><input class="inp" id="pc" placeholder="1234 1234 1234 1234" inputmode="numeric" autocomplete="cc-number" aria-label="Card number"><div class="rw2"><input class="inp" id="px" placeholder="MM / YY" inputmode="numeric" autocomplete="cc-exp" aria-label="Expiry"><input class="inp" id="pv" placeholder="CVC" inputmode="numeric" autocomplete="cc-csc" aria-label="CVC"></div></div><div class="er">Check the card number, expiry and CVC. Test card: 4242 4242 4242 4242.</div></div>
        <div class="fld"><label for="pn">Name on card</label><input class="inp" id="pn" placeholder="Full name on card" autocomplete="cc-name"><div class="er">Enter the name on the card.</div></div>
        <button class="pay" type="submit" id="payBtn"><span>Add credits</span><b>${money(pk.amount)} →</b></button>
        <p class="mu" style="font-size:12px;text-align:center;margin-top:12px">${svg(IC.lock).replace('class="ic"', 'class="ic" style="display:inline;width:13px;height:13px;vertical-align:-2px"')} Payments by Stripe. VAT is added for your country.</p>
      </form>
    </div>
    <div class="card cb" style="padding:20px 22px"><h3 class="h" style="font-size:20px;letter-spacing:-.03em">Summary</h3>
      <div style="margin-top:8px"><div class="er-row"><span>Credit pack</span><b>${money(pk.amount)}</b></div><div class="er-row"><span>Bonus credits</span><b style="color:var(--ok)">+${money(pk.amount * pk.bonus / 100)}</b></div><div class="er-row"><span>New balance</span><b>${money(c.balance + pk.amount * (1 + pk.bonus / 100))}</b></div></div>
      <div class="tot"><span class="mu" style="font-weight:650">Due today</span><b style="font-size:34px">${money(pk.amount)}</b></div>
      <p class="mu" style="font-size:13px;margin-top:14px">At your current pace that covers about <b style="color:var(--tx)">${num(pk.amount * (1 + pk.bonus / 100) / 0.032)}</b> images on the ${planOf(c.plan).name} plan.</p></div>
  </div>`;
  $$('#p-credits [data-pk]').forEach(bt => bt.onclick = () => { S.pack = +bt.dataset.pk; save(); pCredits(); });
  $$('#p-credits [data-wallet]').forEach(bt => bt.onclick = () => charge(bt.dataset.wallet));
  // card number spacing + expiry slash
  $('#pc').oninput = e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); };
  $('#px').oninput = e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); e.target.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d; };
  $('#pv').oninput = e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); };
  $('#pf').onsubmit = e => {
    e.preventDefault();
    const em = $('#pe'), cn = $('#pc'), ex = $('#px'), cv = $('#pv'), nm = $('#pn');
    const okEmail = /^\S+@\S+\.\S+$/.test(em.value);
    const digits = cn.value.replace(/\D/g, '');
    const luhn = digits.length >= 15 && digits.split('').reverse().reduce((a, d, i) => { let n = +d; if (i % 2) { n *= 2; if (n > 9) n -= 9; } return a + n; }, 0) % 10 === 0;
    const m = ex.value.replace(/\D/g, ''), mm = +m.slice(0, 2), yy = +m.slice(2);
    const okExp = m.length === 4 && mm >= 1 && mm <= 12 && (yy > 26 || (yy === 26 && mm >= 11));
    const okCard = luhn && okExp && cv.value.length >= 3;
    const okName = nm.value.trim().length >= 2;
    [[em, okEmail], [nm, okName]].forEach(([el, ok]) => { el.classList.toggle('err', !ok); el.closest('.fld').classList.toggle('bad', !ok); });
    $('#cg').classList.toggle('err', !okCard); $('#cg').closest('.fld').classList.toggle('bad', !okCard);
    if (okEmail && okCard && okName) charge('Visa ·· ' + digits.slice(-4));
    else { const f = $('#pf .bad input'); if (f) f.focus(); }
  };
}
function charge(method) {
  const b = $('#payBtn'); b.disabled = true; b.innerHTML = '<span>Processing…</span><span class="spin"></span>';
  setTimeout(() => {
    const pk = DATA.packs[S.pack], add = pk.amount * (1 + pk.bonus / 100), c = me();
    c.balance = Math.round((c.balance + add) * 100) / 100;
    S.payments.unshift({ date: 'Nov 20, 2026', what: `Prepaid credits · ${method}`, amount: pk.amount, status: 'Paid' }); save();
    $('#payBox').innerHTML = `<div class="done"><div class="tick">${svg(IC.check)}</div><h3 class="h" style="font-size:26px">${money(add)} added</h3><p class="mu" style="margin-top:6px">Your balance is now <b style="color:var(--tx)">${money(c.balance)}</b>. A receipt is on its way.</p><div style="display:flex;gap:8px;justify-content:center;margin-top:20px;flex-wrap:wrap"><a class="btn v" href="#usage">Back to usage</a><button class="btn" id="again">Buy more</button></div></div>`;
    $('#again').onclick = pCredits;
    toast(`${money(add)} in credits added`);
  }, 1200);
}

/* ---------------- router ---------------- */
const PAGES = { overview: pOverview, customers: pCustomers, pricing: pPricing, usage: pUsage, calculator: pCalculator, credits: pCredits };
const TITLES = { overview: 'Usage revenue', customers: 'Customers', pricing: 'Tiers & prices', usage: 'Usage & billing', calculator: 'Price calculator', credits: 'Add credits' };
let cur = '';
function go() {
  const id = PAGES[location.hash.slice(1)] ? location.hash.slice(1) : 'overview';
  closeAll();
  $$('.page').forEach(p => p.classList.toggle('on', p.id === 'p-' + id));
  $$('.nv').forEach(a => a.classList.toggle('on', a.dataset.p === id));
  PAGES[id]();
  document.title = TITLES[id] + ' · Kiln';
  if (id !== cur) { scrollTo(0, 0); const a = $(`.nv[data-p="${id}"]`); if (a && innerWidth <= 1024) a.scrollIntoView({ inline: 'center', block: 'nearest' }); }
  cur = id; badge();
}
function refresh() { PAGES[cur](); badge(); }
function badge() { const n = S.customers.filter(c => pct(c) >= 90).length; const b = $('#alertCount'); b.textContent = n; b.classList.toggle('hide', !n); }
addEventListener('hashchange', go);
let rT, lastW = innerWidth; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (Math.abs(innerWidth - lastW) > 40) { lastW = innerWidth; $$('.page.on .chart').forEach(c => c._redraw && c._redraw()); } }, 150); });
// live meter counter in the sidebar
(function tick() { let n = DATA.platform.meterEventsToday; setInterval(() => { n += 3 + Math.floor(Math.random() * 9); $('#meterNum').textContent = num(n); $('#meterBar').style.width = Math.min(100, n / 653000 * 100) + '%'; }, 1500); })();
go();
