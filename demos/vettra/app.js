/* Vettra — app logic. Vanilla JS + GSAP (free for commercial use). */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const kfmt = v => String(Math.round(v));
const lerp = (a, b, p) => a + (b - a) * p;
const ini = s => s.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const mq = matchMedia('(max-width:760px)');
gsap.registerPlugin(CustomEase, Flip);
CustomEase.create('glide', '0.22,1,0.36,1');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.globalTimeline.timeScale(20);

/* ---------- Icons ---------- */
const svg = p => `<svg class="ic" viewBox="0 0 24 24">${p}</svg>`;
const I = {
  home: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'),
  jobs: svg('<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18"/>'),
  cand: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6"/>'),
  cal: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'),
  vol: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'),
  send: svg('<path d="M21 3 3 10.5l7 3 3 7.5zM10 13.5 21 3"/>'),
  queue: svg('<path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  pin: svg('<path d="M12 21s-6.5-5.2-6.5-11a6.5 6.5 0 0 1 13 0c0 5.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  doc: svg('<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"/><path d="M14 3.5V8h4"/>'),
  arrow: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
  users: svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  star: svg('<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
  video: svg('<rect x="3" y="6.5" width="13" height="11" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  user: svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0M18 4v4M16 6h4"/>')
};

/* ---------- Sound ---------- */
const SFX = (() => {
  let ctx = null, on = true, last = -1e9; const bufs = {};
  try { on = localStorage.getItem('vettra-sound') !== 'off'; } catch (e) { }
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
  return { play, recent: () => performance.now() - last < 40, isOn: () => on, set(v) { on = v; try { localStorage.setItem('vettra-sound', v ? 'on' : 'off'); } catch (e) { } } };
})();

/* ---------- Helpers ---------- */
const D = DATA;
const sw = on => `<button class="sw${on ? ' on' : ''}" role="switch" aria-checked="${on}"><i></i></button>`;
const spark = (vals, color, dim) => {
  // mini bar chart: last bar highlighted
  const W = 96, Hh = 32, n = vals.length, mx = Math.max(...vals), bw = 7, gap = (W - n * bw) / (n - 1);
  return `<svg class="spark" viewBox="0 0 ${W} ${Hh}">${vals.map((v, i) => { const h = Math.max(4, v / mx * Hh); return `<rect class="sb" x="${(i * (bw + gap)).toFixed(1)}" y="${(Hh - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="2.5" fill="${i === n - 1 ? color : dim}"/>`; }).join('')}</svg>`;
};
const steps = (n, total = 4) => `<div class="steps">${Array.from({ length: total }, (_, i) => `${i ? `<s class="${i <= n ? 'ok' : ''}"></s>` : ''}<i class="${i < n ? 'ok' : i === n ? 'now' : ''}"></i>`).join('')}</div>`;

/* ---------- Pages ---------- */
const PAGES = [['overview', 'Overview', I.home, 'Desk'], ['jobs', 'Jobs', I.jobs, null, D.roles.filter(r => r.status === 'Live').length], ['candidates', 'Candidates', I.cand], ['interviews', 'Interviews', I.cal, null, D.interviews.length], ['settings', 'Settings', I.gear, 'Team']];
const H = {};
const tth = D.timeToHire, tNow = tth[11], tPrev = tth[10];
const stageMax = D.stages[0][1];

const RING = { r: 84, w: 20, gap: 3 };
const ring = () => {
  const C = 2 * Math.PI * RING.r; let at = 0;
  const segs = D.tthStages.map((s, i) => { const len = s[2] / tNow * C - RING.gap, o = at; at += s[2] / tNow * C;
    return `<circle class="seg" data-s="${i}" data-len="${len.toFixed(2)}" cx="100" cy="100" r="${RING.r}" stroke="${s[3]}" stroke-width="${RING.w}" stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-o).toFixed(2)}"/>`; }).join('');
  return `<div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="${RING.r}" class="trk" stroke-width="${RING.w}"/><g transform="rotate(-90 100 100)">${segs}</g></svg>
    <div class="rc"><b class="num" data-n="${tNow}" data-f="int">0</b><span>days to hire</span></div></div>`;
};

H.overview = () => `
<div class="ph"><div><h1>Good morning, Daniel</h1><p>${D.interviews.length} interviews today and 2 offers are waiting for approval. Time to hire is down for the third month running.</p></div>
  <div class="acts"><button class="btn" data-act="share">${I.send}Share report</button><button class="btn light" data-go="candidates">${I.queue}Review queue <span class="cnt">12</span></button></div></div>
<div class="g">
  <div class="c paper s8" id="heroC">
    <div class="hero"><div><div class="sub">Time to hire · November</div>
      <div class="dl"><em>−${(tPrev - tNow).toFixed(1).replace('.0', '')} days</em>vs October · goal ${D.timeToHireGoal} days</div></div>
      <div class="mini"><div><b class="num" data-n="148" data-f="int">0</b><span>Applicants this month</span></div><div><b class="num" data-n="42" data-f="pct">0%</b><span>Screened</span></div><div><b>2h 10m</b><span>Median reply</span></div></div></div>
    <div class="donut">${ring()}
      <div><ul class="dlist">${D.tthStages.map((s, i) => `<li data-s="${i}"><i style="background:${s[3]}"></i><div><b>${s[0]}</b><span>${s[1]}</span></div><strong>${s[2]} days</strong><small>${Math.round(s[2] / tNow * 100)}%</small></li>`).join('')}</ul>
      <p class="dnote">Interviews take the longest, but they are 2 days shorter than in October.</p></div></div></div>
  <div class="c s4" id="mixC"><div class="ch"><div><h3>Pipeline</h3><p>${D.stages[0][1]} active candidates</p></div><button class="link" data-go="candidates" aria-label="Open pipeline">${I.arrow}</button></div>
    <ul class="mix">${D.stages.map(s => `<li><span>${s[0]}</span><div class="tr"><i data-w="${(s[1] / stageMax * 100).toFixed(1)}"></i></div><b class="num">${s[1]}</b></li>`).join('')}</ul>
    <div class="note"><span class="dot">${I.check}</span><span><b>84%</b> of offers accepted this quarter, up from 71%</span></div>
    <div class="trio">${[['Offer rate', '29%'], ['No-shows', '4%'], ['Open roles', '6']].map(t => `<div><span>${t[0]}</span><b>${t[1]}</b></div>`).join('')}</div></div>
  ${D.kpis.map((k, i) => `<div class="c kpi s3${i ? '' : ' metal'}"><div class="hd"><i>${[I.users, I.cal, I.send, I.star][i]}</i>${k[0]}</div>
    <div class="row"><div><b class="num" data-n="${k[1]}" data-f="int">0</b><small>${k[2]}</small></div>${spark(k[3], i ? '#8EB2FF' : '#0A0F1C', i ? 'rgba(142,178,255,.18)' : 'rgba(10,15,28,.18)')}</div></div>`).join('')}
  <div class="c s7"><div class="ch"><div><h3>Today’s interviews</h3><p>Thursday, November 12</p></div><button class="link" data-go="interviews" aria-label="Open interviews">${I.arrow}</button></div>
    <ul class="rows">${D.interviews.slice(0, 4).map(v => `<li><div class="tm">${v.time}<small>${v.end}</small></div><span class="av">${ini(v.name)}</span><div class="t"><b>${v.name}</b><span>${v.role}</span></div><span class="pill${v.status === 'Next' ? ' blue' : ''}">${v.type}</span></li>`).join('')}</ul></div>
  <div class="c s5"><div class="ch"><div><h3>Where hires come from</h3><p>Last 12 months</p></div></div>
    <ul class="mix">${D.sources.map((s, i) => `<li><span>${s[0]}</span><div class="tr"><i style="background:${i ? 'var(--blue-2)' : 'var(--text)'}" data-w="${(s[1] / 41 * 100).toFixed(1)}"></i></div><b class="num">${s[1]}%</b></li>`).join('')}</ul></div>
</div>`;

const depts = ['All', ...new Set(D.roles.map(r => r.dept))].slice(0, 6);
H.jobs = () => `
<div class="ph"><div><h1>Jobs</h1><p>Every open role at Northwind — how many people applied and how far they’ve got.</p></div>
  <div class="acts"><button class="btn light" data-act="post">${I.plus}Post a job</button></div></div>
<div class="tabs" id="jobTabs"><span class="u"></span><button class="on" data-t="Live">Open <em>${D.roles.filter(r => r.status === 'Live').length}</em></button><button data-t="Paused">Paused <em>${D.roles.filter(r => r.status === 'Paused').length}</em></button><button data-t="All">All roles <em>${D.roles.length}</em></button></div>
<div class="tools"><label class="field">${svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>')}<input id="jq" placeholder="Search role, team or city"></label>
  <div class="seg" id="deptSeg"><span class="p"></span>${depts.map((d, i) => `<button${i ? '' : ' class="on"'} data-d="${d}">${d}</button>`).join('')}</div></div>
<div class="roles" id="roles">${D.roles.map(r => `<div class="role" data-id="${r.id}" data-dept="${r.dept}" data-status="${r.status}">
  <div class="rt"><span class="ico">${r.id.split('-')[0]}</span><span class="pill ${r.status === 'Live' ? 'live' : 'pause'}">${r.status}</span></div>
  <div><h4>${r.title}</h4><div class="meta">${I.pin}${r.loc}</div><div class="meta">${I.users}${r.owner}</div></div>
  <div class="pbar"><i data-w="${(r.fill * 100).toFixed(0)}"></i></div>
  <div class="st"><div><b class="num">${r.applicants}</b><span>applied</span></div><div><b class="num">${r.interview}</b><span>interviewing</span></div><div><b class="num">${r.days}d</b><span>open</span></div></div></div>`).join('')}</div>`;

H.candidates = () => `
<div class="ph"><div><h1>Candidates</h1><p>Everyone in the pipeline — the stage they’re at and the one thing that moves them on.</p></div>
  <div class="acts"><button class="btn" data-act="invite">${I.user}Invite a candidate</button></div></div>
<div class="tabs" id="candTabs"><span class="u"></span><button class="on">Pipeline <em>${Object.values(D.board).flat().length}</em></button><button data-act="soon">Talent pool <em>212</em></button></div>
<div class="board" id="board">${D.columns.map((c, i) => c[0] === 'hired'
    ? `<div class="col done" data-col="hired"><div class="hd"><span class="n">${I.check.replace('class="ic"', 'class="ic" style="width:12px;height:12px;stroke-width:3"')}</span>Hired<em id="hiredN">0</em></div>
      <div class="live-col"><div class="ready"><i></i>Ready to start</div><p>Marking a candidate as hired sends their offer pack and books day-one onboarding.</p><div class="hiredlist" id="hiredList"></div><button class="btn sm w100" data-act="invite">${I.user}Invite another</button></div></div>`
    : `<div class="col" data-col="${c[0]}"><div class="hd"><span class="n">${i + 1}</span>${c[1]}<em class="cnt">0</em></div><div class="list"></div></div>`).join('')}</div>`;

H.interviews = () => `
<div class="ph"><div><h1>Interviews</h1><p>${D.interviews.length} today · 1 panel · scorecards are due within 24 hours.</p></div>
  <div class="acts"><div class="seg" id="ivSeg"><span class="p"></span><button class="on" data-v="today">Today</button><button data-v="week">This week</button></div></div></div>
<div class="g">
  <div class="s5"><ul class="ivl" id="ivl">${D.interviews.map((v, i) => `<li data-i="${i}"${i ? '' : ' class="sel"'}><div class="tm">${v.time}<small>${v.end}</small></div><div class="t"><b>${v.name}</b><span>${v.type} · ${v.role}</span></div><span class="pill${v.status === 'Next' ? ' blue' : ''}">${v.status === 'Next' ? 'Next' : v.mode}</span></li>`).join('')}</ul></div>
  <div class="c s7 ivd" id="ivd"></div>
</div>`;

H.settings = () => `
<div class="ph"><div><h1>Settings</h1><p>Your hiring team, the stages every candidate goes through and where Vettra sends updates.</p></div></div>
<div class="g">
  <div class="c s6"><div class="ch"><div><h3>Hiring team</h3><p>${D.team.length} people</p></div><button class="btn sm" data-act="invite">${I.plus}Add</button></div>
    <ul class="rows">${D.team.map((t, i) => `<li><span class="av">${ini(t[0])}</span><div class="t"><b>${t[0]}</b><span>${t[1]}</span></div><span class="pill${i ? '' : ' live'}">${t[2]}</span></li>`).join('')}</ul></div>
  <div class="c s6"><div class="ch"><div><h3>Hiring stages</h3><p>Applied to every new role</p></div></div>
    ${[['Phone screen', '15 minutes with a recruiter', true], ['Take-home task', 'Engineering and design roles only', true], ['Panel interview', 'Two interviewers and a scorecard', true], ['Reference checks', 'Two references before the offer', false]].map(t => `<div class="set"><span><b>${t[0]}</b><small>${t[1]}</small></span>${sw(t[2])}</div>`).join('')}</div>
  <div class="c s6"><div class="ch"><div><h3>Integrations</h3><p>Calendars, job boards and chat</p></div></div>
    ${[['LinkedIn', 'Post jobs and import applicants', true, '#0A66C2'], ['Google Calendar', 'Book interviews in free slots', true, '#3D7BFF'], ['Slack', 'Updates to #hiring', true, '#4A154B'], ['Zoom', 'Video links for remote interviews', false, '#2D8CFF']].map(t => `<div class="set"><span class="int" style="--c:${t[3]}">${t[0][0]}</span><span style="flex:1"><b>${t[0]}</b><small>${t[1]}</small></span>${sw(t[2])}</div>`).join('')}</div>
  <div class="c s6"><div class="ch"><div><h3>Notifications</h3><p>Email and Slack</p></div></div>
    ${[['New applicant', 'For roles you own', true], ['Scorecard overdue', '24 hours after the interview', true], ['Offer accepted', 'Notify the whole team', true], ['Weekly digest', 'Monday 9:00', false]].map(t => `<div class="set"><span><b>${t[0]}</b><small>${t[1]}</small></span>${sw(t[2])}</div>`).join('')}</div>
</div>`;

/* ---------- Build shell ---------- */
const nav = $('#nav'), view = $('#view'), hl = $('#hl');
nav.insertAdjacentHTML('beforeend', PAGES.map(p => `${p[3] ? `<p${p[3] === 'Team' ? ' class="sp"' : ''}>${p[3]}</p>` : ''}<a href="#${p[0]}" data-page="${p[0]}">${p[2]}<span>${p[1]}</span>${p[4] ? `<em>${p[4]}</em>` : ''}</a>`).join(''));
$('#tabbar').innerHTML = PAGES.map(p => `<a href="#${p[0]}" data-page="${p[0]}">${p[2]}${p[1]}</a>`).join('');
view.innerHTML = PAGES.map(p => `<section class="page" id="p-${p[0]}" aria-label="${p[1]}">${H[p[0]]()}</section>`).join('');
const pageEl = id => $('#p-' + id);
gsap.set('.page', { autoAlpha: 0 });

/* ---------- Counters ---------- */
const FMT = { int: v => Math.round(v).toLocaleString('en-US'), pct: v => Math.round(v) + '%' };
function count(el, to, dur = 1.3) {
  const o = { v: 0 }, f = FMT[el.dataset.f] || FMT.int;
  return gsap.to(o, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = f(o.v); } });
}

