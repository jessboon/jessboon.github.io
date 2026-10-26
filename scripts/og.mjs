#!/usr/bin/env node
// Generates a minimal OG image per blog post (whites/grays/blacks only).
// Zero npm deps: renders SVG via macOS QuickLook, crops via sips.

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN = 80;

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function parseFrontmatter(raw) {
  const fm = raw.split("---")[1] ?? "";
  const get = (key) => {
    const m = fm.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"));
    if (!m) return null;
    return m[1].trim().replace(/^"(.*)"$/, "$1");
  };
  return { title: get("title"), permalink: get("permalink") };
}

function wrap(text, size, maxWidth) {
  const maxChars = Math.floor(maxWidth / (size * 0.65));
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if (line && (line + " " + w).length > maxChars) {
      lines.push(line);
      line = w;
    } else {
      line = line ? line + " " + w : w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitLines(title, maxWidth, maxBlockHeight) {
  for (let size = 30; size >= 14; size -= 4) {
    const lines = wrap(title, size, maxWidth);
    if (lines.length * size * 1.3 <= maxBlockHeight) return { lines, size };
  }
  return { lines: wrap(title, 32, maxWidth), size: 30 };
}

function svgFor(title) {
  const { lines, size } = fitLines(title, WIDTH - MARGIN * 2, 380);
  const lineHeight = size * 1.3;
  const titleBlockHeight = lines.length * lineHeight;
  const firstBaseline = (HEIGHT - titleBlockHeight) / 2 + size * 0.35;
  const titleTexts = lines
    .map((line, i) => `<text x="${MARGIN}" y="${(firstBaseline + i * lineHeight).toFixed(1)}" font-family="Menlo" font-size="${size}" font-weight="bold" fill="rgb(11, 11, 11)">${esc(line)}</text>`)
    .join("\n  ");
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#ebebeb"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
  <rect x="${MARGIN}" y="76" width="14" height="14" fill="#111"/>
  <text x="108" y="90" font-family="Menlo" font-size="26" fill="#8b8b8b">jess boonekamp</text>
  ${titleTexts}
  <text x="${MARGIN}" y="${(firstBaseline + lines.length * lineHeight + 34).toFixed(1)}" font-family="Menlo" font-size="24" fill="#8b8b8b">a take by jess boonekamp</text>
  <text x="${MARGIN}" y="560" font-family="Menlo" font-size="20" fill="#8b8b8b">jessboonekamp.com</text>
</svg>`;
}

mkdirSync("og", { recursive: true });

for (const file of readdirSync("blog").filter((f) => f.endsWith(".md"))) {
  const { title, permalink } = parseFrontmatter(readFileSync(`blog/${file}`, "utf8"));
  if (!title || !permalink) continue;
  const slug = permalink.split("/").filter(Boolean).pop();
  writeFileSync("/tmp/og-build.svg", svgFor(title));
  execSync("qlmanage -t -s 1200 -o /tmp /tmp/og-build.svg", { stdio: "ignore" });
  execSync(`sips -c ${HEIGHT} ${WIDTH} --cropOffset 0 0 /tmp/og-build.svg.png --out og/${slug}.png`, { stdio: "ignore" });
  console.log(`og/${slug}.png`);
}
