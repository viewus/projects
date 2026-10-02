/**
 * Smoke test: opens the BUILT site (../index.html + ../assets) in a real browser against a dataset folder and checks
 * the things that break most often: every page loads, no console errors, no 404s, no broken images, the header fits
 * on phones, the Saved list works and respects its limit, and the carousel moves.
 *
 *   npm run build            (once, so ../assets is current)
 *   npm test                 tests ../data
 *   npm test -- data_sample  tests another dataset folder
 *
 * Needs Google Chrome or Edge installed (set CHROME_PATH if it is somewhere unusual).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { parseCSV } from '../src/utils/csvParser.js';

const root = path.resolve(import.meta.dirname, '..', '..');
const folder = process.argv[2] || 'data';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.csv': 'text/csv; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/') u = '/index.html';
  const file = path.join(root, u.startsWith('/data/') ? folder + u.slice(5) : u);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;

const exe = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => p && fs.existsSync(p));
if (!exe) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(2); }

const rows = (n) => { try { return parseCSV(fs.readFileSync(path.join(root, folder, `${n}.csv`), 'utf8')).rows; } catch { return []; } };
const cat = rows('categories')[0]?.slug; const item = rows('content').find((r) => !r.status || r.status === 'active'); const blog = rows('blogs')[0]?.slug; const tag = rows('tags')[0]?.slug;
const pages = [['home', '#/'], ['topics', '#/categories'], ['topic', `#/category/${cat}`], ['content', `#/content/${item?.slug}`], ['journal', '#/blog'], ['article', `#/blog/${blog}`], ['tags', '#/tags'], ['tag', `#/tag/${tag}`], ['about', '#/page/about'], ['contact', '#/page/contact'], ['privacy', '#/page/privacy'], ['saved', '#/saved'], ['search', '#/search?q=a'], ['trending', '#/trending']];

const feat = (() => { try { return JSON.parse(fs.readFileSync(path.join(root, folder, 'site.json'), 'utf8')).features || {}; } catch { return {}; } })();
if (feat.faq) pages.push(['faq', '#/faq']); if (feat.glossary) pages.push(['glossary', '#/glossary']);
let fail = 0;
const ok = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`); if (!cond) fail++; };
const browser = await chromium.launch({ executablePath: exe });
const mk = async (w, h, mobile = false) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage();
  p.problems = []; p.on('pageerror', (e) => p.problems.push('error: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') p.problems.push('console: ' + m.text().slice(0, 100)); });
  p.on('response', (r) => { if (r.status() >= 400) p.problems.push(`${r.status()} ${r.url().slice(-60)}`); }); return p;
};

console.log(`Testing dataset "${folder}"\n`);
const d = await mk(1440, 900);
for (const [name, hash] of pages) {
  d.problems.length = 0;
  await d.goto(`${BASE}?t=${name}${hash}`); await d.waitForFunction(() => (document.querySelector('main')?.innerText || '').trim().length > 20, null, { timeout: 8000 }).catch(() => {}); await d.waitForTimeout(500);
  await d.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); }); await d.waitForTimeout(300);
  const broken = await d.$$eval('img', (is) => is.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-40)));
  const empty = await d.$eval('main', (m) => m.innerText.trim().length < 20).catch(() => true);
  ok(`page: ${name}`, !d.problems.length && !broken.length && !empty, [...d.problems, ...broken.map((b) => 'broken image ' + b), empty ? 'page is empty' : ''].filter(Boolean).slice(0, 3).join('; '));
}

// header must fit at phone widths (menu + search buttons never pushed out of the bar)
for (const w of [320, 390]) {
  const m = await mk(w, 700, true); await m.goto(`${BASE}?t=h${w}#/`); await m.waitForTimeout(1200);
  const r = await m.evaluate(() => { const bar = document.querySelector('.site-header__bar').getBoundingClientRect(); const bs = [...document.querySelectorAll('.site-header__actions button')].map((e) => e.getBoundingClientRect()); return { inside: bs.length > 0 && bs.every((x) => x.right <= bar.right + 1), page: document.documentElement.scrollWidth > innerWidth }; });
  ok(`phone ${w}px: header buttons inside the bar, no sideways scroll`, r.inside && !r.page);
}

// carousel moves with the buttons
await d.goto(`${BASE}?t=car#/`); await d.waitForSelector('.carousel__container', { timeout: 8000 }).catch(() => {}); await d.waitForTimeout(1200);
let moved = null;
for (const c of await d.$$('.carousel')) {
  const next = await c.$('.carousel__btn--next'); if (!next || !(await next.isEnabled())) continue;   // rows that fit on screen have nothing to scroll
  const cont = await c.$('.carousel__container'); await c.evaluate((e) => e.scrollIntoView({ block: 'center' })); await d.waitForTimeout(500);
  const x = () => cont.evaluate((e) => Math.round(new DOMMatrix(getComputedStyle(e).transform).m41)); const x0 = await x();
  await next.click(); await d.waitForTimeout(800); moved = [x0, await x()]; break;
}
ok('a scrollable carousel moves with its next button', moved === null || moved[1] < moved[0], moved ? `${moved[0]} -> ${moved[1]}` : 'all rows fit on screen, nothing to scroll');

// saved list: save, persist, cap, remove
const sp = await mk(1440, 900);
await sp.route(/\/data\/site\.json/, async (r) => { const res = await r.fetch(); const j = JSON.parse(await res.text()); j.features = { ...(j.features || {}), saved: { enabled: true, limit: 2 } }; r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(j) }); });
await sp.goto(`${BASE}?t=s#/new`); await sp.waitForSelector('.content-card .save-btn', { timeout: 8000 }).catch(() => {}); await sp.waitForTimeout(600);
const btns = await sp.$$('.content-card .save-btn');
if (btns.length >= 3) {
  for (let i = 0; i < 3; i++) { await btns[i].click(); await sp.waitForTimeout(150); }
  const stored = await sp.evaluate(() => JSON.parse(localStorage.getItem('mh_saved_v1') || '[]'));
  ok('saved list stops at its limit (limit 2, clicked 3)', stored.length === 2);
  await sp.goto(`${BASE}?t=s#/saved`); await sp.waitForTimeout(900);
  ok('saved page lists the saved items', (await sp.$$('.content-card')).length === 2);
} else ok('saved: bookmark buttons present', btns.length >= 3, `${btns.length} found`);

await browser.close(); server.close();
console.log(fail ? `\n${fail} check(s) FAILED` : '\nAll checks passed');
process.exit(fail ? 1 : 0);
