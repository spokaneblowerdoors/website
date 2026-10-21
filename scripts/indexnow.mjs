// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver...) about every page in the sitemap.
// Run after a production deploy: `node scripts/indexnow.mjs`.
// The key is public by design; its file lives at /<key>.txt (see public/).
import { readFileSync, readdirSync } from 'node:fs';

const host = 'spokaneblowerdoors.com';
const keyFile = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file not found in public/');
const key = keyFile.replace('.txt', '');

const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
// 200/202 = accepted. Don't fail the deploy over a ping.
