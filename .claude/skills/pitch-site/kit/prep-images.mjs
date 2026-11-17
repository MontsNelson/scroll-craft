// node prep-images.mjs <jobs.json>
// jobs.json: { "out": "studio/builds/<slug>/assets", "jobs": [
//   { "in": "studio/builds/<slug>/raw/03.jpg", "name": "hero", "width": 2000, "quality": 72 } ] }
// Writes <name>.webp for each job and prints the total size (aim for under ~2 MB).
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { trySharp } from './browser.mjs';

const sharp = trySharp();
const file = process.argv[2];
if (!file || !sharp) { console.error('usage: node prep-images.mjs <jobs.json>  (needs sharp: npm i)'); process.exit(1); }
const { out, jobs } = JSON.parse(readFileSync(file, 'utf8'));
mkdirSync(out, { recursive: true });
let total = 0;
for (const j of jobs) {
  const dest = join(out, `${j.name}.webp`);
  let img = sharp(j.in).rotate();
  if (j.crop) img = img.extract(j.crop);
  await img.resize({ width: j.width ?? 1600, withoutEnlargement: true }).webp({ quality: j.quality ?? 72 }).toFile(dest);
  const kb = statSync(dest).size / 1024; total += kb;
  console.log(`${dest}  ${kb.toFixed(0)} KB`);
}
console.log(`total ${(total / 1024).toFixed(2)} MB${total > 2048 ? '  (over budget: lower width or quality)' : ''}`);
