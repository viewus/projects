/**
 * Dev-only build script — recompiles the .jsx component sources in this folder
 * into bundle.js (the plain-JS file index.html actually loads).
 *
 * Why this exists: Babel Standalone's in-browser transform of `<script
 * type="text/babel" src="...">` tags fetches each file over XHR, which the
 * browser blocks when the page is opened as a local file (file://) instead
 * of through a web server. Precompiling once, ahead of time, removes that
 * runtime dependency entirely — the shipped site is plain JS and works the
 * same whether opened directly or served from GitHub Pages.
 *
 * Usage (only needed after editing a .jsx file in this folder):
 *   npm install --no-save @babel/core @babel/preset-react
 *   node assets/js/build.js
 */
const path = require("path");
const fs = require("fs");

let babel;
try {
  babel = require("@babel/core");
} catch {
  console.error(
    "@babel/core is not installed. Run:\n  npm install --no-save @babel/core @babel/preset-react\nthen re-run this script."
  );
  process.exit(1);
}

const jsDir = __dirname;

// Dependency order: each file may reference globals/components defined by
// files earlier in this list.
const order = [
  "utils.jsx",
  "particles.jsx",
  "calendar.jsx",
  "maps.jsx",
  "lightbox.jsx",
  "gallery.jsx",
  "timeline.jsx",
  "family.jsx",
  "venue.jsx",
  "story.jsx",
  "countdown.jsx",
  "hero.jsx",
  "music.jsx",
  "door.jsx",
  "final.jsx",
  "app.jsx"
];

let bundle = "";
for (const file of order) {
  const source = fs.readFileSync(path.join(jsDir, file), "utf8");
  const result = babel.transformSync(source, {
    presets: [["@babel/preset-react", { runtime: "classic" }]],
    filename: file,
    babelrc: false,
    configFile: false
  });
  bundle += `\n/* ===== ${file} ===== */\n${result.code}\n`;
}

fs.writeFileSync(path.join(jsDir, "bundle.js"), bundle);
console.log(`Wrote ${path.join(jsDir, "bundle.js")} (${bundle.length} bytes)`);