/* ---------- Time-to-hire ring (on the light card) ---------- */
const TTH = (() => {
  const C = () => (2 * Math.PI * RING.r).toFixed(2);
  const hl = i => $$('#heroC .seg').forEach(c => gsap.to(c, { opacity: i == null || +c.dataset.s === i ? 1 : .22, duration: .3 }));
  document.addEventListener('mouseover', e => { const li = e.target.closest('.dlist li'); if (li) hl(+li.dataset.s); });
  document.addEventListener('mouseout', e => { const li = e.target.closest('.dlist li'); if (li && !li.contains(e.relatedTarget)) hl(null); });
  return { reveal() {
    $$('#heroC .seg').forEach((c, i) => gsap.fromTo(c, { attr: { 'stroke-dasharray': `0 ${C()}` } }, { attr: { 'stroke-dasharray': `${c.dataset.len} ${C()}` }, duration: .9, delay: .35 + i * .22, ease: 'power2.inOut' }));
    gsap.fromTo('#heroC .dlist li', { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: .6, stagger: .12, delay: .4, ease: 'glide' });
    gsap.fromTo('#heroC .dnote', { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, delay: 1.2 });
  } };
})();

/* ---------- Tabs & segmented ---------- */
const UIS = [];
function tabs(root, onPick) {
  const u = $('.u', root);
  const place = (b, d = .45) => gsap.to(u, { x: b.offsetLeft, width: b.offsetWidth, duration: d, ease: 'glide' });
  $$('button', root).forEach(b => b.addEventListener('click', () => {
    if (b.dataset.act || b.classList.contains('on')) return;
    $$('button', root).forEach(x => x.classList.toggle('on', x === b)); place(b); SFX.play('tick'); onPick && onPick(b);
  }));
  const s = { init() { const b = $('button.on', root); if (b && b.offsetWidth) gsap.set(u, { x: b.offsetLeft, width: b.offsetWidth }); } };
  UIS.push(s); s.init(); return s;
}
function seg(root, onPick) {
  const pill = $('.p', root);
  const place = (b, d = .5) => gsap.to(pill, { x: b.offsetLeft - 3, width: b.offsetWidth, duration: d, ease: 'glide' });
  $$('button', root).forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('on')) return;
    $$('button', root).forEach(x => x.classList.toggle('on', x === b)); place(b); SFX.play('tick'); onPick(b);
  }));
  const s = { init() { const b = $('button.on', root); if (b && b.offsetWidth) gsap.set(pill, { x: b.offsetLeft - 3, width: b.offsetWidth }); } };
  UIS.push(s); s.init(); return s;
}

