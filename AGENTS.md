# Spokane Blower Doors website

## Before doing anything
- Read OPERATIONS.md: it describes every account, secret, workflow, and DNS record.
  (OPERATIONS.md is written at the end of setup; until it exists, read .site-builder/progress.json.)
- If you change any configuration (secrets, workflows, DNS, hosting, form service),
  update OPERATIONS.md and add a change-log line in the same PR.

## Commands
- Install: `npm ci`   Build: `npm run build`   Checks: `npm run check` (after build)   Tests: `npm test`
- Local preview: `npm run dev`

## Source of truth
- All facts come from business-facts.md. Never invent or infer prices, hours,
  credentials, service areas, testimonials, stats, or guarantees.
- Business facts used by pages live in src/data/business.ts and must match business-facts.md.
- If a request needs a fact that isn't there, stop and ask in the issue or PR.

## The owner
- The owner, Gabe Bell, is non-technical. Explain everything in plain language, with no jargon.

## Voice
- Straightforward and professional. Short sentences. No superlatives unless business-facts.md backs them.
- No certifications, insurance, years in business, reviews, or prices on the site (owner's choice).

## Structure
- Astro, static output. Pages in src/pages, shared layout in src/layouts, facts in src/data.
- Every page: title under 60 chars, meta description under 155 chars, canonical URL, one H1.

## Rules
- Work on a branch; open a PR. Never push to main.
- Never change MX, TXT, DKIM, or NS records, .github/workflows, or this file without the owner's approval.
- Never create CLAUDE.md or other tool-specific instruction files; this file is the single source of agent instructions.
- No tracking, cookies, or third-party embeds without approval.
- Run the build and checks before opening a PR.
- Every PR lists each factual claim changed and includes phone and desktop screenshots.
