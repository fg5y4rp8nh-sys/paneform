# Paneform — website

A static website (HTML, CSS, JavaScript), hosted on GitHub Pages. No server and no database.

Paneform does three things:

- **Dealer portals** (`index.html`) — a B2B ordering portal for manufacturers, sold as a subscription. Payment is on Lemon Squeezy.
- **SaaS development** (`saas.html`) — custom products from $1,500.
- **Company websites** (`sites.html`) — ready-made designs from $290, an online store from $490, a custom site from $490.

## Pages

| File | What it is |
|------|------------|
| `index.html` | Dealer portals: demo, plans, FAQ, request form |
| `saas.html` | SaaS development |
| `sites.html` | Company websites and designs |
| `checkout.html` | Choose a portal plan and period → Lemon Squeezy checkout |
| `start.html` | After payment: upload logo, catalog and dealer list |
| `preview.html` | A client’s portal preview with an “Order portal” button |
| `demo.html` | Opens a live demo: `demo.html#portal`, `#clarix`, `#dental`, `#counsellor`, `#homes`, `#tours`, `#store` |
| `404.html` | Page not found |
| `demos/` | Live demos (portal, clarix, dental, counsellor, homes, tours, store, plus older demos) |

## Settings — `assets/js/config.js`

- `PORTAL.plans.*.checkout` — Lemon Squeezy checkout links for every plan, period and AI option.
- `formEndpoint` — address of the form relay (Cloudflare Worker). When it’s set, requests go through it and the bot key isn’t needed on the site.
- `telegram` — used only while `formEndpoint` is empty.

## Languages

The site is written in English. Other languages are translated by Google Translate from the language menu.

## Security headers

`_headers` is read by Netlify and Cloudflare Pages (GitHub Pages ignores it).
