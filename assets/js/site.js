/* Paneform store — shared layout and page rendering.
   Product data lives in products.js; you should not need to edit this file to add a template. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PAGE = document.body.dataset.page;
const ROOT = document.body.dataset.root || '';
const url = p => ROOT + p;
const usd = n => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const SALE = (() => { const s = STORE.sale; if (!s || !s.on || !s.percent) return null; if (s.ends && new Date() > new Date(s.ends + 'T23:59:59')) return null; return s; })();
const saleEnds = () => SALE && SALE.ends ? ' until ' + new Date(SALE.ends + 'T12:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '';
const finalPrice = p => SALE ? Math.round(p.price * (100 - SALE.percent) / 100) : p.price;
const priceHtml = p => SALE ? `<s>${usd(p.price)}</s>${usd(finalPrice(p))}` : usd(p.price);

const I = {
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  rocket: '<svg viewBox="0 0 24 24"><path d="M12.5 15.5 8.5 11.5c1.6-4.4 4.6-7.2 10-8 -.8 5.4-3.6 8.4-8 10z"/><path d="M8.5 11.5H5l2.5-3.5h3.6M12.5 15.5V19l3.5-2.5v-3.6"/><path d="M6.5 16c-1.4.6-2 2-2 3.5 1.5 0 2.9-.6 3.5-2"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  dl: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'
};

/* ---------- Header & footer ---------- */
function layout() {
  const nav = [['templates.html', 'Templates', 'templates'], ['license.html', 'Licence', 'license'], ['faq.html', 'FAQ', 'faq']];
  document.body.insertAdjacentHTML('afterbegin', `${SALE ? `
  <div class="promo"><div class="wrap"><span class="tag">−${SALE.percent}%</span><span><b>${SALE.label}</b> on every template${saleEnds()}<span class="pm-x"> — no code needed</span></span><a href="${url('templates.html')}">Shop now ${I.arrow}</a></div></div>` : ''}
  <header class="hdr"><div class="wrap">
    <a class="brand" href="${url('index.html')}"><span class="brand-mark"><i></i><i></i></span>${STORE.name}</a>
    <nav class="nav" id="nav">${nav.map(n => `<a href="${url(n[0])}" class="${PAGE === n[2] || (PAGE === 'product' && n[2] === 'templates') ? 'on' : ''}">${n[1]}</a>`).join('')}</nav>
    <div class="hdr-r">
      <a class="btn sm ink" href="${url('templates.html')}">Browse templates</a>
      <button class="menu-btn" id="menuBtn" aria-label="Menu">${I.menu}</button>
    </div>
  </div></header>`);
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="ftr"><div class="wrap">
    <div><a class="brand" href="${url('index.html')}"><span class="brand-mark"><i></i><i></i></span>${STORE.name}</a><p>${STORE.tagline}. Plain HTML, CSS and JavaScript — yours to change and ship.</p></div>
    <div><h4>Shop</h4><ul><li><a href="${url('templates.html')}">All templates</a></li>${CATEGORIES.filter(c => PRODUCTS.some(p => p.category === c)).map(c => `<li><a href="${url('templates.html')}#${encodeURIComponent(c)}">${c}</a></li>`).join('')}</ul></div>
    <div><h4>Help</h4><ul><li><a href="${url('faq.html')}">FAQ</a></li><li><a href="${url('license.html')}">Licence</a></li><li><a href="https://app.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer">My downloads</a></li></ul></div>
    <div class="copy"><span>© ${new Date().getFullYear()} ${STORE.name}</span><span><a href="${url('terms.html')}">Terms</a> · <a href="${url('terms.html')}#refunds">Refunds</a> · <a href="${url('terms.html')}#privacy">Privacy</a></span></div>
  </div></footer>`);
  $('#menuBtn').onclick = () => $('#nav').classList.toggle('on');
  addEventListener('scroll', () => $('.hdr').classList.toggle('scrolled', scrollY > 4), { passive: true });
}

/* ---------- Product card ---------- */
function card(p) {
  return `<article class="pcard rv">
    <a class="media" href="${url('product.html?t=' + p.slug)}" aria-label="${p.name}">
      <img src="${url(p.cover)}" alt="${p.name} — ${p.title}" loading="lazy">
      ${p.video ? `<video muted loop playsinline preload="none" data-src="${url(p.video)}"></video>` : ''}
      <span class="peek btn sm">${I.eye}Details</span>
    </a>
    <div class="meta"><div><h3>${p.name} <span>· ${p.title}</span></h3><p>${p.short}</p></div><span class="price${SALE ? ' sale' : ''}">${priceHtml(p)}</span></div>
    <div class="chips"><span class="chip">${p.pages > 1 ? p.pages + ' pages' : 'One screen'}</span>${p.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div>
    <div class="acts"><a class="btn ink lemonsqueezy-button" href="${checkoutUrl(p)}">${I.bag}Buy now</a><a class="btn lime setup-btn" href="${url('index.html')}?setup=${p.slug}#custom" title="We build it live for you">${I.rocket}We build it live · ${STORE.setupPrice}</a></div>
  </article>`;
}
function wireCards(root = document) {
  $$('.pcard', root).forEach(c => {
    const v = $('video', c); if (!v) return;
    c.addEventListener('mouseenter', () => {
      if (!v.src) { v.src = v.dataset.src; v.addEventListener('canplay', () => v.classList.add('ready'), { once: true }); }
      v.currentTime = 0; v.play().catch(() => {});
    });
    c.addEventListener('mouseleave', () => v.pause());
  });
}

/* ---------- Checkout (Lemon Squeezy overlay) ---------- */
function loadLemon() {
  const s = document.createElement('script');
  s.src = 'https://app.lemonsqueezy.com/js/lemon.js'; s.defer = true;
  s.onload = () => window.createLemonSqueezy && window.createLemonSqueezy();
  document.head.appendChild(s);
}
const checkoutUrl = p => p.checkout.split('?')[0] + '?embed=1&media=0&logo=0' + (SALE && SALE.code ? '&checkout%5Bdiscount_code%5D=' + encodeURIComponent(SALE.code) : '&discount=0');

/* ---------- Reveal on scroll ---------- */
function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
}

/* ---------- FAQ (shared by home and faq page) ---------- */
const FAQ = [
  ['What do I get after paying?', `A zip file with the full source: HTML, CSS and JavaScript, a README, a licence file and a ready Vite setup. The download link appears on the screen right after payment and is emailed to you. You can download it again any time from <a href="https://app.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer">My downloads</a>.`],
  ['Do I need React or any framework?', 'No. Every template runs by opening index.html in a browser. There are no libraries to install. If you prefer a dev server, run npm install and npm run dev.'],
  ['Can I use it for a client?', 'Yes — on unlimited client and personal projects, for as long as you like. You can’t resell or share the template itself as a template or UI kit.'],
  ['How do I connect my own data?', 'All sample data sits in one place (data.js or the DATA object at the top of app.js). Replace it with responses from your API using the same field names, and every chart, table and total follows. The README shows exactly where.'],
  ['Do I get updates?', 'Yes, free for life. When a template is updated, your download link serves the newest version and the change is listed on its page.'],
  [`What if it doesn’t work for me?`, `Write to us within ${STORE.refundDays} days of buying and you get your money back if the template doesn’t work as shown in the live preview.`],
  ['Can I try a template before buying?', 'Yes. Every template has a live preview — click through all the pages on desktop and phone. The zip you download is exactly what you see.'],
  ['Can you change a template or build something new for me?', 'Yes. Leave a request in the form at the bottom of the home page — a custom web app, a dashboard, a tool that replaces a spreadsheet or changes to one of our templates. We reply within 30 minutes and agree a fixed price before any work starts.'],
  ['Can you set a template up for me?', `Yes. For ${STORE.setupPrice} we put the template online for you with your logo, name and data, so you can start using it without touching the code. Open the template page and choose “We build it live”, or leave a request in the form on the home page.`],
  ['Who handles payment and tax?', 'Checkout is run by Lemon Squeezy, our reseller. They take cards, PayPal and Apple Pay, add the right sales tax or VAT and send you an invoice.']
];
const faqHtml = list => list.map(([q, a]) => `<details class="rv"><summary>${q}<i></i></summary><p>${a}</p></details>`).join('');

/* ---------- Custom project request → Telegram bot (STORE.telegram) ---------- */
function wireRequest() {
  const f = $('#reqForm'); if (!f) return;
  const name = $('#rName'), msg = $('#reqMsg'), btn = $('button[type=submit]', f);
  const sp = PRODUCTS.find(p => p.slug === new URLSearchParams(location.search).get('setup'));
  let service = '';
  if (sp) {
    service = `Установка шаблона ${sp.name} (${STORE.setupPrice})`;
    $('#rNote').value = `Please set up ${sp.name} for me: put it online with my logo, name and data.`;
    $('#custom .kicker').textContent = `We build it live · ${STORE.setupPrice}`;
    $('#custom .req-l h2').textContent = `Let’s set up ${sp.name} for you`;
    const tick = $('#custom .req-ticks svg').outerHTML;
    $('#custom .req-ticks').innerHTML = ['Online on its own link, ready to use', 'Your logo, name and colours', sp.slug === 'tempo' ? 'Your services and team — clients book from their phones' : 'Your own data loaded in', 'Works on desktop and phone', 'No code on your side', 'We reply to every request within 30 minutes'].map(t => `<li>${tick}${t}</li>`).join('');
  }
  name.addEventListener('input', () => { if (name.value.trim()) name.closest('.fld').classList.remove('bad'); });
  f.addEventListener('submit', async e => {
    e.preventDefault(); msg.textContent = '';
    if (!name.value.trim()) { name.closest('.fld').classList.add('bad'); name.focus(); return; }
    btn.disabled = true;
    try {
      const d = new FormData(f);
      if (d.get('bot-field')) { f.hidden = true; $('#reqDone').hidden = false; return; }
      const v = k => String(d.get(k) || '').trim();
      const text = ['🆕 Новая заявка с сайта Paneform', '', 'Имя: ' + v('name').slice(0, 120), 'Телефон: ' + (v('phone').slice(0, 60) || '—'), 'Куда писать: ' + (v('contact') || '—'), ...(service ? ['Услуга: ' + service] : []), '', 'О проекте:', v('comment').slice(0, 3000) || '—'].join('\n');
      const tg = STORE.telegram, bot = atob(tg.bot).split('').reverse().join('');
      const r = await fetch('https://api.telegram.org/bot' + bot + '/sendMessage', { method: 'POST', body: new URLSearchParams({ chat_id: tg.chat, text }) });
      const res = await r.json();
      if (!res.ok) throw new Error(res.description || 'not sent');
      f.hidden = true; $('#reqDone').hidden = false;
    } catch (err) {
      msg.innerHTML = `Couldn’t send right now. Please try again in a minute.`;
    } finally { btn.disabled = false; }
  });
}

/* ================= Pages ================= */
const Pages = {
  home() {
    const sorted = [...PRODUCTS].sort((a, b) => b.released.localeCompare(a.released));
    $('#latest').innerHTML = sorted.slice(0, 6).map(card).join('') + (sorted.length < 3 ? `<div class="soon rv"><b>New templates every week</b><span>Clinic booking, shop admin and invoicing are next. Follow on Threads to see them first.</span><a class="btn sm" href="${STORE.threads}" target="_blank" rel="noopener noreferrer">Follow on Threads</a></div>` : '');
    $('#homeFaq').innerHTML = faqHtml(FAQ);
    loadLemon();
    // categories without templates yet show "Coming soon" instead of an empty link
    $$('.cat[href*="#"]').forEach(a => {
      const c = decodeURIComponent(a.getAttribute('href').split('#')[1]);
      if (!PRODUCTS.some(p => p.category === c)) { a.classList.add('off'); a.removeAttribute('href'); a.insertAdjacentHTML('beforeend', '<em class="soon-t">Coming soon</em>'); }
    });
    wireCards();
    wireRequest();
  },
  templates() {
    let cat = decodeURIComponent(location.hash.slice(1)) || 'All', q = '';
    const used = ['All', ...CATEGORIES.filter(c => PRODUCTS.some(p => p.category === c))];
    if (!used.includes(cat)) cat = 'All';
    const tabs = $('#tabs');
    const draw = () => {
      tabs.innerHTML = used.map(c => `<button class="${c === cat ? 'on' : ''}" data-c="${c}">${c}<small>${c === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === c).length}</small></button>`).join('');
      const list = PRODUCTS.filter(p => (cat === 'All' || p.category === cat) && (!q || (p.name + p.title + p.short + p.tags.join(' ')).toLowerCase().includes(q)))
        .sort((a, b) => b.released.localeCompare(a.released));
      $('#list').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">Nothing here yet — try another category.</p>';
      wireCards($('#list')); reveal();
    };
    tabs.onclick = e => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c; history.replaceState(null, '', cat === 'All' ? location.pathname : '#' + encodeURIComponent(cat)); draw(); };
    $('#q').oninput = e => { q = e.target.value.trim().toLowerCase(); draw(); };
    draw();
    loadLemon();
  },
  product() {
    const slug = new URLSearchParams(location.search).get('t');
    const p = PRODUCTS.find(x => x.slug === slug) || PRODUCTS[0];
    document.title = `${p.name} — ${p.title} · ${STORE.name}`;
    const media = [...(p.video ? [{ v: p.video, poster: p.poster }] : []), ...p.images.map(i => ({ i }))];
    $('#crumbs').innerHTML = `<a href="${url('templates.html')}">Templates</a><span>/</span><a href="${url('templates.html')}#${encodeURIComponent(p.category)}">${p.category}</a><span>/</span><span>${p.name}</span>`;
    $('#gallery').innerHTML = `<div class="main" id="gMain"></div><div class="thumbs" id="gThumbs">${media.map((m, k) => `<button class="${k ? '' : 'on'}" data-k="${k}"><img src="${url(m.poster || m.i)}" alt="">${m.v ? `<span class="play">${I.play}</span>` : ''}</button>`).join('')}</div>`;
    const show = k => {
      const m = media[k];
      $('#gMain').innerHTML = m.v ? `<video src="${url(m.v)}" poster="${url(m.poster)}" autoplay muted loop playsinline></video>` : `<img src="${url(m.i)}" alt="${p.name} screenshot" class="${/dark/.test(m.i) ? '' : 'light'}">`;
      $$('#gThumbs button').forEach((b, i) => b.classList.toggle('on', i === k));
    };
    $('#gThumbs').onclick = e => { const b = e.target.closest('button'); if (b) show(+b.dataset.k); };
    show(0);
    $('#buy').innerHTML = `
      <span class="cat-l">${p.category}</span>
      <h1>${p.name}<span class="serif">${p.title}</span></h1>
      <p class="short">${p.short}.</p>
      <div class="pr${SALE ? ' sale' : ''}"><b>${priceHtml(p)}</b><span>one-time · USD</span>${SALE ? `<em class="off">${SALE.percent}% off · ${SALE.label.toLowerCase()}${saleEnds()}</em>` : ''}</div>
      <div class="acts">
        <a class="btn ink lg lemonsqueezy-button" href="${checkoutUrl(p)}">${I.bag}Buy ${p.name}</a>
        <a class="btn lg" href="${url(p.demo)}" target="_blank" rel="noopener noreferrer">${I.eye}Live preview</a>
      </div>
      <a class="setup" href="${url('index.html')}?setup=${p.slug}#custom">
        <span class="setup-ic">${I.rocket}</span>
        <span class="setup-t"><b>We build it live <em>${STORE.setupPrice}</em></b><small>${p.slug === 'tempo' ? 'Live online with your logo, services and team — clients book from their own phones.' : 'Live online with your own logo, name and data — no code on your side.'}</small></span>
        <span class="setup-go">${I.arrow}</span>
      </a>
      <ul>
        <li>${I.check}Instant download — zip with full source</li>
        <li>${I.check}Unlimited personal and client projects</li>
        <li>${I.check}Free updates for life</li>
        <li>${I.check}${STORE.refundDays}-day refund if it doesn’t work like the preview</li>
      </ul>
      <div class="specs">
        <div><span>Pages</span><b>${p.pages}</b></div>
        <div><span>Version</span><b>${p.version}</b></div>
        <div><span>Built with</span><b>${p.stack}</b></div>
        <div><span>Dependencies</span><b>None</b></div>
      </div>`;
    $('#detail').innerHTML = `
      <div>
        <h2>About ${p.name}</h2><p class="body">${p.description}</p>
        <h2>What it does</h2><ul class="feat">${p.features.map(f => `<li>${I.check}<span>${f}</span></li>`).join('')}</ul>
        <h2>Good for</h2><p class="body">${p.goodFor}</p>
      </div>
      <div>
        <h2>In the zip</h2>
        <div class="tree"><em>${p.slug}/</em><br>${p.files.map((f, i) => `<i>${i === p.files.length - 1 ? '└──' : '├──'}</i> ${f}`).join('<br>')}</div>
        <h2>Changelog</h2><ul class="log">${p.changelog.map(c => `<li><b>v${c.v}</b><div>${c.text}<br><span>${new Date(c.date + 'T12:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div></li>`).join('')}</ul>
      </div>`;
    const rel = PRODUCTS.filter(x => x.slug !== p.slug).slice(0, 3);
    $('#related').innerHTML = rel.map(card).join('');
    $('#relSec').style.display = rel.length ? '' : 'none';
    wireCards();
    loadLemon();
  },
  faq() { $('#faqAll').innerHTML = faqHtml(FAQ); },
  thanks() {}
};

layout();
// Reload always opens a page from the top; a #section link still jumps once, then the address is cleaned
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
(Pages[PAGE] || (() => {}))();
if (PAGE === 'home' && (location.hash || location.search)) {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) requestAnimationFrame(() => target.scrollIntoView());
  history.replaceState(null, '', location.pathname);
}
$$('[data-store]').forEach(el => el.textContent = STORE[el.dataset.store]);
reveal();
