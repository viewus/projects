# File 2 of 2 — Composite Components, Sections & Pages

Continues straight from `01-foundations-and-mini-components.md` — build
that file first. This file covers the last two tiers: Composite
Components (functional blocks) and Sections/Pages (the real pages).

```
Variables  →  Mini Components  →  Composite Components  →  Sections  →  Pages
   └──────── File 1 ────────┘        └──────────── File 2 (this file) ────────────┘
```

**Reminder:** Auto Layout Flow still defaults to Vertical on every new
frame — click the horizontal icon yourself whenever a row below says
"horizontal." If you're combining anything into variants, every layer
name needs the `PropertyName=Value` format — see `problems/README.md`.

## Checklist for this file

| ☐ | Name | Section below |
|---|---|---|
| ☐ | Browse Courses Block | Step 6.1 |
| ☐ | Combo Packs Block | Step 6.2 |
| ☐ | Access Cards Pair | Step 6.3 |
| ☐ | Course Explorer Shell | Step 6.4 |
| ☐ | Curriculum Browser | Step 6.5 |
| ☐ | Header, Footer, Refund Flow, Final CTA, FAQ Accordion (shared) | Step 7.1 |
| ☐ | Hero, Trust Bar, How It Works, Browse Courses, Combo Packs, Access Cards, Why Tutedude, Proof/Reviews, Newsletter (homepage-only, 9) | Step 7.2 |
| ☐ | Course Hero, Course Explorer section, Pricing (course-only, 3) | Step 7.2 |
| ☐ | 🏠 Homepage assembled | Step 7.3 |
| ☐ | 📄 Course Page assembled | Step 7.4 |

**File 2 total: 5 composite + 17 sections + 2 pages = 24 items** (120 from
File 1 + 24 here = **144 grand total**).

---
---

# Step 6 — Composite Components (5 total)

