# Figma Reference Package

Everything you need to build the Tutedude redesign in Figma, in one place.
Nothing here is a new design — it's the existing, already-approved HTML build
(`redesign/frontend/`) packaged as reference material.

## Folder contents

```
figma-reference/
├── README.md                    ← you are here
├── 01-design-tokens.md          ← every color / type / spacing / radius / shadow value, ready to paste into Figma styles
├── 02-component-specs.md        ← every component, in build order, with notes on what's a shared master vs a distinct component
├── reference-images/            ← the ORIGINAL inspiration images (see caveat below)
└── component-screenshots/
    ├── desktop/                 ← 23 PNGs, 1440px — every component as actually shipped
    └── mobile/                  ← same 23, at 390px
```

## Build order

1. Read **01-design-tokens.md** first — set up color/text/effect styles before touching any component.
2. Work through **02-component-specs.md** top to bottom. Each numbered entry names its screenshot pair — open `component-screenshots/desktop/NN-name.png` and `mobile/NN-name.png` side by side while you build that one.
3. The specs doc tells you explicitly which components are **shared masters** (e.g. Refund Flow is one component used on both pages, Final CTA is one component used on both pages) — build those once and instance them, don't rebuild per page.

## Reference images — read this caveat first

`reference-images/` holds the images the redesign was originally briefed from.
They are **not all the same status**:

**Primary — these are what was actually built, treat as ground truth for layout:**
- `courseheader.png`, `coursecurriculum.png` — course page hero + curriculum layout
- `cards.png` — Course Card / Combo Pack Card / All Access Pack Card patterns
- `navheader.png` — header/nav
- `footer.png` — footer
- `homehero.png` — homepage hero

**Exploratory only — early AI-generated moodboards, NOT the final direction:**
- The four `ChatGPT Image Sep 18, 2026...png` files

These four contain patterns that were **deliberately not built**, on purpose,
not by oversight — don't reintroduce them while building in Figma:
- **Photo testimonial cards** (a named person's photo + quote + star rating) — no real learner photos or quotes were used; Tutedude only publishes video reviews with names, no written quotes. See ProofStrip in `02-component-specs.md` (10).
- **Countdown/urgency banners** ("New batch starting 15th Oct 2025! 12 days 08 hours...") — these dates would have to be invented; there's no real batch schedule to show.
- A different color system (`#3833A8` / `#BB7ED0`, "Plus Jakarta Sans") — the real palette in `01-design-tokens.md` is sampled from Tutedude's actual logo file, not this moodboard's palette.
- Fabricated review counts / Google rating card showing "4.8 (2.4K reviews)" — the real, verified figure is 4.9/5 (see ProofStrip), not 4.8/2.4K.

If in doubt about whether something in these four images should exist, check
`02-component-specs.md` / `component-list.md` first — if it's not listed
there, it was excluded on purpose.

## Also in `redesign/figma-plugin/`

A Figma plugin that auto-generates the color/text/effect styles and 27 icon
components from these same tokens — saves you re-typing every hex code by
hand. **Requires the Figma desktop app** (confirmed: Figma's own docs state
local plugin development only works in the desktop app, on any plan — the
browser can't run an unpublished plugin at all). Run it whenever you're
ready to use the desktop app; everything after Foundations/Icons still
needs to be assembled by hand or via new plugin steps we add together.
