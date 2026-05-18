# AGENTS.md

## Project

This repository is for a low-fidelity playable prototype of **History Debugger: 1914 / 历史现场调试器：1914**.

The game is a historical causality debugging prototype. The player is a “historical system debugger” working through the 1914 July Crisis. The core loop is:

Read historical intel → choose intervention cards → modify variables → trigger side effects / backlash → advance turns → reach an ending → generate a historical incident report.

The first milestone is not a beautiful game. It is a working prototype that proves the loop.

## Primary Goal

Build a React + TypeScript + Vite prototype that can load the provided JSON files and run the complete 12-turn case.

The prototype must prioritize correctness of the data-driven loop over visual polish.

## Data Files

The project should use these JSON files as the source of truth:

- `variables_1914.json`
- `timeline_1914.json`
- `intervention_cards_1914.json`
- `intel_cards_1914.json`
- `endings_1914.json`
- `case_1914.json`

Do not hardcode game content into React components if it can be read from JSON.

If JSON fields appear incomplete or inconsistent, do not silently invent a new schema. Add a short note in README or TODO, and make the smallest reasonable fix.

## Required Core Loop

Implement the following before adding polish:

1. Initialize game state:
   - `turn = 1`
   - `ap = 2`
   - variables loaded from `variables_1914.json`
2. Display:
   - current turn
   - date range
   - AP
   - war probability
   - all variables
   - current turn intel cards
   - available intervention cards
3. Allow player to use intervention cards:
   - check AP
   - check requirements
   - subtract AP
   - apply effects
   - apply flags
   - unlock cards if applicable
   - check risks / backlash
   - write action log
4. Allow player to advance turn:
   - apply current turn defaultPressure
   - apply specialRules
   - reset AP
   - advance date / turn
   - check endings
5. Generate ending report:
   - ending title
   - rating
   - credibility score
   - final variables
   - key actions
   - shareLine

## Tech Stack

Use:

- React
- TypeScript
- Vite
- Zustand or a similarly lightweight state store
- Plain CSS / Tailwind CSS for low-fidelity layout

Do not add heavy UI frameworks unless necessary.

## Implementation Priorities

Priority order:

1. Data loading
2. TypeScript types
3. Game state
4. Card application logic
5. Requirement checking
6. Risk / backlash logic
7. Turn advancement
8. Ending checking
9. Basic UI
10. Debug tools
11. Visual polish

Do not start with animations, maps, or complex graph rendering.

## UI Scope

Build these components first:

- `TopStatusBar`
- `VariablePanel`
- `TimelinePanel`
- `IntelTray`
- `InterventionCardTray`
- `ActionResultModal`
- `EndingReportModal`
- optional `ActionLogPanel`
- optional `DebugPanel`

The first version may use simple cards, tables, and lists.

## Rules for Game Logic

- Clamp variable values to `0–100`.
- All variable changes should be logged.
- All card effects should come from JSON.
- All card risks should be conditionally evaluated.
- Requirements should support at minimum:
  - `turn_min`
  - `turn_max`
  - `variable_min`
  - `variable_max`
  - `flag_exists`
  - `card_used`
  - `node_active`
- Ending definitions should be evaluated by priority.
- If multiple endings match, choose the highest priority ending.

## Historical Design Constraints

This is not a fantasy rewrite tool.

The game should preserve the design principle:

> The player is not God. The player can only intervene through plausible historical mechanisms.

Avoid features that let the player arbitrarily rewrite history without constraints.

The game should communicate that:
- events are sparks,
- structures are gunpowder,
- intervention creates tradeoffs,
- solving one variable may increase another risk.

## AI Usage Constraints

Do not rely on LLM generation for the first playable prototype.

For now:
- No AI-generated facts.
- No AI-generated endings.
- No AI-generated historical claims.
- Use only the provided JSON and static text.

AI text generation can be added later as a presentation layer, not as the rules engine.

## Coding Style

- Keep logic out of React components when possible.
- Put reusable game logic in `/src/engine`.
- Put types in `/src/types`.
- Put JSON files in `/src/data`.
- Keep components small and readable.
- Prefer explicit functions over clever abstractions.
- Add comments for non-obvious game rules.

Suggested structure:

```txt
src/
  data/
  types/
  engine/
  store/
  components/
  pages/

## Testing / Validation

Before reporting completion, verify:

1. App starts with `npm run dev`.
2. JSON files load without parse errors.
3. Turn 1 displays correct initial variables.
4. C01 can be used and changes variables correctly.
5. AP decreases after using a card.
6. A card with unmet requirements is locked.
7. Risks can trigger when conditions are met.
8. Advancing a turn applies defaultPressure.
9. The game can reach turn 12.
10. At least one ending can trigger.
11. Restart resets the game.

## Debug Requirements

Add a simple debug panel or debug output if useful.

Helpful debug features:

- show current `GameState`
- export current `GameState` as JSON
- manually jump to a turn
- manually adjust variables
- force ending check

These are for prototype development and can be hidden later.

## Deliverable

When done, provide:

1. Summary of implemented features.
2. How to run locally.
3. Known limitations.
4. Any JSON/schema issues discovered.
5. Suggested next engineering step.

Do not claim the prototype is complete unless the full 12-turn loop can run.