/* ---------- Jobs: filter with Flip ---------- */
const JOBS = (() => {
  let status = 'Live', dept = 'All', q = '';
  function apply(anim = true) {
    const cards = $$('#roles .role'), state = Flip.getState(cards);
    cards.forEach(c => {
      const r = D.roles.find(x => x.id === c.dataset.id);
      const ok = (status === 'All' || r.status === status) && (dept === 'All' || r.dept === dept) && (r.title + r.loc + r.dept).toLowerCase().includes(q);
      c.style.display = ok ? '' : 'none';
    });
    if (anim) Flip.from(state, { duration: .6, ease: 'glide', scale: true, absolute: true, onEnter: els => gsap.fromTo(els, { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: .5 }), onLeave: els => gsap.to(els, { autoAlpha: 0, scale: .9, duration: .3 }) });
  }
  tabs($('#jobTabs'), b => { status = b.dataset.t; apply(); });
  seg($('#deptSeg'), b => { dept = b.dataset.d; apply(); });
  $('#jq').addEventListener('input', e => { q = e.target.value.toLowerCase(); apply(false); });
  apply(false);
  return { apply };
})();

/* ---------- Candidates board ---------- */
const BOARD = (() => {
  const order = D.columns.map(c => c[0]);
  const docs = { applied: 'CV and portfolio', screening: 'Phone screen notes', interview: 'Interview scorecards', offer: 'Offer documents' };
  const card = (c, col) => `<div class="cand" data-name="${c[0]}"><div class="who"><span class="av">${ini(c[0])}</span><div><b>${c[0]}</b><span>${c[1]}</span></div></div>
    ${steps(c[2])}<div class="doc">${I.doc}${c[2]} of 4 done · ${docs[col]}</div>
    <button class="btn sm w100" data-move="${c[0]}">${I.check}${D.columns.find(x => x[0] === col)[2]}</button></div>`;
  function render() {
    order.forEach(col => {
      if (col === 'hired') {
        $('#hiredList').innerHTML = D.board.hired.map(c => `<div class="h"><span class="av">${ini(c[0])}</span><span><b>${c[0]}</b><br><span style="color:var(--dim);font-size:11px">${c[1]}</span></span></div>`).join('');
        $('#hiredN').textContent = 18 + D.board.hired.length; return;
      }
      const el = $(`.col[data-col="${col}"]`);
      $('.list', el).innerHTML = D.board[col].map(c => card(c, col)).join('');
      $('.cnt', el).textContent = D.board[col].length;
    });
  }
  function move(name) {
    const from = order.find(k => D.board[k].some(c => c[0] === name)), i = order.indexOf(from), to = order[i + 1]; if (!to) return;
    const els = $$('#board .cand, #board .hiredlist .h'), state = Flip.getState(els);
    const idx = D.board[from].findIndex(c => c[0] === name), c = D.board[from].splice(idx, 1)[0];
    D.board[to].unshift([c[0], c[1], to === 'hired' ? 4 : 0, c[3]]);
    render();
    Flip.from(state, { targets: $$('#board .cand, #board .hiredlist .h'), duration: .75, ease: 'glide', nested: true, onEnter: e => gsap.fromTo(e, { autoAlpha: 0, scale: .85, y: -10 }, { autoAlpha: 1, scale: 1, y: 0, duration: .6, ease: 'back.out(1.6)' }) });
    const moved = $(`#board .cand[data-name="${name}"]`);
    if (moved) gsap.fromTo(moved, { boxShadow: '0 0 0 2px rgba(61,123,255,.9)' }, { boxShadow: '0 0 0 0px rgba(61,123,255,0)', duration: 1.4, delay: .5 });
    SFX.play(to === 'hired' ? 'ding' : 'open');
    toast(`${name} moved to ${D.columns.find(x => x[0] === to)[1]}`, () => { const k = D.board[to].findIndex(x => x[0] === name); D.board[to].splice(k, 1); D.board[from].splice(idx, 0, c); const st = Flip.getState($$('#board .cand, #board .hiredlist .h')); render(); Flip.from(st, { duration: .6, ease: 'glide', nested: true }); });
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-move]'); if (b) move(b.dataset.move); });
  tabs($('#candTabs'));
  render();
  return { render, move };
})();

