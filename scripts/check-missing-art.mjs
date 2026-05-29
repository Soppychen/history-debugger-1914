import { access } from "node:fs/promises";
import { missingArtGroups } from "./missing-art-manifest.mjs";

const asJson = process.argv.includes("--json");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const results = [];

for (const group of missingArtGroups) {
  const existing = [];
  const missing = [];
  for (const filePath of group.anyOf) {
    if (await exists(filePath)) existing.push(filePath);
    else missing.push(filePath);
  }

  results.push({
    id: group.id,
    label: group.label,
    ready: existing.length > 0,
    selected: existing[0] ?? null,
    missing,
    acceptedPaths: group.anyOf,
  });
}

const ready = results.every((item) => item.ready);

if (asJson) {
  console.log(JSON.stringify({ ready, results }, null, 2));
} else if (ready) {
  console.log("Missing art checklist is ready.");
  for (const item of results) console.log(`- ${item.id}: ${item.selected}`);
} else {
  console.log("Missing art checklist is not ready yet.");
  for (const item of results.filter((entry) => !entry.ready)) {
    console.log(`- ${item.id} ${item.label}: waiting for one of ${item.acceptedPaths.join(", ")}`);
  }
}

process.exit(ready ? 0 : 1);