**Tier 3 of 4.** A Composite Component combines several Mini Components
(File 1, Steps 4–5) into one functional block — a grid with a filter bar,
a tab shell with panels — but it's still not a full page Section: no
section heading, no page-level padding/background yet (that's Step 7).
Think of it as "the working machine," and a Section as "the machine
placed on the page with a title above it."

Draw a Section (`S`) labeled `Components — Composite` to hold all 5.

---

## 6.1 — Browse Courses Block

Search input + category/level filter pills + a responsive grid of
`Course Card` instances (2 cols mobile / 3 tablet / 5 desktop).

| # | Click | Value |
|---|---|---|
| 1 | Frame → Auto Layout, vertical | gap `Spacing/6` |
| 2 | Add a search input row: rectangle + `Icon/search` instance + placeholder text | style `Body/Small`, color `Ink/300` |
| 3 | Add a horizontal wrap-row of `Tag` instances for categories (11) + levels (4) | Tone=Neutral, one gets a selected-state override |
| 4 | Add a grid frame below (Auto Layout, wrap enabled) | drag in several `Course Card` instances |
| 5 | Rename | `Browse Courses Block` |

## 6.2 — Combo Packs Block

Same shape as 6.1, simpler — a row of group-filter `Tag` instances above a
grid of `Combo Pack Card` instances.

| # | Click | Value |
|---|---|---|
| 1 | Frame → Auto Layout, vertical | gap `Spacing/6` |
| 2 | Horizontal row of `Tag` instances (4 real groups) | Tone=Neutral |
| 3 | Grid frame below with `Combo Pack Card` instances | 2 cols mobile / 3 desktop |
| 4 | Rename | `Combo Packs Block` |

## 6.3 — Access Cards Pair

Just two `Access Card` instances side by side — small, but it's a distinct
composite because the two cards need to sit in a matched-height row.

| # | Click | Value |
|---|---|---|
| 1 | Frame → Auto Layout, horizontal (wraps to vertical on mobile — build the desktop version first) | gap `Spacing/6` |
| 2 | Drag in 2 `Access Card` instances | — |
| 3 | Rename | `Access Cards Pair` |

## 6.4 — Course Explorer Shell

The tab bar + one active panel, on the course page. This is the biggest
composite — it holds the `Curriculum Browser` (6.5) as ONE of its 5 tab
panels.

| # | Click | Value |
|---|---|---|
| 1 | Frame → Auto Layout, vertical | Fill `Surface/White`, radius `Radius/Default`, shadow style `Elevation/Shadow MD` |
| 2 | Top row: horizontal Auto Layout, space-between | 5 tab buttons (small text + icon, active one filled `Brand/500`) + one `Button` instance (Style=Primary) labeled "Enroll Now" |
| 3 | Below: one panel visible at a time — for now just build the Curriculum panel (6.5) inside; Features/Projects/Certification/FAQs panels reuse Mini Components (a grid of `Feature Card` instances, `Project Card`, `Info Card`, `FAQ Item`) the same way | — |
| 4 | Add a bottom row of 4 `Stat Item`-style highlight entries | — |
| 5 | Rename | `Course Explorer Shell` |

## 6.5 — Curriculum Browser

Sidebar (module list) + detail pane (lessons + takeaways) — sits inside
6.4's Curriculum tab panel.

| # | Click | Value |
|---|---|---|
| 1 | Frame → Auto Layout, horizontal | gap `Spacing/6` |
| 2 | Left: vertical Auto Layout, `Curriculum Module Row` instances stacked (from Step 5) | one marked active/selected |
| 3 | Right: vertical Auto Layout — title, summary text, stacked `Curriculum Lesson Row` instances, then a takeaways panel (`Icon Tile` + checklist + `Button` instance) | — |
| 4 | Rename | `Curriculum Browser` |

**Done?** Move on to **Step 7** below.

---
---

# Step 7 — Sections, then pages

**Tier 4 of 4.** The last layer — full page sections made from Composite
Component instances (Step 6) and standalone Mini Components (File 1,
Steps 4–5), wrapped with a section heading, page-level padding, and
background. Then two pages made from section instances.

**Rule:** if you're drawing a rectangle or typing raw text at this stage,
stop — that content should already be a component from File 1, drag an
instance in instead.

---

## 7.1 — Shared sections (build ONCE, used on both pages)

| # | Section | Text properties to add |
|---|---|---|
| 1 | Header | none — identical both pages |
| 2 | Footer | none — identical both pages |
| 3 | Refund Flow | `Title`, `Description` |
| 4 | Final CTA | `Title`, `Description` |
| 5 | FAQ Accordion | repeat `FAQ Item` instances inside, one per question |

Build these on the Design System page, inside a Section labeled `Sections — Shared`.

## 7.2 — Page-specific sections

Build directly as components too (even though used once) — Section labeled
`Sections — Homepage` / `Sections — Course Page`. See
`../02-component-specs.md` entries 02–14 (homepage) and 15–23 (course) for
exact layout of each.

**Homepage:** Hero, Trust Bar, How It Works, Browse Courses, Combo Packs, Access Cards, Why Tutedude, Proof/Reviews, Newsletter (9) — the Browse Courses / Combo Packs / Access Cards sections just add a section heading + page padding around the `Browse Courses Block` / `Combo Packs Block` / `Access Cards Pair` composites from Step 6; drag those in as instances rather than rebuilding.

**Course page:** Course Hero, Course Explorer (5 tab panels), Pricing (3)

## 7.3 — Assemble 🏠 Homepage

| # | Click |
|---|---|
| 1 | Switch to `🏠 Homepage` page |
| 2 | Assets panel → drag ONE instance of each, in order: Header → Hero → Trust Bar → How It Works → Refund Flow → Browse Courses → Combo Packs → Access Cards → Why Tutedude → Proof → FAQ Accordion → Final CTA → Newsletter → Footer |
| 3 | Select all → Auto Layout, vertical, gap `0` |
| 4 | Click each instance → edit its Text properties in the right panel for real per-page copy |

## 7.4 — Assemble 📄 Course Page

Same method: Header → Course Hero → Course Explorer → Refund Flow →
Pricing → Final CTA → Newsletter → Footer. Header/Footer/Refund
Flow/Final CTA/Newsletter are the **same instances** dragged from the same
Assets panel entries as the homepage — not rebuilt.

## 7.5 — The one rule that keeps everything reusable

**Never** right-click → **Detach instance** unless it's a genuine one-off
that will never need to sync again. If something needs to look different
in one place, that's a missing **variant** or **property** — go back to
File 1 (Steps 4–5) or Step 6 above and add one instead of detaching.

**Done. Test it:** change `Button`'s corner radius in File 1, Step 4 — it
should visibly update everywhere, on both pages, instantly. That's
confirmation everything was built as real instances, not copies.

**Both files complete = all 144 items built.**
