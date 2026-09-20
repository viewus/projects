# Design Tokens — copy straight into Figma styles

Source of truth: `redesign/frontend/css/tokens.css`. Values here are transcribed,
not re-derived — if you change a value, change it there first and update this
file to match.

## Colors

Create as Figma **Color Styles**, named exactly as below (the `/` creates a
folder in Figma's style picker automatically).

| Style name | Hex | Notes |
|---|---|---|
| Brand/100 | `#EADCF0` | violet tinted toward white |
| Brand/200 | `#CDACDC` | |
| Brand/300 | `#AB74C4` | = logo's light violet, sampled from the real logo |
| Brand/400 | `#955EB6` | |
| Brand/500 | `#815BB5` | **primary** — midpoint of the logo gradient |
| Brand/600 | `#684CAC` | |
| Brand/700 | `#332C99` | = logo's dark indigo, sampled from the real logo |
| Brand/800 | `#231F6B` | |
| Brand/900 | `#171445` | indigo shaded toward black |
| Ink/900 | `#14101F` | headings |
| Ink/700 | `#372F52` | body text |
| Ink/500 | `#635C7A` | secondary text |
| Ink/300 | `#A9A2C2` | placeholder / disabled |
| Surface/White | `#FFFFFF` | |
| Surface/Default | `#FBFAFF` | page background, lavender-tinted |
| Surface/Alt | `#F1EEFB` | section alt background |
| Surface/Dark | `#171445` | = Brand/900 |
| Semantic/Success-600 | `#16A34A` | |
| Semantic/Success-500 | `#22C55E` | refund / positive confirmation |
| Semantic/Success-100 | `#DCFCE7` | |
| Semantic/Teal-500 | `#14B8A6` | live doubt-solving / mentorship accent |
| Semantic/Teal-100 | `#CCFBF1` | |
| Semantic/Gold-500 | `#F5A524` | ratings / stars |
| Semantic/Danger-500 | `#EF4444` | |
| Gray/900 | `#111827` | |
| Gray/700 | `#374151` | |
| Gray/500 | `#6B7280` | |
| Gray/300 | `#D1D5DB` | |
| Gray/100 | `#F3F4F6` | |
| Divider/Default | `#14101F` at **14% opacity** | not a flat gray — set the style's opacity, don't flatten to a solid gray |

## Typography

Fonts: **Sora** (display), **Inter** (body), **Lora** (serif accent, Italic
cut), **Caveat** (script accent, SemiBold/Bold cuts) — all Google Fonts,
available in Figma's font picker with no install needed.

Create as Figma **Text Styles**. Line-height is expressed as a % (Figma's
"Line height" field set to Percent), matching the CSS multiplier × 100.

| Style name | Font | Weight | Size (mobile) | Size (tablet) | Size (desktop) | Line height |
|---|---|---|---|---|---|---|
| Display/Hero | Sora | Bold | 40px | 52px | 68px | 115% |
| Display/H1 | Sora | Bold | 32px | 40px | 48px | 115% |
| Display/H2 | Sora | Bold | 24px | 30px | 36px | 115% |
| Display/H3 | Sora | Bold | 20px | 24px | 28px | 130% |
| Body/Large | Inter | Regular | 18px | 18px | 20px | 160% |
| Body/Regular | Inter | Regular | 16px | — | — | 150% |
| Body/Small | Inter | Regular | 14px | — | — | 150% |
| Caption | Inter | Medium | 12px | — | — | 130% |
| Accent/Serif Italic | Lora | Italic | 16px | — | — | 160% |
| Accent/Script | Caveat | SemiBold | 20px | — | — | 130% |

Build each responsive size as its own text style (`Display/Hero`,
`Display/Hero - Tablet`, `Display/Hero - Desktop`) — Figma has no native
responsive text style, so three explicit styles is the correct mapping, not
a shortcut.

Weights used across the site: Regular 400, Medium 500, SemiBold 600, Bold 700.

## Spacing (4px base unit)

Use as Figma **auto-layout gap / padding** values directly — there's no
"spacing style" in Figma, so just use these numbers consistently:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120` px
(named --space-1 through --space-30 in code, 1 unit = 4px)

## Corner radius

**Capped at 4px everywhere** — nothing on the site rounds more than that,
including what were pills and circular badges before a later revision. Set
every frame/rectangle corner radius to `4px`. There is no radius scale to
build in Figma — it's one number.

## Elevation (shadows)

Create as Figma **Effect Styles**, each a stack of 1–2 drop shadows:

| Style name | Shadow 1 | Shadow 2 |
|---|---|---|
| Elevation/Shadow SM | 0 / 1 / 2 / 0, `#14101F` 6% | 0 / 1 / 3 / 0, `#14101F` 8% |
| Elevation/Shadow MD | 0 / 4 / 8 / 0, `#14101F` 8% | 0 / 2 / 4 / 0, `#14101F` 6% |
| Elevation/Shadow LG | 0 / 12 / 24 / 0, `#14101F` 10% | 0 / 4 / 8 / 0, `#14101F` 6% |
| Elevation/Shadow Hero | 0 / 24 / 48 / 0, `#5B3FE0` 16% | — |

(format: X / Y / Blur / Spread, color, alpha%)

## Layout

| Token | Value |
|---|---|
| Container max width | 1280px |
| Container medium | 960px |
| Gutter — mobile | 20px |
| Gutter — tablet | 40px |
| Gutter — desktop | 64px |
| Breakpoints | Mobile 0–767 / Tablet 768–1023 / Desktop 1024+ |
