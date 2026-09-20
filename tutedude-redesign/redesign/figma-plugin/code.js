/*
  Tutedude Design System Builder — a local Figma plugin (Plugin API, not the
  read-only REST API) that actually creates real design-system content:
  paint styles, text styles, effect styles and icon components. This is the
  only way to get real, reusable Figma components with variant properties
  that propagate to instances — Figma's public REST API cannot write nodes
  at all, on any plan.

  Values below are transcribed directly from the HTML build's own source of
  truth (css/tokens.css and js/utils/icons.js), not re-invented — so the
  Figma file starts from the same tokens the shipped site uses.

  Run steps IN ORDER from the plugin UI, one at a time:
    1. Build Foundations   — color / text / effect styles
    2. Build Icon Library  — icon components, one per glyph
  (Later steps — Button/Badge/Input, then composite cards, then Header/
  Footer, then page assembly — get appended here the same way, as their own
  message handlers + UI buttons, once you've reviewed each step in Figma.)
*/

const DS_PAGE_NAME = '🎨 Design System';

// ---------- 1. Colors (css/tokens.css :root) ----------
const COLORS = [
  // Brand — sampled from the logo's own gradient (violet -> indigo), not invented.
  { name: 'Brand/100', hex: '#EADCF0' },
  { name: 'Brand/200', hex: '#CDACDC' },
  { name: 'Brand/300', hex: '#AB74C4' },
  { name: 'Brand/400', hex: '#955EB6' },
  { name: 'Brand/500', hex: '#815BB5' },
  { name: 'Brand/600', hex: '#684CAC' },
  { name: 'Brand/700', hex: '#332C99' },
  { name: 'Brand/800', hex: '#231F6B' },
  { name: 'Brand/900', hex: '#171445' },
  // Ink (text)
  { name: 'Ink/900', hex: '#14101F' },
  { name: 'Ink/700', hex: '#372F52' },
  { name: 'Ink/500', hex: '#635C7A' },
  { name: 'Ink/300', hex: '#A9A2C2' },
  // Surfaces
  { name: 'Surface/White', hex: '#FFFFFF' },
  { name: 'Surface/Default', hex: '#FBFAFF' },
  { name: 'Surface/Alt', hex: '#F1EEFB' },
  { name: 'Surface/Dark', hex: '#171445' },
  // Semantic
  { name: 'Semantic/Success-600', hex: '#16A34A' },
  { name: 'Semantic/Success-500', hex: '#22C55E' },
  { name: 'Semantic/Success-100', hex: '#DCFCE7' },
  { name: 'Semantic/Teal-500', hex: '#14B8A6' },
  { name: 'Semantic/Teal-100', hex: '#CCFBF1' },
  { name: 'Semantic/Gold-500', hex: '#F5A524' },
  { name: 'Semantic/Danger-500', hex: '#EF4444' },
  // Neutral gray
  { name: 'Gray/900', hex: '#111827' },
  { name: 'Gray/700', hex: '#374151' },
  { name: 'Gray/500', hex: '#6B7280' },
  { name: 'Gray/300', hex: '#D1D5DB' },
  { name: 'Gray/100', hex: '#F3F4F6' },
  // Divider — opacity-based, not a flat swatch
  { name: 'Divider/Default', hex: '#14101F', opacity: 0.14 }
];

// ---------- 2. Typography (mobile-first base, + tablet/desktop overrides
// for the four sizes that actually scale — see tokens.css media queries) ----------
const TEXT_STYLES = [
  { name: 'Display/Hero', family: 'Sora', style: 'Bold', size: 40, lineHeightPct: 115 },
  { name: 'Display/Hero - Tablet', family: 'Sora', style: 'Bold', size: 52, lineHeightPct: 115 },
  { name: 'Display/Hero - Desktop', family: 'Sora', style: 'Bold', size: 68, lineHeightPct: 115 },

  { name: 'Display/H1', family: 'Sora', style: 'Bold', size: 32, lineHeightPct: 115 },
  { name: 'Display/H1 - Tablet', family: 'Sora', style: 'Bold', size: 40, lineHeightPct: 115 },
  { name: 'Display/H1 - Desktop', family: 'Sora', style: 'Bold', size: 48, lineHeightPct: 115 },

  { name: 'Display/H2', family: 'Sora', style: 'Bold', size: 24, lineHeightPct: 115 },
  { name: 'Display/H2 - Tablet', family: 'Sora', style: 'Bold', size: 30, lineHeightPct: 115 },
  { name: 'Display/H2 - Desktop', family: 'Sora', style: 'Bold', size: 36, lineHeightPct: 115 },

  { name: 'Display/H3', family: 'Sora', style: 'Bold', size: 20, lineHeightPct: 130 },
  { name: 'Display/H3 - Tablet', family: 'Sora', style: 'Bold', size: 24, lineHeightPct: 130 },
  { name: 'Display/H3 - Desktop', family: 'Sora', style: 'Bold', size: 28, lineHeightPct: 130 },

  { name: 'Display/H3 SemiBold', family: 'Sora', style: 'SemiBold', size: 20, lineHeightPct: 130 },

  { name: 'Body/Large', family: 'Inter', style: 'Regular', size: 18, lineHeightPct: 160 },
  { name: 'Body/Large - Desktop', family: 'Inter', style: 'Regular', size: 20, lineHeightPct: 160 },
  { name: 'Body/Regular', family: 'Inter', style: 'Regular', size: 16, lineHeightPct: 150 },
  { name: 'Body/Regular Medium', family: 'Inter', style: 'Medium', size: 16, lineHeightPct: 150 },
  { name: 'Body/Regular SemiBold', family: 'Inter', style: 'SemiBold', size: 16, lineHeightPct: 150 },
  { name: 'Body/Small', family: 'Inter', style: 'Regular', size: 14, lineHeightPct: 150 },
  { name: 'Body/Small Medium', family: 'Inter', style: 'Medium', size: 14, lineHeightPct: 150 },
  { name: 'Body/Small SemiBold', family: 'Inter', style: 'SemiBold', size: 14, lineHeightPct: 150 },
  { name: 'Caption/Regular', family: 'Inter', style: 'Medium', size: 12, lineHeightPct: 130 },
  { name: 'Caption/Bold', family: 'Inter', style: 'Bold', size: 12, lineHeightPct: 130 },

  // Accent faces — one-line decorative moments only, never running body copy.
  { name: 'Accent/Serif Italic', family: 'Lora', style: 'Italic', size: 16, lineHeightPct: 160 },
  { name: 'Accent/Script', family: 'Caveat', style: 'SemiBold', size: 20, lineHeightPct: 130 }
];

