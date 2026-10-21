// Builds public/og-image.png (the preview picture shown when the site is shared).
// Replace with a real photo once the owner adds one to photos/.
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0f4c5c"/><stop offset="1" stop-color="#1f7a5a"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="90" y="150" width="200" height="250" rx="16" fill="none" stroke="#9fe0c4" stroke-width="14"/>
  <circle cx="190" cy="275" r="58" fill="none" stroke="#9fe0c4" stroke-width="14"/>
  <text x="350" y="270" font-family="Segoe UI, Arial, sans-serif" font-size="80" font-weight="800" fill="#ffffff">Spokane Blower Doors</text>
  <text x="352" y="345" font-family="Segoe UI, Arial, sans-serif" font-size="38" fill="#d7efe7">Blower door &amp; duct leakage testing</text>
  <text x="352" y="400" font-family="Segoe UI, Arial, sans-serif" font-size="38" fill="#d7efe7">Spokane · North Idaho · 509-903-8595</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
console.log('Wrote public/og-image.png');
