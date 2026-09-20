# File 1 of 2 — Foundations & Mini Components

This is everything from the old Steps 1–5, merged into one file. File 2
(`02-composite-sections-and-pages.md`) picks up with Composite Components,
Sections, and Pages. Together these 2 files replace the previous 8 (the
master checklist and steps 00–07) — nothing was cut, just merged.

```
Variables  →  Mini Components  →  Composite Components  →  Sections  →  Pages
(tokens)      (buttons, cards)     (grids, tab shells)      (page blocks)  (assembled)
    └──────────── File 1 (this file) ────────────┘   └────── File 2 ──────┘
```

## The organizing idea (read once)

Everything reusable lives on **ONE page**: `🎨 Design System`. The other
two pages (`🏠 Homepage`, `📄 Course Page`) only ever hold **instances**
dragged in from the Assets panel — nothing is built twice, at any tier.

Every name uses `/` or `PropertyName=Value` (`Brand/500`, `Icon/check`,
`State=Default, Style=Primary`) — Figma turns `/` into folders
automatically, and requires the `=` form for anything you combine into
variants (see the Problems Log if that error shows up).

**If you get stuck:** check `problems/README.md` first — every real issue
hit while building this was logged there with its exact fix.

## Master Checklist — everything in File 1

| ☐ | Name | Count | Section below |
|---|---|---|---|
| ☐ | Color variables | 29 | Step 1 |
| ☐ | Spacing variables | 13 | Step 1 |
| ☐ | Radius variable | 1 | Step 1 |
| ☐ | Divider color style | 1 | Step 2 |
| ☐ | Text styles | 24 | Step 2 |
| ☐ | Effect (shadow) styles | 4 | Step 2 |
| ☐ | Icon components | 29 | Step 3 |
| ☐ | Button | Style × State (6) | Step 4.1 |
| ☐ | Badge | none | Step 4.2 |
| ☐ | Tag | Tone (2) | Step 4.3 |
| ☐ | Icon Tile | Color (4) + Icon swap | Step 4.4 |
| ☐ | Stat Item | — | Step 5.1 |
| ☐ | FAQ Item | Open/Closed | Step 5.2 |
| ☐ | Course Card | — | Step 5.3 |
| ☐ | Feature Card | — | Step 5.4 |
| ☐ | Combo Pack Card, Access Card, Project Card, Info Card, Pricing Card, Curriculum Module Row, Curriculum Lesson Row, Course Highlight, Tools List Item, Review Card, Rating Summary (11) | — | Step 5.5 |

**File 1 total: 43 variables + 29 styles + 29 icons + 19 mini components = 120 items.**
(File 2 covers the remaining 24: 5 composite + 17 sections + 2 pages = 144 grand total.)

---
---

# Step 1 — Variables (43 total: 29 color, 13 spacing, 1 radius)

**What you're building:** the raw color/spacing/radius tokens as real Figma
Variables, so every component later binds to these instead of typed-in
numbers.

**Deep explanation:** a Variable is different from a Style — a Variable can
be bound directly into a fill, a stroke, a padding value, a corner radius.
If `Brand/500` ever changes from purple to something else, every button,
badge, and card bound to it updates in one edit. This only works if every
component from Step 4 onward binds to these, never types a raw hex/number.

## Option A — Bulk import via plugin (confirmed working — do this)

This is what actually worked, in two parts, because Number and Color
variables needed different tools:

**Spacing + Radius (Number variables) — Figma's own native import:**
1. Open the Variables panel (Ctrl+K → `variables`).
2. Use its built-in **Import** action, pointing at
   `assets/variables-import.json`.
3. This creates `Spacing` (13 variables) and `Radius` (1 variable)
   correctly. It does **not** reliably create Color variables — that's a
   known current limitation of Figma's native import, not a mistake in the
   file. Ignore/delete any empty `Colors` collection it leaves behind.

