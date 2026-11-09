#!/usr/bin/env node

// Prepares .tmp/biblio.json, which is the merge of resources/biblio.json with ./local-biblio.json

import fs from "node:fs";
import path from "node:path";
import { RESOURCES, TMP } from "./config.mjs";

const LOCAL = "local-biblio.json";
const BASE = path.join(RESOURCES, "bikeshed", "biblio.json");
const MERGED = path.join(TMP, "biblio.json");

function readJsonObject(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${file}: top level must be an object of bibliography entries`);
  }
  return data;
}

try {
  if (!fs.existsSync(TMP)) {
    throw new Error(`${TMP}/ not found; run reset-tmp.mjs first`);
  }

  if (!fs.existsSync(LOCAL)) {
    console.log(`::notice::${LOCAL} not found, using the resources biblio.json as is`);
    fs.copyFileSync(BASE, MERGED);
    process.exit(0);
  }

  const biblio = readJsonObject(BASE);
  const local = readJsonObject(LOCAL);

  for (const [key, entry] of Object.entries(local)) {
    if (key in biblio) console.log(`::warning::${LOCAL}: "${key}" overrides an existing biblio entry`);
    else console.log(`added biblio entry "${key}"`);
    biblio[key] = entry;
  }

  fs.writeFileSync(MERGED, JSON.stringify(biblio, null, 4) + "\n");
} catch (error) {
  console.error(`::error::${error.message}`);
  process.exit(1);
}
