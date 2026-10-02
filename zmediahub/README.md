# MediaHub

A **multi-provider content discovery platform** built with **React (Vite) + React Router**.

MediaHub does not publish content itself. It organises references to content published by many independent **providers** (creators, businesses, brands, organisations, publishers, educators, influencers), each with **several platform accounts** (Instagram, YouTube, Facebook, TikTok, X, blog, website), and lets visitors discover it by category, tag, platform, provider and search. The original content always stays on its original platform.

```
MediaHub
 └─ Providers (creator, business, brand, ...)
     └─ Platform accounts (Instagram, YouTube, Facebook, TikTok, X, blog, website)
         └─ Content items  →  Category / Subcategory / Tags
```

There is no login, no sign-up, no account, no feed and no cart. It is a public directory/aggregator, not a social network and not a marketplace.

Everything is data-driven: no content is hardcoded in React components.

```
CSV / JSON  →  DataService  →  normalise + link  →  filter / search / sort  →  React components  →  pages
```

## Run it

```bash
cd app
npm install
npm run dev        # http://localhost:5173  (data/ — settings, tables and data/media/ — is served from the folder above)
npm run build      # builds the site into ../ (index.html + assets/). Nothing is generated from your data.
```

Opening `index.html` straight from disk will not work (browsers block `fetch` on `file://`); use any static server, for example `npx serve .` from this folder.

## Hosting on GitHub Pages

The built site (`index.html` + `assets/`) already sits in this folder, so commit and push, then enable Pages. Routes use `#/` URLs and all asset paths are relative, so it works at a domain root or in any sub-folder.

**The public address lives in one place only: `data/seo.csv` → `baseUrl`** (must end with `/`). Canonical links, Open Graph tags and structured data are built from it at runtime, in the browser, from your JSON/CSV. The build generates **no per-page files** (no copies of your data), so editing a CSV never leaves anything stale.

### Search engines (optional)

Routes use `#/` URLs, which search engines treat as one page. If you later want individual pages indexed, run `npm run seo:optional` inside `app/`. It writes a sitemap, robots.txt, a 404 page and one small landing page per item under `s/` (about 240 files), and you then set `staticPagesPath` to `"s/"` in `data/seo.csv`. It is off by default because those files are generated copies of your data and must be re-run after every data change.

## One folder = one website

The app only ever reads the folder called **`data/`**. Nothing about a site (text, colours, menu, images, contact details, SEO) is inside React or CSS, so you can keep several complete sites side by side and switch by renaming:

| Folder | What it is |
| --- | --- |
| `data/` | the site that is live right now (currently Punarjiva Organics) |
| `data_sample/` | the original multi-creator MediaHub demo, kept as a clean copy to show clients |
| `data_current/` | the MediaHub demo as it was when the Punarjiva site went live |

To switch: rename `data` to something else (for example `data_current`), then rename the folder you want to `data`. No rebuild, no code change. To make a new client site: copy `data_sample/` to `data_clientname/`, edit the files in it (text and images only), and rename it to `data` when you want to show it.

Paths inside the files always start with `data/media/...`, which is why the active folder must be called `data`.

## Moving to an API

`data/api.json` is the single registry of everything the app loads. Each entry has the local file and the REST endpoint:

```json
{ "mode": "files", "apiBase": "", "headers": {},
  "resources": { "tables": { "content": { "file": "content.csv", "endpoint": "/content" } }, ... } }
```

To use a backend: set `"mode": "api"`, set `"apiBase": "https://your-api.example.com/v1"` (and `"headers": { "Authorization": "Bearer ..." }` if needed). Every table, settings file and key/value table is then fetched from `apiBase + endpoint`. A single entry can use another source with `"source": "file"` or `"source": "api"`.

Response shapes (the same data you edit today):
* **tables** (`/content`, `/providers`, ...): a JSON array of rows with the same column names as the CSV, or `{ "data": [...] }`.
* **settings** (`/settings/site`, `/settings/theme`, `/settings/navigation`, ...): the same JSON object as the file.
* **key/value** (`/settings/seo`, `/settings/company`): an array of `{ "key", "value" }` rows (dotted keys become nested) or a plain object.

