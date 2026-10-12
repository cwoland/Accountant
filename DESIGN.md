---
name: Accountant
description: A dark umber wall of printed category posters — all colour belongs to the tiles, all chrome is bone on graphite.
colors:
  ground: "#16130F"
  wall: "#1E1A15"
  wall-2: "#272118"
  wall-3: "#332B20"
  hairline: "rgba(240, 234, 224, 0.10)"
  hairline-2: "rgba(240, 234, 224, 0.18)"
  bone: "#F2EDE3"
  bone-2: "#C4BBAA"
  bone-3: "#8B8172"
  bone-4: "#5D5547"
  on-bone: "#16130F"
  ink-0: "#E8482D"
  ink-1: "#D99A1F"
  ink-2: "#1F6F4A"
  ink-3: "#13746F"
  ink-4: "#2B5CC4"
  ink-5: "#3B3B8F"
  ink-6: "#6E2E63"
  ink-7: "#B52A6B"
  ink-8: "#A2452A"
  ink-9: "#5F6B23"
  ink-10: "#44525E"
  ink-11: "#7A1F2B"
  over: "#E8482D"
  ok: "#2E9E6B"
  warn: "#D99A1F"
typography:
  display:
    fontFamily: "Unbounded, 'Golos Text', system-ui, sans-serif"
    fontSize: "clamp(44px, 13.5vw, 74px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.045em"
    fontFeature: "tabular-nums"
  headline:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.45
  meta:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.14em"
    textTransform: "uppercase"
  numeric:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontFeature: "tabular-nums"
  micro:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace"
    fontSize: "9.5px"
    fontWeight: 400
    letterSpacing: "0.02em"
rounded:
  chip: "2px"
  tile: "4px"
  sheet: "18px"
  pill: "99px"
spacing:
  pad: "16px"
  rail-gap: "10px"
  section: "26px"
components:
  poster-tile:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone}"
    rounded: "{rounded.tile}"
    width: "138px"
    padding: "10px"
  poster-spine:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone}"
    rounded: "{rounded.tile}"
    width: "146px"
    height: "66px"
    padding: "9px 11px"
  poster-spine-current:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.on-bone}"
    rounded: "{rounded.tile}"
  poster-wide:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone}"
    rounded: "{rounded.tile}"
    width: "208px"
    height: "92px"
    padding: "11px 12px"
  poster-flag:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.on-bone}"
    rounded: "{rounded.chip}"
    padding: "2px 4px"
  poster-flag-alert:
    backgroundColor: "{colors.over}"
    textColor: "{colors.bone}"
    rounded: "{rounded.chip}"
    padding: "2px 4px"
  button-bone:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.on-bone}"
    rounded: "{rounded.tile}"
    height: "42px"
    padding: "0 18px"
  button-quiet:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone-2}"
    rounded: "{rounded.tile}"
    height: "42px"
    padding: "0 18px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone-3}"
    rounded: "{rounded.tile}"
    height: "42px"
    padding: "0 18px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.over}"
    rounded: "{rounded.tile}"
    height: "42px"
    padding: "0 18px"
  capture-primary:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.on-bone}"
    rounded: "{rounded.tile}"
    height: "48px"
    padding: "0 20px"
  field-box:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone}"
    typography: "{typography.lead}"
    rounded: "{rounded.tile}"
    height: "46px"
    padding: "0 14px"
  field-label:
    textColor: "{colors.bone-3}"
    typography: "{typography.label}"
  sheet-panel:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.bone}"
    rounded: "{rounded.sheet}"
    padding: "18px 16px 22px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.bone-3}"
    rounded: "{rounded.chip}"
    padding: "9px 10px"
  nav-item-active:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.on-bone}"
    rounded: "{rounded.chip}"
    padding: "9px 10px"
  chip-quiet:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone-2}"
    rounded: "{rounded.chip}"
    height: "34px"
    padding: "0 12px"
  empty-plate:
    backgroundColor: "transparent"
    textColor: "{colors.bone-3}"
    rounded: "{rounded.tile}"
    padding: "44px 24px"
  op-mark:
    textColor: "{colors.bone}"
    rounded: "{rounded.chip}"
    size: "30px"