// ---------- 3. Effects (elevation shadows) ----------
const EFFECT_STYLES = [
  {
    name: 'Elevation/Shadow SM',
    shadows: [
      { x: 0, y: 1, blur: 2, spread: 0, color: '#14101F', alpha: 0.06 },
      { x: 0, y: 1, blur: 3, spread: 0, color: '#14101F', alpha: 0.08 }
    ]
  },
  {
    name: 'Elevation/Shadow MD',
    shadows: [
      { x: 0, y: 4, blur: 8, spread: 0, color: '#14101F', alpha: 0.08 },
      { x: 0, y: 2, blur: 4, spread: 0, color: '#14101F', alpha: 0.06 }
    ]
  },
  {
    name: 'Elevation/Shadow LG',
    shadows: [
      { x: 0, y: 12, blur: 24, spread: 0, color: '#14101F', alpha: 0.10 },
      { x: 0, y: 4, blur: 8, spread: 0, color: '#14101F', alpha: 0.06 }
    ]
  },
  {
    name: 'Elevation/Shadow Hero',
    shadows: [
      { x: 0, y: 24, blur: 48, spread: 0, color: '#5B3FE0', alpha: 0.16 }
    ]
  }
];

// ---------- 4. Icons (js/utils/icons.js ICONS map, transcribed verbatim) ----------
const ICON_SVGS = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  caret: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  mentor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/><circle cx="17.5" cy="8.5" r="2.2"/><path d="M14.8 13.8c.9-.5 1.9-.8 2.9-.8 2.6 0 4.8 2 4.8 4.6"/></svg>',
  refund: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><polyline points="9 12 11 14 15 10"/></svg>',
  project: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>',
  lifetime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 12a4 4 0 118 0 4 4 0 01-8 0z"/><path d="M4 12a4 4 0 118 0"/></svg>',
  community: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M2.5 19c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5"/><path d="M13.8 15.2c2.3.2 4.2 1.9 4.2 3.8"/></svg>',
  certificate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5.5"/><polyline points="8.5 13.5 7 21 12 18.5 17 21 15.5 13.5"/></svg>',
  recorded: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="10 8.5 16 12 10 15.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  language: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2 2 0 016 4h5v16H6a2 2 0 01-2-2z"/><path d="M20 5.5A2 2 0 0018 4h-5v16h5a2 2 0 002-2z"/></svg>',
  internship: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="3" y1="13" x2="21" y2="13"/></svg>',
  quality: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2.5 15 9 22 10 17 15 18.5 22 12 18.5 5.5 22 7 15 2 10 9 9 12 2.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2.5 15 9 22 10 17 15 18.5 22 12 18.5 5.5 22 7 15 2 10 9 9 12 2.5"/></svg>',
  graduate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 4 22 9 12 14 2 9 12 4"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 2a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6V15h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0012 2z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="10.5 8.5 16 12 10.5 15.5 10.5 8.5" fill="currentColor" stroke="none"/></svg>',
  question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.5 2.5 0 114 2c-.8.6-1.5 1.1-1.5 2.3"/><line x1="12" y1="17" x2="12" y2="17.1"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 8 0 100 16c1.1 0 1.5-.6 1.5-1.3 0-.6-.4-1-.4-1.6 0-.8.7-1.4 1.6-1.4H16a4 4 0 004-4c0-4.3-3.6-7.7-8-7.7z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="20" x2="5" y2="12"/><line x1="12" y1="20" x2="12" y2="6"/><line x1="19" y1="20" x2="19" y2="15"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 8 4 12 9 16"/><polyline points="15 8 20 12 15 16"/></svg>',
  layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><line x1="3.5" y1="9.5" x2="20.5" y2="9.5"/><line x1="9.5" y1="9.5" x2="9.5" y2="19.5"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 001 1h1l3 4V6l-3 4H4a1 1 0 00-1 1z"/><path d="M9 7l9-3v16l-9-3"/><path d="M19 10.5a2.5 2.5 0 010 3"/></svg>'
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16) / 255,
    g: parseInt(clean.substring(2, 4), 16) / 255,
    b: parseInt(clean.substring(4, 6), 16) / 255
  };
}

async function findOrCreatePage(name) {
  let page = figma.root.children.find((p) => p.name === name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
  }
  await figma.setCurrentPageAsync(page);
  return page;
}

