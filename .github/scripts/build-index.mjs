#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { OUTPUT } from "./config.mjs";
import { readMakefileAndManifest, versionedBaseName } from "./manifest.mjs";

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function readTitle(htmlFile, fallback) {
  const match = fs.readFileSync(htmlFile, "utf8").match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : fallback;
}

function publishSpec(spec, release) {
  const name = path.basename(spec, ".bs");
  if (name === "index") throw new Error(`${spec}: "index" is reserved for the generated index page`);

  const versioned = versionedBaseName(name, release);
  const htmlFile = path.join(OUTPUT, `${versioned}.html`);
  const pdfFile = path.join(OUTPUT, `${versioned}.pdf`);
  if (!fs.existsSync(htmlFile)) throw new Error(`${htmlFile} not found, was it built?`);

  const title = readTitle(htmlFile, name);
  fs.renameSync(htmlFile, path.join(OUTPUT, `${name}.html`));

  const hasPdf = fs.existsSync(pdfFile);
  if (hasPdf) fs.renameSync(pdfFile, path.join(OUTPUT, `${name}.pdf`));
  else if (release.generatePdf) console.warn(`::warning::${pdfFile} not found, ${name} will have no PDF link`);

  return { name, title, hasPdf };
}

function renderIndex(entries, { version, status, releaseDate }) {
  const label = `v${version} ${status.toUpperCase()}`;
  const rows = entries
    .map(
      ({ name, title, hasPdf }) => `      <tr>
        <td>${escapeHtml(title)} <span class="meta">${escapeHtml(label)}</span></td>
        <td><a href="${name}.html">HTML</a></td>
        <td>${hasPdf ? `<a href="${name}.pdf">PDF</a>` : ""}</td>
      </tr>`,
    )
    .join("\n");

  const { GITHUB_SHA, GITHUB_REPOSITORY, GITHUB_SERVER_URL } = process.env;
  const source = GITHUB_SHA
    ? ` from <a href="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA}">${GITHUB_SHA.slice(0, 7)}</a>`
    : "";
  const date = `${releaseDate.slice(0, 4)}-${releaseDate.slice(4, 6)}-${releaseDate.slice(6, 8)}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Documents</title>
  <style>
    :root { color-scheme: light dark; }
    body { font: 16px/1.5 system-ui, sans-serif; max-width: 52rem; margin: 2rem auto; padding: 0 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid #8884; }
    .meta { margin-left: .5rem; font-size: .875rem; opacity: .7; white-space: nowrap; }
    footer { margin-top: 2rem; font-size: .875rem; opacity: .75; }
  </style>
</head>
<body>
  <h1>Documents</h1>
  <table>
    <thead>
      <tr><th>Document</th><th>HTML</th><th>PDF</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <footer>Built ${date}${source}.</footer>
</body>
</html>
`;
}

try {
  const release = readMakefileAndManifest();
  const entries = release.specs.map((spec) => publishSpec(spec, release));
  fs.writeFileSync(path.join(OUTPUT, "index.html"), renderIndex(entries, release));
  console.log(`index.html written with ${entries.length} document(s)`);
} catch (error) {
  console.error(`::error::${error.message}`);
  process.exitCode = 1;
}
