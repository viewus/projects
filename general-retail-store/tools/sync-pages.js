#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * tools/sync-pages.js — generate page shells and keep their <head> in step
 * with data/seo.json.
 *
 * WHY THIS EXISTS
 *
 * Every page carries its title/description/canonical statically in the HTML,
 * because crawlers and link-preview scrapers do not run JavaScript. That is
 * good for SEO but creates a duplication risk: seo.json says one thing, the
 * page head says another.
 *
 * This script removes that risk. seo.json stays the single source of truth,
 * and running this rewrites every page's head to match.
 *
 * THIS IS NOT A BUILD STEP. The site is fully static and serves fine without
 * ever running it. It is a maintenance tool — run it after editing seo.json.
 *
 *     node tools/sync-pages.js            update every page's <head>
 *     node tools/sync-pages.js --check    report drift, change nothing (CI-safe)
 * ------------------------------------------------------------------------- */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CHECK_ONLY = process.argv.includes("--check");

const seo = JSON.parse(fs.readFileSync(path.join(ROOT, "data/seo.json"), "utf8"));

/* Which file backs which page key, and how deep it sits. Mirrors the routes
   map in assets/js/router.js — keep the two in step. */
const PAGES = [
  { key: "home",            file: "index.html",                    depth: 0 },
  { key: "products",        file: "pages/products.html",           depth: 1 },
  { key: "product",         file: "pages/product.html",            depth: 1, detail: true },
  { key: "categories",      file: "pages/categories.html",         depth: 1 },
  { key: "offers",          file: "pages/offers.html",             depth: 1 },
  { key: "planner",         file: "pages/planner.html",            depth: 1 },
  { key: "monthlyGrocery",  file: "pages/monthly-grocery.html",    depth: 1 },
  { key: "healthyShopping", file: "pages/healthy-shopping.html",   depth: 1 },
  { key: "recipes",         file: "pages/recipes.html",            depth: 1 },
  { key: "recipe",          file: "pages/recipe.html",             depth: 1, detail: true },
  { key: "blogs",           file: "pages/blogs.html",              depth: 1 },
  { key: "blog",            file: "pages/blog.html",               depth: 1, detail: true },
  { key: "about",           file: "pages/about.html",              depth: 1 },
  { key: "contact",         file: "pages/contact.html",            depth: 1 },
  { key: "faq",             file: "pages/faq.html",                depth: 1 },
  { key: "privacy",         file: "pages/privacy.html",            depth: 1 },
  { key: "terms",           file: "pages/terms.html",              depth: 1 },
  { key: "notFound",        file: "404.html",                      depth: 0 }
];

/* Detail pages are rendered from a ?slug=, so their real title is set at
   runtime by pages.js. They still need a sensible crawlable default. */
const DETAIL_DEFAULTS = {
  product: { title: "Product", description: "Product details, price and availability." },
  recipe:  { title: "Recipe",  description: "Recipe with a ready-made ingredient shopping list." },
  blog:    { title: "Article", description: "Shopping tips and kitchen advice." }
};

const NOT_FOUND = {
  title: "Page not found",
  description: "The page you were looking for could not be found."
};

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SCRIPTS = [
  "paths", "helpers", "loader", "router", "storage", "render", "ui", "api",
  "validator", "search", "filter", "pagination", "lazyload", "seo", "analytics", "chrome"
];
const RENDERERS = ["sections", "banners", "product", "content", "planner"];
const STYLES = ["variables", "common", "layout", "components", "banners", "animations", "theme", "responsive"];

function metaFor(page) {
  const fromJson = seo.pages && seo.pages[page.key];
  if (fromJson) return fromJson;

  if (page.key === "notFound") return NOT_FOUND;
  if (page.detail) return DETAIL_DEFAULTS[page.key] || NOT_FOUND;

  return { title: page.key, description: seo.global.defaultDescription };
}

