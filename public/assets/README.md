# History Debugger: 1914 Asset Batch 01

All filenames follow `DESIGN.md`: English lowercase plus hyphens.

## Production Brief Content Art

Generated from `ART_PRODUCTION_BRIEF.md`.

Manifest: `public/assets/production-brief-manifest.md`

### Card Type Illustrations

Path: `public/assets/card-illustrations/`

- 12 PNG files.
- Required size: `1024 x 640`.
- Intended display crop: `320 x 180`, `240 x 135`, or other 16:9 card media slots.

### Turn Event Images

Path: `public/assets/turn-events/`

- 12 PNG files.
- Required size: `1600 x 900`.
- Intended for crisis briefing, time advance report, timeline detail, and ending recap.

### Motion Guidelines

Reference CSS: `public/assets/motion-guidelines.css`

These effects should be implemented in CSS rather than as rendered image sequences:

- `card-expiring`
- `card-backlash`
- `node-irreversible`
- `variable-delta`
- `time-advance`
- `ending-stamp`

## Icons

Path: `public/assets/icons/`

- `icon-event.svg`
- `icon-intel.svg`
- `icon-risk.svg`
- `icon-lock.svg`
- `icon-backlash.svg`
- `icon-alert.svg`
- `icon-time-advance.svg`
- `icon-action-point.svg`
- `icon-ending.svg`

Implementation notes:

- Icons use `currentColor`; set color from CSS state classes.
- Use 16px, 20px, or 24px display sizes.
- Do not communicate warning states with color alone; keep labels/tooltips.

## Textures

Path: `public/assets/textures/`

- `texture-paper-aged.jpg`
- `texture-panel-grain.png`
- `texture-map-noise.png`

Implementation notes:

- `texture-paper-aged.jpg`: card/report paper surface.
- `texture-panel-grain.png`: dark panel overlay at low opacity.
- `texture-map-noise.png`: old-map noise overlay at low opacity.

## Backgrounds

Path: `public/assets/backgrounds/`

- `bg-archive-map-europe.png`
- `bg-main-crisis-room.png`

Implementation notes:

- Use as low-contrast backgrounds behind UI panels.
- Apply dark overlay in CSS when text appears above them.

## Stamps

Path: `public/assets/stamps/`

- `stamp-total-war.svg`
- `stamp-delayed-war.svg`
- `stamp-localized-war.svg`
- `stamp-conference-freeze.svg`
- `stamp-coercive-peace.svg`

Implementation notes:

- Stamps are SVG and include bilingual text.
- Use inside `EndingReportModal` according to ending type.

## Card Frames / State References

Path: `public/assets/card-frames/`

- `card-frame-intervention-default.svg`
- `card-frame-intervention-selected.svg`
- `card-frame-intervention-locked.svg`
- `card-frame-intervention-expiring.svg`
- `card-frame-intervention-expired.svg`
- `card-frame-intervention-backlash.svg`
- `card-frame-intel-unread.svg`
- `card-frame-intel-read.svg`
- `card-frame-intel-important.svg`

Implementation notes:

- These are frame/reference assets for state styling, not a requirement to use image backgrounds for every card.
- Prefer CSS for dynamic state treatments: hover lift, selected outline, disabled opacity, AP shortage badge, delta flash, risk pulse, and `prefers-reduced-motion`.
- Use SVG frames only where a reusable decorative frame is actually helpful.
