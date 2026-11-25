/* Paneform — live chat. Visitor writes on the site, the message goes to Telegram,
   the owner replies to it in Telegram ("Reply"), and the answer shows up here.
   Turned on by STORE.chat.enabled, or for testing by opening any page with ?chat=on (?chat=off to hide). */
(() => {
  const qs = new URLSearchParams(location.search);
  try {
    if (qs.get('chat') === 'on') localStorage.setItem('pf-chat-on', '1');
    if (qs.get('chat') === 'off') localStorage.removeItem('pf-chat-on');
  } catch (e) {}
  let forced = false; try { forced = localStorage.getItem('pf-chat-on') === '1'; } catch (e) {}
  if (!((STORE.chat && STORE.chat.enabled) || forced) || document.body.dataset.bare) return;

  const KEY = 'pf-chat', MAX_LEN = 1000, MAX_MSGS = 40;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const st = load() || { id: Math.random().toString(36).slice(2, 6).toUpperCase(), msgs: [], tg: [], seen: [], contact: '', unread: 0 };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  const tg = STORE.telegram, api = 'https://api.telegram.org/bot' + atob(tg.bot).split('').reverse().join('');
  const IC = {
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'
  };

  document.body.insertAdjacentHTML('beforeend', `
  <button class="pc-fab" id="pcFab" type="button" aria-label="Chat with us" aria-expanded="false">${IC.chat}<b class="pc-badge" id="pcBadge" hidden></b></button>
  <section class="pc" id="pc" role="dialog" aria-label="Chat with Paneform" hidden>
    <header class="pc-h">
      <span class="brand-mark" aria-hidden="true"><i></i><i></i></span>
      <div><b class="notranslate" translate="no">Paneform</b><small><i class="pc-dot"></i>Usually replies within 30 minutes</small></div>
      <button class="pc-x" id="pcX" type="button" aria-label="Close chat">${IC.x}</button>
    </header>
    <div class="pc-body" id="pcBody" aria-live="polite"></div>
    <form class="pc-contact" id="pcContact" hidden>
      <label for="pcC">If you leave, where should we reply?</label>
      <div><input id="pcC" name="c" autocomplete="email" maxlength="120"><button type="submit">Save</button></div>
    </form>
    <form class="pc-f" id="pcF">
      <textarea id="pcT" rows="1" maxlength="${MAX_LEN}" aria-label="Message"></textarea>
      <button type="submit" aria-label="Send">${IC.send}</button>
    </form>
    <p class="pc-err" id="pcErr" role="alert"></p>
  </section>`);

  const fab = $('#pcFab'), box = $('#pc'), body = $('#pcBody'), form = $('#pcF'), ta = $('#pcT'), err = $('#pcErr'), badge = $('#pcBadge'), cform = $('#pcContact');
  const time = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  function bubble(m) {
    const d = document.createElement('div');
    d.className = 'pc-m ' + (m.from === 'me' ? 'me' : 'pf') + (m.from === 'me' ? ' notranslate' : '');
    if (m.from === 'me') d.setAttribute('translate', 'no');
    const p = document.createElement('p'); p.textContent = m.text;
    const s = document.createElement('small'); s.textContent = m.pending ? 'Sending…' : time(m.t);
    d.append(p, s); return d;
  }
  function draw() {
    body.innerHTML = '';
    body.append(bubble({ from: 'pf', text: 'Hi! Ask us anything about dealer portals, SaaS or websites — we reply right here.', t: st.msgs[0] ? st.msgs[0].t : Date.now() }));
    st.msgs.forEach(m => body.append(bubble(m)));
    cform.hidden = !st.msgs.some(m => m.from === 'me') || !!st.contact;
    body.scrollTop = body.scrollHeight;
    badge.hidden = !st.unread; badge.textContent = st.unread > 9 ? '9+' : st.unread;
  }
  const isOpen = () => !box.hidden;
  function open(v) {
    box.hidden = !v; fab.setAttribute('aria-expanded', String(v)); document.body.classList.toggle('pc-open', v);
    if (v) { st.unread = 0; save(); draw(); setTimeout(() => ta.focus(), 60); }
    schedule(0);
  }
  fab.addEventListener('click', () => open(!isOpen()));
  $('#pcX').addEventListener('click', () => open(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) open(false); });
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; });
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

  async function tgSend(text) {
    const r = await (await fetch(api + '/sendMessage', { method: 'POST', body: new URLSearchParams({ chat_id: tg.chat, text, disable_web_page_preview: 'true' }) })).json();
    if (!r.ok) throw new Error(r.description || 'not sent');
    st.tg.push(r.result.message_id); st.tg = st.tg.slice(-60);
  }
  let last = 0;
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.textContent = '';
    const text = ta.value.trim().slice(0, MAX_LEN);
    if (!text) return;
    if (Date.now() - last < 1500 || st.msgs.filter(m => m.from === 'me').length >= MAX_MSGS) { err.textContent = 'Please wait a moment before sending another message.'; return; }
    last = Date.now();
    const m = { from: 'me', text, t: Date.now(), pending: true };
    st.msgs.push(m); ta.value = ''; ta.style.height = 'auto'; draw();
    const first = st.tg.length === 0;
    try {
      await tgSend(['💬 Чат с сайта · #' + st.id, 'Страница: ' + (location.pathname.split('/').pop() || 'index.html') + ' · язык: ' + (navigator.language || '—') + (st.contact ? ' · ' + st.contact : ''), '', text, ...(first ? ['', '↩️ Чтобы ответить, нажмите «Ответить» на это сообщение'] : [])].join('\n'));
      delete m.pending; save(); draw(); schedule(1500);
    } catch (x) {
      st.msgs.splice(st.msgs.indexOf(m), 1); ta.value = text; draw();
      err.textContent = 'Couldn’t send. Check your connection and try again.';
    }
  });
  cform.addEventListener('submit', async e => {
    e.preventDefault();
    const c = $('#pcC').value.trim().slice(0, 120); if (!c) return;
    try { await tgSend('📇 Чат #' + st.id + ' — куда ответить: ' + c); st.contact = c; save(); draw(); }
    catch (x) { err.textContent = 'Couldn’t save. Please try again.'; }
  });

  // Replies: the owner answers a chat message with "Reply" in Telegram
  let timer = 0, busy = false;
  function schedule(ms) {
    clearTimeout(timer);
    if (!st.tg.length) return;
    timer = setTimeout(poll, ms == null ? (isOpen() && !document.hidden ? 4000 : 15000) : ms);
  }
  async function poll() {
    if (busy) return schedule(); busy = true;
    try {
      const r = await (await fetch(api + '/getUpdates?offset=-100&timeout=0&allowed_updates=' + encodeURIComponent('["message"]'))).json();
      let got = 0;
      (r.ok ? r.result : []).forEach(u => {
        const msg = u.message;
        if (!msg || st.seen.includes(u.update_id) || String(msg.chat.id) !== String(tg.chat)) return;
        if (!msg.reply_to_message || !st.tg.includes(msg.reply_to_message.message_id)) return;
        const text = (msg.text || msg.caption || '').trim(); if (!text) return;
        st.seen.push(u.update_id); st.msgs.push({ from: 'pf', text, t: msg.date * 1000 }); got++;
      });
      st.seen = st.seen.slice(-200);
      if (got) { if (!isOpen()) st.unread += got; save(); draw(); }
    } catch (x) {}
    busy = false; schedule();
  }
  document.addEventListener('visibilitychange', () => schedule(document.hidden ? null : 0));
  draw(); schedule(0);
})();
