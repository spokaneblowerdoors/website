// Takes phone (375px) and desktop (1280px) screenshots of every page and
// reports basic problems: horizontal scrolling, broken images, small tap targets.
// Usage: start `npm run preview` first, then `node scripts/screenshots.mjs [baseUrl]`.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4321';
const pages = [
  '/', '/services/', '/services/blower-door-testing/', '/services/duct-leakage-testing/',
  '/services/eri-scores/', '/services/washington-energy-code-compliance/',
  '/services/home-energy-audits/', '/about/', '/contact/', '/thank-you/', '/privacy/', '/404.html',
];
const sizes = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 900 },
];

mkdirSync('screenshots', { recursive: true });
const browser = await chromium.launch();
let problems = 0;
for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const file = `screenshots/${size.name}${path.replace(/\//g, '_').replace(/_$/, '') || '_home'}.png`;
    await page.screenshot({ path: file, fullPage: true });
    const report = await page.evaluate(() => {
      const out = [];
      if (document.documentElement.scrollWidth > window.innerWidth + 1) out.push(`horizontal scroll (${document.documentElement.scrollWidth}px)`);
      for (const img of document.images) if (!img.complete || img.naturalWidth === 0) out.push(`broken image ${img.src}`);
      for (const el of document.querySelectorAll('a, button, input, textarea, select')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || getComputedStyle(el).position === 'absolute' && r.left < 0) continue;
        if (el.closest('p, li') && el.closest('.prose, .site-footer, .breadcrumb, .plain')) continue; // inline text links
        if (r.height < 24 || r.width < 24) out.push(`small tap target "${el.textContent.trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return out;
    });
    if (report.length) { problems += report.length; console.log(`${size.name} ${path}:\n  - ${report.join('\n  - ')}`); }
  }
  await page.close();
}
await browser.close();
console.log(problems ? `${problems} problem(s) found.` : 'No layout problems found.');
