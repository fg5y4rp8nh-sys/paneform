/* Paneform settings. Requests from every form go to the Telegram bot t.me/paneform732_bot. */
const STORE = {
  name: 'Paneform',
  whatsapp: '84775742403',
  email: '',
  // Заявки уходят на свой сервер-посредник (Cloudflare Worker), а он пересылает их в Telegram.
  // Ключа бота на сайте нет. Вставьте сюда адрес воркера, например 'https://paneform-forms.<имя>.workers.dev'
  formEndpoint: '',
  // Пока сервера нет, заявки идут напрямую в Telegram (ключ виден в коде — заменить на воркер, когда будут клиенты)
  telegram: { bot: 'NGpyRU15WTl3NWpRajZDM2pQYVY3UUI4UzY1SkFUUGxFQUE6MzA2Mzg5OTcyOQ==', chat: '5448288818' },
  threads: 'https://www.threads.net/@paneform',
  instagram: 'https://www.instagram.com/paneform'
};

/* Тарифы дилерского портала. Цены в долларах. q — оплата раз в 3 месяца, y — раз в год.
   checkout — ссылки на оплату Lemon Squeezy (подписка с нужным периодом). После оплаты
   Lemon Squeezy должен перенаправлять на start.html. Пока ссылок нет, кнопка ведёт сразу на start.html. */
const PORTAL = {
  refundDays: 14,
  // ИИ-ассистент для дилеров — отдельная подписка, добавляется к любому тарифу
  ai: { name: 'AI assistant', m: 99, q: 297, y: 990, checkout: { q: '', y: '' } },
  // Для тарифа с ИИ-ассистентом в Lemon Squeezy создаётся отдельный вариант подписки: ссылки qai / yai.
  plans: {
    start:  { name: 'Start', dealers: 'up to 25 dealers',  m: 190, q: 570, y: 1900, checkout: { q: 'https://paneform.lemonsqueezy.com/checkout/buy/cb853c3b-3869-4315-9d7e-4cdfe5f7ed97?media=0&logo=0&discount=0', y: 'https://paneform.lemonsqueezy.com/checkout/buy/5d34c392-4aac-4f21-acab-aa95435bf348?media=0&logo=0&discount=0', qai: 'https://paneform.lemonsqueezy.com/checkout/buy/1cb9df0d-cd27-45cc-9424-c0230241403a?media=0&logo=0&discount=0', yai: 'https://paneform.lemonsqueezy.com/checkout/buy/d410be6b-0ba4-4ade-92e5-8b026d0fd394?media=0&logo=0&discount=0' } },
    growth: { name: 'Growth',  dealers: 'up to 100 dealers', m: 290, q: 870, y: 2900, checkout: { q: 'https://paneform.lemonsqueezy.com/checkout/buy/5ddb6044-ce3e-4761-8040-2dbfe5db5bc4?media=0&logo=0&discount=0', y: 'https://paneform.lemonsqueezy.com/checkout/buy/bf37a3e1-051c-443d-9c6c-e8a18fa570f0?media=0&logo=0&discount=0', qai: 'https://paneform.lemonsqueezy.com/checkout/buy/7e3698da-3568-47a6-a55d-fff9ab106901?media=0&logo=0&discount=0', yai: 'https://paneform.lemonsqueezy.com/checkout/buy/41723d6c-1a02-420f-9f5c-2c1336b94d4c?media=0&logo=0&discount=0' } }
  }
};

/* Отзывы клиентов — только настоящие (например, с Fiverr), дословно.
   Пример записи: { name: 'Daniel R.', country: 'United States', stars: 5, text: '…', project: 'Dealer portal', page: 'b2b', date: 'Oct 2026' }
   page: 'b2b' | 'saas' | 'sites' | 'all' — на какой странице показывать.
   rating и count — ваша реальная оценка и число отзывов на Fiverr; пока null, блок показывает заглушки. */
const REVIEWS = {
  source: 'Fiverr',
  profile: '',
  rating: null,
  count: null,
  items: []
};
