// Saves the visible text, title, description and structured data of every page
// to one file, for fact audits. Start `npm run preview` first.
// Usage: node scripts/extract-text.mjs <outFile> [baseUrl]
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const [outFile, base = 'http://localhost:4321'] = process.argv.slice(2);
const pages = [
  '/', '/services/', '/services/blower-door-testing/', '/services/duct-leakage-testing/',
  '/services/washington-energy-code-compliance/',
  '/services/home-energy-audits/', '/about/', '/contact/', '/privacy/', '/404.html',
];

const browser = await chromium.launch();
const page = await browser.newPage();
let text = '';
for (const path of pages) {
  await page.goto(base + path);
  const title = await page.title();
  const description = await page.getAttribute('meta[name=description]', 'content');
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  text += `===== PAGE ${path} =====\nTITLE: ${title}\nDESCRIPTION: ${description}\nSTRUCTURED DATA: ${jsonLd}\n\n${await page.innerText('body')}\n\n`;
}
writeFileSync(outFile, text);
await browser.close();
console.log(`Wrote ${outFile}`);