function buildPage(page) {
  const meta = metaFor(page);
  const up = page.depth ? "../" : "";
  const title = meta.title.includes("|") ? meta.title : meta.title + seo.global.titleSuffix;
  const canonical = meta.canonical || "";
  const noindex = page.detail || page.key === "notFound";

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- GENERATED FROM data/seo.json by tools/sync-pages.js — edit the JSON, then
       re-run that script. Editing this block by hand will be overwritten. -->
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(meta.description)}">
${canonical ? `  <link rel="canonical" href="${esc(canonical)}">\n` : ""}${noindex ? `  <meta name="robots" content="noindex">\n` : ""}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(meta.description)}">
${canonical ? `  <meta property="og:url" content="${esc(canonical)}">\n` : ""}  <meta name="twitter:card" content="summary_large_image">

  <!-- Site-wide values, filled from data/site.json by assets/js/seo.js -->
  <meta name="theme-color" id="themeColorMeta" content="#1f7a4d">
  <meta property="og:site_name" id="ogSiteName" content="">
  <meta property="og:image" id="ogImage" content="">
  <meta name="twitter:image" id="twitterImage" content="">
  <meta name="twitter:site" id="twitterSite" content="">
  <link rel="icon" type="image/svg+xml" id="faviconLink" href="${up}assets/images/logo.svg">
  <link rel="apple-touch-icon" id="appleIconLink" href="${up}assets/images/logo.svg">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet"
    integrity="sha384-XGjxtQfXaH2tnPFa9x+ruJTuLE3Aa6LhHSWRr1XeTyhezb4abCG4ccI5AkVDxqC+" crossorigin="anonymous">

${STYLES.map((s) => `  <link rel="stylesheet" href="${up}assets/css/${s}.css">`).join("\n")}
</head>

<body data-page="${page.key}">
  <a class="skipLink" href="#sections">Skip to content</a>

  <div id="headerPlaceholder"></div>
  <div id="navPlaceholder"></div>
  <div id="breadcrumbPlaceholder"></div>

  <!-- Rendered from the "${page.key}" array in data/sections.json. -->
  <main id="sections"></main>

  <div id="newsletterPlaceholder"></div>
  <div id="footerPlaceholder"></div>
  <div id="floatingPlaceholder"></div>

  <noscript>
    <div class="wrap" style="padding:60px 24px">
      <h1>JavaScript is required</h1>
      <p>This site loads its content from JSON files, so it needs JavaScript enabled.</p>
    </div>
  </noscript>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"
    integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs"
    crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
    crossorigin="anonymous"></script>

  <!-- paths.js MUST be first and MUST NOT be deferred: it derives the project
       root from its own script src, which needs document.currentScript. -->
${SCRIPTS.map((s) => `  <script src="${up}assets/js/${s}.js"></script>`).join("\n")}
${RENDERERS.map((s) => `  <script src="${up}assets/js/renderers/${s}.js"></script>`).join("\n")}
  <script src="${up}assets/js/pages.js"></script>
  <script src="${up}assets/js/app.js"></script>
</body>

</html>
`;
}

/* ---------- run ------------------------------------------------------------ */

let written = 0;
let drifted = 0;

PAGES.forEach((page) => {
  const target = path.join(ROOT, page.file);
  const next = buildPage(page);
  const exists = fs.existsSync(target);
  const current = exists ? fs.readFileSync(target, "utf8") : null;

  if (current === next) return;

  if (CHECK_ONLY) {
    drifted++;
    console.log((exists ? "DRIFT   " : "MISSING ") + page.file);
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, next, "utf8");
  written++;
  console.log((exists ? "updated " : "created ") + page.file);
});

if (CHECK_ONLY) {
  console.log(drifted
    ? `\n${drifted} page(s) out of step with data/seo.json — run: node tools/sync-pages.js`
    : `\nAll ${PAGES.length} pages match data/seo.json`);
  process.exit(drifted ? 1 : 0);
}

console.log(written
  ? `\n${written} page(s) written, ${PAGES.length - written} already current`
  : `\nAll ${PAGES.length} pages already current`);
