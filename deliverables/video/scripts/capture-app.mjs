#!/usr/bin/env node
/**
 * Deterministic application capture for the executive video.
 *
 * - Resets the synthetic database (npm run db:reset in the app root).
 * - Expects the app to be running at BASE_URL (default http://localhost:3000).
 *   Start it separately with `npm run start` (production) or `npm run dev`.
 * - Produces high-resolution screenshots (2x) and screen recordings (webm -> h264 mp4)
 *   under public/captures/, plus a manifest.json describing every capture.
 * - Fails loudly if any page logs a console error.
 *
 * All data shown is synthetic (see prisma/seed.ts). No secrets are involved.
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO_ROOT = path.resolve(__dirname, "..");
const APP_ROOT = path.resolve(VIDEO_ROOT, "..", "..");
const CAPTURES = path.join(VIDEO_ROOT, "public", "captures");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const VIEWPORT = { width: 1920, height: 1080 };
const PERSONAS = {
  alex: "user-alex-reviewer",
  morgan: "user-morgan-admin",
};

const consoleErrors = [];
const manifest = { baseUrl: BASE_URL, generatedBy: "scripts/capture-app.mjs", screenshots: [], recordings: [] };

function resetDatabase() {
  console.log("→ Resetting synthetic database (npm run db:reset)…");
  execFileSync("npm", ["run", "db:reset"], { cwd: APP_ROOT, stdio: "inherit" });
}

function personaCookie(personaId) {
  return {
    name: "demo_persona",
    value: personaId,
    url: BASE_URL,
    httpOnly: true,
    sameSite: "Lax",
  };
}

function watchConsole(page, label) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push({ label, text: msg.text() });
  });
  page.on("pageerror", (err) => consoleErrors.push({ label, text: String(err) }));
}

/** Inject a visible cursor dot that follows the mouse, for recordings only. */
const CURSOR_SCRIPT = `
  (() => {
    const attach = () => {
      if (!document.body || !document.head) {
        requestAnimationFrame(attach);
        return;
      }
      if (document.getElementById('pw-cursor')) return;
      const style = document.createElement('style');
      style.textContent = \`#pw-cursor{position:fixed;z-index:999999;width:22px;height:22px;border-radius:50%;
        background:rgba(37,99,235,.35);border:2px solid rgba(37,99,235,.9);pointer-events:none;
        transform:translate(-50%,-50%);transition:transform .08s ease}\`;
      document.head.appendChild(style);
      const dot = document.createElement('div');
      dot.id = 'pw-cursor';
      dot.style.left = '-100px';
      document.body.appendChild(dot);
      window.addEventListener('mousemove', (e) => {
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
      }, { passive: true });
      window.addEventListener('mousedown', () => { dot.style.transform = 'translate(-50%,-50%) scale(.7)'; });
      window.addEventListener('mouseup', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; });
    };
    attach();
  })();
`;

async function hoverThenClick(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.hover();
  await page.waitForTimeout(450);
  await locator.click();
}

async function typeSlowly(locator, text) {
  await locator.click();
  await locator.pressSequentially(text, { delay: 32 });
}

async function screenshot(browser, { name, persona, url, viewport = VIEWPORT, scale = 2, prepare }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale });
  await context.addCookies([personaCookie(PERSONAS[persona])]);
  const page = await context.newPage();
  watchConsole(page, name);
  await page.goto(BASE_URL + url, { waitUntil: "networkidle" });
  if (prepare) await prepare(page);
  await page.waitForTimeout(400);
  const file = path.join(CAPTURES, `${name}.png`);
  await page.screenshot({ path: file });
  manifest.screenshots.push({ name, persona, url, file: `captures/${name}.png`, viewport, scale });
  await context.close();
  console.log(`✓ screenshot ${name}`);
}

