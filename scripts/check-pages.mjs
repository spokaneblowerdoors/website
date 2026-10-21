// Checks every built page has a title (<60 chars), a meta description (<155 chars),
// a canonical URL, and exactly one <h1>. Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) files.push(p);
  }
})(dist);

let failed = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const problems = [];
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (!title) problems.push('missing <title>');
  else if (title.length > 60) problems.push(`title is ${title.length} chars (max 60)`);
  if (!desc) problems.push('missing meta description');
  else if (desc.length > 155) problems.push(`description is ${desc.length} chars (max 155)`);
  if (!/<link rel="canonical"/.test(html)) problems.push('missing canonical link');
  if (h1s !== 1) problems.push(`has ${h1s} <h1> tags (need exactly 1)`);
  if (problems.length) {
    failed++;
    console.error(`✘ ${file}\n  - ${problems.join('\n  - ')}`);
  }
}
console.log(`${files.length - failed}/${files.length} pages passed.`);
process.exit(failed ? 1 : 0);
