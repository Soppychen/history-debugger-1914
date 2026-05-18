# Art Asset Integration Guide

This document tells frontend developers where to replace placeholder visuals with the new art assets from `ART_PRODUCTION_BRIEF.md`.

The assets are already in `public/assets/` and can be referenced from React as `/assets/...`.

## 1. Asset Locations

### Card Type Illustrations

Use these in card media slots and card/detail modals.

```txt
public/assets/card-illustrations/
  card-illo-diplomacy.png
  card-illo-military.png
  card-illo-media.png
  card-illo-judicial.png
  card-illo-intelligence.png
  card-illo-institutional.png
  card-illo-domestic-politics.png
  card-illo-symbolic-politics.png
  card-illo-international-law.png
  card-illo-crisis-management.png
  card-illo-war-aims.png
  card-illo-backlash.png
```

Size: `1024 x 640`.  
Display crop: use `aspect-ratio: 16 / 9; object-fit: cover;`.

### Turn Event Images

Use these in crisis briefing, current event panel, timeline detail, and time advance report.

```txt
public/assets/turn-events/
  turn-01-spark-falls.png
  turn-02-blank-check.png
  turn-03-war-in-the-text.png
  turn-04-press-faster-than-diplomacy.png
  turn-05-countdown-begins.png
  turn-06-how-much-acceptance.png
  turn-07-gate-of-local-war.png
  turn-08-mobilization-slope.png
  turn-09-timetable-takes-over.png
  turn-10-first-gate-opens.png
  turn-11-belgium-redline.png
  turn-12-system-collapse-check.png
```

Size: `1600 x 900`.  
Display crop: `aspect-ratio: 16 / 9; object-fit: cover;`.

### Ending Stamps

Use these inside `EndingReportModal`.

```txt
public/assets/stamps/
  stamp-total-war.svg
  stamp-delayed-war.svg
  stamp-localized-war.svg
  stamp-conference-freeze.svg
  stamp-coercive-peace.svg
  stamp-low-credibility-miracle.svg
```

## 2. Recommended Mapping File

Create a small mapping file instead of hardcoding asset paths in components.

Suggested path:

```txt
src/design/artAssets.ts
```

Suggested content:

```ts
export const cardTypeIllustrationMap: Record<string, string> = {
  diplomacy: "/assets/card-illustrations/card-illo-diplomacy.png",
  military: "/assets/card-illustrations/card-illo-military.png",
  media: "/assets/card-illustrations/card-illo-media.png",
  judicial: "/assets/card-illustrations/card-illo-judicial.png",
  intelligence: "/assets/card-illustrations/card-illo-intelligence.png",
  institutional: "/assets/card-illustrations/card-illo-institutional.png",
  domestic_politics: "/assets/card-illustrations/card-illo-domestic-politics.png",
  symbolic_politics: "/assets/card-illustrations/card-illo-symbolic-politics.png",
  international_law: "/assets/card-illustrations/card-illo-international-law.png",
  crisis_management: "/assets/card-illustrations/card-illo-crisis-management.png",
  war_aims: "/assets/card-illustrations/card-illo-war-aims.png",
  backlash: "/assets/card-illustrations/card-illo-backlash.png",
};

export const turnEventImageMap: Record<number, string> = {
  1: "/assets/turn-events/turn-01-spark-falls.png",
  2: "/assets/turn-events/turn-02-blank-check.png",
  3: "/assets/turn-events/turn-03-war-in-the-text.png",
  4: "/assets/turn-events/turn-04-press-faster-than-diplomacy.png",
  5: "/assets/turn-events/turn-05-countdown-begins.png",
  6: "/assets/turn-events/turn-06-how-much-acceptance.png",
  7: "/assets/turn-events/turn-07-gate-of-local-war.png",
  8: "/assets/turn-events/turn-08-mobilization-slope.png",
  9: "/assets/turn-events/turn-09-timetable-takes-over.png",
  10: "/assets/turn-events/turn-10-first-gate-opens.png",
  11: "/assets/turn-events/turn-11-belgium-redline.png",
  12: "/assets/turn-events/turn-12-system-collapse-check.png",
};

export const endingStampMap: Record<string, string> = {
  total_war: "/assets/stamps/stamp-total-war.svg",
  delayed_war: "/assets/stamps/stamp-delayed-war.svg",
  localized_war: "/assets/stamps/stamp-localized-war.svg",
  conference_freeze: "/assets/stamps/stamp-conference-freeze.svg",
  coercive_peace: "/assets/stamps/stamp-coercive-peace.svg",
  low_credibility_miracle: "/assets/stamps/stamp-low-credibility-miracle.svg",
};

export function getCardIllustration(type: string | string[] | undefined): string {
  const key = Array.isArray(type) ? type[0] : type;
  return key ? cardTypeIllustrationMap[key] ?? cardTypeIllustrationMap.intelligence : cardTypeIllustrationMap.intelligence;
}

export function getTurnEventImage(turn: number): string {
  return turnEventImageMap[turn] ?? turnEventImageMap[1];
}

export function getEndingStamp(type: string): string {
  return endingStampMap[type] ?? endingStampMap.total_war;
}
```

## 3. Where To Replace Images

### `InterventionCard`

File:

```txt
src/components.tsx
```

Current component:

```tsx
export function InterventionCard(...)
```

Add a media slot near the top, after `.intervention-card__topline` and before the card title.

Example:

