import { execFileSync } from "node:child_process";
import fs from "node:fs";

function readMakeVars(file, names) {
  const assignments = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => new RegExp(`^(${names.join("|")})\\s*[:?+]?=`).test(line));
  const printer = [".PHONY: print-vars", "print-vars:", ...names.map((n) => `\t@echo ${n}=$(${n})`)];
  const output = execFileSync("make", ["-s", "-f", "-", "print-vars"], {
    input: [...assignments, ...printer].join("\n") + "\n",
    encoding: "utf8",
  });
  return Object.fromEntries(output.trim().split("\n").map((line) => line.split(/=(.*)/s).slice(0, 2)));
}

const isYes = (value) => ["yes", "true"].includes((value ?? "").trim().toLowerCase());

// Read release settings from the Makefile and the file lists from .fido-manifest.mk
export function readMakefileAndManifest() {
  const required = ["RELEASE_VERSION", "RELEASE_STATUS", "RELEASE_DATE"];
  const makefile = readMakeVars("Makefile", [...required, "SPECSET_NAME", "PUBLISH_PAGES", "GENERATE_PDF"]);
  const manifest = readMakeVars(".fido-manifest.mk", ["BIKESHED_FILES", "CP_FILES"]);

  for (const name of required) {
    if (!makefile[name]) throw new Error(`${name} is not set in the Makefile`);
  }
  if (!/^\d{8}$/.test(makefile.RELEASE_DATE)) {
    throw new Error(`RELEASE_DATE must be YYYYMMDD, got "${makefile.RELEASE_DATE}"`);
  }

  const specs = manifest.BIKESHED_FILES.split(/\s+/).filter(Boolean);
  if (specs.length === 0) throw new Error("No BIKESHED_FILES found in .fido-manifest.mk");

  const version = makefile.RELEASE_VERSION;
  const status = makefile.RELEASE_STATUS.toLowerCase();
  const releaseDate = makefile.RELEASE_DATE;

  return {
    version,
    status,
    releaseDate,
    publishPages: isYes(makefile.PUBLISH_PAGES),
    generatePdf: isYes(makefile.GENERATE_PDF),
    archiveName: ["fido", makefile.SPECSET_NAME, `v${version}-${status}-${releaseDate}`].filter(Boolean).join("-"),
    specs,
    localAssets: manifest.CP_FILES.split(/\s+/).filter(Boolean),
  };
}

export function versionedBaseName(name, { version, status, releaseDate }) {
  return `${name}-v${version}-${status}-${releaseDate}`;
}
