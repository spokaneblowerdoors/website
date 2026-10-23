// Submits the LIVE contact form once in a real browser and prints Web3Forms' reply.
// This sends a real message to the owner. Use only when diagnosing delivery.
// Usage: node scripts/form-live-check.mjs [baseUrl]
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'https://spokaneblowerdoors.com';
const browser = await chromium.launch();
const page = await browser.newPage();
let reply = null;
page.on('response', async (res) => {
  if (res.url().startsWith('https://api.web3forms.com/')) {
    reply = { status: res.status(), body: await res.text().catch(() => '') };
  }
});
await page.goto(`${base}/contact/`);
await page.getByLabel(/^Name/).fill('Website setup test');
await page.getByLabel(/^Email/).fill('Gabriel@2ohairsolutions.com');
await page.getByLabel(/^Message/).fill('Automated delivery test from the website setup. Please ignore.');
await page.getByRole('button', { name: 'Send message' }).click();
await page.waitForTimeout(8000);
console.log('Final page:', page.url());
console.log('Web3Forms reply:', reply ? `${reply.status} ${reply.body.slice(0, 400)}` : 'no request seen');
await browser.close();
