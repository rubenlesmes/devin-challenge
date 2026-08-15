#!/usr/bin/env node
/**
 * Renders a contact sheet (grid of frames sampled across the whole video)
 * for visual QA: output/contact-sheet.png (6×5 grid = 30 frames).
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TARGET = process.argv[2] ?? path.join(ROOT, "output", "fintech-internal-tools-vp-engineering.mp4");
const OUT = path.join(ROOT, "output", "contact-sheet.png");

const duration = parseFloat(
  execFileSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", TARGET]).toString(),
);
const frames = 30;
const interval = duration / frames;

execFileSync("ffmpeg", [
  "-y",
  "-i", TARGET,
  "-vf", `fps=1/${interval.toFixed(3)},scale=480:-1,tile=6x5`,
  "-frames:v", "1",
  OUT,
], { stdio: "pipe" });
console.log(`✓ Contact sheet written to ${OUT} (${frames} frames across ${duration.toFixed(1)}s)`);
