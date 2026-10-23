// Quick "is the site up?" check, run every 15 minutes by .github/workflows/health.yml.
// Passes if the home page and contact page load with the expected text. Retries once to avoid false alarms.
const checks = [
  ['https://spokaneblowerdoors.com/', ['Spokane Blower Doors', '509-903-8595']],
  ['https://spokaneblowerdoors.com/contact/', ['Send message', '509-903-8595']],
];

async function attempt() {
  const problems = [];
  for (const [url, texts] of checks) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const body = await res.text();
      if (res.status !== 200) problems.push(`${url} returned HTTP ${res.status}`);
      for (const t of texts) if (!body.includes(t)) problems.push(`${url} is missing the text "${t}"`);
    } catch (e) {
      problems.push(`${url} did not load (${e.message})`);
    }
  }
  return problems;
}

let problems = await attempt();
if (problems.length) {
  await new Promise((r) => setTimeout(r, 60000));
  problems = await attempt();
}
if (problems.length) {
  console.log(problems.map((p) => `- ${p}`).join('\n'));
  process.exit(1);
}
console.log('Site is up.');