// Loaded fonts are cached so we never call loadFontAsync twice for the same
// family+style, and a missing weight (e.g. a Caveat cut that isn't synced)
// degrades to Inter Regular instead of throwing and aborting the whole run.
const loadedFonts = new Set();
async function ensureFont(family, style) {
  const key = family + '::' + style;
  if (loadedFonts.has(key)) return { family, style };
  try {
    await figma.loadFontAsync({ family, style });
    loadedFonts.add(key);
    return { family, style };
  } catch (e) {
    const fallbackKey = 'Inter::Regular';
    if (!loadedFonts.has(fallbackKey)) {
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      loadedFonts.add(fallbackKey);
    }
    figma.notify('Font not found: ' + family + ' ' + style + ' — used Inter Regular instead', { timeout: 4000 });
    return { family: 'Inter', style: 'Regular' };
  }
}

function makeAutoLayoutFrame(name, direction) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = direction || 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.itemSpacing = 16;
  frame.paddingLeft = 24;
  frame.paddingRight = 24;
  frame.paddingTop = 24;
  frame.paddingBottom = 24;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.cornerRadius = 4;
  return frame;
}

async function makeLabel(text, family, style, size, color) {
  const font = await ensureFont(family || 'Inter', style || 'Regular');
  const node = figma.createText();
  node.fontName = font;
  node.characters = text;
  node.fontSize = size || 12;
  if (color) node.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
  return node;
}

// ---------------------------------------------------------------------------
// Step 1 — Foundations: color / text / effect styles
// ---------------------------------------------------------------------------

async function buildColorStyles() {
  const existing = await figma.getLocalPaintStylesAsync();
  const byName = new Map(existing.map((s) => [s.name, s]));

  const swatchGroups = new Map(); // group label -> array of {name, hex}

  for (const c of COLORS) {
    let style = byName.get(c.name);
    if (!style) {
      style = figma.createPaintStyle();
      style.name = c.name;
    }
    const paint = { type: 'SOLID', color: hexToRgb(c.hex) };
    if (typeof c.opacity === 'number') paint.opacity = c.opacity;
    style.paints = [paint];

    const group = c.name.split('/')[0];
    if (!swatchGroups.has(group)) swatchGroups.set(group, []);
    swatchGroups.get(group).push(c);
  }

  // Documentation frame — one row per group, one swatch per color, each
  // swatch's fill is linked to the real style (fillStyleId), so clicking a
  // swatch in Figma jumps straight to its style.
  const root = makeAutoLayoutFrame('Colors', 'VERTICAL');
  root.itemSpacing = 20;

  const title = await makeLabel('Colors', 'Sora', 'Bold', 24, '#14101F');
  root.appendChild(title);

  const styleByName = new Map();
  for (const s of await figma.getLocalPaintStylesAsync()) styleByName.set(s.name, s);

  for (const [group, colors] of swatchGroups) {
    const row = makeAutoLayoutFrame(group, 'HORIZONTAL');
    row.itemSpacing = 12;
    row.fills = [];
    row.paddingLeft = 0;
    row.paddingRight = 0;
    row.paddingTop = 0;
    row.paddingBottom = 0;

    for (const c of colors) {
      const cell = makeAutoLayoutFrame(c.name, 'VERTICAL');
      cell.itemSpacing = 6;
      cell.paddingLeft = 0;
      cell.paddingRight = 0;
      cell.paddingTop = 0;
      cell.paddingBottom = 0;
      cell.fills = [];

      const swatch = figma.createRectangle();
      swatch.resize(64, 64);
      swatch.cornerRadius = 4;
      const style = styleByName.get(c.name);
      if (style) swatch.fillStyleId = style.id;
      cell.appendChild(swatch);

      const label = await makeLabel(c.name.split('/')[1], 'Inter', 'Medium', 11, '#372F52');
      cell.appendChild(label);
      row.appendChild(cell);
    }
    root.appendChild(row);
  }

  return root;
}

async function buildTextStyles() {
  const existing = await figma.getLocalTextStylesAsync();
  const byName = new Map(existing.map((s) => [s.name, s]));

  const root = makeAutoLayoutFrame('Typography', 'VERTICAL');
  root.itemSpacing = 4;

  const title = await makeLabel('Typography', 'Sora', 'Bold', 24, '#14101F');
  root.appendChild(title);

  for (const t of TEXT_STYLES) {
    const font = await ensureFont(t.family, t.style);

    let style = byName.get(t.name);
    if (!style) {
      style = figma.createTextStyle();
      style.name = t.name;
    }
    style.fontName = font;
    style.fontSize = t.size;
    style.lineHeight = { value: t.lineHeightPct, unit: 'PERCENT' };

    const sample = figma.createText();
    sample.fontName = font;
    sample.characters = t.name + ' — ' + t.size + '/' + t.lineHeightPct + '%';
    sample.textStyleId = style.id;
    root.appendChild(sample);
  }

  return root;
}

