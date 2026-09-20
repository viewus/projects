# Component specs — build order

Each entry below corresponds to a numbered screenshot pair in
`component-screenshots/desktop/` and `component-screenshots/mobile/` — open
both side by side in Figma while building that component. These are
pixel-accurate captures of the live, shipped build, not mockups — if a
screenshot and this text ever disagree, trust the screenshot.

Build in this order: it goes outside-in — shell (header/footer) first, then
homepage sections top to bottom, then course page sections top to bottom.
Reuse a master component wherever the same note says so instead of
duplicating it.

---

## 01 — Header
**Screenshot:** `01-header`
Two variants exist in code (standard / floating-on-scroll) — the capture
shows the standard, top-of-page state. Nav items, dropdown ("Courses"),
search icon, Login (with icon), and the primary "Start Your Challenge" CTA
button. On scroll the whole bar morphs into an inset glass pill (blurred,
translucent, drop shadow) — capture that state yourself by scrolling the
live page at `redesign/frontend/index.html` if you want it pixel-matched;
it's a state/variant of this same component, not a separate one.
Mobile: hamburger opens a slide-in panel with the nav list, search input,
and login/CTA stacked.

## 02 — Hero (homepage)
**Screenshot:** `02-hero`
Headline + subhead + stat row + two CTAs, real hero image right. This is
**different** from CourseHero (07) below — do not merge them into one
component; they have different data shapes and layouts.

## 03 — Trust bar
**Screenshot:** `03-trust-bar`
5 real platform stats (4.9/5 rating, 50+ courses, 100k+ learners, 100k+
doubts solved, 10k+ student projects). Reused (same visual component) inside
CourseHero for module/lesson/project counts — build ONE "Stat Item" master
component with a value+label+icon, instance it in both places.

## 04 — How it works
**Screenshot:** `04-how-it-works`
Numbered vertical timeline, 3–4 steps, connecting line between numbers.

## 05 — Refund explained
**Screenshot:** `05-refund-explained`
Dark section (Surface/Dark background). Numbered flow steps + a conditions
list. **Reused verbatim** on the course page (21) — one master component,
two instances with different copy.

## 06 — Browse courses
**Screenshot:** `06-browse-courses`
Search input + category pills (11 real categories) + level pills, above a
responsive course grid (2/3/5 columns). Each card = logo + name + category
chip + level chip only — no per-card refund badge (every course is
refundable, stated once in the section copy instead). Capped at 10 visible
with a "Show all 64 courses" toggle button.

## 07 — Combo packs
**Screenshot:** `07-combo-packs`
14 real bundle cards (Full Stack Developer, Data Scientist, AI Engineer,
Data Analyst, Business Analyst, Designer, Graphic Designer, Video Editor,
Tech Geek, App Developer, DevOps & Cloud Engineer, Cyber Security Expert,
Marketer, Finance Professional), each with a discount badge, star rating +
enrolment count, a row of the real included-course icon chips, and a CTA.
Filterable by 4 group tabs above the grid. **Distinct component from Course
Card (06)** — a bundle card, not a course card.

## 08 — Access cards
**Screenshot:** `08-access-cards`
The two headline plans (Customised Pack / All Access Pack) — richer than a
plain pricing card: icon + title + tagline + badge header, description, a
chip grid of the real courses included ending in a "+N more" chip, a
checkmark feature list, then price (with strikethrough original + discount
pill) and CTA in a footer row. All Access carries a tinted background as
the visual upsell — same component, a variant/state, not a separate one.

## 09 — Why Tutedude
**Screenshot:** `09-why-tutedude`
Feature grid, icon-box color varies per item (teal/success/gold/soft) —
build the icon tile as a variant property (Color = Teal/Success/Gold/Soft)
on one Feature Card component. **Reused verbatim** on the course page for
"What You Get" (inside 16 → Features tab).

