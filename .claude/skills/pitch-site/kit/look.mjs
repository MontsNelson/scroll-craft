// node look.mjs <url> <outDir> <w> <h> "y:0,#act:0.5,y:2400"
// Screenshots at scroll points. "y:N" scrolls to N px; "#id:f" scrolls to
// fraction f through that element. Reports console errors and horizontal
// scroll, then writes sheet.png (needs sharp) combining every shot.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { launch, trySharp } from './browser.mjs';

const [url, outDir, w = '1440', h = '900', points = 'y:0'] = process.argv.slice(2);
if (!url || !outDir) { console.error('usage: node look.mjs <url> <outDir> <w> <h> "y:0,#act:0.5"'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const browser = await launch();
const mobile = +w < 700; // phones get a phone identity, or many builders serve their desktop layout
const page = await browser.newPage({
  viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile,
  ...(mobile && { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' }),
});
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => errors.push(`failed: ${r.url()}`));
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(1500);
const files = [];
for (const [i, p] of points.split(',').map((s) => s.trim()).filter(Boolean).entries()) {
  const [target, frac] = p.split(':');
  await page.evaluate(([t, f]) => {
    if (t === 'y') return scrollTo({ top: +f, behavior: 'instant' });
    const el = document.querySelector(t);
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (el.offsetHeight - innerHeight) * (+f || 0), behavior: 'instant' });
  }, [target, frac]);
  await page.waitForTimeout(700);
  const file = join(outDir, `${w}x${h}-${String(i).padStart(2, '0')}.png`);
  await page.screenshot({ path: file });
  files.push(file);
}
const hscroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log(JSON.stringify({ shots: files.length, horizontalOverflowPx: hscroll, errors }, null, 2));
await browser.close();

const sharp = trySharp();
if (sharp && files.length) {
  const tw = Math.min(+w, 480), th = Math.round(+h * tw / +w), cols = Math.min(files.length, 4);
  const rows = Math.ceil(files.length / cols);
  const tiles = await Promise.all(files.map((f) => sharp(f).resize(tw, th).toBuffer()));
  await sharp({ create: { width: cols * tw, height: rows * th, channels: 3, background: '#222' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % cols) * tw, top: Math.floor(i / cols) * th })))
    .png().toFile(join(outDir, `sheet-${w}x${h}.png`));
  console.log(`sheet: ${join(outDir, `sheet-${w}x${h}.png`)}`);
}