All fetching is in one module, `app/src/services/api.js`; no component calls `fetch` for content.

## Single-organisation (informational) sites

MediaHub can also present **one** organisation. It is an information site: nobody can buy, sign in or see multiple vendors; it collects links and embeds of the organisation's own YouTube, Instagram and Facebook content, plus its articles.

* `data/site.json` → `features.providers: false` hides the creators list, its menu links, the search tab and per-category creator counts. `features.businesses: false` hides the business directory.
* Put the organisation's accounts in `providers.csv` and `provider_platforms.csv` (one provider).
* Add each post / video as a row in `content.csv`.

### Embedding a post or video

In `content.csv`, paste a normal link into **`embed_url`** and set `platform` and `content_type`. The site builds the official embed, loads it on click, and falls back to a "View original" card if it cannot:

| You paste | Result |
| --- | --- |
| `https://www.youtube.com/watch?v=ID`, `https://youtu.be/ID`, `.../shorts/ID` | YouTube player (16:9, shorts 9:16) |
| `https://www.instagram.com/p/ID/` or `/reel/ID/` | Instagram embed (4:5) |
| `https://www.facebook.com/page/videos/ID/` | Facebook video plugin |
| TikTok / X / Vimeo embed URLs | allowed when the host is in `platforms.json → embedHosts` |

Player shapes are controlled in `data/platforms.json → embeds` (`ratio`, `shortRatio`). Rows with `status` = `draft` are hidden, so you can prepare them in advance (Punarjiva has no social profiles listed on its live site, so its data ships without any; add rows to `platforms.csv` and `provider_platforms.csv` when accounts exist).

### The Punarjiva Organics dataset (`data/`)

Built from the brand text, contact details and four journal articles of the earlier Punarjiva Organics site. Things to confirm with the client before launch:
* the live site lists no Instagram, Facebook or YouTube profiles, so only the website, WhatsApp, phone, email and Google Maps are used; add `social.*` rows to `company.csv` once real accounts exist;
* the 26 product posts are a demo catalogue (no prices, written as sample copy); views / likes numbers are only ordering weights and are hidden on cards;
* images are stock photos that were downloaded into `data_organics/media/` and should be replaced with real store photos;
* `seo.csv → baseUrl`, the email address and store hours must be confirmed.

## Project structure

```
zmediahub/
├── index.html, assets/         built app (generated, commit it)
├── app/                        React source (components, pages, styles, services)  -  only touched by developers
├── data/                       THE ACTIVE SITE: everything a client can change lives in this one folder
│   ├── api.json                registry of every file + REST endpoint (the one place to switch to an API)
│   ├── theme.json              ALL colours, radius, shadows, fonts, spacing, SVG background patterns
│   ├── site.json               name, logo, tabs, sort options, page size, feature switches
│   ├── navigation.json         header menu, "More" menu, phone tab bar
│   ├── platforms.json          platform filter pills, allowed embed hosts, embed ratios
│   ├── sections.json           homepage sections (order, on/off, titles, limits)
│   ├── footer.json             footer columns and bottom links
│   ├── pages.json              page headings + About / Privacy / Terms / Contact text
│   ├── tag-images.json         tag -> image map
│   ├── seo.csv  company.csv    key,value tables: base URL, titles, descriptions, contact details, social links
│   ├── categories.csv  subcategories.csv  tags.csv  content.csv  content_tags.csv  content_platforms.csv
│   ├── providers.csv  provider_platforms.csv  platforms.csv  banners.csv  blogs.csv  businesses.csv  popups.csv
│   └── media/                  ALL images (thumbnails, banners, categories, providers, blog, tags, images/logo+favicon+patterns)
├── data_sample/                spare copy of the original MediaHub demo (not used by the app)
└── data_organics/              ready-made single-organisation site for Punarjiva Organics (not used by the app)
```


## Routes

