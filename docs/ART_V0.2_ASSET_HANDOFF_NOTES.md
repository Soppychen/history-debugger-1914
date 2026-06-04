# v0.2 Art Asset Handoff Notes

Role: Art 2  
Date: 2026-06-04  
Related design doc: `docs/V0.2_CRISIS_PRESSURE_AND_REVIEW_DESIGN.md`

This document is an art-side handoff note for Product and Engineering. It does not replace the v0.2 design document. Please add questions, decisions, and implementation notes directly in the feedback sections below.

## Product Manager Review

Product Manager opinion, 2026-06-04:

I agree with the overall art-side proposal. The asset plan is aligned with the v0.2 product goal: make the July Crisis feel like a tightening historical system, not a larger war-content expansion.

The most important product correction is scope control:

- Irreversible node images, event type icons, and the `IRREVERSIBLE` stamp are v0.2 core assets.
- Intel templates are useful, but they should be treated as fallback/runtime assets only if Engineering can wire them with a small resolver. They should not delay irreversible node work.
- Countdown should not become a separate historical event type. It is a UI urgency marker applied to events or cards whose intervention window is closing.
- Images should not contain long readable text. Actual historical wording, variable effects, and consequences must remain in UI/data so localization, readability, and historical accuracy stay controllable.

Priority order from Product:

1. 6 irreversible node PNGs
2. `stamp-irreversible.svg`
3. 7 event type SVG icons
4. 3 UI state SVG icons
5. 4 intel fallback template PNGs

## Art 2 Response

Art 2 opinion, 2026-06-04:

I agree with the Product Manager direction and priority order.

Art has delivered the full v0.2 asset batch listed below:

- 6 irreversible node PNGs in `public/assets/irreversible-events/`
- `public/assets/stamps/stamp-irreversible.svg`
- 7 event type SVG icons in `public/assets/icons/`
- 3 UI state SVG icons in `public/assets/icons/`
- 4 intel fallback template PNGs in `public/assets/intel-documents/`

Validation status:

```txt
npm run validate:visuals
```

Result: passed.

Remaining visual warning is for `public/assets/card-specific/`, which is outside this v0.2 handoff batch.

Engineering can now wire the delivered assets in this order:

1. `irreversibleEventVisuals`
2. event type icon mapping
3. `stamp-irreversible.svg`
4. intel template fallback resolver

## 1. Current Read

Based on the current repository state:

- v0.2 data files already exist:
  - `public/data/crisis_events_1914.json`
  - `public/data/irreversible_nodes_1914.json`
- 12 turn crisis images already exist in `public/assets/turn-events/`.
- 12 card type illustrations already exist in `public/assets/card-illustrations/`.
- 10 specific intel document images already exist in `public/assets/intel-documents/`.
- 6 ending visuals already exist in `public/assets/ending-visuals/`.
- Ending stamps already exist in `public/assets/stamps/`.
- The folder `public/assets/irreversible-events/` exists but currently has no delivered irreversible node art.
- The current icon set has general icons, but not the 7 v0.2 event-type icons listed by Product.

## 2. Assets Art Can Produce In Parallel

### 2.1 Irreversible Node Images

Suggested format:

- PNG
- `1600 x 900`
- Dark archive collage style
- No important information near the extreme edges
- Minimal readable text inside the image
- Let UI overlay the title, effects, and `IRREVERSIBLE` stamp

Target files:

```txt
public/assets/irreversible-events/irreversible-ultimatum-sent.png
public/assets/irreversible-events/irreversible-serbian-rejection.png
public/assets/irreversible-events/irreversible-austria-declares-war.png
public/assets/irreversible-events/irreversible-russian-general-mobilization.png
public/assets/irreversible-events/irreversible-german-ultimatum.png
public/assets/irreversible-events/irreversible-belgium-path-open.png
```

Suggested mapping:

```txt
ultimatum_sent -> irreversible-ultimatum-sent.png
serbian_core_rejection -> irreversible-serbian-rejection.png
austria_declares_war -> irreversible-austria-declares-war.png
russian_general_mobilization -> irreversible-russian-general-mobilization.png
german_ultimatum -> irreversible-german-ultimatum.png
belgium_path_open -> irreversible-belgium-path-open.png
```

### 2.2 Intel Template Images

Suggested format:

- PNG
- `1200 x 800`
- Designed as reusable fallback/document templates
- Avoid clear long text, because UI should provide actual content

Target files:

```txt
public/assets/intel-documents/template-diplomatic-telegram.png
public/assets/intel-documents/template-newspaper-clipping.png
public/assets/intel-documents/template-cabinet-minutes.png
public/assets/intel-documents/template-secret-dossier.png
```