---

# Design System: Accountant

## Overview

**Creative North Star: "The Printed Wall"**

Money here is a catalogue you leaf through, not a dashboard you read. The app is a warm umber-graphite wall — `ground` (#16130F) with a fixed, embossed paper grain and one faint vermilion bloom at the top edge — and everything on it behaves like printed card stock pinned to that wall. Each category is a poster: a saturated ink field flooded from the bottom upward by the share it has consumed, with bone-white typography printed over it. The rejected canon is explicit and visible in the absence: there is no stack of rounded cards, no donut chart, no chart library on the critical path, no gradient-on-white surface anywhere.

The division of labour is absolute and is the thing a new contributor must not break. **Chroma belongs to posters; chrome is bone on graphite.** The interface furniture — top bar, side nav, capture bar, sheets, fields, buttons — is built from four graphite wall steps and four bone text steps, plus 1px hairlines at 10% and 18% bone. The only way a piece of chrome asserts itself is by going *lighter*: the primary action, the active account spine, the active nav row, and the user's own chat bubble are all the same opaque bone plate. Focus is a 2px bone ring, never a colour.

Density is phone-first and unapologetically tight: a 13.5px body, an 11px tracked uppercase section label, 10–12px poster padding, 16px screen gutters. The interface language is Russian throughout and labels run long — poster titles clamp to two lines, spines and wide posters to one, op names ellipsize — so every new surface must assume a label is longer than it looks in English. Motion is sparse and physical: posters lift 4px on hover, fills grow by `transform` over 0.5s on a single shared easing curve, sheets spring up from the bottom edge, and everything collapses to 0.01ms under `prefers-reduced-motion`.

**Key Characteristics:**
- Warm umber-graphite ground with fixed paper-grain noise; nothing is pure black and nothing is pure white.
- Twelve fixed category inks, indexed (`Category.ink` → `--ink-N`), applied only to posters, op marks and category pickers.
- Bone (#F2EDE3) is the accent: the primary plate, the active state, the focus ring.
- One display face (Unbounded) for one number per surface; every other number is tabular JetBrains Mono.
- Printed-card geometry: 4px tiles, 2px chips, 18px only on the sheet. No decorative pills.
- Flat in flow — depth comes from the wall ramp and hairlines; shadow exists only on detached overlays.
- One breakpoint (860px), CSS-only. No JavaScript reads the viewport.

## Colors

A warm, low-chroma graphite ground carrying a closed set of twelve high-saturation print inks and one bone highlight; every neutral is pulled toward umber (hue ~75–85 in OKLCH), so nothing in the palette reads as cold grey.

### Primary
- **Bone** (`bone`, #F2EDE3): The accent of the system, used as *light*, not as colour. It fills the one primary action per surface (capture bar, sheet submit), the active account spine, the active side-nav row, the "my message" chat bubble, the `БОЛЬШЕ ВСЕГО` / due-date flag on a poster, the Hero gauge fill, and the focus ring. A bone plate always carries `on-bone` (#16130F) text.
- **On Bone** (`on-bone`, #16130F): The only text colour permitted on a bone plate. Identical to `ground` by design — the plate reads as a window cut back to the wall.

### Secondary
The twelve category inks. They are a closed, ordered set in `shared/src/inks.ts`; the index — not the hex — is what persists in MongoDB as `Category.ink`, and `inkVar()` maps that index onto `--ink-N` with modulo wraparound, falling back to `--ink-10` for null. Never hardcode an ink hex in a component; set `--ink` via `inkStyle()` / `inkVar()` and let the CSS read it.

- **Vermilion** (`ink-0`, #E8482D) · **Ochre** (`ink-1`, #D99A1F) · **Bottle** (`ink-2`, #1F6F4A) · **Teal** (`ink-3`, #13746F) · **Cobalt** (`ink-4`, #2B5CC4) · **Indigo** (`ink-5`, #3B3B8F) · **Plum** (`ink-6`, #6E2E63) · **Magenta** (`ink-7`, #B52A6B) · **Rust** (`ink-8`, #A2452A) · **Olive** (`ink-9`, #5F6B23) · **Slate** (`ink-10`, #44525E) · **Oxblood** (`ink-11`, #7A1F2B).

An ink appears at exactly three strengths, and only these three: as a 17%-opacity ground behind an unfilled poster, at full opacity as the poster fill, and mixed into the wall (`color-mix(in srgb, var(--ink) 15–22%, …)`) for op marks and category picker tiles. Ink is never used for text, never for a border on chrome, never for a button.

### Tertiary
The status trio. These three carry meaning, so they are never the *only* carrier (see the Sign Before Colour Rule).
- **Alert Vermilion** (`over`, #E8482D): overspend, destructive intent, invalid field, unread dot, overdue flag. Shares its hex with `ink-0` but is a separate semantic token — do not collapse them.
- **Signal Green** (`ok`, #2E9E6B): on-plan status dot, income amounts.
- **Caution Ochre** (`warn`, #D99A1F): "spending faster than plan" dot, the today-marker on the gauge, the offline notice, pending invitations.

### Neutral
- **Ground Umber** (`ground`, #16130F): The wall. Body background, under the paper-grain noise and the top vermilion bloom; also the `theme-color` of the installed app.
- **Wall** (`wall`, #1E1A15): First step off the ground — sheet panel, notification panel, chat frame, ghost-button hover.
- **Wall Two** (`wall-2`, #272118): The standard inert surface — unfilled poster body, field box, quiet button, search input, op mark base, side list rows.
- **Wall Three** (`wall-3`, #332B20): Highest graphite step — gauge track, AI badge, disabled send button, scrollbar thumb, the 404 numeral.
- **Hairline** (`hairline`, 10% bone) / **Hairline Two** (`hairline-2`, 18% bone): The entire border vocabulary. 10% for dividers and resting poster edges; 18% for interactive boundaries (fields, quiet buttons, sheet edge, overlays).
- **Bone Two** (`bone-2`, #C4BBAA): Secondary text on dark — quiet-button label, icon buttons at rest, emphasised words inside Hero prose.
- **Bone Three** (`bone-3`, #8B8172): Tertiary text — section labels, field labels, sub-copy, inactive nav.
- **Bone Four** (`bone-4`, #5D5547): Quietest legible step — mono micro-meta, counts, timestamps, placeholders, grab handle.

### Named Rules
**The Poster Monopoly Rule.** All chroma belongs to the posters. If a new surface wants colour, it earns it by being a poster; chrome gets bone and the wall ramp and nothing else. Audit test: hide every `.poster`, every op mark, and every category tile — the remaining screen must be strictly graphite + bone + at most one status dot.

**The Bone Plate Rule.** The primary action is the lightest object on the screen, not the most colourful. Exactly one bone plate per interactive region (one per sheet, one per capture bar, one active nav row, one current spine). A second bone plate in the same region is a bug.

**The Sign Before Colour Rule.** Income and expense are never distinguished by colour alone. Every signed amount carries a typographic sign — `+` for income, U+2212 `−` for expense — set at the call site; overspend additionally relabels the Hero ("Перерасход" replaces "Остаток"), adds a screen-reader "минус", and only *then* turns the number vermilion.

**The Focus Is Bone Rule.** `:focus-visible` is a 2px `bone` outline at 2px offset with a 2px radius, globally. Never an ink, never a glow, never removed.

## Typography

**Display Font:** Unbounded (600/700/800, falling back to Golos Text then system-ui)
**Body Font:** Golos Text (400–900, falling back to system-ui / -apple-system)
**Number Font:** JetBrains Mono (400/500/700, falling back to ui-monospace / SF Mono)

**Character:** A geometric, slightly condensed display face used once per surface against a humanist Cyrillic-first sans that stays dense and legible at 11–15px, with every digit that isn't the hero number set in tabular mono so columns of money line up by place value. Golos Text is the choice that makes the Russian interface work; it is not interchangeable with a Latin-first grotesk.

### Hierarchy
- **Display** (Unbounded 800, `clamp(44px, 13.5vw, 74px)` → 84px ≥860px, line-height 0.92, −0.045em, tabular): The Hero amount. One per screen. The currency symbol rides at 0.42em in `bone-3` on the same baseline.
- **Headline** (Golos 800, 26px, −0.03em): Page titles (`Page`, transactions). Flush left, no kicker above it.
- **Title** (Golos 800, 20px / `--t-title`, −0.02em): Sheet titles, dialog headings.
- **Lead** (Golos 400, 15px / `--t-lead`): Field input text, EmptyPlate title size, wide-poster amount.
- **Body** (Golos 400, 13.5px / `--t-body`, line-height 1.45): Default. Op names at 600, poster titles at 800.
- **Meta** (Golos 400, 12px / `--t-meta`, line-height 1.5–1.6): Sub-copy, hints, errors, status chip. Prose caps at ~34–46ch.
- **Label** (Golos 800, 11px / `--t-label` → 12px ≥860px, +0.14em, uppercase, `bone-3`): Row headings, section headings, field labels, fieldset legends, notification panel title. Field labels and sheet legends use the slightly tighter +0.12em.
- **Numeric** (JetBrains Mono 700, 13–14px, tabular, −0.02em): Every amount outside the Hero. Available as the `.u-num` utility.
- **Micro** (JetBrains Mono 400–700, 9.5–10.5px / `--t-micro`, +0.02–0.04em): Poster meta, counts, timestamps, gauge legend, dates. Dates render uppercase through `formatDay` (`СЕГОДНЯ 14:20`, `ВЧЕРА`, `12 ОКТ`).

Weight is binary in practice: 800 for anything structural (poster titles, labels, buttons, headings) and 400–600 for running text. 700 is reserved for mono numbers and small emphatic labels. Note the one inversion: inside Hero sub-copy, `<b>` is *de*-bolded to 500 and recoloured `bone-2` — emphasis there is a colour step, not a weight step.

### Named Rules
**The One Big Number Rule.** Unbounded sets exactly one element per surface: the Hero remainder in the app, and on standalone surfaces the single display line that stands in for it (auth claim, onboarding title, the 404 numeral, the 26px brand mark). A second Unbounded element on the same screen breaks the hierarchy the whole wall is built on.

**The Tabular Number Rule.** Every number the user might compare — amounts, counts, percentages, days, times — is JetBrains Mono with `font-variant-numeric: tabular-nums`, via `--font-num` or the `.u-num` utility. Money is never rendered by hand: it is an integer `Minor` (kopecks, branded in `shared/src/money.ts`) passed through `formatMoney` / `formatAmount` / `splitMoney` at the ru-RU locale. A number formatted with string interpolation is a defect.

**The Tracked-Label Rule.** Uppercase exists in exactly two places: the 11px +0.14em tracked section label, and mono micro-meta (dates, `12 ОПЕР.`, `ПРОСРОЧЕНО`). Sentence case everywhere else — buttons, titles, body, nav all stay cased.

## Layout

The app is a single centred column, `max-width: 1240px`, that becomes a two-column CSS grid at one breakpoint.

**Mobile (default).** A stacked column. `TopBar` is sticky at the top with a `ground`-to-transparent gradient and `env(safe-area-inset-top)` padding; `CaptureBar` is fixed to the bottom with the inverse gradient and `env(safe-area-inset-bottom)` padding; the shell reserves `84px + safe-b` of bottom padding so the wall can always scroll clear of it. Each content block carries its own `padding: 0 var(--pad)` (16px) rather than the shell carrying a gutter — that is what lets rails bleed off both edges while headers stay aligned.

**Desktop (≥860px).** `--pad` re-bases to 28px, `--rail-gap` to 14px, `--t-label` to 12px, and the shell becomes `grid-template-columns: 212px 1fr` with three rows: the top bar spans both columns, the capture button and the sticky side nav occupy the left column, and `main` takes column 2 across rows 2–3. Every block that carried a mobile gutter zeroes its horizontal padding; the grid supplies the spacing instead. `CaptureBar` goes from `fixed` to `static`, the receipt-camera button is hidden (that path lives inside the capture sheet), the sheet becomes a centred 440px card, and rails grow horizontal nudge arrows positioned above their right edge.

**Rhythm.** A single spacing family: 16/28px screen gutter (`--pad`), 10/14px rail gap (`--rail-gap`), 26px between rows and sections, 18px between sheet form groups, 8–11px inside components. Posters are fixed-width in rails (138 → 168px tile; 146×66 → 184×72 spine; 208×92 → 252×100 wide) and the grid variant on list pages is `repeat(auto-fill, minmax(138px, 1fr))` → `minmax(168px, 1fr)`.

**Rails.** Horizontal `overflow-x: auto` with `scroll-snap-type: x mandatory`, snap-align start on every child, scrollbars hidden, momentum scrolling on, and ArrowLeft/ArrowRight moving focus between children. Edge state is measured with a scroll listener plus a `ResizeObserver` — never a window resize listener.

### Named Rules
**The One Breakpoint Rule.** 860px, declared in CSS only. No component branches on viewport width in JavaScript; the `useMedia` / `useIsMobile` hooks exist in `client/src/hooks/useMedia.ts` but have zero call sites, and that is deliberate — the old codebase carried six duplicate resize listeners. New responsive behaviour goes in a media query. (`AuthLayout.module.css` uses 900px for its decorative poster wall; that is the one exception in the build and should not be copied.)

**The Self-Gutter Rule.** Content blocks own their horizontal padding (`padding: 0 var(--pad)`) and zero it at ≥860px. Never add a gutter to the shell or to `main` — rails must be able to bleed past the viewport edge.

**The Thumb Reserve Rule.** The bottom `84px + safe-b` on mobile belongs to the capture bar. Anything that floats above it (the install banner sits at `76px + safe-b`) must clear it; nothing scrollable may end under it.

## Elevation & Depth

This system is flat in flow and layers tonally. Depth is built from four graphite steps (`ground` → `wall` → `wall-2` → `wall-3`), 1px bone hairlines at 10%/18%, and the fixed paper-grain noise on the body, which keeps large dark areas from reading as flat ink. No in-flow surface — poster, card, field, button, nav, list row, chat frame — has a box-shadow. The two gradients in the shell (top bar, capture bar) are not decoration; they are scrim, letting the wall scroll under sticky chrome without a hard edge.

### Shadow Vocabulary
- **Detached overlay** (`box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55)` on the notification panel; `0 16px 48px rgba(0, 0, 0, 0.5)` on the install banner): The only real shadows. Large, soft, downward, for a panel that floats free of the wall rather than resting on it. Treat the notification-panel value as the canonical one for a new overlay.
- **Modal scrim** (`background: rgba(10, 8, 6, 0.72)`): The sheet's backdrop. No blur — the grain stays visible through it.
- **Inset unread marker** (`box-shadow: inset 2px 0 0 var(--bone)`): A 2px bone bar on the left edge of an unread notification, used *in addition to* the row content, so unread state is not background-only.
- **Printed-text shadow** (`text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45)`): On poster body text only. This is legibility insurance for bone type crossing the fill boundary over twelve different ink hues — not elevation. It is removed when a spine goes bone-filled and the text flips to `on-bone`.

### Named Rules
**The Flat Wall Rule.** Surfaces that sit on the wall get a tonal step and a hairline, never a shadow. A shadow is permitted only when an element is detached from the wall (a popover, a floating banner) — and then it is large, soft, and nearly black.

**The Scrim-Not-Edge Rule.** Sticky and fixed chrome fades the wall with a `ground` gradient instead of drawing a border or a solid bar. Sticky chrome never gets a hard bottom hairline.

## Shapes

Printed card stock, cut square. `--r-tile` (4px) is the house radius: posters, buttons, fields, op marks, chat bubbles, empty plates, banners, overlay panels. `--r-chip` (2px) is for small inlaid things — icon buttons, flags, status pill, nav rows, picker chips, list rows, the focus ring. `--r-sheet` (18px) is used exactly once, on the bottom sheet's top corners (all four when it becomes a centred desktop card), and is the only soft corner in the system. Full pills (99px) are reserved for genuinely linear or handle-shaped objects: the Hero gauge track and fill, the sheet grab handle, the scrollbar thumb. Circles (50%) appear only as 6–8px dots — status, unread badge, typing indicator.

Borders are always 1px and always a bone alpha: `hairline` (10%) for dividers and resting edges, `hairline-2` (18%) for interactive edges, full `bone` for selected/current, `over` for invalid, and `color-mix(…)` of an ink for ink-tinted marks. One dashed border exists in the system, on `EmptyPlate` — dashed means "a slot waiting to be filled" and is reserved for that.

Posters have three silhouettes and no others: **tile** (3:4 portrait, the category poster), **spine** (short landscape, 146×66, the account selector), and **wide** (208×92, the "continue" item). Each is a fixed-width `<button>` with `overflow: hidden` and `isolation: isolate` so the fill can be painted edge to edge under the type.

### Named Rules
**The Square-Card Rule.** 4px is the default corner; 2px for anything inlaid; nothing between 4px and 18px exists. Reach for 18px only if you are building a sheet, and for a pill only if the object is a track, a handle, or a dot.

**The Hairline Rule.** Separation is a 1px bone-alpha line, not a shadow and not a filled divider block. Selection is the same line promoted to full `bone`.

## Components

### Posters (signature component)
The system's defining object: a fixed-size button whose face *is* its data. Structure is three stacked layers inside one clipped box — a `ground` layer (the ink at 17% opacity, the unfilled card), a `fill` layer (the ink at full opacity), and the `body` (icon, title, amount, meta) on top at `z-index: 1`.

- **Shape:** 4px radius, `wall-2` base, 1px `hairline` border, portrait 3:4 by default.
- **Fill:** driven by one custom property, `--f` (0–1, clamped in `Poster.tsx`), animated as `transform: scaleY(var(--f))` from `transform-origin: bottom` over `--dur-slow` (0.5s). A 1px 50%-bone highlight line sits on the fill's top edge and counter-scales (`scaleY(calc(1 / max(var(--f), 0.04)))`) so it stays exactly 1px at every fill level. **Never animate `height`.**
- **Ink:** read from `--ink`, set by the caller via `inkStyle(index)`; the component never picks a colour itself.
- **Type:** 12.5px/800 title clamped to two lines pushed to the bottom by `margin-top: auto`, mono 13px/700 amount under it, 9.5px mono meta at 72% bone, all under the printed-text shadow.
- **Flag:** optional top-right bone chip at 8.5px mono (`БОЛЬШЕ ВСЕГО`, `ЗАВТРА`); `flagAlert` turns it `over`/bone for overdue.
- **States:** hover and `:focus-visible` both lift `translateY(-4px)` and brighten the border to 18%; `aria-current="true"` promotes the border to full `bone`; `dimWhenNotCurrent` drops non-current siblings to 0.62 opacity and restores them on hover.
- **Spine variant:** when current, the fill becomes `bone`, the ink ground is hidden, and the body flips to `on-bone` with no text shadow — the active account reads as a solid bone plate, the same device as the primary button.
- **Semantics:** the category row's `--f` is `category.total ÷ monthly budget` — how much of the
  month's plan this category has eaten. When no budget is set the denominator falls back to the
  largest category, purely so the row still renders. Over 100% the fill caps at the tile edge and
  diagonal hatching takes over, so 101% and 300% do not look alike. The Hero gauge shows the same
  quantity for the month as a whole; the posters break it down by category.

### Buttons
- **Shape:** 4px radius (`--r-tile`), three fixed heights — 34px/12.5px (sm), 42px/14px (md), 48px/14.5px (lg) — weight 800, −0.01em, 8px icon gap.
- **Bone (primary):** opaque `bone` plate with `on-bone` text. The default variant and the only one that should appear once per region.
- **Quiet (secondary):** `wall-2` fill, `bone-2` text, 18% hairline; hover brightens text to `bone` and the border to `bone-4`.
- **Ghost (tertiary):** transparent, `bone-3` text; hover fills `wall` and brightens text.
- **Danger:** transparent with `over` text and a 40%-`over` border; hover washes 14% `over`. Destructive actions are outlined, never a filled red plate.
- **States:** `:active` scales to 0.985 (the only press feedback in the system), `:disabled` drops to 0.45 opacity, `loading` swaps the icon for a 14px `currentColor` spinner and sets `aria-busy`.
- **Capture bar:** a 48px full-width bone plate ("Записать трату", plus icon) with a 48px square quiet companion for the receipt camera on mobile; on desktop it becomes a 44px nailed-left plate and the companion is hidden.

### Fields
- **Style:** stacked label-over-box. Tracked uppercase 11px `bone-3` label, then a `wall-2` box with an 18% hairline and 4px radius containing a borderless 46px/15px input; placeholders at `bone-4`; optional mono suffix (currency symbol) inside the box on the right.
- **Focus:** the box border goes full `bone` via `:focus-within` — the same bone-means-active device as everything else. The inner input has no outline of its own.
- **Error:** border flips to `over` on `data-invalid`, with 12px `over` message text below; hints use the same size in `bone-4`.
- **Numbers:** `type="number"` and `inputmode="decimal"` inputs switch to tabular mono automatically; spinners are stripped. The capture sheet's amount field is the one deliberate enlargement — 60px tall, 26px mono.
- **Selects:** native `<select>` with appearance stripped and an inline SVG chevron in `bone-3` at right 14px.

### Sheet
- **Style:** bottom sheet on mobile — `wall` panel, 18px top corners, 18% top hairline, `max-height: 92dvh`, a 36px `bone-4` grab handle, a hairline-separated header with a 20px title and a 32px chip-radius close button, and a scrolling body padded 18/16/22. Centred 440px card with full 18px radius and no grab handle at ≥860px.
- **Motion:** scrim fades; panel springs from `y: 100%` with `stiffness: 420, damping: 38` (framer-motion) — the one spring in the system.
- **Behaviour:** `role="dialog"`, `aria-modal`, `aria-labelledby`; focus moves to the first focusable child on open, Tab cycles inside the panel, Escape closes and stops propagation, body scroll is locked, and focus returns to the opener on close. Reuse this component for anything modal; do not write a new dialog.

### Navigation
- **Top bar:** sticky, gradient-scrimmed, holding a 26px bone brand mark (Unbounded letter on bone) plus a 15px/800 wordmark, then 38px chip-radius icon buttons with 10% borders and `bone-2` glyphs. The notification button carries an 8px `over` dot ringed 2px in `ground` so it reads against any backdrop.
- **Side nav (≥860px only):** sticky at `top: 132px`, 212px column. Rows are 9/10px padded, 13.5px/600, `bone-3`; hover goes `bone` on `wall`; `aria-current="page"` becomes a bone plate with `on-bone` text. Mobile has no nav list at all — the wall's rows and the capture bar are the navigation.
- **Row header:** every wall section is a `<section aria-labelledby>` with a tracked 11px `bone-3` heading, an optional 10px mono count, and an optional right-aligned "Все →" link in `bone-2`/700/+0.06em uppercase.

### Operation list
A 30px / 1fr / auto grid per row with 11px vertical padding and a 10% hairline between rows (none after the last). The leading mark is a 2px-radius square washed with the category ink (`color-mix` 22% fill, 45% border) holding a 14px Lucide icon. Name is 13.5px/600 and ellipsizes; meta is 10.5px mono `bone-4`; the amount is right-aligned 14px mono/700 prefixed with `+` or `−` and tinted `ok` only for income.

### Icons
A closed registry, not an open set. `shared/src/icons.ts` holds `ICON_NAMES` (57 names) and `Category.icon` stores a name; `client/src/components/ui/Icon.tsx` is the single place that maps a name to a Lucide component, typed as `Record<IconName, LucideIcon>` so a name added to the registry without a component fails compilation. Unknown values (legacy rows) degrade to `circle` through `toIconName`, and `EMOJI_TO_ICON` migrates the pre-registry emoji. Default render is 16px at `strokeWidth: 2` (17px on posters, 13px at 2.6 in rail arrows), `aria-hidden` unless a `label` is passed. Emoji are banned as interface glyphs: they are system-font bitmaps that ignore `currentColor` and stroke weight, and this world needs one stroke at one weight.

### Empty states
`EmptyPlate` — a dashed 18%-hairline plate at 4px radius, 44/24px padding, centred, holding a 46px `wall-2` mark with the section's icon, a 15px/800 title, 12px `bone-3` copy capped at 34ch, and an optional action button. Its copy prop is documented as "what to do", not "nothing here yet"; keep that.

### Loading
Two skeleton families, both shimmering a `wall → wall-2 → wall` gradient at 400% width on a 1.4s loop, and both switching to a flat `wall` fill under `prefers-reduced-motion`: poster-shaped skeletons (real tile/spine dimensions, so nothing reflows when data lands) and 56px row ghosts on list pages. Spinners appear only inside buttons.

## Do's and Don'ts

### Do:
- **Do** set an ink by index: `style={inkStyle(category.ink)}` and read `var(--ink)` in CSS. The persisted integer is the contract; the hex is not.
- **Do** animate fills with `transform: scaleY` / `scaleX` on a `transform-origin` edge, and counter-scale any 1px highlight riding that edge. Never animate `height`, `width`, or `background-position` for a fill.
- **Do** keep money as `Minor` (integer kopecks, branded in `shared/src/money.ts`) end to end, and render it only through `formatMoney` / `formatAmount` / `splitMoney`. Note the type-level asymmetry when you write props: `exactOptionalPropertyTypes` is on in `shared` (it guards the DTOs) and off in `client`/`server`, with the reason commented in each tsconfig.
- **Do** pair every signed amount with its sign glyph — `+` or U+2212 `−` — and give any colour-coded state a second carrier (a word, an icon, a sign, an inset bar).
- **Do** use `Sheet` for anything modal and `Poster` for anything that represents a category, account, or pending item. Both already solve focus, labels, clamping, and fill mechanics.
- **Do** put responsive behaviour in the 860px media query, and zero a block's horizontal padding there.
- **Do** write Russian labels at realistic length and verify two-line clamping, one-line ellipsis, and `u-nowrap` on amounts before calling a surface done.
- **Do** keep uppercase to the tracked 11px label and mono micro-meta, and set every comparable number in tabular mono.
- **Do** give new chrome a tonal step plus a hairline, and let bone — not colour — mark the active or primary thing.
- **Do** honour `prefers-reduced-motion`: the global rule flattens transitions, and any JS-driven animation (framer-motion springs, shimmer) must degrade as the skeletons already do.

### Don't:
- **Don't** introduce a thirteenth category colour, reorder `INKS`, or hardcode an ink hex in a component. The array index is persisted data.
- **Don't** paint chrome with an ink — no coloured buttons, no coloured nav, no coloured borders on fields. If it isn't a poster, an op mark, or a category tile, it is graphite and bone.
- **Don't** put a second bone plate in one region, or a second Unbounded element on one screen.
- **Don't** add a box-shadow to anything that rests on the wall. Shadow is for detached overlays only; `0 18px 50px rgba(0,0,0,0.55)` is the one value to reuse.
- **Don't** reintroduce emoji as interface glyphs, or render a Lucide component outside `Icon.tsx`'s map for a category/pending icon.
- **Don't** branch on viewport width in JavaScript — no `window.innerWidth`, no resize listener, no `useIsMobile`. One CSS breakpoint at 860px.
- **Don't** add a radius between 4px and 18px, or use a 99px pill for anything that isn't a track, a handle, or a dot.
- **Don't** use colour as the sole signal of income vs. expense, overspend, or unread.
- **Don't** add an uppercase eyebrow or kicker line above a title. Page titles stand alone; the tracked 11px label is a *section* heading, not a label stuck on top of a headline. (`OnboardingPage.module.css` carries a `.kicker` that does exactly this — it is the lone instance in the build and not a pattern to extend.)
- **Don't** clamp overspend to zero, or hide a negative remainder. A negative number is information: name it ("Перерасход"), sign it, then colour it.
- **Don't** hand-format a number with template strings or render a currency symbol inline at full size — the Hero symbol is 0.42em in `bone-3` for a reason.
- **Don't** copy the op-row or shimmer CSS into a new page. `OpList` and `TransactionsPage` already duplicate it; the next one should extract a shared module instead.