`/` · `/categories` · `/category/:slug` · `/creators` (provider directory) · `/provider/:slug` · `/content/:slug` · `/trending` · `/popular` · `/new` · `/tags` · `/tag/:slug` · `/search` · `/blog` · `/blog/:slug` · `/businesses` · `/business/:slug` · `/page/privacy|terms|contact`

(In the browser these appear as `#/category/food-drinks`, and so on.) Filters live in the URL, for example `?platform=youtube&sub=healthy-eating&tab=popular&sort=likes&page=2&view=list`, so they stack, can be shared, and work with the back button.

## How configuration works

All `data/*.json` settings files are fetched at runtime before the first render. `data/theme.json` is converted into CSS variables (`--mh-primary`, `--mh-radius-md`, `--mh-shadow-lg`, `--mh-font-heading`, ...) and every colour in the CSS comes from those variables, so editing `theme.json` re-themes the whole site. After editing on a live site, bump `data/api.json` → `version` to bypass browser caching.

| To… | Edit |
| --- | --- |
| Change name, tagline, logo, favicon | `data/site.json` (logo files are in `data/media/images/`) |
| Change contact details and social links | `data/company.csv` |
| Change ANY colour (brand, overlays, shadows, glows), radius, shadows | `data/theme.json` → `colors`, `radius`, `shadow` — no colour is hard-coded in the CSS. Every hex colour also gets an `--mh-<name>-rgb` variable automatically for transparent tints. Category and platform colours are in `data/categories.csv` / `data/platforms.csv` (`color` column) |
| Change fonts | `data/theme.json` → `typography` (`headingFont`, `bodyFont`, and `googleFonts` URL) |
| Change the menu | `data/navigation.json` |
| Change the platform filter pills or allowed embed hosts | `data/platforms.json` |
| Enable, disable or reorder homepage sections | `data/sections.json` (`"enabled": false`, or move entries) |
| Change SEO defaults and templates | `data/seo.csv` |

## Adding data

IDs are shared between files (`provider_id`, `category_id`, ...). Rows whose `status` is `draft`, `hidden` or `inactive` are ignored.

| To add… | Do this |
| --- | --- |
| A category | Add a row to `categories.csv` (`icon` is a Font Awesome class, `image` a path, `color` tints the icon) |
| A subcategory | Add a row to `subcategories.csv` with the parent `category_id` |
| A tag | Add a row to `tags.csv`; tag content with `content_id,tag_id` rows in `content_tags.csv` |
| A provider | Add a row to `providers.csv`. `provider_type` is one of `creator`, `business`, `brand`, `organization`, `publisher`, `educator`, `influencer`. Use `avatar` (people) or `logo`; with neither, initials are shown |
| A social account | Add a row to `provider_platforms.csv` (`provider_id`, `platform`, `username`, `profile_url`, `followers`). A provider can have any number of rows |
| Content | Add a row to `content.csv` (see below) |
| A banner | Add a row to `banners.csv`. `position`: `hero`, `promo`, `category`, `business`, `info`, `seasonal`, `custom`, `cta`. Optional `category_id`, `provider_id`, `start_date`, `end_date` |
| A blog post | Add a row to `blogs.csv`. `content` supports `##` headings, `- ` lists, `**bold**`, `*italic*` and `[links](https://…)`; tags are `;`-separated slugs |
| A business | Add a row to `businesses.csv`. `social_links` is `instagram=https://…;youtube=https://…` |

`content.csv` uses `provider_id`, `platform` (`instagram`, `youtube`, `facebook`, `tiktok`, `x`, `blog`, `website`), `content_type` (`video`, `reel`, `short`, `post`, `article`, `live`, `link`), `duration` (`m:ss`, `h:mm:ss` or seconds) and the flags `featured`, `trending`, `popular` (0/1). Trending and Popular pages use the flags; New sorts by `published_at`.

## How embeds work

The content page uses `EmbedViewer`, which detects YouTube, Instagram, Facebook, TikTok, X and generic embed URLs from `embed_url`.

