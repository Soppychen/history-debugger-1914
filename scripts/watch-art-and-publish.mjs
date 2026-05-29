import { appendFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { missingArtGroups } from "./missing-art-manifest.mjs";

const intervalMs = Number.parseInt(getArg("--interval-ms") ?? "60000", 10);
const once = process.argv.includes("--once");
const publish = process.argv.includes("--publish");
const branch = getArg("--branch") ?? "feature/android-capacitor";
const target = getArg("--target") ?? "main";
const logFile = getArg("--log") ?? "logs/art-watch.log";
const npmBin = getArg("--npm") ?? "/usr/local/bin/npm";
const gitBin = getArg("--git") ?? "/usr/bin/git";
const commandEnv = {
  ...process.env,
  PATH: [
    "/usr/local/bin",
    "/opt/homebrew/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
    process.env.PATH ?? "",
  ].join(":"),
};

await mkdir("logs", { recursive: true });

async function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  await appendFile(logFile, `${line}\n`, "utf8");
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { allowFailure = false, ...spawnOptions } = options;
    const child = spawn(command, args, { stdio: "pipe", shell: false, env: commandEnv, ...spawnOptions });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.on("close", (code) => {
      appendFile(logFile, output, "utf8").then(() => {
        if (code === 0 || allowFailure) resolve(output);
        else reject(new Error(`${command} ${args.join(" ")} failed with code ${code}\n${output}`));
      });
    });
  });
}

async function hasReadyArt() {
  const output = await run(process.execPath, ["scripts/check-missing-art.mjs", "--json"], { allowFailure: true });
  return JSON.parse(output).ready;
}

async function finalizeAndPublish() {
  await log("All missing art files detected; starting finalize pipeline.");
  await run(process.execPath, ["scripts/finalize-missing-art.mjs"]);
  await run(npmBin, ["test"]);

  if (!publish) {
    await log("Finalize completed in dry-run mode. Re-run with --publish to commit, merge, and push.");
    return true;
  }

  await run(gitBin, ["switch", branch]);
  await run(gitBin, [
    "add",
    ".gitignore",
    "package.json",
    "package-lock.json",
    "capacitor.config.ts",
    "android",
    "docs/ANDROID_APP_TECHNICAL_PLAN.md",
    "docs/ANDROID_BUILD_RUNBOOK.md",
    "docs/CLOUD_DATA_SYNC_AND_LEADERBOARD_DESIGN.md",
    "docs/MISSING_ART_REQUESTS.md",
    "scripts/check-missing-art.mjs",
    "scripts/com.historydebugger.art-watch.plist",
    "scripts/finalize-missing-art.mjs",
    "scripts/missing-art-manifest.mjs",
    "scripts/watch-art-and-publish.mjs",
    "scripts/validate-visual-assets.mjs",
    "src/App.tsx",
    "src/assets",
    "public/assets/intel-documents",
  ]);
  await run(gitBin, ["commit", "-m", "Integrate Android shell and delivered intel art"]);
  await run(gitBin, ["switch", target]);
  await run(gitBin, ["merge", branch]);
  await run(gitBin, ["push", "origin", target]);
  await log(`Published ${branch} into ${target} and pushed to origin/${target}.`);
  return true;
}

while (true) {
  try {
    if (await hasReadyArt()) {
      await finalizeAndPublish();
      process.exit(0);
    }
    await log(`Waiting for missing art: ${missingArtGroups.length} required groups are not complete yet.`);
  } catch (error) {
    await log(error instanceof Error ? error.message : String(error));
    if (once) process.exit(1);
  }

  if (once) process.exit(1);
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}