**Colors (29 variables) — the "JSON to Color Variables" plugin:**
1. **Ctrl+K** → search `JSON to Color Variables` → install/run it.
2. In its panel: **JSON format = Tokens**, **New Collection name = Colors**.
3. Paste the full contents of **`assets/colors-tokens-format.json`** into
   the "Paste JSON" box (this file has no outer wrapper key and uses plain
   `value`/`type`, not `$value`/`$type` — that's specifically what this
   plugin's "Tokens" format expects).
4. Run the import.

Confirm in the Variables panel: **Colors = 29, Spacing = 13, Radius = 1**
(43 total) — recorded in `assets/all-variables-final.json` for reference.

## Option B — Manual, one variable at a time (fallback only, not needed)

## 1.1 — Open the Variables panel

1. Press **Ctrl+K** (Quick Actions — the real command search, confirmed
   working in your browser).
2. Type `variables`, press Enter on **"Open variables"** (wording may vary
   slightly, e.g. "Local variables").
3. An empty panel opens with a **"+"** button.

## 1.2 — Colors collection

1. Click **"+" → Create collection**. Name it `Colors`.
2. Click **"+" New variable** once per row below. For each: set **Type =
   Color**, paste the hex into the value swatch, name it exactly as shown
   (the `/` creates a folder inside the collection).

**Brand**
| Name | Hex |
|---|---|
| Brand/100 | EADCF0 |
| Brand/200 | CDACDC |
| Brand/300 | AB74C4 |
| Brand/400 | 955EB6 |
| Brand/500 | 815BB5 |
| Brand/600 | 684CAC |
| Brand/700 | 332C99 |
| Brand/800 | 231F6B |
| Brand/900 | 171445 |

**Ink**
| Name | Hex |
|---|---|
| Ink/900 | 14101F |
| Ink/700 | 372F52 |
| Ink/500 | 635C7A |
| Ink/300 | A9A2C2 |

**Surface**
| Name | Hex |
|---|---|
| Surface/White | FFFFFF |
| Surface/Default | FBFAFF |
| Surface/Alt | F1EEFB |
| Surface/Dark | 171445 |

**Semantic**
| Name | Hex |
|---|---|
| Semantic/Success-600 | 16A34A |
| Semantic/Success-500 | 22C55E |
| Semantic/Success-100 | DCFCE7 |
| Semantic/Teal-500 | 14B8A6 |
| Semantic/Teal-100 | CCFBF1 |
| Semantic/Gold-500 | F5A524 |
| Semantic/Danger-500 | EF4444 |

**Gray**
| Name | Hex |
|---|---|
| Gray/900 | 111827 |
| Gray/700 | 374151 |
| Gray/500 | 6B7280 |
| Gray/300 | D1D5DB |
| Gray/100 | F3F4F6 |

That's 29 variables. Don't add Divider/Default here — variables don't
reliably carry a separate opacity field in every Figma version. We'll make
that one a **style** instead, in Step 2, where opacity definitely works.

## 1.3 — Spacing collection

1. **"+" → Create collection**, name it `Spacing`. Type = **Number** for
   every variable in it.
2. Add these (name = number of px ÷ 4, matching the codebase's own naming):

| Name | Value |
|---|---|
| 1 | 4 |
| 2 | 8 |
| 3 | 12 |
| 4 | 16 |
| 5 | 20 |
| 6 | 24 |
| 8 | 32 |
| 10 | 40 |
| 12 | 48 |
| 16 | 64 |
| 20 | 80 |
| 24 | 96 |
| 30 | 120 |

## 1.4 — Radius collection

1. **"+" → Create collection**, name it `Radius`. Type = Number.
2. One variable: `Default` = `4`

(Everything on the real site is capped at 4px radius — one token, not a
scale, is correct here. Don't add Small/Medium/Large variants.)

## 1.5 — Document it on canvas

1. Press **S** (Section tool), draw a large box on the `🎨 Design System`
   page, label it `Variables Reference`.
2. Inside it, for each color: press **R**, draw a 48×48 rectangle, fill it,
   then bind that fill to the variable instead of a flat color — click the
   Fill swatch → the small **variable icon** (looks like 4 small diamonds,
   next to the style 4-dot icon) → pick the matching variable from the list.
   This way the swatch visibly updates if you ever edit the variable later.
3. Add a small text label under each swatch with its name.

This step can take a while for 29 swatches — it's optional polish, not
required for the variables to work. If you want to skip straight to Step 2
and come back to the visual documentation later, that's fine.

**Done?** Check: Variables panel shows 3 collections — Colors (29
variables), Spacing (13), Radius (1). Move on to **Step 2** below.

---
---

# Step 2 — Text styles (24) + Effect styles (4) + 1 color style

**What you're building:** every text size/weight used on the site, as
named Styles (not Variables — Figma doesn't do font family/size as
variables reliably), plus the 4 drop-shadow combinations, plus one color
style for dividers (skipped from Step 1 because opacity is safer as a
style than a variable).

**Deep explanation:** a Text Style bundles font+weight+size+line-height
into one clickable name. Apply it to any text layer via the 4-dot style
icon next to the font controls — never manually retype font settings on a
new text layer once its style exists.

## 2.1 — Divider color style

| # | Click | Value |
|---|---|---|
| 1 | Draw a rectangle (`R`) | any size |
| 2 | Fill swatch → type hex | `14101F` |
| 3 | Drag Opacity slider | `14%` |
| 4 | Fill row → 4-dot style icon → **"+"** | name: `Divider/Default` |

## 2.2 — Text styles

For each row: press `T`, click canvas, type placeholder text, set
Font/Style/Size/Line-height in the right panel exactly as shown, then
4-dot style icon → **"+"** → name it.

| Style name | Font | Style | Size | Line height |
|---|---|---|---|---|
| Display/Hero | Sora | Bold | 40 | 115% |
| Display/Hero - Tablet | Sora | Bold | 52 | 115% |
| Display/Hero - Desktop | Sora | Bold | 68 | 115% |
| Display/H1 | Sora | Bold | 32 | 115% |
| Display/H1 - Tablet | Sora | Bold | 40 | 115% |
| Display/H1 - Desktop | Sora | Bold | 48 | 115% |
| Display/H2 | Sora | Bold | 24 | 115% |
| Display/H2 - Tablet | Sora | Bold | 30 | 115% |
| Display/H2 - Desktop | Sora | Bold | 36 | 115% |
| Display/H3 | Sora | Bold | 20 | 130% |
| Display/H3 - Tablet | Sora | Bold | 24 | 130% |
| Display/H3 - Desktop | Sora | Bold | 28 | 130% |
| Body/Large | Inter | Regular | 18 | 160% |
| Body/Large - Desktop | Inter | Regular | 20 | 160% |
| Body/Regular | Inter | Regular | 16 | 150% |
| Body/Regular Medium | Inter | Medium | 16 | 150% |
| Body/Regular SemiBold | Inter | Semi Bold | 16 | 150% |
| Body/Small | Inter | Regular | 14 | 150% |
| Body/Small Medium | Inter | Medium | 14 | 150% |
| Body/Small SemiBold | Inter | Semi Bold | 14 | 150% |
| Caption/Regular | Inter | Medium | 12 | 130% |
| Caption/Bold | Inter | Bold | 12 | 130% |
| Accent/Serif Italic | Lora | Italic | 16 | 160% |
| Accent/Script | Caveat | Semi Bold | 20 | 130% |

**Gotcha:** Figma names 600-weight "**Semi Bold**" (two words) — "SemiBold" won't match in the dropdown.

## 2.3 — Effect styles (shadows)

For each: draw a rectangle (`R`), white fill, **"+ Effect"** in the right
panel, add the shadow row(s) below (two rows = two stacked shadows on the
SAME style, add both before saving), then 4-dot icon next to Effects →
**"+"** → name it.

| Style name | Shadow (X / Y / Blur / Spread) | Color | Opacity |
|---|---|---|---|
| Elevation/Shadow SM | 0/1/2/0 | `#14101F` | 6% |
| ↳ same style, 2nd shadow | 0/1/3/0 | `#14101F` | 8% |
| Elevation/Shadow MD | 0/4/8/0 | `#14101F` | 8% |
| ↳ same style, 2nd shadow | 0/2/4/0 | `#14101F` | 6% |
| Elevation/Shadow LG | 0/12/24/0 | `#14101F` | 10% |
| ↳ same style, 2nd shadow | 0/4/8/0 | `#14101F` | 6% |
| Elevation/Shadow Hero | 0/24/48/0 | `#5B3FE0` | 16% |

**Done?** Move on to **Step 3** below.

---
---

# Step 3 — Icon components (29, drag-and-drop, no drawing)

**What you're building:** 29 real Figma components, one per icon, imported
from real `.svg` files instead of hand-drawn — Figma can import an `.svg`
file natively by dragging it from File Explorer onto the canvas.

**Deep explanation:** every icon used anywhere else in the file (buttons,
tags, stat rows, cards) should be an *instance* of one of these 29, never a
redrawn shape and never Figma's own default placeholder icon (the "person"
silhouette that appears if you insert an icon without picking one — see
`problems/README.md` row 1).

## Click table (repeat for all 29 files in `assets/icons/`)

| # | Click | Result |
|---|---|---|
| 1 | Draw a Section (`S`) on the Design System page, label it `Icons` | Visual container for all 29 |
| 2 | Open `assets/icons/` in File Explorer, drag one `.svg` file into the `Icons` Section on canvas | Imports as a vector, pre-colored dark |
| 3 | Select it → set **W=24, H=24** (lock proportions on) | Correct size |
| 4 | Right-click → **Create component** (or `Ctrl+Alt+K`) | Becomes a real component |
| 5 | Double-click its name → rename to `Icon/<filename without .svg>` | e.g. `Icon/check` |
| 6 | Repeat steps 2–5 for the next file | — |

## Full list of 29 filenames

`arrow` `book` `bulb` `caret` `certificate` `chart` `check` `chevronLeft`
`chevronRight` `clock` `code` `community` `graduate` `internship`
`language` `layout` `lifetime` `lock` `megaphone` `mentor` `palette`
`play` `project` `quality` `question` `recorded` `refund` `search` `star`

**Tip:** drag in 4–5 at once, componentize each, then grab the next batch.

**Done?** Check Assets panel shows an `Icon` folder with 29 items → move on to **Step 4** below.

---
---

# Step 4 — Mini Components: Controls (4 total)

Tier 2a of 2 — the smallest reusable pieces (Button, Badge, Tag, Icon
Tile). Step 5 below covers the cards/rows built from these. Together,
this tier = "Mini Components."

**What you're building:** Button, Badge, Tag, Icon Tile — used inside
almost every composite component later. Build these properly once;
everything after this just drags in instances.

**Method for all 4:** build ONE variant completely, then `Alt+drag` a copy
of it, rename, change only what's different (usually just a color), repeat
for remaining variants, then select all and **Combine as variants**.

Draw a Section (`S`) labeled `Mini Components — Controls` to hold all 4.

**Reminder before you start:** Auto Layout's Flow defaults to **Vertical**
every time, even when a step below says "horizontal" — you must click the
horizontal icon in the Flow row yourself each time. See `problems/README.md`
if you land on this again.

---

## 4.1 — Button (6 variants: Style × State)

### Build the first one — `State=Default, Style=Primary`

| # | Click | Value |
|---|---|---|
| 1 | `F` → **click-and-drag freehand** on empty canvas (don't click a device preset name) | any size — if it lands as a phone-sized frame anyway, that's fine, step 6 fixes it |
| 2 | Right panel → Auto Layout icon (or `Shift+A`) | turns it on |
| 3 | In the new **Auto Layout** section → **Flow** row → click the **horizontal** icon (not the vertical one, which is the default) | text/icon will sit side by side, not stacked |
| 4 | Padding fields | top/bottom `12`, left/right `20` (bind each to `Spacing/3` and `Spacing/5`) |
| 5 | Gap field | `8` |
| 6 | Resizing (still in Auto Layout section) → both W and H dropdowns | **Hug contents** on both |
| 7 | Scroll to the **"Appearance"** section (below Auto Layout, has Opacity + Corner radius) → click the **link-all-corners icon** next to Corner radius first, then the field's variable icon | bind to `Radius/Default` |
| 8 | `T` → click **inside** the frame → type | `Button Label` |
| 9 | Text → 4-dot style icon | `Body/Regular SemiBold` |
| 10 | Assets panel → find `Icon/arrow` → drag it **into** the frame, next to the text | — |
| 11 | Select the icon instance → if it shows a "swap" icon (two arrows) and it's not already `Icon/arrow`, click it and pick `Icon/arrow` | fixes the default "person" icon if it appears |
| 12 | Select the frame itself → Fill → variable icon → | bind to `Brand/500` |
| 13 | Select text layer → Fill → variable icon → | bind to `Surface/White` |
| 14 | Select icon instance → color → variable icon → | bind to `Surface/White` |
| 15 | Rename the frame (double-click name) | `State=Default, Style=Primary` |

### Duplicate into the other 5

| # | Click | Rename to | Change |
|---|---|---|---|
| 1 | Select `State=Default, Style=Primary` → `Alt+drag` down | `State=Hover, Style=Primary` | Fill → `Brand/600` |
| 2 | Select that → `Alt+drag` down | `State=Active, Style=Primary` | Fill → `Brand/700` |
| 3 | Select that → `Alt+drag` down | `State=Default, Style=Secondary` | Fill → `Surface/White`; add Stroke 1px → `Brand/300`; text+icon color → `Brand/700` |
| 4 | Select that → `Alt+drag` down | `State=Hover, Style=Secondary` | Fill → `Brand/500`; Stroke → `Brand/500`; text+icon color → `Surface/White` |
| 5 | Select that → `Alt+drag` down | `State=Active, Style=Secondary` | Fill → `Brand/600`; Stroke → `Brand/600`; text+icon color → `Surface/White` |

### Combine

| # | Click | Result |
|---|---|---|
| 1 | Select all 6 (shift-click each in Layers) | — |
| 2 | Right-click → **Combine as variants** | merges into one component set |
| 3 | Rename set → `Button` | — |
| 4 | Properties panel → check the two properties | should already read `State` and `Style` automatically — the `Prop=Value` names from Step 4.1 are what create these labels, no manual renaming needed this time |

**If the 6 land in one long row instead of a 2×3 grid** — see
`problems/README.md` row 3 to rearrange, or leave as one column, both work
identically as a component set (grid shape is cosmetic).

---

## 4.2 — Badge (1, no variants)

| # | Click | Value |
|---|---|---|
| 1 | `F` → click-and-drag freehand on empty canvas | any size |
| 2 | Right panel → `Shift+A` | turns on Auto Layout |
| 3 | Auto Layout section → **Flow** row → click the **horizontal** icon | it defaults to Vertical, always click this |
| 4 | Padding fields | top/bottom `4` (bind to `Spacing/1`), left/right `16` (bind to `Spacing/4`) |
| 5 | Resizing → both W and H dropdowns | **Hug contents** on both |
| 6 | Scroll to **"Appearance"** section → click link-all-corners icon next to Corner radius → then its variable icon | bind to `Radius/Default` |
| 7 | Fill → variable icon | bind to `Surface/White` |
| 8 | Scroll to **Effects** section → click **"+"** | add an effect |
| 9 | Effects row → 4-dot style icon | bind to `Elevation/Shadow SM` |
| 10 | `T` → click **inside** the frame → type | any short label text |
| 11 | Text → 4-dot style icon | `Caption/Bold` |
| 12 | Text → Fill → variable icon | bind to `Brand/700` |
| 13 | Rename the frame (double-click name) | `Badge` |

---

## 4.3 — Tag (2 variants: Tone)

### Build `Tone=Neutral`

| # | Click | Value |
|---|---|---|
| 1 | `F` → click-and-drag freehand on empty canvas | any size |
| 2 | Right panel → `Shift+A` | turns on Auto Layout |
| 3 | Auto Layout section → **Flow** row → click the **horizontal** icon | always click this, it defaults to Vertical |
| 4 | Padding fields | top/bottom `2`, left/right `10` |
| 5 | Resizing → both W and H dropdowns | **Hug contents** on both |
| 6 | Scroll to **"Appearance"** section → click link-all-corners icon next to Corner radius → then its variable icon | bind to `Radius/Default` |
| 7 | Fill → variable icon | bind to `Surface/Alt` |
| 8 | `T` → click **inside** the frame → type | any short label text |
| 9 | Text → 4-dot style icon | `Caption/Regular` |
| 10 | Text → Fill → variable icon | bind to `Ink/700` |
| 11 | Rename the frame (double-click name) | `Tone=Neutral` |

### Duplicate + combine

| # | Click | Rename to | Change |
|---|---|---|---|
| 1 | `Alt+drag` down | `Tone=Success` | Fill → `Semantic/Success-100`; text color → `Semantic/Success-600` |
| 2 | Select both → Combine as variants | set name `Tag` (property `Tone` should auto-appear from the names) | — |

---

## 4.4 — Icon Tile (4 variants: Color)

### Build `Color=Brand`

| # | Click | Value |
|---|---|---|
| 1 | `F` → click-and-drag freehand on empty canvas | any size |
| 2 | Right panel → `Shift+A` | turns on Auto Layout (this centers the icon inside easily) |
| 3 | Auto Layout section → **Alignment** grid (the 9-dot grid icon) → click the **center dot** | centers contents both horizontally and vertically |
| 4 | Resizing → both W and H dropdowns → **Fixed** (not Hug this time) | keep them Fixed |
| 5 | W and H number fields | type `44` in each |
| 6 | Scroll to **"Appearance"** section → click link-all-corners icon next to Corner radius → then its variable icon | bind to `Radius/Default` |
| 7 | Fill → variable icon | bind to `Brand/100` |
| 8 | Assets panel → find `Icon/check` → drag it **into** the frame | becomes the only child |
| 9 | Select that icon instance → color → variable icon | bind to `Brand/700` |
| 10 | Rename the frame (double-click name) | `Color=Brand` |

### Duplicate + combine

| # | Click | Rename to | Fill | Icon color |
|---|---|---|---|---|
| 1 | `Alt+drag` down | `Color=Success` | `Semantic/Success-100` | `Semantic/Success-600` |
| 2 | `Alt+drag` down | `Color=Teal` | `Semantic/Teal-100` | `Semantic/Teal-500` |
| 3 | `Alt+drag` down | `Color=Gold` | `Semantic/Gold-500` at ~15% opacity (or `Surface/Alt`) | `Semantic/Gold-500` |
| 4 | Select all 4 → Combine as variants | set name `Icon Tile` (property `Color` should auto-appear from the names) | — | — |
| 5 | On the merged set: click the icon instance inside any variant → Properties panel → **"+" → Instance swap** → name it `Icon` | anyone using this component can now pick any icon | — |

**Done?** Check Assets panel has `Button`, `Badge`, `Tag`, `Icon Tile` → move on to **Step 5** below.

---
---

# Step 5 — Mini Components: Cards & Rows (15 total)

Tier 2b of 2 — cards and rows built from the controls in Step 4 (instances
only, never redrawn). This is still "Mini Components," not Composite —
Composite (File 2, Step 6) is the next tier up: blocks that combine
several of these cards/rows together (a grid, a tab shell) into one
functional unit.

**What you're building:** cards and rows made from **instances** of the 4
base components (Step 4) — never redraw a button/tag/icon-tile inside
these, always drag an instance in from Assets.

Draw a Section (`S`) labeled `Mini Components — Cards` (not "Composite" —
that's a different, later tier, in File 2).

**Reminder:** Auto Layout Flow still defaults to Vertical on every new
frame — click the horizontal icon yourself whenever a row below says
"horizontal." And if you're combining variants anywhere here, every layer
name must use the `PropertyName=Value` format (see `problems/README.md`).

---

## 5.1 — Stat Item

Build **just ONE** of these now. Later, in File 2 Step 7, you'll drag 3
separate **instances** of this same component into 3 different sections
(Trust Bar, Course Hero, Proof/Reviews) — that reuse happens later, not
now.

| # | Click | Value |
|---|---|---|
| 1 | `F` → click-and-drag freehand on empty canvas | any size |
| 2 | Right panel → `Shift+A` | turns on Auto Layout |
| 3 | Auto Layout section → **Flow** row → click the **horizontal** icon | defaults to Vertical |
| 4 | Auto Layout section → **Alignment** grid → click the **center-left dot** (vertically centered) | icon and text block line up on the same row |
| 5 | Gap field | bind to `Spacing/3` |
| 6 | Resizing → both W and H dropdowns | **Hug contents** on both |
| 7 | Assets panel → find `Icon Tile` → drag one instance **into** the frame | first child |
| 8 | `F` again → draw a small second frame **inside** the first one, next to the Icon Tile instance | this becomes the text column |
| 9 | Select that inner frame → `Shift+A` | Auto Layout on |
| 10 | Inner frame's Flow → click the **vertical** icon this time | value sits above label |
| 11 | Inner frame Resizing → Hug both | — |
| 12 | `T` → click inside the inner frame → type | a placeholder value like `100k+` |
| 13 | That text → 4-dot style icon | `Body/Regular SemiBold` |
| 14 | `T` again → click inside the inner frame, below the first text → type | a placeholder label like `Learners` |
| 15 | That text → 4-dot style icon | `Caption/Regular` |
| 16 | That text → Fill → variable icon | bind to `Ink/500` |
| 17 | Rename the outer frame (double-click name) | `Stat Item` |
| 18 | Select the value text + label text together (shift-click both in Layers) → right panel **Properties** section → click **"+"** twice | adds 2 new properties |
| 19 | Name the two new properties | `Value`, `Label` |

## 5.2 — FAQ Item

Build **just ONE** of these (well, one component set with its Open/Closed
variants). Later, in File 2 Step 7, you'll drag its instances into both
the homepage FAQ and the course-page FAQ, with different questions typed
into each instance — that reuse happens later, not now.

Work through these **one row at a time**, in order. Don't skip ahead —
each row builds on the one before it.

### Part A — the outer card shape

| # | Click | Value |
|---|---|---|
| 1 | `F` → click-and-drag freehand on empty canvas | any size, roughly wide and short |
| 2 | With it still selected, right panel → `Shift+A` | turns on Auto Layout |
| 3 | Find the **Flow** row (small icon group, near the top of the Auto Layout section) → click the **vertical** icon | makes the question sit above the answer |
| 4 | Find the **Padding** fields → type `20` in each (top/bottom and left/right) | adds inner spacing on all 4 sides |
| 5 | Find **Resizing** → click the **W** dropdown → choose **Fixed** → a number field appears next to it → type `600` | card has a fixed width now |
| 6 | Same **Resizing** row → click the **H** dropdown → choose **Hug contents** | height will follow whatever's inside |
| 7 | Scroll down to the **"Appearance"** section (separate from Auto Layout, has Opacity + Corner radius) | — |
| 8 | Click the **link-all-corners icon** right next to the Corner radius field | turns 4 fields into 1 |
| 9 | Click the small **diamond/variable icon** next to that same field | a picker opens |
| 10 | Pick `Radius/Default` from the list | radius is now bound to the variable |
| 11 | Scroll to **Fill** → click the fill color swatch → click the diamond/variable icon inside that picker → pick `Surface/White` | card background set |
| 12 | Scroll to **Stroke** → click the **"+"** next to it | adds a stroke, defaults to 1px black |
| 13 | Click the new stroke's color swatch → diamond/variable icon → pick `Gray/100` | stroke color set |

### Part B — the question row (inside the card)

| # | Click | Value |
|---|---|---|
| 14 | Make sure the outer card frame from Part A is still selected (click it once if not) | — |
| 15 | Press `F`, then click-and-drag **directly on top of the card**, near its top edge | this draws a new frame; because you drew it on top of the existing card, it should become a **child** of the card automatically |
| 16 | Check the Layers panel right now — the new frame should appear **nested under** the card (indented), not as a separate item next to it | if it's NOT nested, undo (`Ctrl+Z`) and try step 15 again, drawing more carefully inside the card's visible area |
| 17 | With that new inner frame selected → `Shift+A` | Auto Layout on |
| 18 | Flow row → click the **horizontal** icon | question text and the arrow icon will sit side by side |
| 19 | Resizing → W dropdown → choose **Fill container** | this row stretches to the card's full width |
| 20 | Resizing → H dropdown → choose **Hug contents** | — |
| 21 | Press `T`, then click **once inside this same inner row** | a text cursor appears |
| 22 | Type a placeholder question, e.g. `Do I get a certificate?` | — |
| 23 | With that text selected → 4-dot style icon (near the font settings) → pick `Body/Regular SemiBold` | — |
| 24 | Open the **Assets panel** (left sidebar) → find `Icon/chevronRight` → drag it into the same inner row, dropping it **right after the text** | icon sits at the end of the question row |

### Part C — the answer text (back in the outer card, not the inner row)

| # | Click | Value |
|---|---|---|
| 25 | Click the **outer card frame** itself in the Layers panel (not the inner question row) | makes sure the next thing you add is a sibling of the question row, not inside it |
| 26 | Press `T`, then click **inside the outer card, below the question row** | a text cursor appears as a new item under the question row |
| 27 | Type a placeholder answer, e.g. `Yes, once you finish the course.` | — |
| 28 | With that text selected → 4-dot style icon → pick `Body/Small` | — |
| 29 | Same text → Fill → color swatch → diamond/variable icon → pick `Ink/500` | — |

### Part D — turn it into Open/Closed variants

| # | Click | Value |
|---|---|---|
| 30 | Click the **outer card frame** in Layers → double-click its name → type | `State=Open` |
| 31 | With it selected, hold **Alt** and drag it straight down → release a little below | creates a full duplicate copy |
| 32 | Double-click the new copy's name → type | `State=Closed` |
| 33 | In the Layers panel, expand `State=Closed` and click on its **answer text layer only** (the one from Part C, not the question row) | selects just that one text |
| 34 | Hover over that layer's row in the Layers panel — a small **eye icon** appears on the right side → click it | hides that text layer in this copy only |
| 35 | Click `State=Open` in Layers, then hold **Shift** and click `State=Closed` too | both selected together |
| 36 | Look at the right panel — it should say **"2 selected"** with a button below it labeled **"Combine as variants"** → click that button | merges both into one component set |
| 37 | Double-click the merged set's name → type | `FAQ Item` |

## 5.3 — Course Card (mini) — homepage grid, 64 real courses

| # | Click | Value |
|---|---|---|
| 1 | `F` → click-and-drag freehand | any size |
| 2 | `Shift+A` | Auto Layout on |
| 3 | Flow → click the **vertical** icon | — |
| 4 | Padding fields | `20` on all sides |
| 5 | Gap field | bind to `Spacing/3` |
| 6 | Resizing → both W and H | **Hug contents** |
| 7 | Appearance → link-all-corners icon → variable icon | bind to `Radius/Default` |
| 8 | Fill → variable icon | bind to `Surface/White` |
| 9 | Add Stroke `1` px → variable icon | bind to `Gray/100` |
| 10 | `R` → draw a rectangle inside, top of the frame | this is the logo slot |
| 11 | That rectangle → W/H fields | `48` and `48` |
| 12 | `T` → click inside the frame, below the rectangle → type a placeholder course name | style → 4-dot icon → `Body/Regular SemiBold` |
| 13 | `F` → draw one more small frame inside, below the name | this holds the two tags |
| 14 | Select it → `Shift+A` → Flow → click **horizontal** icon | — |
| 15 | Gap field | bind to `Spacing/2` |
| 16 | Assets panel → drag one `Tag` instance in (Tone=Neutral), then another `Tag` instance next to it | category + level |
| 17 | Rename the whole outer frame (double-click name) | `Course Card` |
| 18 | Select the course-name text + both Tag instances → Properties panel → click **"+"** for each | add Text properties `Name`, and check each Tag instance for its own text override |

## 5.4 — Feature Card (grid item for Why Tutedude + course Features tab)

| # | Click | Value |
|---|---|---|
| 1 | `F` → click-and-drag freehand | any size |
| 2 | `Shift+A` | Auto Layout on |
| 3 | Flow → click the **vertical** icon | — |
| 4 | Padding fields | `20` on all sides |
| 5 | Gap field | bind to `Spacing/3` |
| 6 | Resizing → both W and H | **Hug contents** |
| 7 | Assets panel → drag one `Icon Tile` instance into the frame | first child |
| 8 | `T` → click inside, below the Icon Tile → type a placeholder title | style → 4-dot icon → `Body/Regular SemiBold` |
| 9 | `T` again → click inside, below that → type a placeholder description | style → 4-dot icon → `Body/Small`; Fill → variable icon → bind to `Ink/500` |
| 10 | Rename the frame (double-click name) | `Feature Card` |
| 11 | Select title text + description text → Properties panel → click **"+"** twice | add Text properties `Title`, `Description` |

(There's no separate "Feature Grid" component to build — it's just several
`Feature Card` instances placed in a grid directly inside the Why Tutedude
/ Features-tab Section in File 2 Step 7. No dedicated Composite Component
needed since it has no filter/search bar attached, unlike Browse Courses.)

## 5.5 — Remaining cards: same method, per reference

For the rest — Combo Pack Card, Access Card, Project Card, Info Card,
Pricing Card, Curriculum Module Row, Curriculum Lesson Row, Course
Highlight, Tools List Item, Review Card, Rating Summary — the exact layout
of each is in:
- `../02-component-specs.md` (what each one contains)
- `../component-screenshots/desktop/` + `mobile/` (real pixel reference)

Build each using the **same numbered pattern as 5.1–5.4 above**: `F` to
draw → `Shift+A` → click Flow direction → set Padding/Gap → set Resizing →
bind Fill/Corner-radius/Stroke to variables → drag in instances from
Assets wherever the screenshot shows a Button/Badge/Tag/Icon Tile → add
text with the right style from Step 2 → rename → add Text/Instance-swap
properties for anything that needs per-use editing.

**File 1 done.** Move on to **`02-composite-sections-and-pages.md`**.
