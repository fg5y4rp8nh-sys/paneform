# Paneform — store website

A static website (HTML, CSS, JavaScript). No server and no database: payment, tax and
file delivery are done by **Lemon Squeezy**. Host it free on Netlify or Cloudflare Pages.

## Folder structure

```
paneform/
├── index.html          Home: hero video, latest templates, categories, how it works, FAQ
├── templates.html      Catalogue: category tabs, search, product cards (video on hover)
├── product.html        One page for every template: ?t=<slug>
├── license.html        What buyers can and can't do
├── faq.html            Questions
├── terms.html          Terms, refunds (#refunds) and privacy (#privacy)
├── thanks.html         Page buyers land on after paying
├── assets/
│   ├── css/site.css
│   ├── js/products.js  ← STORE settings and the PRODUCTS list. The only file you edit.
│   ├── js/site.js      Layout and rendering (no need to touch)
│   ├── img/favicon.svg
│   └── products/<slug>/   cover.webp, poster.webp, reel.mp4, more screenshots
└── demos/<slug>/       The live preview of each template (a copy of its files)
```

## How a sale works

1. A buyer opens **product.html?t=quorra**, tries the **Live preview** (demos/quorra/).
2. **Buy** opens the Lemon Squeezy checkout on top of the page (card, PayPal, Apple Pay).
3. After payment Lemon Squeezy shows a **Download** button straight away, emails a receipt
   with the download link, and sends the buyer to **thanks.html**.
4. The buyer can re-download any time at app.lemonsqueezy.com/my-orders
   (the “My downloads” button in the header).

The file you sell is the **zip** of the template folder (e.g. `quorra-v1.0.0.zip`).
You upload it once in Lemon Squeezy — it is not stored on this website.

## Set up Lemon Squeezy (once per template)

1. **Products → New product.** Name, description, price (one-time), images.
2. **Files:** upload the zip (e.g. `quorra-v1.0.0.zip`).
3. **Confirmation modal / Thank-you:** turn on “Redirect after purchase” and set
   `https://YOUR-DOMAIN/thanks.html`.
4. Publish, then click **Share** and copy the checkout link
   (looks like `https://paneform.lemonsqueezy.com/buy/1a2b3c…`).
5. Paste it into `checkout:` of that product in `assets/js/products.js`.

In `STORE` (top of `products.js`) set `lemonStore`, your support `email` and social links.

## Add a new template (5 minutes)

1. Copy the template folder into `demos/<slug>/` (remove README, LICENSE, package.json —
   the demo only needs the html/css/js files).
2. Put its media into `assets/products/<slug>/`:
   `cover.webp` (16:10 or 16:9 screenshot), `poster.webp` (first frame of the video),
   `reel.mp4` (1280 px wide, muted, 15–25 s), plus any extra screenshots.
3. In `assets/js/products.js` copy one product block, change slug, name, price, texts,
   images, `checkout` link and `released` date. New products get a “New” badge for 30 days.
4. If it's a new category, add it to `CATEGORIES`.
5. Upload the site again (see below).

## Update a template

Upload the new zip in Lemon Squeezy (Files → replace). Buyers' download links serve the new
file. Add a line to that product's `changelog` and bump `version` in `products.js`.

## Hosting

**Netlify (easiest):** app.netlify.com/drop → drag the whole `paneform` folder → you get a
link at once. Later: Site settings → Domain → add your domain (e.g. paneform.com).
To update, drag the folder again in Deploys.

**Cloudflare Pages:** Workers & Pages → Create → Pages → Upload assets → drag the folder.

Buy the domain anywhere (Namecheap, Porkbun, Cloudflare) and point it to the host.

## Sale

`STORE.sale` in `products.js` runs a store-wide sale: a bar at the top of every page, a badge on the
home page and crossed-out prices. No discount code is used: each product in Lemon Squeezy is
priced at the sale price already ($60 → $48, $50 → $40).

1. The sale price on the site is `price` minus `percent`. Keep it equal to the price in Lemon Squeezy.
2. To end the sale: set `on: false` here and put the full price back on every product in Lemon Squeezy.
3. To end it on a date, set `ends: '2026-11-30'` — and change the Lemon Squeezy prices on that day.

## Custom project requests

The form at the bottom of the home page sends each request straight to your Telegram bot
(t.me/paneform732_bot). Settings are in `STORE.telegram` in `products.js`: `bot` is the bot token
(stored reversed and base64-encoded), `chat` is your Telegram user id. You must press **Start** in the
bot once, otherwise it can't message you. If sending fails, the form asks people to email `STORE.email`.

## Before going live — checklist

- [ ] Real checkout links in `products.js` (search for `REPLACE-`)
- [ ] `STORE.email`, `threads`, `instagram` filled in
- [ ] Form email notifications turned on in Netlify (see above)
- [ ] Lemon Squeezy prices equal the sale prices on the site ($48 / $40), or `sale.on` set to `false`
- [ ] Redirect after purchase → `/thanks.html` in every Lemon Squeezy product
- [ ] Read `terms.html` and adjust the refund and privacy text to your own policy
- [ ] Buy your own product once in Lemon Squeezy **test mode** to see the whole flow
