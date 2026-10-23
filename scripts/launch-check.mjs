// Live-site launch check: DNS, redirects, SSL, key files, structured data.
// Usage: node scripts/launch-check.mjs   (prints a Markdown report; exits 1 if anything fails)
import tls from 'node:tls';

const HOST = 'spokaneblowerdoors.com';
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass, detail });

async function doh(server, name, type) {
  const url = server === 'cloudflare'
    ? `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`
    : `https://dns.google/resolve?name=${name}&type=${type}`;
  const r = await fetch(url, { headers: { accept: 'application/dns-json' } });
  const j = await r.json();
  return (j.Answer ?? []).map((a) => a.data.replace(/^"|"$/g, '').replace(/\.$/, ''));
}

// DNS (compared against dns-snapshot-before.txt and the Cloudflare setup)
for (const server of ['cloudflare', 'google']) {
  const ns = await doh(server, HOST, 'NS');
  ok(`NS via ${server} DNS`, ns.length > 0 && ns.every((n) => n.endsWith('.ns.cloudflare.com')), ns.join(', ') || 'none');
  const mx = await doh(server, HOST, 'MX');
  ok(`No MX (no email on domain, as before) via ${server}`, mx.length === 0, mx.join(', ') || 'none');
  const dmarc = await doh(server, `_dmarc.${HOST}`, 'TXT');
  ok(`_dmarc TXT unchanged via ${server}`, dmarc.some((v) => v.startsWith('v=DMARC1; p=quarantine')), dmarc.join(' | ') || 'none');
  const apex = await doh(server, HOST, 'A');
  ok(`Apex A record exists via ${server}`, apex.length > 0, apex.join(', '));
}

// HTTP behaviour
async function head(url) {
  const r = await fetch(url, { redirect: 'manual' });
  return { status: r.status, location: r.headers.get('location') };
}
const expect = [
  ['https://spokaneblowerdoors.com/', 200],
  ['https://spokaneblowerdoors.com/sitemap-index.xml', 200],
  ['https://spokaneblowerdoors.com/robots.txt', 200],
  ['https://spokaneblowerdoors.com/this-page-does-not-exist/', 404],
];
for (const [url, code] of expect) {
  const r = await head(url);
  ok(`${url} returns ${code}`, r.status === code, `got ${r.status}`);
}
for (const url of ['http://spokaneblowerdoors.com/contact/', 'https://www.spokaneblowerdoors.com/contact/', 'http://www.spokaneblowerdoors.com/contact/']) {
  const r = await head(url);
  const target = 'https://spokaneblowerdoors.com/contact/';
  let hops = 0, final = url, cur = r;
  while (cur.status >= 300 && cur.status < 400 && hops < 5) { hops++; final = new URL(cur.location, final).href; cur = await head(final); }
  ok(`${url} → one 301 to https apex`, r.status === 301 && hops === 1 && final === target && cur.status === 200, `${r.status}, ${hops} hop(s) → ${final}`);
}

// SSL certificates
function cert(host) {
  return new Promise((resolve, reject) => {
    const s = tls.connect(443, host, { servername: host }, () => {
      const c = s.getPeerCertificate();
      resolve({ authorized: s.authorized, validTo: c.valid_to, err: s.authorizationError });
      s.end();
    });
    s.on('error', reject);
  });
}
for (const h of [HOST, `www.${HOST}`]) {
  const c = await cert(h);
  const days = Math.round((new Date(c.validTo) - Date.now()) / 86400000);
  ok(`SSL valid for ${h}`, c.authorized && days > 14, `expires ${c.validTo} (${days} days)${c.err ? ' ' + c.err : ''}`);
}

// Structured data on the home page
const html = await (await fetch(`https://${HOST}/`)).text();
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let parsed = null;
try { parsed = JSON.parse(ld?.[1] ?? ''); } catch {}
ok('Structured data (JSON-LD) parses', !!parsed && parsed['@type'] === 'HomeAndConstructionBusiness' && parsed.telephone === '+1-509-903-8595', parsed ? `${parsed['@type']}, ${parsed.name}` : 'missing/invalid');
ok('Canonical is https apex', /<link rel="canonical" href="https:\/\/spokaneblowerdoors\.com\/"/.test(html));
// The Privacy Policy promises no analytics; Cloudflare can auto-inject its Web Analytics beacon.
ok('No analytics/tracking scripts injected (privacy promise)', !/cloudflareinsights|googletagmanager|google-analytics|gtag\(/.test(html));

// Report
const failed = results.filter((r) => !r.pass);
console.log(`## Launch check: ${failed.length ? `❌ ${failed.length} problem(s)` : '✅ all passed'} (${new Date().toISOString()})\n`);
console.log('| Check | Result | Detail |\n|---|---|---|');
for (const r of results) console.log(`| ${r.name} | ${r.pass ? '✅' : '❌'} | ${r.detail} |`);
process.exit(failed.length ? 1 : 0);
