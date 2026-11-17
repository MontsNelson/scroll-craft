// Print ROOT, SC, KIT and STUDIO for the current layout (PC folder or cloud repo).
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(KIT, '../../../..');
const candidates = [
  join(ROOT, 'plugins/nateherk-design/skills/scroll-craft'),
  join(ROOT, 'scroll-craft/plugins/nateherk-design/skills/scroll-craft'),
];
const SC = candidates.find((p) => existsSync(join(p, 'SKILL.md')));
const out = { ROOT, SC: SC ?? '(not found: clone scroll-craft into ROOT/scroll-craft)', KIT, STUDIO: join(ROOT, 'studio') };
for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
