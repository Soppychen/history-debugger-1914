# Art Delivery Status

This file tracks visual assets that were referenced by product/design expectations and their delivery status.

## Completed: I02 维也纳内部备忘录

- Surface: intel card detail image
- Data id: `I02`
- Title: `维也纳内部备忘录`
- Delivered file: `public/assets/intel-documents/intel-vienna-internal-memo.png`
- Art brief used: a 1914 Austro-Hungarian internal government memorandum scene, with archival paper, typed/handwritten annotations, Vienna ministry atmosphere, imperial seal/stamp details, and a restrained documentary style.
- Alternate filename from the original visual expansion design: `public/assets/intel-documents/intel-austrian-war-council.png`
- Delivered spec: `1536 x 1024`, `3:2`, `png`.

## Completed Intel Document Art

The original visual expansion design planned a first batch of 10 key intel document images under `public/assets/intel-documents/`. These are now delivered and mapped through `src/assets/deliveredIntelDocumentVisuals.ts`.

Delivered filenames:

- `intel-vienna-internal-memo.png`
- `intel-blank-check-telegram.png`
- `intel-british-cabinet-note.png`
- `intel-russian-mobilization-memo.png`
- `intel-serbian-reply-dossier.png`
- `intel-belgium-neutrality-treaty.png`
- `intel-german-general-staff-map.png`
- `intel-press-nationalist-headlines.png`
- `intel-hague-arbitration-file.png`
- `intel-schlieffen-risk-brief.png`

## Deferred Art Buckets

These are still deferred and should not be referenced by code until delivered:

- `public/assets/irreversible-events/`
- crisis-stage-specific backgrounds such as `bg-stage-stable.png`, `bg-stage-tense.png`, etc.
- `public/assets/card-specific/`

## Automation

Current watcher behavior:

- Check readiness: `npm run art:check-missing`
- Generate delivered intel document mappings after the files exist: `npm run art:finalize-missing`
- Watch and publish automatically: `npm run art:watch`

The current macOS development machine has a launchd watcher loaded from:

```txt
scripts/com.historydebugger.art-watch.plist
```

It checks every 60 seconds. When all required intel document groups above are ready, it will:

1. update `src/assets/deliveredIntelDocumentVisuals.ts`;
2. run `npm test`;
3. commit the selected Android/art integration files on `feature/android-capacitor`;
4. merge that branch into `main`;
5. push `main` to `origin`.

Runtime logs are written under `logs/`, which is intentionally ignored by Git.