### 2.3 Event Type Icons

Suggested format:

- SVG
- `64 x 64` viewBox
- Use `currentColor`
- Legible at `16px`, `20px`, and `24px`
- Do not rely on color alone to express warning state

Proposed files:

```txt
public/assets/icons/icon-event-countdown.svg
public/assets/icons/icon-event-diplomatic-window.svg
public/assets/icons/icon-event-ultimatum.svg
public/assets/icons/icon-event-mobilization.svg
public/assets/icons/icon-event-media-pressure.svg
public/assets/icons/icon-event-irreversible.svg
public/assets/icons/icon-event-war-threshold.svg
```

Suggested mapping:

```txt
countdown UI marker -> icon-event-countdown.svg
diplomatic_window -> icon-event-diplomatic-window.svg
ultimatum -> icon-event-ultimatum.svg
mobilization -> icon-event-mobilization.svg
media_pressure -> icon-event-media-pressure.svg
irreversible -> icon-event-irreversible.svg
war_threshold -> icon-event-war-threshold.svg
```

### 2.4 UI State Assets

Suggested format:

- SVG
- Use `currentColor` when possible
- Stamp can use fixed red if Engineering prefers direct asset styling

Proposed files:

```txt
public/assets/icons/icon-red-lock.svg
public/assets/icons/icon-countdown-marker.svg
public/assets/icons/icon-window-closed.svg
public/assets/stamps/stamp-irreversible.svg
```

## 3. Engineering Integration Notes

These are not art blockers, but the assets will not fully appear in game until these are wired.

### 3.1 Irreversible Images

Current code has:

```ts
export const irreversibleEventVisuals: Record<string, VisualAsset> = {};
```

Suggested follow-up:

- Add entries for all 6 irreversible node ids in `src/assets/visualAssetManifest.ts`.
- Optionally add the 6 files to `scripts/validate-visual-assets.mjs` once art is committed.

### 3.2 Intel Templates

Current behavior:

- Specific intel images are already mapped through `deliveredIntelDocumentVisuals`.
- If an intel card has no specific image, it currently falls back to card-type illustration logic.

Open integration decision:

- Should the 4 template files become actual fallback images based on intel type?
- Or are they only production templates/reference art?

If they should appear in game, Engineering likely needs a small template resolver.

### 3.3 Event Type Icons

Current `UpcomingCrisisEvents` UI appears to show event title, date, risk summary, and variables, but not a dedicated `eventType` icon.

Suggested follow-up:

- Include `eventType` in the event data passed to `UpcomingCrisisEvents`.
- Add a mapping from crisis event type to icon asset.
- Decide whether countdown is its own icon-only UI marker or a new event type.

### 3.4 UI State Assets

Some card and timeline states are already handled with CSS and existing frames. Please decide which of these should be image assets versus CSS treatments:

- Red lock
- Countdown marker
- Window closed marker
- `IRREVERSIBLE` stamp

Art recommendation:

- Use SVG assets for semantic symbols and stamp overlays.
- Keep pulses, gray-out, and transition states in CSS.

## 4. Art Direction Notes

Use:

- Archive room
- Old Europe map
- Diplomatic telegram
- Typewritten documents
- Red warning line
- Military timetable
- Investigation report
- Official stamp
- Controlled crisis atmosphere

Avoid:

- Hero portraits
- War spectacle
- Entertainment-like battlefield scenes
- Bright victory UI
- Heavy fantasy or sci-fi styling
- Long readable fake text inside generated images
- Large red areas that make the UI feel like an alarm screen all the time

The desired feeling is not "war poster"; it is "historical incident file becoming harder to revise."

## 5. Questions For Product

Please answer directly below each item.

1. Should irreversible node images be `1600 x 900 PNG` like turn event images?

Product answer:

Yes. Product Manager opinion: use `1600 x 900 PNG` for all irreversible node images. This matches the existing turn-event image direction and gives Engineering predictable modal and report crops.

Safe-space requirement: keep the central subject readable, but reserve roughly 12% margin on all edges for mobile crop, modal padding, stamps, and UI overlays.

2. Should the `IRREVERSIBLE` stamp be bilingual, English-only, or symbol-first?

Product answer:

Product Manager opinion: use symbol-first plus English.

Recommended stamp text:

```txt
IRREVERSIBLE
```

Optional smaller secondary text, if legible:

```txt
NODE LOCKED
```

Do not make the stamp bilingual in the asset. Chinese explanatory text should stay in UI copy. Reason: bilingual stamp text will become crowded at small sizes and harder to reuse across desktop/mobile states.

## 6. Engineering Implementation Notes

Engineering update, 2026-06-04:

- The filenames in this document are now treated as canonical v0.2 asset paths.
- `src/assets/visualAssetManifest.ts` now contains mappings for:
  - all 6 irreversible node images;
  - `public/assets/stamps/stamp-irreversible.svg`;
  - v0.2 event type SVG icons;
  - UI state icons for countdown, red lock, and window closed;
  - 4 intel fallback templates.
- Runtime behavior remains fallback-safe:
  - Delivered assets render normally.
  - Missing planned v0.2 assets fall back to CSS/UI placeholders.
  - Historical explanations, variable effects, and node consequences stay in UI/JSON, not inside images.
- `scripts/validate-visual-assets.mjs` now treats planned v0.2 assets as warn-only until art is delivered.
- Countdown is implemented only as a UI urgency marker for closing windows and expiring cards. It is not a `CrisisEvent.eventType`.
- The `IRREVERSIBLE` stamp asset is expected to be English-first. Chinese explanation remains in modal/report UI.

3. Is "countdown" a separate event type, or only a UI state marker for events/cards whose window is closing?

Product answer:

Product Manager opinion: countdown is a UI state marker, not a separate event type.

Event types should remain semantic historical/system categories:

```txt
diplomatic_window
ultimatum
mobilization
media_pressure
irreversible
war_threshold
```

`icon-event-countdown.svg` is still useful, but it should mark urgency states such as:

- event triggers in 1 turn
- intervention window closes this turn
- card is expiring

It should not replace the underlying event type icon.

4. Should the 4 intel templates appear in game as fallback art, or are they only source templates for future specific intel images?

Product answer:

Product Manager opinion: they should appear in game as fallback art, but this is P1, not P0.

Desired behavior:

- If an intel card has a specific image, use the specific image.
- If no specific image exists, use a template based on intel type.
- If no type template exists, fall back to current card-type illustration/CSS fallback.

This helps avoid visually empty intel cards while preserving the rule that factual text comes from JSON/UI, not from embedded art.

5. Should irreversible node images contain visible text, or should text stay entirely in UI overlays?

Product answer:

Product Manager opinion: keep meaningful text in UI overlays.

Images may contain short atmospheric fragments such as stamps, dates, map labels, telegram lines, or blurred document blocks, but should avoid long readable fake text. The title, historical explanation, variable effects, locked cards, and system commentary must stay in data-driven UI.

## 6. Questions For Engineering

Please answer directly below each item.

1. Are the proposed file names acceptable for direct integration?

Engineering answer:

Product Manager opinion:

The proposed names are acceptable and should be treated as the canonical v0.2 naming set unless Engineering finds a path conflict. Keeping exact filenames will reduce handoff friction.

2. Should Art add `stamp-irreversible.svg` under `public/assets/stamps/`, or should it live under `public/assets/icons/`?

Engineering answer:

Product Manager opinion:

Use:

```txt
public/assets/stamps/stamp-irreversible.svg
```

Reason: this is a semantic report/node stamp, not a generic UI icon. It belongs with the existing ending and card stamps.

3. Should `scripts/validate-visual-assets.mjs` treat the new assets as required immediately, or only after the first art batch lands?

Engineering answer:

Product Manager opinion:

Do not make the new art batch required until the files land. Add validation in two phases:

1. Before delivery: warn-only for missing v0.2 assets.
2. After delivery and integration: required validation for canonical irreversible images, event icons, and `stamp-irreversible.svg`.

This prevents blocking unrelated game work while still making the final handoff enforceable.

4. Will Engineering wire `irreversibleEventVisuals`, event type icon mapping, and optional intel template fallback?

Engineering answer:

Product Manager opinion:

Engineering should wire these in this order:

1. `irreversibleEventVisuals`
2. event type icon mapping
3. `stamp-irreversible.svg`
4. optional intel template fallback

Intel template fallback is useful, but it should not block v0.2 if irreversible node presentation is not yet complete.

5. Are there crop constraints for mobile modals that Art should reserve safe space for?

Engineering answer:

Product Manager opinion:

Yes. Use a conservative safe space:

- Keep essential visual information inside the central 76% of the canvas.
- Avoid important text or symbolic details within the outer 12% edge margin.
- Assume mobile modals may crop from the sides or overlay title/stamp/buttons near edges.
- Avoid tiny details that only read at desktop width.

## 7. Proposed Next Step

Art can start with the following batch after Product and Engineering confirm the questions above:

```txt
6 irreversible node PNGs
4 intel template PNGs
7 event type SVG icons
3 UI state SVG icons
1 irreversible stamp SVG
```

After the batch lands, Engineering should wire the assets and run:

```txt
npm run validate:visuals
```

Then Art should review in-game screenshots for crop, contrast, and state readability.
