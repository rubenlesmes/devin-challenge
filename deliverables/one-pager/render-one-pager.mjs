#!/usr/bin/env node
/**
 * Renders key-decisions.html to a one-page US Letter PDF and validates it:
 * file exists, non-zero, exactly ONE page, and no browser console errors
 * during rendering. Reuses the Playwright install from ../video.
 *
 * Run:  node render-one-pager.mjs   (from this directory)
 */
import { createRequire } from "node:module";
import { existsSync, statSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, "..", "video", "package.json"));
const { chromium } = require("playwright");

const HTML = path.join(__dirname, "key-decisions.html");
const PDF = path.join(__dirname, "key-decisions.pdf");

function countPdfPages(file) {
  // Chromium-generated PDFs list page objects as "/Type /Page" (the page tree
  // node is "/Type /Pages", excluded by the negative lookahead).
  const buf = readFileSync(file).toString("latin1");
  const matches = buf.match(/\/Type\s*\/Page(?!s)/g);
  return matches ? matches.length : 0;
}

const consoleErrors = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(String(e)));
await page.goto(`file://${HTML}`, { waitUntil: "networkidle" });
await page.pdf({ path: PDF, format: "Letter", printBackground: true });
await browser.close();

let failures = 0;
const ok = (label, cond, detail = "") => {
  console.log(`${cond ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
};

ok("PDF exists", existsSync(PDF));
ok("PDF is non-zero", statSync(PDF).size > 0, `${(statSync(PDF).size / 1024).toFixed(0)} KB`);
const pages = countPdfPages(PDF);
ok("Page count is exactly 1", pages === 1, `${pages} page(s)`);
ok("No browser console errors during rendering", consoleErrors.length === 0, consoleErrors.join("; "));

console.log(failures === 0 ? "\n✓ ONE-PAGER VALID" : `\n✗ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