async function buildEffectStyles() {
  const existing = await figma.getLocalEffectStylesAsync();
  const byName = new Map(existing.map((s) => [s.name, s]));

  const root = makeAutoLayoutFrame('Effects', 'HORIZONTAL');
  root.itemSpacing = 32;

  const title = await makeLabel('Effects', 'Sora', 'Bold', 24, '#14101F');

  const wrapper = makeAutoLayoutFrame('Effects Wrapper', 'VERTICAL');
  wrapper.fills = [];
  wrapper.paddingLeft = 0;
  wrapper.paddingRight = 0;
  wrapper.paddingTop = 0;
  wrapper.paddingBottom = 0;
  wrapper.appendChild(title);

  const row = makeAutoLayoutFrame('Effects Row', 'HORIZONTAL');
  row.itemSpacing = 32;
  row.fills = [];
  row.paddingLeft = 0;
  row.paddingRight = 0;
  row.paddingTop = 40;
  row.paddingBottom = 0;

  for (const e of EFFECT_STYLES) {
    let style = byName.get(e.name);
    if (!style) {
      style = figma.createEffectStyle();
      style.name = e.name;
    }
    style.effects = e.shadows.map((s) => {
      const rgb = hexToRgb(s.color);
      return {
        type: 'DROP_SHADOW',
        color: { r: rgb.r, g: rgb.g, b: rgb.b, a: s.alpha },
        offset: { x: s.x, y: s.y },
        radius: s.blur,
        spread: s.spread,
        visible: true,
        blendMode: 'NORMAL'
      };
    });

    const cell = makeAutoLayoutFrame(e.name, 'VERTICAL');
    cell.itemSpacing = 10;
    cell.counterAxisAlignItems = 'CENTER';

    const swatch = figma.createRectangle();
    swatch.resize(96, 64);
    swatch.cornerRadius = 4;
    swatch.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    swatch.effectStyleId = style.id;
    cell.appendChild(swatch);

    const label = await makeLabel(e.name.split('/')[1], 'Inter', 'Medium', 11, '#372F52');
    cell.appendChild(label);
    row.appendChild(cell);
  }

  wrapper.appendChild(row);
  return wrapper;
}

async function buildFoundations() {
  await findOrCreatePage(DS_PAGE_NAME);

  const colors = await buildColorStyles();
  const typography = await buildTextStyles();
  const effects = await buildEffectStyles();

  colors.x = 0;
  colors.y = 0;
  typography.x = colors.x + colors.width + 80;
  typography.y = 0;
  effects.x = 0;
  effects.y = colors.y + colors.height + 80;

  figma.currentPage.appendChild(colors);
  figma.currentPage.appendChild(typography);
  figma.currentPage.appendChild(effects);

  figma.viewport.scrollAndZoomIntoView([colors, typography, effects]);
  figma.notify('Foundations built: ' + COLORS.length + ' color styles, ' + TEXT_STYLES.length + ' text styles, ' + EFFECT_STYLES.length + ' effect styles.');
}

// ---------------------------------------------------------------------------
// Step 2 — Icon library (real components, one per glyph)
// ---------------------------------------------------------------------------

async function svgToIconComponent(key, svgString) {
  // createNodeFromSvg parses the markup into a FrameNode + vector children.
  // We then move those children into a real ComponentNode so each icon is a
  // reusable master component, not just a static vector group.
  const imported = figma.createNodeFromSvg(svgString);
  const component = figma.createComponent();
  component.name = 'Icon/' + key;
  component.resize(24, 24);

  const children = [...imported.children];
  for (const child of children) {
    component.appendChild(child);
  }
  imported.remove();

  // Recolor every vector to Ink/900 by default — instances can override the
  // fill/stroke per use (e.g. brand color on a stat icon) without touching
  // the master.
  const inkColor = hexToRgb('#14101F');
  component.findAll((n) => 'strokes' in n || 'fills' in n).forEach((n) => {
    if ('strokes' in n && n.strokes && n.strokes.length) {
      n.strokes = n.strokes.map((s) => (s.type === 'SOLID' ? { ...s, color: inkColor } : s));
    }
    if ('fills' in n && n.fills && n.fills.length && n.fills !== figma.mixed) {
      n.fills = n.fills.map((f) => (f.type === 'SOLID' ? { ...f, color: inkColor } : f));
    }
  });

  return component;
}

async function buildIconLibrary() {
  await findOrCreatePage(DS_PAGE_NAME);

  const root = makeAutoLayoutFrame('Icons', 'VERTICAL');
  root.itemSpacing = 20;

  const title = await makeLabel('Icons (' + Object.keys(ICON_SVGS).length + ')', 'Sora', 'Bold', 24, '#14101F');
  root.appendChild(title);

  const grid = figma.createFrame();
  grid.name = 'Icon Grid';
  grid.layoutMode = 'HORIZONTAL';
  grid.layoutWrap = 'WRAP';
  grid.primaryAxisSizingMode = 'FIXED';
  grid.counterAxisSizingMode = 'AUTO';
  grid.resize(880, 100);
  grid.itemSpacing = 16;
  grid.counterAxisSpacing = 16;
  grid.fills = [];

  const keys = Object.keys(ICON_SVGS);
  for (const key of keys) {
    let component;
    try {
      component = await svgToIconComponent(key, ICON_SVGS[key]);
    } catch (e) {
      figma.notify('Skipped icon "' + key + '": ' + e.message, { timeout: 4000 });
      continue;
    }

    const cell = makeAutoLayoutFrame(key + ' cell', 'VERTICAL');
    cell.itemSpacing = 6;
    cell.paddingLeft = 12;
    cell.paddingRight = 12;
    cell.paddingTop = 12;
    cell.paddingBottom = 12;
    cell.counterAxisAlignItems = 'CENTER';
    cell.fills = [{ type: 'SOLID', color: hexToRgb('#F1EEFB') }];

    cell.appendChild(component);
    const label = await makeLabel(key, 'Inter', 'Medium', 10, '#635C7A');
    cell.appendChild(label);
    grid.appendChild(cell);
  }

  root.appendChild(grid);
  root.x = 0;
  root.y = 1400; // below the foundations frames built in step 1
  figma.currentPage.appendChild(root);

  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify('Icon library built: ' + keys.length + ' icon components.');
}

