import { access, writeFile } from "node:fs/promises";
import { missingArtGroups } from "./missing-art-manifest.mjs";

const TARGET = "src/assets/deliveredIntelDocumentVisuals.ts";

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toAssetSrc(filePath) {
  return filePath.replace(/^public/, "");
}

function assetId(id) {
  return `${id}_delivered_document`.toLowerCase();
}

const delivered = [];
const missing = [];

for (const group of missingArtGroups) {
  let selected = null;
  for (const filePath of group.anyOf) {
    if (await exists(filePath)) {
      selected = filePath;
      break;
    }
  }

  if (!selected) {
    missing.push(group);
    continue;
  }

  delivered.push({ ...group, selected });
}

if (missing.length > 0) {
  console.error("Missing art is not complete; not updating visual mappings.");
  for (const item of missing) {
    console.error(`- ${item.id} ${item.label}: waiting for one of ${item.anyOf.join(", ")}`);
  }
  process.exit(1);
}

const lines = [
  'import type { VisualAsset } from "./visualAssetManifest";',
  "",
  "export const deliveredIntelDocumentVisuals: Record<string, VisualAsset> = {",
];

for (const item of delivered) {
  lines.push(`  ${JSON.stringify(item.id)}: {`);
  lines.push(`    id: ${JSON.stringify(assetId(item.id))},`);
  lines.push('    kind: "intel_document",');
  lines.push(`    src: ${JSON.stringify(toAssetSrc(item.selected))},`);
  lines.push(`    alt: ${JSON.stringify(`${item.label} intelligence document`)},`);
  lines.push(`    caption: ${JSON.stringify(item.label)},`);
  lines.push('    fallback: "document-placeholder",');
  lines.push("  },");
}

lines.push("};");
lines.push("");

await writeFile(TARGET, lines.join("\n"), "utf8");
console.log(`Updated ${TARGET} with ${delivered.length} delivered intel document mappings.`);
