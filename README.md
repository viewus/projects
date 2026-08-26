# Projects

A collection of modern, responsive websites developed for clients.

**Live:** [projects.akhileshravuri.online](https://projects.akhileshravuri.online/)

The root [`index.html`](index.html) is a hub page that lists every site in this repo. It is entirely data-driven — see [Adding a project](#adding-a-project).

## Sites

| Site | Folder | Category | Pages |
| --- | --- | --- | --- |
| Punarjiva Organics | [`punarjiva_organics/`](punarjiva_organics/) | Wellness | 40 |
| Advaith Homes | [`advaith_homes/`](advaith_homes/) | Real Estate | 21 |
| Artisano | [`living-designers/`](living-designers/) | Interiors | 6 |
| AR Plants & Seeds | [`plant-seeds/`](plant-seeds/) | Retail | 6 |
| AR Fitness Hub | [`ar-fitness/`](ar-fitness/) | Wellness | 5 |
| Kalakriti | [`kalakriti-arts/`](kalakriti-arts/) | Handmade | 5 |
| Artisana | [`home-traditions/`](home-traditions/) | Handmade | 5 |
| AR Home Services | [`ar-homeservices/`](ar-homeservices/) | Services | 4 |
| The Cane House | [`thecanehouse/`](thecanehouse/) | Food & Drink | 1 |
| The Skiny Co | [`skin-co/`](skin-co/) | Wellness | 1 |
| Rangi | [`jumki-rangi/`](jumki-rangi/) | Handmade | 1 |
| Handy Items | [`handyitems/`](handyitems/) | Handmade | 1 |
| Living Home | [`live-house/`](live-house/) | Interiors | 1 |

## Stack

Plain HTML, CSS and vanilla JavaScript. No framework, no bundler, no build step — every folder is served exactly as committed.

## Structure

```text
.
├── index.html          # hub page listing all sites
├── CNAME               # custom domain for GitHub Pages
├── <project>/          # one folder per site
│   ├── index.html
│   ├── assets/         # css, js, images  (some sites use css/ + js/)
│   └── pages/          # additional pages, on multi-page sites
└── docs/               # working notes, not published
```

## Running locally

No install step. Either open `index.html` in a browser, or serve the folder so that root-relative paths behave the same as in production:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

VS Code's Live Server extension works too.

## Adding a project

1. Create the project folder with an `index.html` inside it.
2. Open the root [`index.html`](index.html) and find the `<script type="application/json" id="site-data">` block.
3. Append one object to the `projects` array:

```json
{
  "id": "new-project",
  "name": "Brand Name",
  "monogram": "B",
  "tagline": "One or two sentences describing the site.",
  "category": "Retail",
  "badge": "Flagship",
  "path": "new-project/",
  "pages": 5,
  "year": 2026,
  "accent": ["#2f7d4f", "#8fbf5a"],
  "tags": ["Multi-page", "SEO"]
}
```

The card, the category filter and its count all update automatically. `badge` is optional. `accent` is the two-stop gradient used for the card cover, so no thumbnail image is needed.

### Editing hub page copy

All text on the hub page — the page title and meta tags, nav links, hero headline, footer and contact email — lives in that same `site-data` block. Nothing is hardcoded in the markup, so change it there and nowhere else.

Two conventions inside the data:

- `{email}` and `{year}` expand automatically, so the email address is written once.
- `*asterisks*` in `hero.headline` render as serif italic.

## Conventions

Config is committed so editors and formatters agree without per-machine setup:

| File | Purpose |
| --- | --- |
| [`.editorconfig`](.editorconfig) | 2-space indent, UTF-8, LF, final newline |
| [`.gitattributes`](.gitattributes) | LF normalisation, binary asset handling |
| [`.prettierrc`](.prettierrc) / [`.prettierignore`](.prettierignore) | Formatting, 120-column width |
| [`.eslintrc.json`](.eslintrc.json) | Browser-globals JS linting |
| [`.markdownlint.json`](.markdownlint.json) | Markdown linting |

There is no `package.json`, so Prettier, ESLint and markdownlint run through editor extensions rather than npm scripts. To run them from the CLI instead, use `npx` — for example `npx prettier --check .`.

## Deployment

Served by GitHub Pages from the default branch. [`CNAME`](CNAME) points the site at `projects.akhileshravuri.online`; pushing to `main` publishes.

## Licence

All rights reserved. Client work — please don't reuse designs or content without permission.
