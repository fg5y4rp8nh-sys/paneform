/* Paneform — shared header, footer, language, reveal, FAQ and the request form. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PAGE = document.body.dataset.page;
const I = {
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
};
/* ---------- Language ----------
   English is the source. Other languages are translated in the browser by Google Translate,
   which is loaded only after a visitor picks a language (the choice is kept in the googtrans cookie). */
const LANGS = [['en', 'English'], ['es', 'Español'], ['pt', 'Português'], ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano'], ['nl', 'Nederlands'], ['pl', 'Polski'], ['sv', 'Svenska'], ['cs', 'Čeština'], ['ro', 'Română'], ['tr', 'Türkçe'], ['uk', 'Українська'], ['ru', 'Русский'], ['ar', 'العربية'], ['hi', 'हिन्दी'], ['id', 'Bahasa Indonesia'], ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['ja', '日本語'], ['ko', '한국어'], ['zh-CN', '简体中文']];
const curLang = () => { const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/); const c = m && decodeURIComponent(m[1]); return LANGS.some(l => l[0] === c) ? c : 'en'; };
function setLang(code) {
  const host = location.hostname, parts = host.split('.'), doms = ['', host, '.' + host];
  if (parts.length > 2) doms.push('.' + parts.slice(-2).join('.'));
  const exp = code === 'en' ? 'Thu, 01 Jan 1970 00:00:00 GMT' : new Date(Date.now() + 365 * 864e5).toUTCString();
  doms.forEach(d => { document.cookie = `googtrans=${code === 'en' ? '' : '/en/' + code}; expires=${exp}; path=/` + (d ? `; domain=${d}` : ''); });
  try { localStorage.setItem('pf-lang', code); } catch (e) {}
  location.reload();
}
function loadTranslate() {
  const lang = curLang();
  document.documentElement.lang = SHOW_LANG ? lang : 'ru';
  if (lang === 'en') return;
  if (lang === 'ar') document.documentElement.classList.add('rtl-lang');
  // headings with a highlighted word are split into pieces; join them so the sentence translates as a whole
  $$('h1, h2').forEach(h => { if (h.querySelector('.hl, br')) { $$('br', h).forEach(b => b.replaceWith(' ')); $$('.hl', h).forEach(x => x.replaceWith(x.textContent)); } });
  const box = document.createElement('div'); box.id = 'gtEl'; box.hidden = true; document.body.appendChild(box);
  window.gtInit = () => new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gtEl');
  const s = document.createElement('script'); s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit'; s.async = true;
  // if the translator can't load (blocked or offline), go back to English instead of leaving the page half-switched
  s.onerror = () => { document.documentElement.classList.remove('rtl-lang'); document.documentElement.lang = 'en'; const b = $('#langBtn b'); if (b) b.textContent = 'EN'; };
  document.head.appendChild(s);
}
function langPicker() {
  const cur = curLang(), name = LANGS.find(l => l[0] === cur)[1];
  return `<div class="lang notranslate" translate="no">
    <button class="lang-btn" id="langBtn" aria-haspopup="listbox" aria-expanded="false" aria-label="Language: ${name}">${I.globe}<b>${cur === 'zh-CN' ? 'ZH' : cur.toUpperCase()}</b>${I.chev}</button>
    <ul class="lang-list" id="langList" role="listbox">${LANGS.map(l => `<li><button role="option" aria-selected="${l[0] === cur}" data-l="${l[0]}" lang="${l[0]}">${l[1]}${l[0] === cur ? I.check : ''}</button></li>`).join('')}</ul>
  </div>`;
}
function wireLang() {
  const btn = $('#langBtn'), list = $('#langList');
  const close = () => { list.classList.remove('on'); btn.setAttribute('aria-expanded', 'false'); };
  btn.onclick = e => { e.stopPropagation(); const on = list.classList.toggle('on'); btn.setAttribute('aria-expanded', on); if (on) $('[aria-selected="true"]', list).scrollIntoView({ block: 'nearest' }); };
  list.onclick = e => { const b = e.target.closest('[data-l]'); if (!b) return; close(); if (b.dataset.l !== curLang()) setLang(b.dataset.l); };
  document.addEventListener('click', e => { if (!e.target.closest('.lang')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  loadTranslate();
}

/* ---------- Header & footer ---------- */
const NAV = [['index.html', 'Dealer portals', 'b2b', 'Portals'], ['saas.html', 'SaaS development', 'saas', 'SaaS'], ['sites.html', 'Company websites', 'sites', 'Websites']];
const SHOW_LANG = true;
function layout() {
  document.body.insertAdjacentHTML('afterbegin', `
  <header class="hdr"><div class="wrap">
    <a class="brand notranslate" translate="no" href="index.html"><span class="brand-mark"><i></i><i></i></span>${STORE.name}</a>
    <nav class="nav" id="nav">${NAV.map(n => `<a href="${n[0]}" class="${PAGE === n[2] ? 'on' : ''}"><span class="nl">${n[1]}</span><span class="ns">${n[3]}</span></a>`).join('')}</nav>
    <div class="hdr-r">
      ${SHOW_LANG ? langPicker() : ''}
      <a class="btn sm ink" href="#contact">Get in touch</a>
      <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false">${I.menu}</button>
    </div>
  </div>
  <nav class="mtabs" aria-label="Sections">${NAV.map(n => `<a href="${n[0]}"${PAGE === n[2] ? ' aria-current="page"' : ''}>${n[3]}</a>`).join('')}</nav></header>`);
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="ftr"><div class="wrap">
    <div><a class="brand notranslate" translate="no" href="index.html"><span class="brand-mark"><i></i><i></i></span>${STORE.name}</a><p>Dealer portals, SaaS products and websites for companies. We build, host and support them.</p></div>
    <div><h4>What we do</h4><ul>${NAV.map(n => `<li><a href="${n[0]}">${n[1]}</a></li>`).join('')}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="#contact">Get in touch</a></li><li><a href="${`https://wa.me/${STORE.whatsapp}`}" target="_blank" rel="noopener">Message us on WhatsApp</a></li></ul></div>
    <div class="copy"><span>© ${STORE.name}</span></div>
  </div></footer>`);
  const mb = $('#menuBtn');
  mb.onclick = () => mb.setAttribute('aria-expanded', $('#nav').classList.toggle('on'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('on')));
  if (SHOW_LANG) wireLang();
  addEventListener('scroll', () => $('.hdr').classList.toggle('scrolled', scrollY > 4), { passive: true });
}

/* ---------- Reveal on scroll ---------- */
function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 60 + 'ms'; io.observe(el); });
}

/* ---------- FAQ: <div class="faq" data-faq> with <script type="application/json"> ---------- */
function faqs() {
  $$('[data-faq]').forEach(box => {
    const list = JSON.parse($('script', box).textContent);
    box.innerHTML = list.map(([q, a]) => `<details><summary>${q}<i></i></summary><p>${a}</p></details>`).join('');
  });
}

/* ---------- Request form → Telegram ----------
   <section id="contact" data-service="Dealer portal" data-plans="Starter|Growth|Not sure yet"> */
function requestForm() {
  const box = $('#contact'); if (!box) return;
  const service = box.dataset.service, plans = (box.dataset.plans || '').split('|').filter(Boolean);
  const steps = JSON.parse($('script', box).textContent);
  box.innerHTML = `<div class="wrap"><div class="req rv">
    <div class="req-l">
      <p class="kicker" style="color:#8C8D86">${box.dataset.kicker}</p>
      <h2>${box.dataset.title}</h2>
      <ol class="req-steps">${steps.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>
      <a class="req-wa-btn" href="${`https://wa.me/${STORE.whatsapp}`}" target="_blank" rel="noopener"><svg class="wa-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.6-.4Z"/></svg><span><b>Message us on WhatsApp</b><em>Straight to chat, no form</em></span>${I.arrow}</a>
    </div>
    <form class="req-f" id="reqForm" novalidate>
      <p class="hp"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      <div class="fld"><label for="rName">Your name</label><input id="rName" name="name" autocomplete="name"><small class="err">Tell us what to call you.</small></div>
      <div class="fld"><label for="rCo">Company or website <em>(optional)</em></label><input id="rCo" name="company" autocomplete="organization"></div>
      <fieldset class="fld"><legend>Where should we reply?</legend>
        <div class="pick">${['WhatsApp', 'Email'].map((c, i) => `<label><input type="radio" name="contact" value="${c}"${i ? '' : ' checked'}><span>${c}</span></label>`).join('')}</div>
      </fieldset>
      <div class="fld"><label for="rReach">Your number or email</label><input id="rReach" name="reach" autocomplete="email"><small class="err">Enter a number or email so we can reply.</small></div>
      ${plans.length ? `<fieldset class="fld"><legend>${box.dataset.plansLabel || 'Which option?'}</legend><div class="pick">${plans.map((p, i) => `<label><input type="radio" name="plan" value="${p}"${i === plans.length - 1 ? ' checked' : ''}><span>${p}</span></label>`).join('')}</div></fieldset>` : ''}
      <div class="fld"><label for="rNote">${box.dataset.noteLabel || 'About the project'} <em>(optional)</em></label><textarea id="rNote" name="comment" rows="3"></textarea></div>
      <button class="btn ink lg" type="submit">Send request${I.arrow}</button>
      <p class="req-note">We use your details only to reply to your request.</p>
      <p class="req-msg" id="reqMsg" role="status" aria-live="polite"></p>
    </form>
    <div class="req-done" id="reqDone" hidden><span class="dot-ic">${I.check}</span><h3>Thanks, we’ve got your request</h3><p>We’ll reply within 30 minutes.</p></div>
  </div></div>`;
  const f = $('#reqForm'), msg = $('#reqMsg'), btn = $('button[type=submit]', f);
  const need = [$('#rName'), $('#rReach')];
  need.forEach(el => el.addEventListener('input', () => { if (el.value.trim()) el.closest('.fld').classList.remove('bad'); }));
  // Any button with data-plan picks that option and scrolls to the form
  $$('[data-plan]').forEach(b => b.addEventListener('click', () => { const r = $(`input[name=plan][value="${b.dataset.plan}"]`, f); if (r) r.checked = true; }));
  f.addEventListener('submit', async e => {
    e.preventDefault(); msg.textContent = '';
    const bad = need.filter(el => !el.value.trim());
    need.forEach(el => el.closest('.fld').classList.toggle('bad', bad.includes(el)));
    if (bad.length) { bad[0].focus(); return; }
    btn.disabled = true;
    try {
      const d = new FormData(f);
      if (d.get('bot-field')) { f.hidden = true; $('#reqDone').hidden = false; return; }
      const v = k => String(d.get(k) || '').trim();
      const text = ['🆕 Новая заявка с сайта Paneform', 'Направление: ' + service, ...(v('plan') ? ['Вариант: ' + v('plan')] : []), '', 'Имя: ' + v('name').slice(0, 120), 'Компания: ' + (v('company').slice(0, 200) || '—'), 'Куда писать: ' + v('contact') + ' — ' + v('reach').slice(0, 120), '', 'Комментарий:', v('comment').slice(0, 3000) || '—'].join('\n');
      const res = await sendLead({ text, hp: v('bot-field') });
      if (!res.ok) throw new Error('not sent');
      f.hidden = true; $('#reqDone').hidden = false;
    } catch (err) {
      msg.textContent = 'Couldn’t send. Please try again in a minute.';
    } finally { btn.disabled = false; }
  });
}

/* ---------- Отправка заявки через свой сервер-посредник (ключ бота на сайте не хранится) ---------- */
async function sendLead(fields, files = {}) {
  // Есть свой сервер — шлём через него (ключ бота на сайте не нужен)
  if (STORE.formEndpoint) {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v)));
    Object.entries(files).forEach(([k, f]) => { if (f && f.size) fd.append(k, f, f.name); });
    return (await fetch(STORE.formEndpoint, { method: 'POST', body: fd })).json();
  }
  // Иначе напрямую в Telegram
  if (fields.hp) return { ok: true };
  const tg = STORE.telegram, api = 'https://api.telegram.org/bot' + atob(tg.bot).split('').reverse().join('');
  const r = await (await fetch(api + '/sendMessage', { method: 'POST', body: new URLSearchParams({ chat_id: tg.chat, text: String(fields.text).slice(0, 3500) }) })).json();
  if (!r.ok) return r;
  for (const [k, f] of Object.entries(files)) {
    if (!f || !f.size) continue;
    const fd = new FormData(); fd.append('chat_id', tg.chat); fd.append('caption', (k + ' — ' + (fields.company || '')).slice(0, 200)); fd.append('document', f, f.name);
    await fetch(api + '/sendDocument', { method: 'POST', body: fd });
  }
  return { ok: true };
}

/* ---------- Screenshot switcher: .switch with [data-shot] buttons and an <img> ---------- */
function switchers() {
  $$('.switch').forEach(sw => {
    const img = $('.frame img', sw), btns = $$('[data-shot]', sw);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-pressed', x === b));
      img.src = b.dataset.shot; img.alt = b.dataset.alt || b.textContent.trim();
    }));
  });
}

/* ---------- Тарифы портала: переключатель «раз в 3 месяца / раз в год» ---------- */
const money = n => '$' + n.toLocaleString('en-US');
function pricing() {
  const box = $('#plansBox'); if (!box || typeof PORTAL === 'undefined') return;
  const set = per => {
    $$('[data-per]', box).forEach(b => b.setAttribute('aria-pressed', b.dataset.per === per));
    $$('[data-pid]', box).forEach(card => {
      const p = PORTAL.plans[card.dataset.pid];
      $('.amt b', card).textContent = money(per === 'y' ? Math.round(p.y / 12) : p.m);
      $('.plus', card).textContent = per === 'y' ? `${money(p.y)} per year — 2 months free` : `${money(p.q)} every 3 months`;
      $('.pay', card).href = `checkout.html?plan=${card.dataset.pid}&per=${per}`;
    });
    const ai = PORTAL.ai, ad = $('[data-addon]', box);
    if (ad) { $('.ai-m', ad).textContent = '+' + money(per === 'y' ? Math.round(ai.y / 12) : ai.m); $('.ai-plus', ad).textContent = per === 'y' ? `${money(ai.y)} per year, for any plan` : `${money(ai.q)} every 3 months, for any plan`; }
  };
  $$('[data-per]', box).forEach(b => b.addEventListener('click', () => set(b.dataset.per)));
  set('q');
}


/* ---------- Отзывы: <section data-reviews="b2b|saas|sites"> ---------- */
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.6l6.1-.8z"/></svg>';
const escH = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function reviews() {
  if (typeof REVIEWS === 'undefined') return;
  $$('[data-reviews]').forEach(box => {
    const page = box.dataset.reviews, list = REVIEWS.items.filter(r => r.page === page || r.page === 'all').slice(0, 6);
    const head = REVIEWS.rating ? `<div class="rv-sum"><div class="rv-stars">${STAR.repeat(5)}</div><b>${escH(REVIEWS.rating)}</b><span>${REVIEWS.count ? escH(REVIEWS.count) + ' reviews on ' : 'on '}${escH(REVIEWS.source)}</span></div>` : '';
    const cards = list.length ? list.map(r => `<figure class="rcard rv">
        <div class="rv-stars">${STAR.repeat(Math.max(1, Math.min(5, r.stars || 5)))}</div>
        <blockquote>${escH(r.text)}</blockquote>
        <figcaption><span class="rv-av">${escH((r.name || '?').trim()[0])}</span><span><b>${escH(r.name)}</b><small>${escH([r.country, r.project, r.date].filter(Boolean).join(' · '))}</small></span><em>${escH(REVIEWS.source)}</em></figcaption>
      </figure>`).join('')
      : [1, 2, 3].map(() => `<figure class="rcard ph rv"><div class="rv-stars">${STAR.repeat(5)}</div><blockquote>A real client review will go here: verbatim text, name, country and rating — for example, from Fiverr.</blockquote><figcaption><span class="rv-av">?</span><span><b>Customer name</b><small>Country · project</small></span><em>${escH(REVIEWS.source)}</em></figcaption></figure>`).join('');
    box.innerHTML = `<div class="wrap"><div class="sec-h"><div><p class="kicker">Reviews</p><h2 class="rv">What clients say</h2></div>${head}</div><div class="rgrid">${cards}</div>${list.length ? '' : '<p class="rv-note">Sample block: the prototype shows placeholders. Send us your real reviews and they’ll appear here.</p>'}${REVIEWS.profile ? `<p class="rv-more"><a href="${escH(REVIEWS.profile)}" target="_blank" rel="noopener noreferrer">All reviews on ${escH(REVIEWS.source)}</a></p>` : ''}</div>`;
  });
}

if (!document.body.dataset.bare) layout();
faqs(); reviews(); requestForm(); switchers(); pricing(); reveal();
// чат подключается отдельным файлом
{ const s = document.createElement('script'); s.src = 'assets/js/chat.js?v=' + ((document.querySelector('script[src*="app.js"]') || {}).src || '').split('v=')[1]; document.body.appendChild(s); }
// На страницах без формы заявки ссылки «#contact» ведут к форме на главной
if (!document.getElementById('contact')) $$('a[href="#contact"]').forEach(a => { a.href = 'index.html#contact'; });