/* ---------- Interviews ---------- */
const IV = (() => {
  let sel = 0;
  function detail(i, anim) {
    const v = D.interviews[i], el = $('#ivd'), avg = (v.score.reduce((a, b) => a + b, 0) / v.score.length).toFixed(1);
    el.innerHTML = `<div class="hd"><span class="av">${ini(v.name)}</span><div><b>${v.name}</b><span>${v.role} · ${v.type}</span></div><span class="pill ${v.status === 'Next' ? 'blue' : ''}" style="margin-left:auto">${v.status === 'Next' ? 'Starts in 6 min' : v.time + '–' + v.end}</span></div>
      <div class="meta"><div>Interviewers<b>${v.with.split(', ').length} people</b></div><div>Format<b>${v.mode}</b></div><div>Average score<b class="num">${avg} / 5</b></div></div>
      <div class="sub2">Scorecard · last stage</div>
      ${D.criteria.map((c, k) => `<div class="score-r"><span>${c}</span><div class="dots">${Array.from({ length: 5 }, (_, j) => `<i class="${j < v.score[k] ? 'on' : ''}"></i>`).join('')}</div><b class="num">${v.score[k]}</b></div>`).join('')}
      <div class="sub2" style="margin-top:14px">Recruiter note</div>
      <div class="quote"><b>${v.with.split(', ')[0]}:</b> ${['Strong on fundamentals and explains trade-offs clearly. Push on testing and how they handle production incidents.', 'Great energy and a real track record closing mid-market deals. Check how they forecast.', 'Thoughtful about channels and budget. Ask for a recent campaign with numbers.', 'Designed a payments service at scale before. Go deep on data consistency.', 'Portfolio is sharp and well explained. Ask about working with engineers on constraints.'][i]}</div>
      <div style="display:flex;gap:8px;margin-top:16px"><button class="btn light w100" data-act="join">${I.video}Join call</button><button class="btn w100" data-act="score">${I.check}Submit scorecard</button></div>`;
    if (anim) {
      gsap.fromTo(el.children, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .035, ease: 'glide' });
      gsap.fromTo($$('.dots i.on', el), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: .4, stagger: .02, delay: .2, ease: 'power2.out' });
    }
  }
  function pick(i) {
    if (i === sel) return; sel = i; SFX.play('open', .8);
    $$('#ivl li').forEach(l => l.classList.toggle('sel', +l.dataset.i === i));
    detail(i, true);
  }
  $('#ivl').addEventListener('click', e => { const l = e.target.closest('li[data-i]'); if (l) pick(+l.dataset.i); });
  seg($('#ivSeg'), () => gsap.fromTo('#ivl li', { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: .45, stagger: .05, ease: 'glide' }));
  detail(0, false);
  return { pick, enter() { detail(sel, true); } };
})();