// ---------------------------------------------------------------------------
// Step 3 — Mini Components: Controls + Cards
//
// These build REAL bound-variable components, reusing the Variables you
// already created manually (via the JSON-import plugins) and the Icon
// components you already imported by drag-and-drop — this script looks
// them up by name rather than recreating them, so it slots into your
// existing file instead of duplicating it. Built in a fresh Section named
// "Mini Components — Plugin Build" so you can compare against anything you
// built by hand and delete whichever copy you don't want to keep.
// ---------------------------------------------------------------------------

async function getVariableByName(name) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const c of collections) {
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (v && v.name === name) return v;
    }
  }
  return null;
}

async function getTextStyleByName(name) {
  const styles = await figma.getLocalTextStylesAsync();
  return styles.find((s) => s.name === name) || null;
}

async function getEffectStyleByName(name) {
  const styles = await figma.getLocalEffectStylesAsync();
  return styles.find((s) => s.name === name) || null;
}

function findIconComponent(name) {
  return figma.currentPage.findOne((n) => n.type === 'COMPONENT' && n.name === name);
}

// Binds a variable to a node's solid fill, falling back to a flat color
// (still correct visually) if that variable doesn't exist yet, so one
// missing token never aborts the whole build.
async function bindFill(node, varName, fallbackHex) {
  const v = await getVariableByName(varName);
  let paint = { type: 'SOLID', color: hexToRgb(fallbackHex || '#CCCCCC') };
  if (v) paint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
  else figma.notify('Variable not found: ' + varName + ' (used a flat fallback color)', { timeout: 3000 });
  node.fills = [paint];
}

async function bindStroke(node, varName, fallbackHex, weight) {
  const v = await getVariableByName(varName);
  let paint = { type: 'SOLID', color: hexToRgb(fallbackHex || '#CCCCCC') };
  if (v) paint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
  node.strokes = [paint];
  node.strokeWeight = weight || 1;
}

async function bindCornerRadius(node, varName, fallbackNum) {
  const v = await getVariableByName(varName);
  const corners = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
  for (const c of corners) {
    node[c] = fallbackNum != null ? fallbackNum : 4;
    if (v) node.setBoundVariable(c, v);
  }
}

async function bindNumberProp(node, prop, varName, fallbackNum) {
  const v = await getVariableByName(varName);
  node[prop] = fallbackNum;
  if (v) node.setBoundVariable(prop, v);
}

async function applyTextStyle(textNode, styleName) {
  const style = await getTextStyleByName(styleName);
  if (style) {
    await ensureFont(style.fontName.family, style.fontName.style);
    textNode.textStyleId = style.id;
  } else {
    figma.notify('Text style not found: ' + styleName, { timeout: 3000 });
  }
}

// Recolors every vector inside an icon INSTANCE by binding a variable —
// used per-use, never on the Icon/* master, so one instance's color never
// affects another.
async function recolorIconInstance(instance, varName, fallbackHex) {
  const v = await getVariableByName(varName);
  const targetColor = hexToRgb(fallbackHex || '#000000');
  instance.findAll((n) => 'strokes' in n || 'fills' in n).forEach((n) => {
    if ('strokes' in n && n.strokes && n.strokes.length) {
      n.strokes = n.strokes.map((s) => {
        if (s.type !== 'SOLID') return s;
        let p = { ...s, color: targetColor };
        if (v) p = figma.variables.setBoundVariableForPaint(p, 'color', v);
        return p;
      });
    }
    if ('fills' in n && n.fills && n.fills !== figma.mixed && n.fills.length) {
      n.fills = n.fills.map((f) => {
        if (f.type !== 'SOLID') return f;
        let p = { ...f, color: targetColor };
        if (v) p = figma.variables.setBoundVariableForPaint(p, 'color', v);
        return p;
      });
    }
  });
}

// Converts a plain auto-layout FRAME into a real COMPONENT, preserving
// layout/fill/stroke/effects and moving every child across — the frame
// itself is discarded. This is the "Create Component" step, done in code.
function frameToComponent(frame) {
  const comp = figma.createComponent();
  comp.name = frame.name;
  comp.layoutMode = frame.layoutMode;
  comp.primaryAxisSizingMode = frame.primaryAxisSizingMode;
  comp.counterAxisSizingMode = frame.counterAxisSizingMode;
  comp.primaryAxisAlignItems = frame.primaryAxisAlignItems;
  comp.counterAxisAlignItems = frame.counterAxisAlignItems;
  comp.paddingLeft = frame.paddingLeft;
  comp.paddingRight = frame.paddingRight;
  comp.paddingTop = frame.paddingTop;
  comp.paddingBottom = frame.paddingBottom;
  comp.itemSpacing = frame.itemSpacing;
  comp.fills = frame.fills;
  comp.strokes = frame.strokes;
  comp.strokeWeight = frame.strokeWeight;
  comp.effects = frame.effects;
  comp.resize(Math.max(frame.width, 1), Math.max(frame.height, 1));

  const kids = [...frame.children];
  for (const k of kids) comp.appendChild(k);

  const parent = frame.parent;
  const index = parent.children.indexOf(frame);
  parent.insertChild(index, comp);
  frame.remove();
  return comp;
}

function newAutoLayoutFrame(name, direction) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = direction;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  return f;
}

async function makeStyledText(characters, styleName, colorVar, colorFallback) {
  await ensureFont('Inter', 'Regular'); // safe default before textStyleId resolves its own font
  const t = figma.createText();
  t.characters = characters;
  await applyTextStyle(t, styleName);
  if (colorVar) await bindFill(t, colorVar, colorFallback);
  return t;
}

