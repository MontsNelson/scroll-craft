// node contact-sheet.mjs <rawDir> <out.png>  → numbered grid of every image, to pick shots per act.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { trySharp } from './browser.mjs';

const [dir, out] = process.argv.slice(2);
const sharp = trySharp();
if (!dir || !out || !sharp) { console.error('usage: node contact-sheet.mjs <rawDir> <out.png>  (needs sharp: npm i)'); process.exit(1); }
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort();
const S = 300, cols = 5, rows = Math.ceil(files.length / cols);
const tiles = [];
for (const [i, f] of files.entries()) {
  const meta = await sharp(join(dir, f)).metadata();
  const label = Buffer.from(`<svg width="${S}" height="28"><rect width="100%" height="100%" fill="#000" opacity=".7"/><text x="8" y="19" font-size="15" fill="#fff" font-family="sans-serif">${f} · ${meta.width}x${meta.height}</text></svg>`);
  const img = await sharp(join(dir, f)).resize(S, S, { fit: 'cover' }).composite([{ input: label, gravity: 'south' }]).toBuffer();
  tiles.push({ input: img, left: (i % cols) * S, top: Math.floor(i / cols) * S });
}
await sharp({ create: { width: cols * S, height: Math.max(rows, 1) * S, channels: 3, background: '#111' } }).composite(tiles).png().toFile(out);
console.log(`${files.length} images → ${out}`);
