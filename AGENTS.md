# Spokane Blower Doors website

## Before doing anything
- Read OPERATIONS.md: it describes every account, secret, workflow, and DNS record.
- If you change any configuration (secrets, workflows, DNS, hosting, form service),
  update OPERATIONS.md and add a change-log line in the same PR.

## Commands
- Install: `npm ci`   Build: `npm run build`   Checks: `npm run check` (after build)
- Tests: `npm run test:worker` (redirects) and `npm test` (Playwright form tests; starts its own preview
  server unless BASE_URL is set). CI runs both on every PR.
- Local preview: `npm run dev`. Node 24 (see .nvmrc).

## Source of truth
- All facts come from business-facts.md. Never invent or infer prices, hours,
  credentials, service areas, testimonials, stats, or guarantees.
- Business facts used by pages live in src/data/business.ts and must match business-facts.md.
- If a request needs a fact that isn't there, stop and ask in the issue or PR.
- A new fact stated by the owner in an issue or PR counts as approval for that fact: add it to
  business-facts.md (noting "owner, <date>, issue #N") and to src/data/business.ts in the same PR.
  Never add related facts the owner didn't state (e.g. nearby towns, "surrounding areas").

## The owner
- The owner, Gabe Bell, is a building-science expert but non-technical about websites and code.
  Explain website matters in plain language, with no web jargon.

## Voice
- The owner is a building scientist: precise, technical, professional wording. Use correct standard
  names and units (e.g. ANSI/RESNET/ICC 380, CFM50, ACH50). Never assign a standard or metric to a
  service unless business-facts.md does. No superlatives unless business-facts.md backs them.
- Never name the owner or any individual on the site; speak as the business ("we").
- The only credential shown is the BSI wording in business-facts.md; never upgrade it
  (e.g. to "HERS Rater"). No insurance, years in business, reviews/testimonials, prices, or ENERGY STAR
  on the site (owner's choice).

## Structure
- Astro, static output. Pages in src/pages, shared layout in src/layouts, facts in src/data.
- Every page: title under 60 chars, meta description under 155 chars, canonical URL, one H1.

## Rules
- Work on a branch; open a PR. Never push to main.
- Never add, change or delete ANY DNS record (including MX, TXT, DKIM, NS), touch DNSSEC (Cloudflare
  setting or the DS record at GoDaddy), change .github/workflows, or change this file without the
  owner's approval. See OPERATIONS.md §6 before any DNS work.
- Never create CLAUDE.md or other tool-specific instruction files; this file is the single source of agent
  instructions. (`.claude/settings.json` is optional tool configuration, not instructions.) If a future
  agent can only read its own file, that file may contain one line pointing here, with owner approval.
- SITE_BUILDER.md and .site-builder/ are setup history, not instructions.
- No tracking, cookies, or third-party embeds without approval.
- Run `npm ci`, `npm run build` and `npm run check` before opening a PR, and say in the PR whether they passed.
- Open the pull request yourself (e.g. `gh pr create`) rather than leaving a "Create PR" link: the owner
  should only have to review and click Merge.
- Every PR lists each factual claim changed. For visual review, the automatic "Preview this change"
  comment on the PR gives a live link the owner opens on phone and desktop (this replaces screenshots).