// ---------- Button (6 variants: State x Style) ----------
async function buildButtonVariant(stateVal, styleVal, fillVar, fillHex, strokeVar, textColorVar, textColorHex) {
  const f = newAutoLayoutFrame('State=' + stateVal + ', Style=' + styleVal, 'HORIZONTAL');
  f.primaryAxisAlignItems = 'CENTER';
  f.counterAxisAlignItems = 'CENTER';
  await bindNumberProp(f, 'paddingTop', 'Spacing/3', 12);
  await bindNumberProp(f, 'paddingBottom', 'Spacing/3', 12);
  await bindNumberProp(f, 'paddingLeft', 'Spacing/5', 20);
  await bindNumberProp(f, 'paddingRight', 'Spacing/5', 20);
  await bindNumberProp(f, 'itemSpacing', 'Spacing/2', 8);

  const label = await makeStyledText('Button Label', 'Body/Regular SemiBold', textColorVar, textColorHex);
  f.appendChild(label);

  const iconMaster = findIconComponent('Icon/arrow');
  if (iconMaster) {
    const inst = iconMaster.createInstance();
    inst.resize(20, 20);
    f.appendChild(inst);
    await recolorIconInstance(inst, textColorVar, textColorHex);
  }

  const comp = frameToComponent(f);
  await bindFill(comp, fillVar, fillHex);
  if (strokeVar) await bindStroke(comp, strokeVar, fillHex, 1);
  await bindCornerRadius(comp, 'Radius/Default', 4);
  return comp;
}

async function buildButton() {
  const variants = [];
  variants.push(await buildButtonVariant('Default', 'Primary', 'Brand/500', '#815BB5', null, 'Surface/White', '#FFFFFF'));
  variants.push(await buildButtonVariant('Hover', 'Primary', 'Brand/600', '#684CAC', null, 'Surface/White', '#FFFFFF'));
  variants.push(await buildButtonVariant('Active', 'Primary', 'Brand/700', '#332C99', null, 'Surface/White', '#FFFFFF'));
  variants.push(await buildButtonVariant('Default', 'Secondary', 'Surface/White', '#FFFFFF', 'Brand/300', 'Brand/700', '#332C99'));
  variants.push(await buildButtonVariant('Hover', 'Secondary', 'Brand/500', '#815BB5', 'Brand/500', 'Surface/White', '#FFFFFF'));
  variants.push(await buildButtonVariant('Active', 'Secondary', 'Brand/600', '#684CAC', 'Brand/600', 'Surface/White', '#FFFFFF'));

  variants.forEach((v, i) => { v.x = (i % 2) * 220; v.y = Math.floor(i / 2) * 80; });
  const set = figma.combineAsVariants(variants, figma.currentPage);
  set.name = 'Button';
  return set;
}

// ---------- Badge (1, no variants) ----------
async function buildBadge() {
  const f = newAutoLayoutFrame('Badge', 'HORIZONTAL');
  f.primaryAxisAlignItems = 'CENTER';
  f.counterAxisAlignItems = 'CENTER';
  await bindNumberProp(f, 'paddingTop', 'Spacing/1', 4);
  await bindNumberProp(f, 'paddingBottom', 'Spacing/1', 4);
  await bindNumberProp(f, 'paddingLeft', 'Spacing/4', 16);
  await bindNumberProp(f, 'paddingRight', 'Spacing/4', 16);

  const label = await makeStyledText('Badge Label', 'Caption/Bold', 'Brand/700', '#332C99');
  f.appendChild(label);

  const comp = frameToComponent(f);
  await bindFill(comp, 'Surface/White', '#FFFFFF');
  await bindCornerRadius(comp, 'Radius/Default', 4);
  const shadow = await getEffectStyleByName('Elevation/Shadow SM');
  if (shadow) comp.effectStyleId = shadow.id;
  return comp;
}

// ---------- Tag (2 variants: Tone) ----------
async function buildTagVariant(toneVal, fillVar, fillHex, textVar, textHex) {
  const f = newAutoLayoutFrame('Tone=' + toneVal, 'HORIZONTAL');
  f.primaryAxisAlignItems = 'CENTER';
  f.counterAxisAlignItems = 'CENTER';
  f.paddingTop = 2; f.paddingBottom = 2; f.paddingLeft = 10; f.paddingRight = 10;

  const label = await makeStyledText(toneVal, 'Caption/Regular', textVar, textHex);
  f.appendChild(label);

  const comp = frameToComponent(f);
  await bindFill(comp, fillVar, fillHex);
  await bindCornerRadius(comp, 'Radius/Default', 4);
  return comp;
}

async function buildTag() {
  const variants = [];
  variants.push(await buildTagVariant('Neutral', 'Surface/Alt', '#F1EEFB', 'Ink/700', '#372F52'));
  variants.push(await buildTagVariant('Success', 'Semantic/Success-100', '#DCFCE7', 'Semantic/Success-600', '#16A34A'));
  variants.forEach((v, i) => { v.x = i * 140; v.y = 0; });
  const set = figma.combineAsVariants(variants, figma.currentPage);
  set.name = 'Tag';
  return set;
}

// ---------- Icon Tile (4 variants: Color) ----------
async function buildIconTileVariant(colorVal, fillVar, fillHex, iconVar, iconHex) {
  const f = newAutoLayoutFrame('Color=' + colorVal, 'HORIZONTAL');
  f.primaryAxisSizingMode = 'FIXED';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(44, 44);
  f.primaryAxisAlignItems = 'CENTER';
  f.counterAxisAlignItems = 'CENTER';

  const iconMaster = findIconComponent('Icon/check');
  if (iconMaster) {
    const inst = iconMaster.createInstance();
    inst.resize(20, 20);
    f.appendChild(inst);
    await recolorIconInstance(inst, iconVar, iconHex);
  }

  const comp = frameToComponent(f);
  comp.resize(44, 44);
  await bindFill(comp, fillVar, fillHex);
  await bindCornerRadius(comp, 'Radius/Default', 4);
  return comp;
}