/* ---------- Drawer (unused by default pages, kept for "New") ---------- */
const drawer = $('#drawer'); gsap.set(drawer, { xPercent: 110, autoAlpha: 0 });

/* ---------- Toast ---------- */
const toastEl = $('#toast'); let undoFn = null, toastT;
gsap.set(toastEl, { xPercent: -50, yPercent: 160, autoAlpha: 0 });
function toast(msg, undo) {
  if (!SFX.recent()) SFX.play('ding', .8);
  $('#toastT').textContent = msg; undoFn = undo; $('#undo').style.display = undo ? '' : 'none';
  gsap.to(toastEl, { yPercent: 0, autoAlpha: 1, duration: .55, ease: 'back.out(1.6)' });
  toastT && toastT.kill(); toastT = gsap.delayedCall(3.2, () => gsap.to(toastEl, { yPercent: 160, autoAlpha: 0, duration: .4, ease: 'power2.in' }));
}
$('#undo').addEventListener('click', () => { undoFn && undoFn(); undoFn = null; toastT && toastT.kill(); gsap.to(toastEl, { yPercent: 160, autoAlpha: 0, duration: .4 }); });

/* ---------- Switches ---------- */
function setSw(b, on) { b.classList.toggle('on', on); b.setAttribute('aria-checked', on); gsap.to($('i', b), { x: on ? 16 : 0, duration: .45, ease: 'back.out(2.2)' }); }
document.addEventListener('click', e => {
  const b = e.target.closest('.sw'); if (!b) return;
  const on = !b.classList.contains('on'); setSw(b, on); SFX.play(on ? 'on' : 'off');
  const label = b.closest('.set')?.querySelector('b')?.textContent || 'Setting';
  toast(`${label} ${on ? 'turned on' : 'turned off'}`, () => setSw(b, !on));
});