async function record(browser, { name, persona, run }) {
  const tmpDir = path.join(CAPTURES, `.tmp-${name}`);
  mkdirSync(tmpDir, { recursive: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: tmpDir, size: VIEWPORT },
  });
  await context.addCookies([personaCookie(PERSONAS[persona])]);
  const page = await context.newPage();
  watchConsole(page, name);
  await page.addInitScript(CURSOR_SCRIPT);
  await run(page);
  await page.waitForTimeout(900);
  await context.close();

  const webm = readdirSync(tmpDir).find((f) => f.endsWith(".webm"));
  if (!webm) throw new Error(`No recording produced for ${name}`);
  const mp4 = path.join(CAPTURES, `${name}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-i", path.join(tmpDir, webm),
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-pix_fmt", "yuv420p", "-r", "30", "-an", "-movflags", "+faststart",
    mp4,
  ], { stdio: "pipe" });
  rmSync(tmpDir, { recursive: true, force: true });
  const duration = parseFloat(
    execFileSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]).toString().trim(),
  );
  manifest.recordings.push({ name, persona, file: `captures/${name}.mp4`, durationSeconds: Math.round(duration * 100) / 100 });
  console.log(`✓ recording ${name} (${duration.toFixed(1)}s)`);
}

async function main() {
  mkdirSync(CAPTURES, { recursive: true });
  resetDatabase();

  const browser = await chromium.launch({ slowMo: 60 });

  // ——— Pre-action screenshots (initial seeded state) ———
  await screenshot(browser, { name: "home", persona: "alex", url: "/" });
  await screenshot(browser, { name: "kyc-queue", persona: "alex", url: "/kyc" });
  const kycCaseHref = {};
  {
    // resolve internal ids for stable links
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    await ctx.addCookies([personaCookie(PERSONAS.alex)]);
    const p = await ctx.newPage();
    await p.goto(`${BASE_URL}/kyc`, { waitUntil: "networkidle" });
    for (const num of ["KYC-1001"]) {
      kycCaseHref[num] = await p.getByRole("link", { name: num }).getAttribute("href");
    }
    await ctx.close();
  }
  await screenshot(browser, { name: "kyc-case-detail", persona: "alex", url: kycCaseHref["KYC-1001"] });
  await screenshot(browser, { name: "flags-reviewer-denied", persona: "alex", url: "/feature-flags" });
  await screenshot(browser, { name: "refunds-queue", persona: "alex", url: "/refunds" });
  await screenshot(browser, {
    name: "mobile-kyc-queue", persona: "alex", url: "/kyc",
    viewport: { width: 375, height: 812 }, scale: 3,
  });

  // ——— Recording A: KYC assign + approve as Alex (reviewer) ———
  await record(browser, {
    name: "kyc-flow",
    persona: "alex",
    run: async (page) => {
      await page.goto(`${BASE_URL}/kyc`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      await hoverThenClick(page, page.getByRole("link", { name: "KYC-1001" }));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1400);
      await hoverThenClick(page, page.getByRole("button", { name: "Assign to me" }));
      await page.waitForTimeout(700);
      await hoverThenClick(page, page.getByRole("dialog").getByRole("button", { name: "Assign", exact: true }));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1600);
      await hoverThenClick(page, page.getByRole("button", { name: "Approve", exact: true }));
      await page.waitForTimeout(600);
      await typeSlowly(
        page.getByRole("dialog").locator("#decision-note"),
        "Identity and address verified against synthetic records; risk review complete.",
      );
      await page.waitForTimeout(500);
      await hoverThenClick(page, page.getByRole("dialog").getByRole("button", { name: "Approve", exact: true }));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
      // show the audit timeline
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(1800);
    },
  });

  // Post-decision detail + timeline screenshot
  await screenshot(browser, {
    name: "kyc-audit-timeline", persona: "alex", url: kycCaseHref["KYC-1001"],
    prepare: async (page) => { await page.mouse.wheel(0, 900); await page.waitForTimeout(500); },
  });

  // ——— Recording B: reviewer denied, then admin enables the production flag ———
  await record(browser, {
    name: "flag-toggle",
    persona: "morgan",
    run: async (page) => {
      await page.goto(`${BASE_URL}/feature-flags`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1400);
      const row = page.locator("tr", { hasText: "instant-refunds-v2" }).filter({ hasText: "PRODUCTION" });
      await hoverThenClick(page, row.getByRole("button", { name: "Enable", exact: true }));
      await page.waitForTimeout(700);
      await typeSlowly(
        page.getByRole("dialog").locator("#decision-note"),
        "Rollout approved for the v2 instant-refund decision engine.",
      );
      await page.waitForTimeout(500);
      await hoverThenClick(page, page.getByRole("dialog").getByRole("button", { name: "Enable flag" }));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1800);
    },
  });
  await screenshot(browser, { name: "flags-admin-after", persona: "morgan", url: "/feature-flags" });

  // ——— Recording C: refund approval as Alex ———
  await record(browser, {
    name: "refund-flow",
    persona: "alex",
    run: async (page) => {
      await page.goto(`${BASE_URL}/refunds`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      await hoverThenClick(page, page.getByRole("link", { name: "RF-2001" }));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1400);
      await hoverThenClick(page, page.getByRole("button", { name: "Approve refund" }));
      await page.waitForTimeout(600);
      await typeSlowly(
        page.getByRole("dialog").locator("#decision-note"),
        "Duplicate charge confirmed against the synthetic ledger entry.",
      );
      await page.waitForTimeout(500);
      await hoverThenClick(page, page.getByRole("dialog").getByRole("button", { name: "Approve", exact: true }));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1600);
    },
  });

  // ——— Recording D: persona switch via the header (simulated identity, shown honestly) ———
  await record(browser, {
    name: "persona-switch",
    persona: "alex",
    run: async (page) => {
      await page.goto(`${BASE_URL}/feature-flags`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1300);
      await page.locator("#personaId").selectOption(PERSONAS.morgan);
      await page.waitForTimeout(500);
      await hoverThenClick(page, page.getByRole("button", { name: "Switch" }));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1800);
    },
  });

  // ——— Central audit log after all actions ———
  await screenshot(browser, { name: "audit-log", persona: "morgan", url: "/audit" });

  await browser.close();

  // ——— Repository evidence (real command output, not staged) ———
  console.log("→ Capturing real test output and git history…");
  let testOut = "";
  try {
    testOut = execFileSync("npm", ["test"], { cwd: APP_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    testOut = String(e.stdout ?? "") + String(e.stderr ?? "");
  }
  writeFileSync(path.join(CAPTURES, "test-output.txt"), testOut);
  const gitLog = execFileSync("git", ["log", "--oneline", "--no-decorate"], { cwd: APP_ROOT, encoding: "utf8" });
  writeFileSync(path.join(CAPTURES, "git-log.txt"), gitLog);

  writeFileSync(path.join(CAPTURES, "manifest.json"), JSON.stringify(manifest, null, 2));

  if (consoleErrors.length > 0) {
    console.error("✗ Console errors detected during capture:");
    for (const e of consoleErrors) console.error(`  [${e.label}] ${e.text}`);
    process.exitCode = 1;
  } else {
    console.log("✓ No browser console errors during capture.");
  }
  console.log(`✓ Capture complete: ${manifest.screenshots.length} screenshots, ${manifest.recordings.length} recordings.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
