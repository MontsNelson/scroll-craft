// node qr.mjs <url> [colour]  → prints an inline SVG QR code for the visit card.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const [url, dark = '#111111'] = process.argv.slice(2);
if (!url) { console.error('usage: node qr.mjs <url> [colour]'); process.exit(1); }
const QR = require('qrcode');
console.log(await QR.toString(url, { type: 'svg', margin: 1, color: { dark, light: '#FFFFFF' } }));
