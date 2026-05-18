# Design Implementation Map

This file maps visual design concepts to the current React implementation. It is the handoff layer for future `DESIGN.md` and component visual specs.

## Style Entry Points

- `src/styles/tokens.css`: global design tokens for color, typography, spacing, radii, shadows, borders, and motion.
- `src/styles/components.css`: reusable component-state classes driven by `data-variant` and `data-status`.
- `src/styles.css`: current low-fidelity layout and page-specific styles. It should reference tokens only.
- `src/design/componentVariants.ts`: TypeScript variant/status names shared by React components and CSS selectors.

## Asset Directories

- `public/assets/icons`: line icons using `currentColor`.
- `public/assets/textures`: panel/paper texture placeholders.
- `public/assets/backgrounds`: muted map/workbench background placeholders.
- `public/assets/stamps`: report/card stamp placeholders.
- `public/assets/card-frames`: archive card frame placeholders.
- `public/assets/report`: reserved for report-specific art.

## Visual Component Map

| Visual Component | React File | Export | Variant / Status Source | CSS Surface |
| --- | --- | --- | --- | --- |
| Intervention card | `src/components.tsx` | `InterventionCard` | `InterventionCardVariant` | `.ui-card[data-variant]`, `.intervention-card` |
| Intel card | `src/components.tsx` | `IntelCard` | `IntelCardVariant` | `.ui-card[data-variant]`, `.intel-card` |
| Variable bar | `src/components.tsx` | `VariableBar` | `VariableBarStatus` | `.ui-variable-bar[data-status]` |
| Timeline node | `src/components.tsx` | `TimelineNode` | `TimelineNodeStatus` | `.ui-timeline-node[data-status]` |
| Ending report modal | `src/components.tsx` | `EndingReportModal` | `EndingReportVariant` | `.ui-ending-report[data-variant]`, `.modal` |
| Top status bar | `src/components.tsx` | `TopStatusBar` | risk stage string | `.top-status.stable/warning/critical` |
| Action result modal | `src/components.tsx` | `ActionResultModal` | action log contents | `.modal`, `.changes`, `.risk` |
| Intel detail modal | `src/components.tsx` | `IntelModal` | read modal state | `.modal`, `.tags` |
| Advance confirm modal | `src/components.tsx` | `AdvanceTurnConfirmModal` | `AdvanceTurnConfirmVariant` | `.ui-advance-confirm`, `.ui-modal[data-variant]` |
| Time advance report modal | `src/components.tsx` | `TimeAdvanceReportModal` | `TimeAdvanceReportVariant` | `.ui-time-report`, `.ui-modal[data-variant]` |

## Variant Contract

### InterventionCard

Variants live in `InterventionCardVariant` and mirror `DESIGN.md`:

- `default`: card can be selected.
- `hover`: reserved explicit hover state.
- `selected`: reserved detail/inspector focus state.
- `apInsufficient`: AP is insufficient.
- `requirementLocked`: requirements or turn window are not satisfied.
- `expiringThisTurn`: card window closes after this turn.
- `expiredMissedWindow`: reserved missed-window state.
- `used`: reserved history/discard state.
- `backlashTriggered`: reserved post-use feedback state.

### IntelCard

Variants live in `IntelCardVariant`:

- `unread`: current turn card has not been opened.
- `read`: player opened the detail modal.
- `important`: reserved priority state.
- `unlocksCard`: reserved unlock marker.
- `disputedSource`: reserved source uncertainty marker.

### VariableBar

Statuses live in `VariableBarStatus`:

- `low`: 0-39.
- `medium`: 40-69.
- `high`: 70-84.
- `critical`: 85-100.
- `increasedThisTurn`: latest delta is positive.
- `decreasedThisTurn`: latest delta is negative.
- `locked`: reserved fixed variable state.

### TimelineNode

Statuses live in `TimelineNodeStatus`:

- `past`: completed turn.
- `current`: active turn.
- `future`: upcoming turn.
- `warning`: upcoming pressure window.
- `irreversible`: reserved no-rollback marker.
- `missed`: reserved missed opportunity marker.
- `locked`: reserved for future irreversible event markers.

### EndingReportModal

Variants live in `EndingReportVariant`:

- `totalWar`
- `delayedWar`
- `localizedWar`
- `conferenceFreeze`
- `coercivePeace`
- `special`
- `fallback`

## Implementation Rule

New visual specs should first update tokens and component-state CSS. React logic should only pass semantic `variant` or `status` values; it should not hard-code colors.
