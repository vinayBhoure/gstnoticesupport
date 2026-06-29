// Syncs shared Zod schemas from the Express server into the client.
//
// Why this exists: RULES.md §3.1/§3.2 require a single source of truth for Zod
// schemas in server/src/schemas, imported (never recreated) by the frontend.
// Turbopack will not bundle files physically outside the client root, and
// turbopack.root=parent breaks the RSC client manifest. So instead of importing
// across the package boundary, we COPY the client-safe (pure-Zod) schema files
// into the client on predev/prebuild. The copies are generated, header-marked,
// and must never be hand-edited — that keeps validation drift-free.
//
// Only schemas with NO server-only imports (e.g. @prisma/client) are syncable.

import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, '../../server/src/schemas');
const OUT_DIR = resolve(__dirname, '../src/lib/shared-schemas');

// Allow-list: only pure-Zod schemas. booking.schema.ts imports @prisma/client
// and is excluded until it is refactored to plain z.enum literals (EP11).
const SYNC = ['auth.schema.ts', 'document.schema.ts'];

const HEADER = (name) =>
  `// AUTO-GENERATED — DO NOT EDIT.\n` +
  `// Source of truth: server/src/schemas/${name} (RULES.md §3.1/§3.2).\n` +
  `// Regenerate with: npm run sync:schemas\n\n`;

function main() {
  const available = new Set(readdirSync(SRC_DIR));
  mkdirSync(OUT_DIR, { recursive: true });

  for (const name of SYNC) {
    if (!available.has(name)) {
      throw new Error(`[sync:schemas] expected ${name} in ${SRC_DIR}`);
    }
    const content = readFileSync(join(SRC_DIR, name), 'utf8');
    if (content.includes('@prisma/client')) {
      throw new Error(
        `[sync:schemas] ${name} imports @prisma/client and is not client-safe. ` +
          `Refactor to plain z.enum literals before syncing.`,
      );
    }
    writeFileSync(join(OUT_DIR, name), HEADER(name) + content, 'utf8');
    process.stdout.write(`[sync:schemas] ${name}\n`);
  }
}

main();
