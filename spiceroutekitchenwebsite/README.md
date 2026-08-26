# Spice Route Kitchen — Premium Restaurant Website

A single-page, JSON-driven restaurant website built with plain HTML, CSS, JavaScript and jQuery (no build step, no framework). Every piece of restaurant content — name, menu, prices, offers, gallery, testimonials, FAQ, contact info, theme colors, even section on/off switches — comes from one file: `data/restaurant.json`. The HTML/CSS/JS never hardcode restaurant content; they only render whatever is in that JSON.

## Run it locally

Browsers block a page from `fetch()`-ing local JSON/HTML over the `file://` protocol, so don't just double-click `index.html`. Serve the folder instead:

```bash
cd restaurant-website
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. (Any static server works — `npx serve`, VS Code's Live Server extension, etc.)

## How to edit the site

You almost never need to touch HTML/CSS/JS. Open `data/restaurant.json` and edit:

- **Add a menu item** — add an object to `menuItems` with a new `id` and a `categoryId` matching one of the `categories` entries. It shows up automatically, filterable and searchable.
- **Add a category** — add `{ "id": "...", "name": "...", "icon": "fa-solid fa-..." }` to `categories`. A new pill appears in the category bar and the category menu section auto-groups by it.
- **Change prices / mark a discount** — edit `price` / `discountPrice` (set `discountPrice: null` for no discount).
- **Toggle bestseller / veg / spice level** — `isBestseller`, `isVeg`, `spiceLevel` (0–3).
- **Add/remove an offer** — edit the `offers` array; set `"enabled": false` to hide one without deleting it.
- **Add a testimonial, gallery photo, or FAQ** — append to `testimonials`, `gallery`, or `faq`.
- **Turn a whole section on/off** — flip any value in `sections` (e.g. `"gallery": false` removes the gallery section entirely).
- **Change the ordering behaviour** — `ordering.type` can be `external` (opens a URL), `whatsapp`, `phone`, `internal` (scrolls to the menu), or `disabled`.
- **Change the theme** — colors, radius and fonts all live in `theme`; every color in the CSS reads from these values at runtime, nothing is hardcoded in the stylesheet.
- **Change animations** — `animations.enabled: false` turns off scroll/entrance animations site-wide (content still shows immediately).

## Images

Menu, hero, offer, gallery and testimonial images point at royalty-free Unsplash/placeholder URLs so the site looks complete out of the box. Swap any `image`/`avatar`/`logo` value in the JSON for your own photo URL (or a local path under `assets/images/`) whenever you're ready — no other code changes needed. If an image URL ever fails to load, the card gracefully falls back to a small branded placeholder graphic instead of a broken-image icon.

## Structure

```
restaurant-website/
├── index.html              Single page, structural markup only — no restaurant text
├── data/restaurant.json    ALL content: menu, sections, theme, contact, SEO, etc.
├── assets/css/main.css     Theme-variable-driven styling
├── assets/js/
│   ├── main.js              Data loader + single-page renderer (orchestrator)
│   ├── utils/helpers.js     Small shared formatting/escaping helpers
│   └── components/
│       ├── animations.js    JSON-controlled scroll-reveal + stat count-up
│       └── renderers/       One reusable render function per UI pattern
│                            (food card, offer card, feature card, gallery
│                            item + lightbox, testimonial card, FAQ item)
├── robots.txt / sitemap.xml SEO — update the placeholder domain before launch
└── assets/svg/               Logo + fallback placeholder graphic
```

## Before you launch

- Replace `https://REPLACE-WITH-YOUR-DOMAIN.com/` in `robots.txt`, `sitemap.xml`, and `data/restaurant.json` (`seo.siteUrl`) with your real domain.
- Set `ordering.url` / `quickActions.whatsapp.number` / `quickActions.call.number` to your real ordering link and numbers.
- Swap in your own logo (`assets/svg/logos/logo.svg`) and food photography.
