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

  // Chat texts in every site language (Google Translate doesn't catch text added after load)
  const T = {
    en: ['Hello! Ask your question.', 'Online', 'Leave your phone number or email — we’ll reply there if you leave the page.', 'Save', 'Sending…', 'Couldn’t send. Check your connection and try again.', 'Please wait a moment before sending another message.', 'Couldn’t save. Please try again.'],
    es: ['¡Hola! Haga su pregunta.', 'En línea', 'Deje su teléfono o correo electrónico: le responderemos allí si sale de la página.', 'Guardar', 'Enviando…', 'No se pudo enviar. Revise su conexión e inténtelo de nuevo.', 'Espere un momento antes de enviar otro mensaje.', 'No se pudo guardar. Inténtelo de nuevo.'],
    pt: ['Olá! Faça a sua pergunta.', 'Online', 'Deixe seu telefone ou e-mail — responderemos por lá se você sair da página.', 'Salvar', 'Enviando…', 'Não foi possível enviar. Verifique a conexão e tente novamente.', 'Aguarde um momento antes de enviar outra mensagem.', 'Não foi possível salvar. Tente novamente.'],
    fr: ['Bonjour ! Posez votre question.', 'En ligne', 'Laissez votre téléphone ou votre e-mail — nous vous répondrons là si vous quittez la page.', 'Enregistrer', 'Envoi…', 'Échec de l’envoi. Vérifiez votre connexion et réessayez.', 'Patientez un instant avant d’envoyer un autre message.', 'Échec de l’enregistrement. Réessayez.'],
    de: ['Hallo! Stellen Sie Ihre Frage.', 'Online', 'Hinterlassen Sie Ihre Telefonnummer oder E-Mail – wir antworten dort, falls Sie die Seite verlassen.', 'Speichern', 'Wird gesendet…', 'Senden fehlgeschlagen. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.', 'Bitte warten Sie kurz, bevor Sie die nächste Nachricht senden.', 'Speichern fehlgeschlagen. Bitte erneut versuchen.'],
    it: ['Ciao! Fai la tua domanda.', 'Online', 'Lascia il tuo telefono o la tua email: ti risponderemo lì se lasci la pagina.', 'Salva', 'Invio…', 'Invio non riuscito. Controlla la connessione e riprova.', 'Attendi un momento prima di inviare un altro messaggio.', 'Salvataggio non riuscito. Riprova.'],
    nl: ['Hallo! Stel uw vraag.', 'Online', 'Laat uw telefoonnummer of e-mail achter — dan antwoorden we daar als u de pagina verlaat.', 'Opslaan', 'Verzenden…', 'Verzenden mislukt. Controleer uw verbinding en probeer het opnieuw.', 'Wacht even voordat u nog een bericht stuurt.', 'Opslaan mislukt. Probeer het opnieuw.'],
    pl: ['Dzień dobry! Zadaj pytanie.', 'Online', 'Zostaw numer telefonu lub e-mail — odpowiemy tam, jeśli opuścisz stronę.', 'Zapisz', 'Wysyłanie…', 'Nie udało się wysłać. Sprawdź połączenie i spróbuj ponownie.', 'Poczekaj chwilę przed wysłaniem kolejnej wiadomości.', 'Nie udało się zapisać. Spróbuj ponownie.'],
    sv: ['Hej! Ställ din fråga.', 'Online', 'Lämna ditt telefonnummer eller din e-post – vi svarar där om du lämnar sidan.', 'Spara', 'Skickar…', 'Det gick inte att skicka. Kontrollera anslutningen och försök igen.', 'Vänta en stund innan du skickar nästa meddelande.', 'Det gick inte att spara. Försök igen.'],
    cs: ['Dobrý den! Položte svůj dotaz.', 'Online', 'Zanechte telefon nebo e-mail — odpovíme tam, pokud stránku opustíte.', 'Uložit', 'Odesílání…', 'Odeslání se nezdařilo. Zkontrolujte připojení a zkuste to znovu.', 'Než pošlete další zprávu, chvíli počkejte.', 'Uložení se nezdařilo. Zkuste to znovu.'],
    ro: ['Bună ziua! Puneți întrebarea.', 'Online', 'Lăsați numărul de telefon sau e-mailul — vă răspundem acolo dacă părăsiți pagina.', 'Salvează', 'Se trimite…', 'Nu s-a putut trimite. Verificați conexiunea și încercați din nou.', 'Așteptați puțin înainte de a trimite alt mesaj.', 'Nu s-a putut salva. Încercați din nou.'],
    tr: ['Merhaba! Sorunuzu sorun.', 'Çevrimiçi', 'Telefon numaranızı veya e-postanızı bırakın — sayfadan ayrılırsanız oradan yanıt veririz.', 'Kaydet', 'Gönderiliyor…', 'Gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.', 'Yeni bir mesaj göndermeden önce biraz bekleyin.', 'Kaydedilemedi. Tekrar deneyin.'],
    uk: ['Вітаємо! Поставте своє запитання.', 'Онлайн', 'Залиште телефон або email — ми відповімо туди, якщо ви підете зі сторінки.', 'Зберегти', 'Надсилання…', 'Не вдалося надіслати. Перевірте з’єднання та спробуйте ще раз.', 'Зачекайте трохи перед наступним повідомленням.', 'Не вдалося зберегти. Спробуйте ще раз.'],
    ru: ['Здравствуйте! Задайте ваш вопрос.', 'Онлайн', 'Оставьте телефон или email — ответим туда, если вы уйдёте со страницы.', 'Сохранить', 'Отправка…', 'Не удалось отправить. Проверьте соединение и попробуйте ещё раз.', 'Подождите немного перед следующим сообщением.', 'Не удалось сохранить. Попробуйте ещё раз.'],
    ar: ['مرحبًا! اطرح سؤالك.', 'متصل', 'اترك رقم هاتفك أو بريدك الإلكتروني — سنرد عليك هناك إذا غادرت الصفحة.', 'حفظ', 'جارٍ الإرسال…', 'تعذّر الإرسال. تحقّق من الاتصال وحاول مرة أخرى.', 'يُرجى الانتظار قليلًا قبل إرسال رسالة أخرى.', 'تعذّر الحفظ. حاول مرة أخرى.'],
    hi: ['नमस्ते! अपना सवाल पूछें।', 'ऑनलाइन', 'अपना फ़ोन नंबर या ईमेल छोड़ें — अगर आप पेज छोड़ दें, तो हम वहीं जवाब देंगे।', 'सेव करें', 'भेजा जा रहा है…', 'भेजा नहीं जा सका। कनेक्शन जाँचें और फिर से कोशिश करें।', 'अगला संदेश भेजने से पहले थोड़ा रुकें।', 'सेव नहीं हो सका। फिर से कोशिश करें।'],
    id: ['Halo! Ajukan pertanyaan Anda.', 'Online', 'Tinggalkan nomor telepon atau email Anda — kami akan membalas ke sana jika Anda meninggalkan halaman.', 'Simpan', 'Mengirim…', 'Gagal mengirim. Periksa koneksi Anda dan coba lagi.', 'Tunggu sebentar sebelum mengirim pesan lagi.', 'Gagal menyimpan. Coba lagi.'],
    vi: ['Xin chào! Hãy đặt câu hỏi của bạn.', 'Trực tuyến', 'Để lại số điện thoại hoặc email — chúng tôi sẽ trả lời ở đó nếu bạn rời trang.', 'Lưu', 'Đang gửi…', 'Không gửi được. Hãy kiểm tra kết nối và thử lại.', 'Vui lòng đợi một chút trước khi gửi tin nhắn khác.', 'Không lưu được. Vui lòng thử lại.'],
    th: ['สวัสดี! ถามคำถามของคุณได้เลย', 'ออนไลน์', 'ฝากเบอร์โทรหรืออีเมลไว้ — เราจะตอบกลับทางนั้นหากคุณออกจากหน้านี้', 'บันทึก', 'กำลังส่ง…', 'ส่งไม่สำเร็จ ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง', 'โปรดรอสักครู่ก่อนส่งข้อความถัดไป', 'บันทึกไม่สำเร็จ โปรดลองอีกครั้ง'],
    ja: ['こんにちは！ご質問をどうぞ。', 'オンライン', '電話番号またはメールアドレスを残してください。ページを離れた場合はそちらに返信します。', '保存', '送信中…', '送信できませんでした。接続を確認してもう一度お試しください。', '次のメッセージを送るまで少しお待ちください。', '保存できませんでした。もう一度お試しください。'],
    ko: ['안녕하세요! 질문을 남겨 주세요.', '온라인', '전화번호나 이메일을 남겨 주세요. 페이지를 떠나시면 그쪽으로 답변드립니다.', '저장', '보내는 중…', '보내지 못했습니다. 연결을 확인하고 다시 시도해 주세요.', '다음 메시지를 보내기 전에 잠시 기다려 주세요.', '저장하지 못했습니다. 다시 시도해 주세요.'],
    'zh-CN': ['您好！请提出您的问题。', '在线', '请留下您的电话或邮箱——如果您离开页面，我们会通过它回复您。', '保存', '发送中…', '发送失败，请检查网络后重试。', '请稍等片刻再发送下一条消息。', '保存失败，请重试。']
  };
  const L = T[(typeof curLang === 'function' && curLang()) || 'en'] || T.en;
  const [tHi, tOn, tContact, tSave, tSending, tErr, tWait, tErrSave] = L;
  const tg = STORE.telegram, api = 'https://api.telegram.org/bot' + atob(tg.bot).split('').reverse().join('');
  const IC = {
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'
  };

  document.body.insertAdjacentHTML('beforeend', `
  <button class="pc-fab" id="pcFab" type="button" aria-label="Chat with us" aria-expanded="false">${IC.chat}<b class="pc-badge" id="pcBadge" hidden></b></button>
  <section class="pc notranslate" translate="no" id="pc" role="dialog" aria-label="Chat with Paneform" hidden>
    <header class="pc-h">
      <span class="brand-mark" aria-hidden="true"><i></i><i></i></span>
      <div><b class="notranslate" translate="no">Paneform</b><small><i class="pc-dot"></i>${tOn}</small></div>
      <button class="pc-x" id="pcX" type="button" aria-label="Close chat">${IC.x}</button>
    </header>
    <div class="pc-body" id="pcBody" aria-live="polite"></div>
    <form class="pc-contact" id="pcContact" hidden>
      <label for="pcC">${tContact}</label>
      <div><input id="pcC" name="c" autocomplete="on" inputmode="email" maxlength="120"><button type="submit">${tSave}</button></div>
    </form>
    <form class="pc-f" id="pcF">
      <textarea id="pcT" rows="1" maxlength="${MAX_LEN}" aria-label="Message"></textarea>
      <button type="submit" aria-label="Send">${IC.send}</button>
    </form>
    <p class="pc-err" id="pcErr" role="alert"></p>
  </section>`);

  if ((typeof curLang === 'function' && curLang()) === 'ar') $('#pc').dir = 'rtl';
  const fab = $('#pcFab'), box = $('#pc'), body = $('#pcBody'), form = $('#pcF'), ta = $('#pcT'), err = $('#pcErr'), badge = $('#pcBadge'), cform = $('#pcContact');
  const time = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  function bubble(m) {
    const d = document.createElement('div');
    d.className = 'pc-m ' + (m.from === 'me' ? 'me' : 'pf') + (m.from === 'me' ? ' notranslate' : '');
    if (m.from === 'me') d.setAttribute('translate', 'no');
    const p = document.createElement('p'); p.dir = 'auto'; p.textContent = m.text;
    const s = document.createElement('small'); s.textContent = m.pending ? tSending : time(m.t);
    d.append(p, s); return d;
  }
  function draw() {
    body.innerHTML = '';
    body.append(bubble({ from: 'pf', text: tHi, t: st.msgs[0] ? st.msgs[0].t : Date.now() }));
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
    if (Date.now() - last < 1500 || st.msgs.filter(m => m.from === 'me').length >= MAX_MSGS) { err.textContent = tWait; return; }
    last = Date.now();
    const m = { from: 'me', text, t: Date.now(), pending: true };
    st.msgs.push(m); ta.value = ''; ta.style.height = 'auto'; draw();
    const first = st.tg.length === 0;
    try {
      await tgSend(['💬 Чат с сайта · #' + st.id, 'Страница: ' + (location.pathname.split('/').pop() || 'index.html') + ' · язык: ' + (navigator.language || '—') + (st.contact ? ' · ' + st.contact : ''), '', text, ...(first ? ['', '↩️ Чтобы ответить, нажмите «Ответить» на это сообщение'] : [])].join('\n'));
      delete m.pending; save(); draw(); schedule(1500);
    } catch (x) {
      st.msgs.splice(st.msgs.indexOf(m), 1); ta.value = text; draw();
      err.textContent = tErr;
    }
  });
  cform.addEventListener('submit', async e => {
    e.preventDefault();
    const c = $('#pcC').value.trim().slice(0, 120); if (!c) return;
    try { await tgSend('📇 Чат #' + st.id + ' — куда ответить: ' + c); st.contact = c; save(); draw(); }
    catch (x) { err.textContent = tErrSave; }
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
