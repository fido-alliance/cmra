#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { OUTPUT, RESOURCES, TMP } from "./config.mjs";
import { readMakefileAndManifest, versionedBaseName } from "./manifest.mjs";

function formatReleaseDate(yyyymmdd) {
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  const date = new Date(Date.UTC(y, m - 1, d));
  const human = date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
  return { iso: `${y}-${m}-${d}`, human };
}

function stageBikeshedInputs(specs, releaseDate) {
  const bikeshed = path.join(RESOURCES, "bikeshed");

  for (const file of fs.readdirSync(bikeshed).filter((f) => f.endsWith(".include"))) {
    fs.copyFileSync(path.join(bikeshed, file), path.join(TMP, file));
  }

  const { iso, human } = formatReleaseDate(releaseDate);
  const header = fs
    .readFileSync(path.join(bikeshed, "header.include"), "utf8")
    .replaceAll("[DATE]", human)
    .replaceAll("[ISODATE]", iso);
  fs.writeFileSync(path.join(TMP, "header.include"), header);

  for (const spec of specs) {
    if (!fs.existsSync(spec)) throw new Error(`BIKESHED_FILES: ${spec} not found`);
    fs.copyFileSync(spec, stagedSpecPath(spec));
  }
}

function stagedSpecPath(spec) {
  return path.join(TMP, path.basename(spec));
}

function copySharedAssets(status) {
  console.log(`::group::copy shared assets (${status}) -> ${path.join(OUTPUT, "resources")}`);
  execFileSync(
    "make",
    [
      "-C", RESOURCES,
      "-f", ".fido-manifest.mk",
      "copy-files",
      `RELEASE_PATH=${path.resolve(OUTPUT)}`,
      `SOURCE_DIR=${path.resolve(RESOURCES)}`,
      `RELEASE_STATUS=${status}`,
    ],
    { stdio: "inherit" },
  );
  const darkBg = path.join(RESOURCES, "draft-background-dark.png");
  if (["wd", "rd", "id"].includes(status) && fs.existsSync(darkBg)) {
    fs.copyFileSync(darkBg, path.join(OUTPUT, "resources", "draft-background-dark.png"));
  }
  console.log("::endgroup::");
}

function copyLocalAssets(files) {
  for (const file of files) {
    if (!fs.existsSync(file)) throw new Error(`CP_FILES: ${file} not found`);
    const destination = path.join(OUTPUT, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(file, destination);
  }
}

function buildSpec(spec, version, status, releaseDate) {
  const staged = stagedSpecPath(spec);
  const name = path.basename(spec, ".bs");
  const output = path.join(OUTPUT, `${versionedBaseName(name, { version, status, releaseDate })}.html`);

  // --md-Status overrides the Status in the .bs, so the Makefile RELEASE_STATUS decides the status of the built doc (ribbon, boilerplate)
  console.log(`::group::bikeshed ${staged} -> ${output}`);
  execFileSync("bikeshed", ["--no-update", "spec", `--md-Status=${status.toUpperCase()}`, staged, output], {
    stdio: "inherit",
  });
  console.log("::endgroup::");
}

function publishStepOutputs(archiveName, publishPages, generatePdf) {
  console.log(`archive name: ${archiveName}`);
  console.log(`publish to GitHub Pages: ${publishPages}`);
  console.log(`generate PDF: ${generatePdf}`);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `archive=${archiveName}\npublish=${publishPages}\npdf=${generatePdf}\n`,
    );
  }
}

try {
  const { version, status, releaseDate, publishPages, generatePdf, archiveName, specs, localAssets } = readMakefileAndManifest();

  fs.mkdirSync(OUTPUT, { recursive: true });
  copyLocalAssets(localAssets);
  copySharedAssets(status);
  stageBikeshedInputs(specs, releaseDate);

  for (const spec of specs) buildSpec(spec, version, status, releaseDate);

  publishStepOutputs(archiveName, publishPages, generatePdf);
} catch (error) {
  console.error(`::error::${error.message}`);
  process.exitCode = 1;
}