* Embeds load **on click** (fast pages, no third-party cookies until asked).
* Only hosts listed in `data/platforms.json` → `embedHosts` are allowed, and the URL must be `https`.
* YouTube links are rewritten to `youtube-nocookie.com`.
* If there is no `embed_url`, the host is not allowed, the URL is invalid, or the embed is slow or blocked, a **"View Original Content"** card is shown with the thumbnail, platform, title and provider. `external_url` is validated, so `javascript:` and other unsafe links are never rendered.

## How CSV is parsed

`app/src/utils/csvParser.js` is a small dependency-free RFC-4180 parser. It handles quoted fields, commas and line breaks inside quotes, escaped quotes, a BOM, CRLF line endings, blank lines and ragged rows. A malformed row is skipped with a console warning, a missing file loads as empty, and missing images, providers or categories fall back gracefully. Nothing a data row contains can crash the site. (To use Papa Parse instead, replace `parseCSV` in that one file.)

## Replacing CSV with a REST API later

Components never read files; they call `DataService` (`app/src/services/dataService.js`): `getProviders()`, `getProvider()`, `getProviderPlatforms()`, `getContent()`, `getContentByProvider()`, `getCategories()`, `getSubcategories()`, `getTags()`, `getBanners()`, `getBlogs()`, `getBusinesses()`, `getPlatforms()` and more. To switch, set in `data/site.json`:

```json
"mode": "api", "apiBase": "https://api.example.com/v1"   // in data/api.json
```

The API answers `GET {apiBase}{endpoint}` (endpoints are listed in `data/api.json`, see "Moving to an API" above) with a JSON array of rows that use the same column names as the CSV files, for the tables `platforms, categories, subcategories, tags, content_tags, providers, provider_platforms, content, banners, blogs, businesses`. For server-side filtering or paging, change the bodies of `getContent()`, `getProviders()` and `search()` to call your endpoints. No component, page or route needs to change.

## Notes on the sample data

All providers, businesses, content, links and statistics are fictional demo data, and links go to platform search pages rather than real accounts. Photographs come from Unsplash (free licence) and are stored locally in `media/`. Provider avatars 1 to 10 were cropped from the supplied reference screenshots. The four embedded videos are Blender Foundation open movies (CC BY). Replace all of this with real data before launch.

## Update notes

* **IDs.** Content ids are strings (`c001`). `content_tags.csv` is `content_id,tag` where `tag` is the tag's slug (its unique id in `tags.csv`), not a number.
* **Same content on several platforms.** One row in `content.csv` is the main post; add rows to `content_platforms.csv` (`content_id, platform, content_type, external_url, embed_url, views, likes`) for the same content on other platforms. Cards show every platform badge, the platform filter matches any of them, and the content page lists "Also available on".
* **SEO and company details** live in `data/seo.csv` and `data/company.csv` (`key,value`; dotted keys such as `pages.about.title` or `social.instagram`).
* **Optional features.** `data/site.json` → `features.businesses`, and `cards.showProvider` / `cards.showStats`.

## Popup messages (`data/popups.csv`)

Welcome notes, announcements and promos are plain CSV rows, shown through the reusable `<Modal>` by `PopupManager`:

| column | meaning |
| --- | --- |
| `id` | unique id (used to remember that a visitor closed it) |
| `title`, `message`, `image` | content (image optional) |
| `button_text`, `link` | optional call to action (`#/category/travel` or `https://…`) |
| `page` | where it shows: `home`, `all`, a route such as `trending`, or a prefix such as `category/travel` |
| `delay_seconds` | wait before showing |
| `frequency` | `once` (remembered in the browser), `session` (once per visit) or `always` |
| `start_date`, `end_date` | optional date window (inclusive) |
| `priority` | higher shows first when several match; only one popup shows at a time |
| `status` | `active` shows it, anything else hides it |

## Filters

Every filter drawer group (platform, category, type, …) is multi-select except Date. Selections live in the URL as comma lists (`?category=travel,food-drinks&platform=youtube,tiktok`).
