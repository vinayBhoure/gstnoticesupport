// Fails the build when shipped assets exceed size budgets — a regression
// guard for exactly the defect the Next.js performance audit found (an
// 11 MB unposterred hero video, cached with `max-age=0`, silently shipped
// to production). Runs as `postbuild` so it fires on every `next build`,
// including Hostinger deploys — this repo has no CI workflows to hook
// into instead.
//
// If a budget genuinely needs to grow (a real new asset, a heavier but
// justified dependency), raise the number here in the same commit that
// adds the asset — don't delete the check.

import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '../public');
const CHUNKS_DIR = resolve(__dirname, '../.next/static/chunks');

const KB = 1024;
const MB = 1024 * 1024;

// Per-file budgets for public/, keyed by filename. Anything in public/ not
// listed here falls back to DEFAULT_PUBLIC_BUDGET.
const PUBLIC_FILE_BUDGETS = {
  'hero-section.mp4': 3 * MB,
};
const DEFAULT_PUBLIC_BUDGET = 200 * KB;

const MAX_CHUNK_SIZE = 400 * KB;
const MAX_TOTAL_CHUNKS_SIZE = 2.5 * MB;

function fmt(bytes) {
  return bytes >= MB ? `${(bytes / MB).toFixed(2)} MB` : `${(bytes / KB).toFixed(1)} KB`;
}

function checkPublicAssets() {
  if (!existsSync(PUBLIC_DIR)) return [];
  const rows = [];
  for (const name of readdirSync(PUBLIC_DIR)) {
    const path = join(PUBLIC_DIR, name);
    if (statSync(path).isDirectory()) continue;
    const size = statSync(path).size;
    const budget = PUBLIC_FILE_BUDGETS[name] ?? DEFAULT_PUBLIC_BUDGET;
    rows.push({ label: `public/${name}`, size, budget });
  }
  return rows;
}

function checkChunks() {
  if (!existsSync(CHUNKS_DIR)) {
    // Only meaningful after `next build` has run (this script is wired as
    // `postbuild`, so in normal use the directory always exists by now).
    return [{ label: `.next/static/chunks (missing — build did not run?)`, size: Infinity, budget: 0 }];
  }

  let total = 0;
  let largestName = '(none)';
  let largestSize = 0;
  for (const name of readdirSync(CHUNKS_DIR)) {
    if (extname(name) !== '.js') continue;
    const size = statSync(join(CHUNKS_DIR, name)).size;
    total += size;
    if (size > largestSize) {
      largestSize = size;
      largestName = name;
    }
  }

  return [
    { label: `largest JS chunk (${largestName})`, size: largestSize, budget: MAX_CHUNK_SIZE },
    { label: 'total JS chunks', size: total, budget: MAX_TOTAL_CHUNKS_SIZE },
  ];
}

function main() {
  const rows = [...checkPublicAssets(), ...checkChunks()];
  const failures = rows.filter((r) => r.size > r.budget);

  process.stdout.write('[bundle-budget] asset size check\n');
  for (const r of rows) {
    const status = r.size <= r.budget ? 'PASS' : 'FAIL';
    process.stdout.write(`  ${status}  ${r.label.padEnd(34)} ${fmt(r.size).padStart(9)} / ${fmt(r.budget)}\n`);
  }

  if (failures.length > 0) {
    process.stderr.write('\n[bundle-budget] budget exceeded:\n');
    for (const r of failures) {
      process.stderr.write(`  - ${r.label}: ${fmt(r.size)} exceeds budget ${fmt(r.budget)}\n`);
    }
    process.stderr.write(
      '\nIf this growth is intentional, raise the budget in scripts/check-bundle-budget.mjs in the same commit.\n',
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write('[bundle-budget] all checks passed\n');
}

main();
