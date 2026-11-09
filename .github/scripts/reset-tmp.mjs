#!/usr/bin/env node

// First build step: deletes .tmp/ with whatever a previous run left in it and creates it again.
import fs from "node:fs";
import { TMP } from "./config.mjs";

try {
  fs.rmSync(TMP, { recursive: true, force: true }); // This is only relevant for the local workflow run
  fs.mkdirSync(TMP);
} catch (error) {
  console.error(`::error::${error.message}`);
  process.exit(1);
}
