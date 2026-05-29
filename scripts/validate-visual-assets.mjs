import { access, readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = new URL("../public/assets/", import.meta.url);

const requiredAssets = [
  "turn-events/turn-01-sarajevo-aftershock.png",
  "turn-events/turn-02-blank-check.png",
  "turn-events/turn-03-ultimatum-drafted.png",
  "turn-events/turn-04-press-agitation.png",
  "turn-events/turn-05-countdown-begins.png",
  "turn-events/turn-06-serbian-reply.png",
  "turn-events/turn-07-local-war-gate.png",
  "turn-events/turn-08-russian-mobilization-pressure.png",
  "turn-events/turn-09-timetable-takes-over.png",
  "turn-events/turn-10-german-ultimatum.png",
  "turn-events/turn-11-belgium-redline.png",
  "turn-events/turn-12-system-collapse-or-freeze.png",
  "card-illustrations/card-illo-diplomacy.png",
  "card-illustrations/card-illo-military.png",
  "card-illustrations/card-illo-media.png",
  "card-illustrations/card-illo-judicial.png",
  "card-illustrations/card-illo-intelligence.png",
  "card-illustrations/card-illo-institutional.png",
  "card-illustrations/card-illo-domestic-politics.png",
  "card-illustrations/card-illo-symbolic-politics.png",
  "card-illustrations/card-illo-international-law.png",
  "card-illustrations/card-illo-crisis-management.png",
  "card-illustrations/card-illo-war-aims.png",
  "card-illustrations/card-illo-backlash.png",
  "ending-visuals/ending-total-war.png",
  "ending-visuals/ending-delayed-war.png",
  "ending-visuals/ending-localized-war.png",
  "ending-visuals/ending-conference-freeze.png",
  "ending-visuals/ending-coercive-peace.png",
  "ending-visuals/ending-low-credibility-miracle.png",
];

const fallbackDirectories = [
  "intel-documents",
  "irreversible-events",
  "backgrounds",
  "card-specific",
];

const errors = [];
const warnings = [];

async function exists(path) {
  try {
    await access(new URL(path, ROOT));
    return true;
  } catch {
    return false;
  }
}

for (const path of requiredAssets) {
  if (!(await exists(path))) errors.push(`missing required visual asset: public/assets/${path}`);
}

const scannedReferences = await collectAssetReferences(["src", "public/data"]);
for (const [reference, files] of scannedReferences) {
  const normalized = reference.replace(/^\/assets\//, "");
  if (!(await exists(normalized))) {
    errors.push(`missing referenced visual asset: public${reference} (referenced by ${[...files].join(", ")})`);
  }
}

for (const directory of fallbackDirectories) {
  if (!(await exists(`${directory}/`))) {
    errors.push(`missing visual asset directory: public/assets/${directory}/`);
    continue;
  }
  const files = (await readdir(new URL(`${directory}/`, ROOT))).filter((name) => !name.startsWith("."));
  if (files.length === 0) {
    warnings.push(`public/assets/${directory}/ has no delivered art yet; runtime fallback should handle it`);
  }
}

if (warnings.length > 0) {
  console.warn("\nVisual asset warnings:");
  warnings.forEach((message) => console.warn(`- ${message}`));
}

if (errors.length > 0) {
  console.error("\nVisual asset validation failed:");
  errors.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("\nVisual asset validation passed:");
console.log(`- Required art files found: ${requiredAssets.length}`);
console.log(`- Referenced asset paths checked: ${scannedReferences.size}`);
console.log(`- Fallback-ready directories checked: ${fallbackDirectories.length}`);

async function collectAssetReferences(roots) {
  const references = new Map();
  const files = [];

  for (const root of roots) {
    await walk(root, files);
  }

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const regex = /["'`]((?:\/assets\/)[^"'` )]+)/g;
    let match;
    while ((match = regex.exec(source))) {
      const reference = match[1].replace(/[\\,;]+$/, "");
      if (!references.has(reference)) references.set(reference, new Set());
      references.get(reference).add(file);
    }
  }

  return references;
}

async function walk(directory, files) {
  if (!existsSync(directory)) return;
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(filePath, files);
      continue;
    }
    if (/\.(css|json|ts|tsx)$/.test(entry.name)) files.push(filePath);
  }
}
