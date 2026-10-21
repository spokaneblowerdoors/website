// Runs Lighthouse (mobile) on key pages and fails if any category scores below 90.
// Usage: start `npm run preview`, then `node scripts/lighthouse.mjs [baseUrl]`.
// Uses Playwright's Chromium, opened with a debugging port that Lighthouse connects to.
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:4321';
const pages = ['/', '/services/', '/services/blower-door-testing/', '/services/eri-scores/', '/contact/', '/about/'];
const port = 9223;

const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
const chrome = { port, kill: () => browser.close() };
let failed = false;
for (const path of pages) {
  const { lhr } = await lighthouse(base + path, { port: chrome.port, output: 'json', logLevel: 'error' });
  const scores = Object.fromEntries(Object.values(lhr.categories).map((c) => [c.id, Math.round(c.score * 100)]));
  const low = Object.entries(scores).filter(([, s]) => s < 90);
  if (low.length) failed = true;
  console.log(`${low.length ? '✘' : '✔'} ${path}  ${Object.entries(scores).map(([k, v]) => `${k}=${v}`).join('  ')}`);
  for (const [id] of low) {
    const refs = lhr.categories[id].auditRefs.filter((r) => r.weight > 0 && lhr.audits[r.id].score !== null && lhr.audits[r.id].score < 1);
    for (const r of refs.slice(0, 5)) console.log(`    - ${lhr.audits[r.id].title}`);
  }
}
await chrome.kill();
process.exit(failed ? 1 : 0);