async function buildIconTile() {
  const variants = [];
  variants.push(await buildIconTileVariant('Brand', 'Brand/100', '#EADCF0', 'Brand/700', '#332C99'));
  variants.push(await buildIconTileVariant('Success', 'Semantic/Success-100', '#DCFCE7', 'Semantic/Success-600', '#16A34A'));
  variants.push(await buildIconTileVariant('Teal', 'Semantic/Teal-100', '#CCFBF1', 'Semantic/Teal-500', '#14B8A6'));
  variants.push(await buildIconTileVariant('Gold', 'Surface/Alt', '#F1EEFB', 'Semantic/Gold-500', '#F5A524'));
  variants.forEach((v, i) => { v.x = i * 70; v.y = 0; });
  const set = figma.combineAsVariants(variants, figma.currentPage);
  set.name = 'Icon Tile';

  // Instance-swap property on the icon slot, same as the manual step.
  try {
    const firstIcon = set.children[0].findOne((n) => n.type === 'INSTANCE');
    if (firstIcon) {
      set.addComponentProperty('Icon', 'INSTANCE_SWAP', firstIcon.mainComponent.id);
    }
  } catch (e) {
    figma.notify('Icon Tile built, but the Icon instance-swap property needs to be added by hand (' + e.message + ')', { timeout: 5000 });
  }
  return set;
}

// ---------- Stat Item ----------
async function buildStatItem() {
  const f = newAutoLayoutFrame('Stat Item', 'HORIZONTAL');
  f.counterAxisAlignItems = 'CENTER';
  await bindNumberProp(f, 'itemSpacing', 'Spacing/3', 12);
  f.fills = [];

  const tileSet = figma.currentPage.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Icon Tile');
  if (tileSet) {
    const brandVariant = tileSet.children.find((c) => c.name.indexOf('Brand') !== -1) || tileSet.children[0];
    const inst = brandVariant.createInstance();
    f.appendChild(inst);
  }

  const textCol = newAutoLayoutFrame('Text', 'VERTICAL');
  textCol.fills = [];
  const value = await makeStyledText('100k+', 'Body/Regular SemiBold', null, null);
  const label = await makeStyledText('Learners', 'Caption/Regular', 'Ink/500', '#635C7A');
  textCol.appendChild(value);
  textCol.appendChild(label);
  f.appendChild(textCol);

  const comp = frameToComponent(f);
  try {
    comp.addComponentProperty('Value', 'TEXT', '100k+');
    comp.addComponentProperty('Label', 'TEXT', 'Learners');
  } catch (e) { /* non-fatal — properties can be added by hand */ }
  return comp;
}

// ---------- FAQ Item (2 variants: State) ----------
async function buildFaqItemVariant(stateVal, showAnswer) {
  const outer = newAutoLayoutFrame('State=' + stateVal, 'VERTICAL');
  outer.resize(600, 1);
  outer.primaryAxisSizingMode = 'AUTO';
  outer.counterAxisSizingMode = 'FIXED';
  outer.paddingTop = 20; outer.paddingBottom = 20; outer.paddingLeft = 20; outer.paddingRight = 20;
  outer.itemSpacing = 12;
  await bindStroke(outer, 'Gray/100', '#F3F4F6', 1);
  await bindFill(outer, 'Surface/White', '#FFFFFF');
  await bindCornerRadius(outer, 'Radius/Default', 4);

  const qRow = newAutoLayoutFrame('Question Row', 'HORIZONTAL');
  qRow.fills = [];
  qRow.primaryAxisAlignItems = 'CENTER';
  qRow.counterAxisAlignItems = 'CENTER';

  const qText = await makeStyledText('Question Text?', 'Body/Regular SemiBold', null, null);
  qRow.appendChild(qText); // append BEFORE setting FILL — required order
  qText.layoutSizingHorizontal = 'FILL';

  const iconMaster = findIconComponent('Icon/chevronRight');
  if (iconMaster) {
    const inst = iconMaster.createInstance();
    inst.resize(16, 16);
    qRow.appendChild(inst);
  }

  outer.appendChild(qRow); // append BEFORE setting FILL — required order
  qRow.layoutSizingHorizontal = 'FILL';

  const answer = await makeStyledText('This is my answer', 'Body/Small', 'Ink/500', '#635C7A');
  answer.visible = showAnswer;
  outer.appendChild(answer);

  return frameToComponent(outer);
}

async function buildFaqItem() {
  const openV = await buildFaqItemVariant('Open', true);
  const closedV = await buildFaqItemVariant('Closed', false);
  openV.x = 0; openV.y = 0;
  closedV.x = 650; closedV.y = 0;
  const set = figma.combineAsVariants([openV, closedV], figma.currentPage);
  set.name = 'FAQ Item';
  return set;
}