```tsx
import { getCardIllustration } from "./design/artAssets";

const illustration = getCardIllustration(props.card.type);

<div className="card-media">
  <img src={illustration} alt="" loading="lazy" />
</div>
```

CSS:

```css
.card-media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-panel-sunken);
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

### `IntelCard`

Current component:

```tsx
export function IntelCard(...)
```

Use `props.card.type` with the same `getCardIllustration()` helper.

Place the media slot below `.intel-card__header` and before the title.

If an intel type does not map cleanly, fallback to:

```txt
/assets/card-illustrations/card-illo-intelligence.png
```

### `CardDetailModal`

Current component:

```tsx
export function CardDetailModal(...)
```

Add a larger image under the title.

```tsx
<img
  className="modal-hero-image"
  src={getCardIllustration(props.card.type)}
  alt=""
/>
```

CSS:

```css
.modal-hero-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid var(--color-border-subtle);
}
```

### `IntelModal`

Current component:

```tsx
export function IntelModal(...)
```

Use the same `modal-hero-image` pattern:

```tsx
<img
  className="modal-hero-image"
  src={getCardIllustration(intel.type)}
  alt=""
/>
```

### Current Event Panel

File:

```txt
src/App.tsx
```

Current area:

```tsx
<section className="event-panel">
```

Add the current turn image near the top, after the panel header.

```tsx
import { getTurnEventImage } from "./design/artAssets";

<img
  className="event-hero-image"
  src={getTurnEventImage(state.turn)}
  alt=""
/>
```

CSS:

```css
.event-hero-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-panel-sunken);
}
```

### `TimelineNode` Detail Or Hover

Current component:

```tsx
export function TimelineNode(...)
```

Do not put a full image in every visible timeline row; it will make the rail too heavy. Recommended options:

- Show image only in a selected timeline detail panel.
- Show image in a tooltip/popover on click.
- Show a tiny thumbnail only if the timeline panel has enough width.

Use:

```tsx
getTurnEventImage(props.turn.turn)
```

### `TurnBriefingModal`

Current component:

```tsx
export function TurnBriefingModal(...)
```

Add a hero image under the heading:

```tsx
<img
  className="modal-hero-image"
  src={getTurnEventImage(props.currentTurn.turn)}
  alt=""
/>
```

### `TimeAdvanceReportModal`

Current component currently receives `turnTitle`, but not `turn`.

Recommended change:

```ts
export function TimeAdvanceReportModal(props: {
  action: ActionLogEntry;
  turn: number;
  turnTitle: string;
  ...
})
```

Then add:

```tsx
<img
  className="modal-hero-image"
  src={getTurnEventImage(props.turn)}
  alt=""
/>
```

### `EndingReportModal`

Current placeholder:

```tsx
<div className="report-stamp" aria-hidden="true">{variant === "totalWar" ? "FAILED" : "REPORT"}</div>
```

Replace with:

```tsx
import { getEndingStamp } from "./design/artAssets";

<img
  className="report-stamp-image"
  src={getEndingStamp(props.ending.type)}
  alt=""
  aria-hidden="true"
/>
```

CSS:

```css
.report-stamp-image {
  width: min(220px, 38vw);
  height: auto;
  opacity: .86;
  pointer-events: none;
}
```

## 4. Optional JSON Integration

You can avoid mapping for turn images by adding an `image` field to each `TimelineTurn`.

Type update:

```ts
export interface TimelineTurn {
  turn: number;
  dateRange: string;
  title: string;
  image?: string;
  ...
}
```

JSON example:

```json
{
  "turn": 5,
  "title": "倒计时开始",
  "image": "/assets/turn-events/turn-05-countdown-begins.png"
}
```

For this prototype, the mapping file is safer because it does not require modifying source data.

## 5. Motion Integration

Reference file:

```txt
public/assets/motion-guidelines.css
```

Recommended implementation:

- Copy useful keyframes into `src/styles.css`, or import the file if the build setup allows CSS from `public`.
- Use motion classes only on state changes.
- Keep `prefers-reduced-motion` behavior.

Suggested mapping:

| Game event | CSS class |
| --- | --- |
| Card expiring this turn | `.motion-card-expiring` |
| Backlash triggered | `.motion-card-backlash` |
| Irreversible node triggered | `.motion-node-irreversible` |
| Variable changed | `.motion-variable-delta` |
| Turn advanced | `.motion-time-advance` |
| Ending report appears | `.motion-ending-stamp` |

## 6. Fallback Rules

If an image is missing:

- Do not crash the page.
- Use a CSS fallback background.
- Show the relevant icon.
- Show the type name or turn title.
- Log a warning once in development.

Suggested fallback:

```tsx
function AssetImage(props: { src: string; className: string; fallbackLabel: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`${props.className} asset-fallback`}>{props.fallbackLabel}</div>;
  return <img className={props.className} src={props.src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
```

## 7. Acceptance Checklist

- `InterventionCard` shows a type illustration.
- `IntelCard` shows a type illustration.
- `CardDetailModal` and `IntelModal` show larger illustrations.
- The current event panel shows the current turn image.
- `TurnBriefingModal` shows the current turn image.
- `TimeAdvanceReportModal` shows the advanced turn image.
- `EndingReportModal` uses the correct SVG stamp.
- Images use `object-fit: cover` and do not cover text.
- Missing images have fallback.
- Motion is CSS-based and respects reduced motion.

