// node brand.mjs <url>  → prints the brand-extract.js result as JSON.
import { readFileSync } from 'node:fs';
import { launch } from './browser.mjs';

const url = process.argv[2];
if (!url) { console.error('usage: node brand.mjs <url>'); process.exit(1); }
const script = readFileSync(new URL('./brand-extract.js', import.meta.url), 'utf8');
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(3000);
for (let y = 0; y < 20000; y += 800) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(120); }
console.log(JSON.stringify(await page.evaluate(script), null, 2));
await browser.close();