// ---------- Course Card (mini) ----------
async function buildCourseCard() {
  const f = newAutoLayoutFrame('Course Card', 'VERTICAL');
  await bindNumberProp(f, 'paddingTop', 'Spacing/5', 20);
  await bindNumberProp(f, 'paddingBottom', 'Spacing/5', 20);
  await bindNumberProp(f, 'paddingLeft', 'Spacing/5', 20);
  await bindNumberProp(f, 'paddingRight', 'Spacing/5', 20);
  await bindNumberProp(f, 'itemSpacing', 'Spacing/3', 12);
  await bindStroke(f, 'Gray/100', '#F3F4F6', 1);
  await bindFill(f, 'Surface/White', '#FFFFFF');
  await bindCornerRadius(f, 'Radius/Default', 4);

  const logo = figma.createRectangle();
  logo.resize(48, 48);
  logo.name = 'Logo';
  await bindFill(logo, 'Surface/Alt', '#F1EEFB');
  f.appendChild(logo);

  const name = await makeStyledText('Course Name', 'Body/Regular SemiBold', null, null);
  f.appendChild(name);

  const tagRow = newAutoLayoutFrame('Tags', 'HORIZONTAL');
  tagRow.fills = [];
  await bindNumberProp(tagRow, 'itemSpacing', 'Spacing/2', 8);
  const tagSet = figma.currentPage.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Tag');
  if (tagSet) {
    const neutral = tagSet.children.find((c) => c.name.indexOf('Neutral') !== -1) || tagSet.children[0];
    tagRow.appendChild(neutral.createInstance());
    tagRow.appendChild(neutral.createInstance());
  }
  f.appendChild(tagRow);

  const comp = frameToComponent(f);
  try {
    comp.addComponentProperty('Name', 'TEXT', 'Course Name');
  } catch (e) { /* non-fatal */ }
  return comp;
}

// ---------- Feature Card ----------
async function buildFeatureCard() {
  const f = newAutoLayoutFrame('Feature Card', 'VERTICAL');
  await bindNumberProp(f, 'paddingTop', 'Spacing/5', 20);
  await bindNumberProp(f, 'paddingBottom', 'Spacing/5', 20);
  await bindNumberProp(f, 'paddingLeft', 'Spacing/5', 20);
  await bindNumberProp(f, 'paddingRight', 'Spacing/5', 20);
  await bindNumberProp(f, 'itemSpacing', 'Spacing/3', 12);

  const tileSet = figma.currentPage.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Icon Tile');
  if (tileSet) {
    const brandVariant = tileSet.children.find((c) => c.name.indexOf('Brand') !== -1) || tileSet.children[0];
    f.appendChild(brandVariant.createInstance());
  }

  const title = await makeStyledText('Feature Title', 'Body/Regular SemiBold', null, null);
  const desc = await makeStyledText('Feature description text goes here.', 'Body/Small', 'Ink/500', '#635C7A');
  f.appendChild(title);
  f.appendChild(desc);

  const comp = frameToComponent(f);
  try {
    comp.addComponentProperty('Title', 'TEXT', 'Feature Title');
    comp.addComponentProperty('Description', 'TEXT', 'Feature description text goes here.');
  } catch (e) { /* non-fatal */ }
  return comp;
}

async function buildMiniControls() {
  await findOrCreatePage(DS_PAGE_NAME);
  const section = figma.createSection();
  section.name = 'Mini Components — Plugin Build (Controls)';

  const button = await buildButton();
  const badge = await buildBadge();
  const tag = await buildTag();
  const iconTile = await buildIconTile();

  button.x = 0; button.y = 0;
  badge.x = 0; badge.y = 250;
  tag.x = 0; tag.y = 350;
  iconTile.x = 0; iconTile.y = 450;

  section.appendChild(button);
  section.appendChild(badge);
  section.appendChild(tag);
  section.appendChild(iconTile);
  section.resizeWithoutConstraints(700, 600);
  section.x = 0;
  section.y = 2600; // clear of earlier foundations/icons content
  figma.currentPage.appendChild(section);

  figma.viewport.scrollAndZoomIntoView([section]);
  figma.notify('Mini Components (Controls) built: Button, Badge, Tag, Icon Tile.');
}

async function buildMiniCards() {
  await findOrCreatePage(DS_PAGE_NAME);
  const section = figma.createSection();
  section.name = 'Mini Components — Plugin Build (Cards)';

  const stat = await buildStatItem();
  const faq = await buildFaqItem();
  const card = await buildCourseCard();
  const feature = await buildFeatureCard();

  stat.x = 0; stat.y = 0;
  faq.x = 0; faq.y = 100;
  card.x = 1350; card.y = 0;
  feature.x = 1700; feature.y = 0;

  section.appendChild(stat);
  section.appendChild(faq);
  section.appendChild(card);
  section.appendChild(feature);
  section.resizeWithoutConstraints(2100, 400);
  section.x = 0;
  section.y = 3300;
  figma.currentPage.appendChild(section);

  figma.viewport.scrollAndZoomIntoView([section]);
  figma.notify('Mini Components (Cards) built: Stat Item, FAQ Item, Course Card, Feature Card.');
}

// ---------------------------------------------------------------------------
// UI wiring
// ---------------------------------------------------------------------------

figma.showUI(__html__, { width: 320, height: 420 });

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'build-foundations') {
      await buildFoundations();
      figma.ui.postMessage({ type: 'done', step: 'foundations' });
    } else if (msg.type === 'build-icons') {
      await buildIconLibrary();
      figma.ui.postMessage({ type: 'done', step: 'icons' });
    } else if (msg.type === 'build-mini-controls') {
      await buildMiniControls();
      figma.ui.postMessage({ type: 'done', step: 'mini-controls' });
    } else if (msg.type === 'build-mini-cards') {
      await buildMiniCards();
      figma.ui.postMessage({ type: 'done', step: 'mini-cards' });
    } else if (msg.type === 'close') {
      figma.closePlugin();
    }
  } catch (err) {
    figma.notify('Error: ' + err.message, { error: true, timeout: 6000 });
    figma.ui.postMessage({ type: 'error', step: msg.type, message: err.message });
  }
};
