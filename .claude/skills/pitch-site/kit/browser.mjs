// Launch Chromium with whatever Playwright is available: the cloud image ships
// `playwright` globally; the PC kit installs `playwright-core` and uses Chrome.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export async function launch() {
  for (const name of ['playwright', 'playwright-core']) {
    try {
      const { chromium } = require(name);
      try { return await chromium.launch(); }
      catch { return await chromium.launch({ channel: 'chrome' }); }
    } catch { /* try the next one */ }
  }
  throw new Error('No Playwright found. Run `npm i` in the kit folder.');
}

export function trySharp() {
  try { return require('sharp'); } catch { return null; }
}