/* ---------- Actions ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  ({
    share: () => toast('Report link copied'),
    new: () => toast('Choose: job, candidate or interview'),
    post: () => toast('New job draft created'),
    invite: () => toast('Invite link copied'),
    join: () => toast('Opening the video call'),
    score: () => toast('Scorecard submitted'),
    soon: () => toast('Talent pool is part of the full version')
  })[a.dataset.act]?.();
});

/* ---------- Router ---------- */
const CRUMB = { overview: ['Overview'], jobs: ['Jobs', 'Open roles'], candidates: ['Candidates', 'Pipeline'], interviews: ['Interviews', 'Today'], settings: ['Settings'] };
const ENTER = {
  overview: p => { TTH.reveal(); $$('.kpi svg.spark', p).forEach((sv, i) => gsap.fromTo($$('.sb', sv), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: .7, stagger: .04, delay: .4 + i * .08, ease: 'back.out(1.6)' })); },
  jobs: p => gsap.fromTo($$('#roles .role', p).filter(r => r.style.display !== 'none'), { autoAlpha: 0, y: 24, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .7, stagger: .05, delay: .25, ease: 'glide' }),
  candidates: p => gsap.fromTo($$('#board .cand', p), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .06, delay: .35, ease: 'glide' }),
  interviews: () => IV.enter()
};
const REDRAW = {};
let cur = null;
function moveHl(id, d = .55) {
  const a = $(`.nav a[data-page="${id}"]`);
  $$('.nav a, .tabbar a').forEach(x => x.classList.toggle('on', x.dataset.page === id));
  if (a) gsap.to(hl, { y: a.offsetTop, duration: d, ease: 'glide' });
}
function go(id, first) {
  if (!H[id]) id = 'overview';
  if (id === cur) return;
  if (!first) SFX.play('page');
  const prev = cur && pageEl(cur), next = pageEl(id); cur = id;
  moveHl(id, first ? 0 : .55);
  $('#crumbs').innerHTML = ['Northwind', ...CRUMB[id]].map((c, i, a) => i === a.length - 1 ? `<b>${c}</b>` : `${c}<i>›</i>`).join(' ');
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  document.title = `${PAGES.find(p => p[0] === id)[1]} · Vettra`;
  if (prev) { prev.classList.remove('cur'); gsap.to(prev, { autoAlpha: 0, filter: 'blur(6px)', duration: .22, ease: 'power2.in', onComplete: () => gsap.set(prev, { filter: 'none' }) }); }
  next.classList.add('cur'); next.scrollTop = 0; if (mq.matches) window.scrollTo(0, 0);
  gsap.set(next, { autoAlpha: 1 });
  const items = $$(':scope > .ph, :scope > .tabs, :scope > .tools, :scope > .g > *', next);
  gsap.fromTo(items, { y: 26, autoAlpha: 0, filter: 'blur(6px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: .8, stagger: .05, ease: 'glide', delay: prev ? .18 : .1, clearProps: 'transform,filter' });
  UIS.forEach(s => s.init());
  $$('[data-n]', next).forEach(el => count(el, +el.dataset.n, 1.4));
  $$('[data-w]', next).forEach((el, i) => gsap.fromTo(el, { width: 0 }, { width: el.dataset.w + '%', duration: 1.2, delay: .3 + i * .04, ease: 'glide' }));
  ENTER[id] && ENTER[id](next);
}
$$('.nav a, .tabbar a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.dataset.page); }));
addEventListener('hashchange', () => go(location.hash.slice(1)));
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { moveHl(cur, 0); UIS.forEach(s => s.init()); REDRAW[cur] && REDRAW[cur](); }, 120); });

/* ---------- Sound switch + generic click ---------- */
const soundB = $('#soundB');
const soundIcon = () => { soundB.innerHTML = SFX.isOn() ? I.vol : I.mute; soundB.setAttribute('aria-pressed', SFX.isOn()); soundB.setAttribute('aria-label', SFX.isOn() ? 'Mute sounds' : 'Turn sounds on'); };
soundB.addEventListener('click', () => { SFX.set(!SFX.isOn()); soundIcon(); SFX.play('on'); });
soundIcon();
document.addEventListener('click', e => { if (!SFX.recent() && e.target.closest('button, a, .cand, li[data-i]')) SFX.play('click'); });

/* ---------- Boot ---------- */
gsap.from('.side > *', { autoAlpha: 0, x: -14, duration: .7, stagger: .06, ease: 'glide' });
gsap.from('.top > *', { autoAlpha: 0, y: -10, duration: .6, stagger: .06, delay: .1, ease: 'glide' });
go(location.hash.slice(1) || 'overview', true);

/* ---------- Small public API ---------- */
window.VETTRA = { go, toast };
})();