## 10 — Proof / reviews
**Screenshot:** `10-proof-reviews`
Left: real 4.9/5 rating, 5-star row, "Google Ratings" label, real platform
counts. Right: real 17-name video-review strip (initials avatar + name +
"Student" + play icon). No written quote cards and no per-review star
rating — Tutedude only publishes video reviews with names, so don't invent
quote text or star ratings here; that would misrepresent real people's
reviews.

## 11 — FAQ
**Screenshot:** `11-faq`
Accordion, one open at a time. **Reused verbatim** on the course page (not
separately captured — same component, different question set).

## 12 — Final CTA (homepage)
**Screenshot:** `12-final-cta-homepage`
Simple centered CTA band. **Same master component** as course page's final
CTA (23) — different title/description only.

## 13 — Newsletter / Stay Ahead
**Screenshot:** `13-newsletter-stay-ahead`
Sits directly above the footer, shares its background so it reads as one
continuous area — not a separate floating card. Illustration is a single
pre-composed image (not rebuilt from parts).

## 14 — Footer
**Screenshot:** `14-footer`
Three areas: main link columns + brand, a pull-quote strip, bottom bar with
a wave graphic and social icons. Columns collapse to an accordion below
768px (see mobile capture).

---

## Course page

## 15 — Course hero
**Screenshot:** `15-course-hero`
Two-column: badge pill (course logo + label) + two-line headline (second
line in Brand/500) + subhead + 4-stat row + primary CTA + outlined secondary
CTA with a play icon + 4-item checklist, on the left. Real course photo on
the right with 3 floating feature cards overlapping its left edge (stack
below the image on mobile instead of overlapping). A 4-item trust bar with
hairline dividers spans the full width beneath both columns.

## 16–20 — Course explorer (5 tabs, one card)
**Screenshots:** `16-course-explorer-curriculum`, `17-...-features`,
`18-...-projects`, `19-...-certification`, `20-...-faqs`
**This is one component**, not five — a single white card with an icon tab
bar + persistent "Enroll Now" button at the top, one active panel below, and
a 4-item highlights strip at the bottom. Tabs are conditional: a course with
no project data simply has no Projects tab (see the catalogue-only-course
note in `component-list.md` under CourseExplorer) — build the tab bar as a
component that can hold 2–5 tab instances, not a fixed 5.

- **Curriculum tab (16):** two-pane — left sidebar lists modules (number +
  icon tile + name + topic count, active one filled Brand/500); right pane
  shows the selected module's number/title/summary, a topic-count chip, one
  row per lesson (number, title, description, Preview/Locked pill), and a
  "Key Takeaways" panel with a bulb icon + checklist + "Start This Module"
  button. Stacks to one column below 1024px.
- **Features tab (17):** reuses the Feature Grid component from 09, plus a
  "Tools You Will Use" card with real tool logos below it.
- **Projects tab (18):** numbered project cards (PROJECT 01/02/03 pill),
  title, description, skill chips.
- **Certification tab (19):** two info cards side by side (Certificate,
  Mentor) — icon + title + description each.
- **FAQs tab (20):** same FAQ Accordion component as 11, different questions.

## 21 — Course refund
**Screenshot:** `21-course-refund`
Same master component as 05, different copy — instance it, don't rebuild.

## 22 — Course pricing
**Screenshot:** `22-course-pricing`
Plain 3-up pricing grid (This Course / Combo Pack / All Access), simpler
than the Access Cards (08) — no course chips, just plan name, description,
price, and CTA. Middle card is the featured/highlighted one.

## 23 — Course final CTA
**Screenshot:** `23-course-final-cta`
Same master component as 12.

---

## Icons

27 icon glyphs, all authored as simple 2px-stroke line icons (24×24
viewBox), listed in `redesign/frontend/js/utils/icons.js`. Build each as a
small (24×24) Figma component named `Icon/<name>` so every place an icon is
used is an instance, not a pasted vector — that way a stroke-weight or style
change propagates everywhere at once. Full list: arrow, check, caret,
mentor, refund, project, lifetime, community, certificate, recorded, clock,
language, book, internship, quality, star, graduate, bulb, play, question,
lock, search, chevronLeft, chevronRight, palette, chart, code, layout,
megaphone.
