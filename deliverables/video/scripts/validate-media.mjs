#!/usr/bin/env node
/**
 * Media validation for the final deliverable.
 * Checks: streams/codec/resolution/fps/pixel format, duration ≤ 300s,
 * decode integrity, seekability (faststart), SRT monotonicity, caption bounds,
 * non-zero files, and absence of long unintentional silence.
 * Uses execFileSync with argument arrays only (no shell interpolation).
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TARGET = process.argv[2] ?? path.join(ROOT, "output", "fintech-internal-tools-vp-engineering.mp4");
const SRT = path.join(ROOT, "public", "captions", "final.srt");

let failures = 0;
const ok = (label, cond, detail = "") => {
  console.log(`${cond ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
};

function ffprobeJson(file) {
  return JSON.parse(
    execFileSync("ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", file]).toString(),
  );
}

function run(cmd, args) {
  try {
    return { out: execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString(), err: "" };
  } catch (e) {
    return { out: String(e.stdout ?? ""), err: String(e.stderr ?? e.message ?? "") };
  }
}

function parseSrtTimes(text) {
  const times = [];
  const re = /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/g;
  let m;
  const toS = (h, mi, s, ms) => Number(h) * 3600 + Number(mi) * 60 + Number(s) + Number(ms) / 1000;
  while ((m = re.exec(text))) {
    times.push({ start: toS(m[1], m[2], m[3], m[4]), end: toS(m[5], m[6], m[7], m[8]) });
  }
  return times;
}

console.log(`Validating: ${TARGET}\n`);
ok("MP4 exists", existsSync(TARGET));
if (!existsSync(TARGET)) process.exit(1);
ok("MP4 is non-zero", statSync(TARGET).size > 0, `${(statSync(TARGET).size / 1e6).toFixed(1)} MB`);

const probe = ffprobeJson(TARGET);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const duration = parseFloat(probe.format.duration);

ok("Video stream exists", Boolean(v));
ok("Audio stream exists", Boolean(a));
ok("Video codec is H.264", v?.codec_name === "h264", v?.codec_name);
ok("Audio codec is AAC", a?.codec_name === "aac", a?.codec_name);
ok("Resolution is 1920×1080", v?.width === 1920 && v?.height === 1080, `${v?.width}×${v?.height}`);
const [num, den] = String(v?.r_frame_rate ?? "0/1").split("/").map(Number);
const fps = den ? num / den : 0;
ok("Frame rate is 30 fps", Math.abs(fps - 30) < 0.01, String(v?.r_frame_rate));
ok("Pixel format is yuv420p", v?.pix_fmt === "yuv420p", v?.pix_fmt);
ok("Duration ≤ 300 s", duration <= 300, `${duration.toFixed(1)} s`);
ok("Duration ≥ 240 s (sanity)", duration >= 240, `${duration.toFixed(1)} s`);

// Seekability: moov atom near the start of the file (faststart)
const head = readFileSync(TARGET).subarray(0, 64 * 1024).toString("latin1");
ok("Seekable (moov near file start / faststart)", head.includes("moov"));

// Full-decode integrity
const decode = run("ffmpeg", ["-v", "error", "-i", TARGET, "-f", "null", "-"]);
ok("Plays start-to-end without decode errors", decode.err.trim().length === 0, decode.err.trim().slice(0, 200));

// Long-silence check: the closing card intentionally holds ~5 s, so flag ≥ 6 s.
const silence = run("ffmpeg", ["-i", TARGET, "-af", "silencedetect=noise=-45dB:d=6", "-f", "null", "-"]);
const silenceHits = ((silence.err + silence.out).match(/silence_start/g) ?? []).length;
ok("No unintentional dead air (≥6 s silence)", silenceHits === 0, `${silenceHits} silent stretch(es)`);

// SRT checks
ok("SRT exists", existsSync(SRT));
if (existsSync(SRT)) {
  const times = parseSrtTimes(readFileSync(SRT, "utf8"));
  ok("SRT has captions", times.length > 0, `${times.length} cues`);
  let monotonic = true;
  for (let i = 0; i < times.length; i++) {
    if (times[i].end <= times[i].start) monotonic = false;
    if (i > 0 && times[i].start < times[i - 1].start) monotonic = false;
  }
  ok("SRT timestamps are monotonic", monotonic);
  ok(
    "Last caption ends before video ends",
    times[times.length - 1].end < duration,
    `${times[times.length - 1].end.toFixed(1)}s < ${duration.toFixed(1)}s`,
  );
}

console.log(failures === 0 ? "\n✓ ALL MEDIA CHECKS PASSED" : `\n✗ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
