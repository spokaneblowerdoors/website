# OPERATIONS.md: how spokaneblowerdoors.com is set up and run

The complete map for any maintainer: Claude, Codex, Copilot, Cursor, another AI agent, or a human developer.
Written 2026-10-22 from the **verified live setup** (API calls and commands), not from a plan.
Read `AGENTS.md` first for the rules. If you change any configuration, update this file and add a
**Change log** line in the same pull request.

---

## 1. Overview

- **What it is:** the marketing website for Spokane Blower Doors, a building-performance testing business
  (blower door, duct leakage, ERI/HERS, Washington C3 calculations, home energy audits) serving Eastern
  Washington and North Idaho. Live at **https://spokaneblowerdoors.com**.
- **Owner:** Gabe Bell. He's a building-science expert, but non-technical about websites. He approves every
  change by clicking **Merge** on a pull request (PR). See `AGENTS.md`.
- **Stack:** Astro 7 (static output) → Cloudflare Workers (static assets + a tiny redirect script) ·
  GitHub (repo, PR checks, deploys, scheduled health checks) · Web3Forms (contact form) · DNS at Cloudflare;
  domain registered at GoDaddy.

```
 Change requested (issue + "agent" label, or a developer)
        │
        ▼
 Branch + pull request ──▶ Checks workflow ──▶ Preview URL comment (pr-<N>-…workers.dev)
        │                    build · astro check · page rules · HTML validate · links · Lighthouse ≥90
        │                    · redirect unit tests · Playwright form tests on the preview
        ▼
 Owner opens preview, clicks Merge (main is protected: PR + 3 green checks required)
        │
        ▼
 Deploy workflow ──▶ wrangler deploy ──▶ https://spokaneblowerdoors.com ──▶ IndexNow ping
```

Nothing in the build, deploy, checks, or monitoring requires any AI. Only `.github/workflows/ai-agent.yml`
does (see §12).

---

## 2. Accounts

Never put passwords or key values in this repo.

| Service | Used for | Owner / login | Admin access |
|---|---|---|---|
| GitHub org **spokaneblowerdoors** | Repo `website`, Actions, issues/PRs | User **2OH-air77** (Gabriel@2ohairsolutions.com), 2FA (authenticator app) | 2OH-air77 (org admin) |
| Cloudflare | Hosting (Worker `spokaneblowerdoors-site`), DNS zone, DNSSEC | Gabriel@2ohairsolutions.com, 2FA. Account ID `aad4c495004955e606afa1830ca93e46` | Owner |
| GoDaddy | **Registrar** for spokaneblowerdoors.com. Auto-renew ON, transfer lock ON. Expires 2027-10-21. | Owner's GoDaddy login | Owner |
| Web3Forms | Contact form delivery → Gabriel@2ohairsolutions.com (free plan) | Gabriel@2ohairsolutions.com | Owner |
| Anthropic / Claude | Owner's Claude Pro/Max subscription powers the GitHub AI helper (OAuth token) | Owner's Claude account | Owner |
| Claude GitHub App | Installed on org, **selected repo only** (`website`) | n/a | Org admin |
| Google Search Console | Domain property, verified by DNS TXT; sitemap submitted | Owner's Google account | Owner |
| Google Business Profile | Service-area business. **Verification pending with Google** as of 2026-10-22 | Owner's Google account | Owner |
| Bing Webmaster Tools | Imported from Search Console | Same Google account | Owner |

The owner keeps passwords in Google Password Manager. GitHub and Cloudflare backup codes are kept by the owner.

---

## 3. Secrets and credentials

| Name | Where stored | Used by | Scope / permissions | Created at |
|---|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secret **and** Dependabot secret; owner's local `.env.local` | `checks.yml` (preview upload), `deploy.yml` (deploy) | **Currently the broad setup token** (user token `cfut_…`, from the "Edit Cloudflare Workers" template plus Zone:Edit and DNS:Edit on all zones). **TODO:** replace it with the narrow token (§3.1). | Cloudflare → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secret and Dependabot secret; `.env.local` | Same | Not secret, but kept beside the token | Cloudflare dashboard |
| `CLAUDE_CODE_OAUTH_TOKEN` | GitHub Actions secret; `.env.local` | `ai-agent.yml` only | 1-year OAuth token from `claude setup-token` (owner's subscription); expires ~2027-10-21 | Owner's machine |
| `FORM_ACCESS_KEY` | **Committed** in `src/data/form.ts`; also `.env.local` | Contact form | Public by design. It can only send messages to the owner. | Web3Forms dashboard |
| IndexNow key | **Committed** as `public/0ebb4d1b4939af7d8246a2d8a04b4bad.txt` | `scripts/indexnow.mjs` | Public by design | Generated locally |
| Repo variable `INDEXNOW_ENABLED=true` | GitHub → Settings → Variables | `deploy.yml` | n/a | 2026-10-22 |

`.env.local` is in `.gitignore` and must never be committed.

**Windows gotcha:** in Windows PowerShell 5.1, piping a value into `gh secret set` adds a hidden CR/LF, which
breaks the secret. Write `NAME=value` lines to a temporary UTF-8 (no BOM), LF-ending file, run
`gh secret set -f <file>` (add `--app dependabot` for Dependabot secrets), then erase the file.

### 3.1 Rotating or narrowing the Cloudflare token

Setting secrets needs admin rights on the repo (today only the owner's account 2OH-air77; see §11 for
giving a maintainer access).

1. Owner creates a **custom token** named "website deploy (narrow)" with these permissions: Account › Workers Scripts › Edit;
   Account › Account Settings › Read; Zone › Workers Routes › Edit; Zone › Zone › Read; Zone › DNS › Read;
   User › User Details › Read. Zone resources: the specific zone spokaneblowerdoors.com. (Guide:
   `guide/steps/8.3-narrow-token.html` on the owner's machine.) One was created on 2026-10-22, but its value
   wasn't captured. Roll it to get a value. These permissions were **not yet tested** against
   `wrangler versions upload` or `wrangler deploy` with custom domains, so step 4 is the real test. If it
   fails, the likely missing permission is Zone › DNS › Edit (custom domains manage their own DNS records).
2. The owner pastes it into `.env.local` as `CLOUDFLARE_API_TOKEN_NEW=`. Test it without printing it
   (PowerShell):
   ```powershell
   $t = ((Get-Content .env.local | ? { $_ -like 'CLOUDFLARE_API_TOKEN_NEW=*' }) -split '=',2)[1].Trim()
   Invoke-RestMethod https://api.cloudflare.com/client/v4/user/tokens/verify -Headers @{Authorization="Bearer $t"}
   ```
   It should be `active`, and GET `/zones/<zone>`, `/zones/<zone>/dns_records` and
   `/accounts/<acct>/workers/scripts` should work. Then try to POST a TXT record named
   `narrow-key-test.spokaneblowerdoors.com`: it **must fail**. If it succeeds, the token is too broad. Delete
   that test record immediately and tell the owner.
3. Update the token in **all three places**:
   - the GitHub Actions secret,
   - the Dependabot secret,
   - the owner's `.env.local` (rename `_NEW` to `CLOUDFLARE_API_TOKEN`).

   Use the temp-file method from the gotcha above, for example:
   ```powershell
   $f = Join-Path $env:TEMP "s.env"
   [IO.File]::WriteAllText($f, "CLOUDFLARE_API_TOKEN=$t`n", (New-Object Text.UTF8Encoding($false)))
   gh secret set -f $f --repo spokaneblowerdoors/website
   gh secret set -f $f --app dependabot --repo spokaneblowerdoors/website
   [IO.File]::WriteAllText($f, ''); Remove-Item $f
   ```
4. Open a harmless PR (e.g. a comment in OPERATIONS.md) and confirm "Preview link" passes. Ask the owner to
   merge it, then confirm the Deploy run succeeds.
5. Owner deletes the old token in Cloudflare. Update §3 and the Change log.

### 3.2 Rotating the Claude token

The owner runs `claude setup-token` in a terminal, signs in, copies the `sk-ant-oat01-…` value, and updates
the `CLAUDE_CODE_OAUTH_TOKEN` Actions secret. Do it before it expires (about 2027-10-21). The first token,
created 2026-10-21, was accidentally shown in a setup chat transcript and never used. The owner should revoke
it from their Claude account if possible.

---

## 4. Repo map

| Path | Purpose |
|---|---|
| `AGENTS.md` | Rules for every agent or developer. Read it first. |
| `OPERATIONS.md` | This file |
| `business-facts.md` | **Source of truth** for every fact on the site, owner-approved. Never change it without the owner. |
| `src/data/business.ts` | Facts used by pages. Must match `business-facts.md`. |
| `src/data/form.ts` | Web3Forms endpoint, public access key, email subject |
| `src/pages/` | Pages: home, `services/` (index + `[slug].astro` for 5 services), about, contact, privacy, thank-you, 404 |
| `src/layouts/Base.astro` | Shared layout: meta tags, canonical, OG, **JSON-LD** (`HomeAndConstructionBusiness`), header/footer, mobile call bar |
| `src/components/ContactForm.astro` | Form: honeypot `botcheck`, client-side validation, JSON fetch to Web3Forms, `/thank-you/` |
| `src/styles/global.css` | All styles |
| `src/worker.js` | Cloudflare Worker: one-hop 301 from `www.` and `http://` to `https://spokaneblowerdoors.com`, else serves assets |
| `wrangler.jsonc` | Worker config: name `spokaneblowerdoors-site`, assets `./dist`, `404-page`, `run_worker_first`, custom domains (apex + www), `workers_dev`, `preview_urls` |
| `public/` | robots.txt, favicon, og-image.png (generated; swap for a real photo when available), IndexNow key file |
| `scripts/check-pages.mjs` | Every built page: title ≤60, description ≤155, canonical, exactly one H1 |
| `scripts/lighthouse.mjs` | Lighthouse (mobile) on key pages; fails below 90 |
| `scripts/screenshots.mjs` | 375px/1280px screenshots + layout problem report (local use) |
| `scripts/extract-text.mjs` | Dumps all page text for fact audits |
| `scripts/launch-check.mjs` | Live check: DNS, DNSSEC, redirects, SSL, sitemap/robots/404, JSON-LD, **no analytics**, domain expiry, form service |
| `scripts/uptime-check.mjs` | Every-15-minutes up check (retries once) |
| `scripts/health-issue.sh` | Opens, comments on, or closes a `health-alert` issue |
| `scripts/indexnow.mjs` | Pings IndexNow with every sitemap URL |
| `scripts/form-live-check.mjs` | Diagnostic: submits the LIVE form once. **Sends a real email.** Blocked by Web3Forms' bot protection in headless browsers. |
| `scripts/make-og-image.mjs` | Regenerates `public/og-image.png` |
| `tests/contact-form.spec.ts` | Playwright form tests. Web3Forms is intercepted, so no real email is sent. |
| `tests/worker.test.mjs` | Unit tests for redirect rules (`npm run test:worker`) |
| `.github/workflows/checks.yml` | PR checks: **Build and check**, **Preview link**, **Test the preview** (all three required) |
| `.github/workflows/deploy.yml` | On push to main: build, check, `wrangler deploy`, IndexNow if `INDEXNOW_ENABLED` |
| `.github/workflows/health.yml` | Scheduled checks (§9) |
| `.github/workflows/ai-agent.yml` | The **only** AI-vendor-specific file (§12) |
| `.github/workflows/dependabot-automerge.yml` | Auto-merges Dependabot **patch** updates only, after a visible-text diff check |
| `.github/dependabot.yml` | Monthly npm and Actions updates |
| `.claude/settings.json` | **Optional, Claude-only** setup convenience (permission allow/deny lists). Nothing depends on it. |
| `.site-builder/progress.json` | Setup history and evidence |
| `.site-builder/branch-protection.json` | Branch protection settings applied to `main` |
| `dns-snapshot-before.txt` | DNS records before the move to Cloudflare (2026-10-21) |
| `SITE_BUILDER.md` | The playbook used for initial setup (history) |
| `photos/` | Owner's photos go here. Empty as of 2026-10-22. |

Not in the repo (owner's machine only): `guide/` (picture guides, `handbook.html`, PDFs), `.env.local`.

---

## 5. Build and deploy

```bash
npm ci
npm run build          # → dist/
npm run check          # astro check + page rules + html-validate (needs dist/)
npm run test:worker    # redirect unit tests
npm test               # Playwright form tests; set BASE_URL to test a deployed URL
npm run dev            # local dev server
```

- **Node 24.** Astro 7 allows only one `astro preview` server at a time. If one is already running, run
  tests with `BASE_URL=http://localhost:4321`.
- `@astrojs/check` 0.9.12 needs TypeScript 5 or 6. TypeScript is pinned to 6.0.3.
- **Previews:** `checks.yml` runs `wrangler versions upload --preview-alias pr-<N>`, which gives
  `https://pr-<N>-spokaneblowerdoors-site.spokaneblowerdoors.workers.dev`. This does **not** change production.
  (The open-beta `wrangler preview` command was not used.) Preview URLs aren't redirected: `src/worker.js`
  only redirects the real domain.
- **Production deploy:** merging to `main` runs `deploy.yml` → `wrangler deploy`.
- **Roll back a bad deploy:**
  - **Preferred:** use the **Revert** button on the merged PR, then merge the revert PR, which redeploys.
    Don't merge anything else until it's live, or the next deploy brings the broken code back.
  - **Fastest (emergency):** run `npx wrangler deployments list` to see **production deployments** only.
    PR previews create *versions*, not deployments, so don't pick from `wrangler versions list`. Then run
    `npx wrangler rollback <version-id-of-the-last-good-deployment>`. Wrangler needs `CLOUDFLARE_API_TOKEN`
    and `CLOUDFLARE_ACCOUNT_ID` in the environment, from the owner's `.env.local` (load each `KEY=value`
    line into `$env:`), so on the owner's machine only. Afterwards, still revert the PR so `main` matches
    production.
  - **If the revert PR can't pass checks** (e.g. an expired token breaks "Preview link"): first fix the
    token (§3.1). Only as a last resort, the owner can temporarily turn off "Do not allow bypassing" for
    admins in Settings → Branches, merge, and turn it back on. Record it in the Change log.
- **Preview and workers.dev URLs** are public but have canonical tags pointing to the real domain, so search
  engines treat https://spokaneblowerdoors.com as the original.
- **Branch protection on `main`:** PR required (0 approvals; the owner's Merge click is the approval);
  required checks `Build and check`, `Preview link`, `Test the preview`; admins included; no force-push or
  deletion. The repo allows auto-merge and deletes branches on merge.

---

## 6. DNS

- **Registrar:** GoDaddy. **Nameservers:** `kelly.ns.cloudflare.com`, `pedro.ns.cloudflare.com` (switched
  2026-10-21; zone active). Cloudflare zone ID `73518b99fcb306f89e72604d06599511`, Free plan.
- **DNSSEC:** **active.** Cloudflare signs the zone. The DS record at GoDaddy has key tag **2371**,
  algorithm 13, digest type 2, digest `EC940BCE2C2B6C0F5B41C9C2F641698FD57220288C407EC3D1B37F870AC970A9`.
  **If you ever move DNS away from Cloudflare:** (1) remove the DS record at GoDaddy, (2) **wait at least
  48 hours** (the DS record is cached), (3) only then change the nameservers, and (4) after the move,
  disable DNSSEC in Cloudflare. Doing it in the wrong order takes the whole domain offline.
- ⚠️ **Never add GoDaddy forwarding to spokaneblowerdoors.com.** Forwarding requires GoDaddy DNS. On
  2026-10-23 at 06:08 UTC, setting up forwarding switched the main domain's nameservers back to GoDaddy
  and removed the DS record, so the site was served by GoDaddy for about 12 minutes until the owner
  restored kelly/pedro (06:20 UTC). Restore procedure: put the NS back to Cloudflare, wait **48 hours**
  (the .com delegation TTL), then re-add the DS record (unchanged: 2371/13/2/EC94…70A9; Cloudflare's
  DNSSEC shows "pending" until then).
- **Extra domains (forwarding only):** the owner also owns **washingtonblowerdoors.com** and
  **spokaneblowerdoor.com** (no "s"). Both are at GoDaddy (DNS at GoDaddy, NS ns29/ns30.domaincontrol.com),
  with no email and no website. GoDaddy **Domain Forwarding** is set to **Permanent (301), forward only** →
  spokaneblowerdoors.com (set up 2026-10-22, owner's choice over moving them to Cloudflare).
  - GoDaddy forwards only the bare domain; paths like `/services/` return 404 on those domains.
  - Today they forward to `http://spokaneblowerdoors.com`, so the Worker adds a second hop to https.
    Optional: edit each forward to use `https://`.
  - GoDaddy issues certificates per hostname. `https://www.spokaneblowerdoor.com` had no certificate yet
    right after setup.
  - Checked weekly by `launch-check.mjs`. If one fails for days, the reliable fix is to move that domain's
    DNS to Cloudflare (same process as the main domain) and add it as a Worker custom domain, with a
    redirect in `src/worker.js`.
  - Their registrations also expire 2027-10-21. Confirm auto-renew is on for each.
- **Approved DNS or email changes** (e.g. adding email hosting): also update the expectations in
  `scripts/launch-check.mjs` (it checks "no MX" and the exact DMARC record) in the same PR, or the weekly
  check will start failing.
- **Cloudflare Web Analytics:** **must stay disabled.** It auto-enabled itself and injected a beacon, which
  breaks the Privacy Policy promise. The owner disabled it on 2026-10-22. `launch-check.mjs` checks this weekly.
- Before-move snapshot: `dns-snapshot-before.txt`.

| Type | Name | Content | Proxied | Purpose (plain words) |
|---|---|---|---|---|
| AAAA | spokaneblowerdoors.com | `100::` | yes | Placeholder created by the Worker custom domain. Sends visitors to the website. |
| AAAA | www | `100::` | yes | Same, for www (redirected to the apex by the Worker) |
| TXT | _dmarc | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` | DNS only | ⚠️ **Email record, do not touch without owner approval.** Anti-spoofing policy (GoDaddy default), copied unchanged. |
| TXT | @ | `google-site-verification=zqPuxUF6iNF8ANhT-B-7Hvude-nPFCr7c8OVEsEdm1Y` | DNS only | Proves ownership to Google Search Console. Keep it. |
| TXT | @ | `google-site-verification=cjm3oXiTYBKEKAdKOb-Dh7QBADi6x-vveWoIpoRyiGM` | DNS only | A second Google verification. Origin unconfirmed (probably Google's automatic Cloudflare verification, or added by the owner). Keep it unless the owner says otherwise. |
| CNAME | _domainconnect | `_domainconnect.gd.domaincontrol.com` | DNS only | GoDaddy auto-setup helper, copied from GoDaddy. Harmless. |
| (none) | MX / SPF / DKIM | n/a | n/a | **No email is hosted on this domain.** If email is ever added, do it carefully, with owner approval. |

**Never change MX, TXT, DKIM, or NS records, or delete any record, without a before/after table and the
owner's "yes".**

---

## 7. Contact form

- **Service:** Web3Forms free plan (250 submissions/month; keeps copies for up to 3 years under its own
  privacy policy). Endpoint `https://api.web3forms.com/submit`. The access key is in `src/data/form.ts`. The
  recipient (Gabriel@2ohairsolutions.com) is set in the Web3Forms dashboard, not in code.
- **Spam:** hidden honeypot checkbox `botcheck`, plus Web3Forms' server-side filtering (CleanTalk/Akismet).
  Turnstile isn't available; reCAPTCHA is Pro-only.
- **Submission:** JSON `fetch` from the browser, then a redirect to `/thank-you/`. The no-JS fallback uses
  the `redirect` hidden field.
- **Tests:** `tests/contact-form.spec.ts` intercepts the Web3Forms request. It checks validation errors, the
  shape of the request body (key, name, email, phone, message, subject; no botcheck or redirect), the
  thank-you page, and the failure message with the phone number.
- **Known behaviour:** Web3Forms' bot protection blocks headless and automated browsers (CORS/403), so real
  delivery can't be tested by robots. The owner tests it quarterly (a reminder issue is opened). The owner's
  first live test on 2026-10-22 didn't arrive; the retry did, and landed in the inbox.

---

## 8. SEO setup

- Unique titles and descriptions per page target the owner-approved phrases (`business-facts.md` → Look and feel).
- **Structured data:** JSON-LD `HomeAndConstructionBusiness` in `src/layouts/Base.astro`: name, url, phone,
  email, areaServed, offers. No street address (service-area business) and no person names (owner's rule).
- Sitemap: `/sitemap-index.xml` (`@astrojs/sitemap`, excludes `/thank-you/`). `robots.txt` points to it.
  Canonicals use the https apex.
- **Google Search Console:** Domain property verified via DNS TXT; sitemap submitted 2026-10-22.
- **Bing Webmaster Tools:** imported from Search Console.
- **IndexNow:** key file in `public/`; `deploy.yml` pings after every deploy (`INDEXNOW_ENABLED=true`).
  First ping: 202 Accepted for 10 URLs.
- **Google Business Profile:** service-area business; **verification pending**. The copy kit is
  `guide/steps/google-business-profile.html` on the owner's machine. After verification, add the review link
  and a QR code.
- Lighthouse (mobile, live): 96 to 100 in every category at launch.

---

## 9. Scheduled checks (`.github/workflows/health.yml`)

| Schedule | Job | What it checks | On failure |
|---|---|---|---|
| Every 15 min | `uptime` | Home and contact pages return 200 with the expected text (retries once after 60s) | Issue "Website is down or broken" |
| Weekly, Mon 14:17 UTC | `weekly` | `launch-check.mjs`: NS at Cloudflare, no MX, DMARC unchanged, apex resolves, DNSSEC validates, 200/404 codes, one-hop 301s, SSL valid >14 days for apex and www, JSON-LD, canonical, **no analytics scripts**, domain registration >30 days, Web3Forms reachable | Issue "Weekly check found a problem…" |
| Monthly, 1st, 15:23 UTC | `monthly` | lychee link check of all live pages, including outside links (web3forms.com excluded: it blocks bots); Lighthouse ≥90 on the live site | Issue "Monthly check found broken links or a low Lighthouse score" |
| Quarterly (Jan/Apr/Jul/Oct 1) | `quarterly` | Opens two `reminder` issues: a facts review (owner adds the `agent` label to have an agent compare the site with `business-facts.md`) and a manual form test | n/a |

All of these are plain scripts. `scripts/health-issue.sh` keeps **one open issue per check title**. It comments
while the problem continues and **closes the issue automatically** when the check passes again. Issues
created with `GITHUB_TOKEN` don't trigger other workflows, which is why the quarterly facts review needs the
owner to add the `agent` label. Any check can be run on demand: Actions → Health checks → Run workflow.

**Dependencies:** Dependabot opens monthly PRs for npm and GitHub Actions. `dependabot-automerge.yml` turns on
auto-merge **only** for semver-patch updates, and only if the built site's visible text is unchanged. Branch
protection still requires all three checks. Everything else waits for the owner.

---

## 10. Runbooks

**Site down**
1. `node scripts/uptime-check.mjs` and `node scripts/launch-check.mjs`. Check https://www.cloudflarestatus.com.
2. Check the latest Deploy run. If a recent merge broke it, run `npx wrangler rollback`, then revert the PR.
3. DNS: `NS` must be kelly/pedro.ns.cloudflare.com, and the zone must be active. DNSSEC must validate. A DS
   mismatch breaks resolution: compare GoDaddy's DS with Cloudflare's DNSSEC panel.
4. Domain expired? Check GoDaddy (auto-renew depends on a valid card).

**Email broken**
There's no email on this domain. If email is added later, compare MX/SPF/DKIM/DMARC against the provider's
required records, and against `dns-snapshot-before.txt` for history. Restore any missing record immediately
(with owner approval) and tell the owner plainly.

**Form not delivering**
1. Ask the owner to send a test from a phone, and check the spam folder.
2. Web3Forms dashboard: is the recipient Gabriel@2ohairsolutions.com, is the key active, and is the monthly
   limit (250) reached?
3. Browser devtools on /contact/: a CORS or 403 error from api.web3forms.com points to a Web3Forms-side block
   or a domain restriction setting in their dashboard.
4. Fallback: the page always shows the phone number.

**Domain or SSL expiring**
SSL is automatic from Cloudflare (90-day certificates, auto-renewed). If the weekly check reports less than
14 days, check that the Worker custom domains are still attached. Domain renewal is at GoDaddy (auto-renew on).
Remind the owner to keep the card current.

**Failing CI check**
Read the failing job's log. Typical causes: a page title over 60 characters or a description over 155
(`check-pages.mjs`); invalid HTML (`html-validate`); a broken internal link (lychee); Lighthouse below 90;
form tests failing (selectors changed); "Preview link" failing (an expired or invalid Cloudflare token, or a
CR/LF in the secret; see §3).

**Bad fact published**
Revert the PR that introduced it (or `wrangler rollback` if urgent). Then fix `business-facts.md` **only with
the owner's confirmation**, and update `src/data/business.ts` to match.

**Analytics beacon appeared** (the issue is titled "Weekly check found a problem…"; inside, the
"No analytics/tracking scripts" row is ❌)
1. Find which script it is: view the source of https://spokaneblowerdoors.com/ and search for
   `cloudflareinsights`, `googletagmanager`, `gtag`.
2. If it's `cloudflareinsights`: Cloudflare dashboard → Web Analytics → Manage site → automatic setup →
   **Disable**. The deploy token can't change this (403), so the owner does it.
3. If it's anything else, a recent merge added it. Revert that PR.
4. Re-run: Actions → Health checks → Run workflow → weekly. The issue closes itself.

---

## 11. Owner context

- Communicate in plain language: one instruction at a time, no web jargon. The owner uses building-science
  terms precisely (ANSI/RESNET/ICC 301/380/310, CFM50, ACH50, WSEC R406), and the site's voice must match.
- **Approval rules:** every change goes through a PR the owner merges. DNS, workflows, `AGENTS.md`, and
  anything touching facts need explicit owner approval. Never invent facts. Ask in the issue or PR.
- Site rules from the owner: no personal names; no prices ("Call for a quote"); no ENERGY STAR (for now); the
  only credential is "Credentialed through Building Science Institute (BSI)"; no reviews or testimonials yet;
  no tracking or analytics.
- The owner gets no email for PRs opened under their own account (local agents act as 2OH-air77). Always give
  them the PR link directly.
- **Exception to "owner merges everything":** Dependabot *patch* updates with no visible-text change merge
  automatically after all checks pass (§9).
- **Giving a new maintainer access:** the owner invites the person's **own** GitHub account to the org (or
  as a collaborator on `website`), with Write access, or Admin only if they must manage secrets. Don't share
  the owner's login. Branch protection still requires a PR and green checks, and the owner should remain the
  one who clicks Merge on content changes. Remove access when the work ends.
- **Things only on the owner's computer:** `guide/` (picture guides, handbook PDFs, the Google Business
  Profile kit) and `.env.local`. Ask the owner if you need them.
- **Public repo by choice:** GitHub's free plan only offers branch protection on public repos. The account
  ID, zone ID and business email in this repo aren't secrets. No keys are ever committed.
- **Key dates:** the domain renews 2027-10-21 (auto-renew at GoDaddy). The Claude OAuth token expires around
  2027-10-21, so rotate it before then (§3.2). The quarterly reminder issue mentions this.
- **Reviews:** the owner doesn't want reviews or testimonials **on the website** yet. The Google review link
  (after Business Profile verification) is only for the owner's text-message template, not the site.

---

## 12. Switching AI agents

The owner's habit: **open an issue and add the `agent` label** (or comment `@claude` on an issue or PR).

- **Current wiring:** `.github/workflows/ai-agent.yml` runs `anthropics/claude-code-action` (pinned to
  v1.0.256 by SHA) with `label_trigger: agent`, using secret `CLAUDE_CODE_OAUTH_TOKEN`. The Claude GitHub App
  is installed on the org for the `website` repo only. The workflow allows only `npm ci`, `npm run build`,
  `npm run check` and `gh pr create/view/list` as extra commands. Per `AGENTS.md`, the agent opens the PR itself.
- **Nothing else in the repo depends on which agent is used.** Checks, deploys, monitoring, facts and
  `AGENTS.md` are all vendor-neutral.

**To switch to another agent:**
1. Pick the new integration, and add it to the §2 accounts table, including who pays for it.
   - **GitHub Copilot coding agent** works by **assignment**, not labels. Enable it for the org/repo (this
     needs a Copilot plan). The simplest owner habit is then "open an issue and assign it to Copilot", and
     the handbook should be updated to say so. Keeping the `agent` label would need a workflow that assigns
     labelled issues to Copilot. Check GitHub's current docs on which token is allowed to assign Copilot;
     the default `GITHUB_TOKEN` may not be.
   - **Another vendor's GitHub app or action:** prefer one that can trigger on the `agent` label.
2. Replace `.github/workflows/ai-agent.yml` with the new integration (or delete it if the new agent is an
   app with no workflow).
   - Carry over the **command limits**: only `npm ci`, `npm run build`, `npm run check` and opening or
     viewing PRs. Configure them in whatever way the new tool supports.
   - Replace the owner's second habit, the `@claude` comment, with the new tool's mention keyword, and
     update the handbook.
3. The new agent's PRs may need **Approve and run** before Actions run (GitHub's rule for some bots).
   Confirm the three required checks start, and that the agent's environment uses Node 24 (`.nvmrc`).
4. Remove the Claude pieces:
   - the `CLAUDE_CODE_OAUTH_TOKEN` secret;
   - the Claude GitHub App (org settings → GitHub Apps);
   - optionally `.claude/settings.json`;
   - the token line in the owner's `.env.local`.

   The owner can also revoke the token in their Claude account.
5. If the new tool reads only its own instructions file (e.g. `.github/copilot-instructions.md`), create it
   with a single line ("Follow AGENTS.md in the repo root; it is the only source of instructions"). This
   needs owner approval, per AGENTS.md.
6. Confirm the new agent reads `AGENTS.md`: open a test issue asking it to "reply quoting the first rule
   under 'Source of truth' in AGENTS.md, change nothing". (Issue #1 did this for Claude.)
7. Update §12 and the Change log in the same PR. The owner merges it.

---

## 13. Change log

- 2026-10-21: Repo created (public); Astro site built from `business-facts.md`; AGENTS.md; AI helper workflow.
- 2026-10-21: Contact form (Web3Forms) + Playwright tests; privacy policy updated from Web3Forms' actual policy.
- 2026-10-21: workers.dev subdomain `spokaneblowerdoors` created; PR checks + deploy workflows; `main` protected; launch PR #2 merged by owner.
- 2026-10-21: AI helper allowed to build/check and open PRs (PR #5).
- 2026-10-21: Domain moved to Cloudflare DNS (NS kelly/pedro); `_dmarc` + `_domainconnect` copied; custom domains + one-hop redirects (PR #6). IndexNow enabled.
- 2026-10-22: Cloudflare Web Analytics disabled by owner (privacy promise). Search Console verified (TXT); Bing imported; Google Business Profile pending.
- 2026-10-22: DNSSEC enabled (DS key tag 2371 at GoDaddy). Scheduled health checks, Dependabot + patch auto-merge, OPERATIONS.md added.
- 2026-10-22: washingtonblowerdoors.com and spokaneblowerdoor.com forwarded (GoDaddy 301) to the main site; added to the weekly check.
- 2026-10-23: Incident. The main domain's NS reverted to GoDaddy and the DS was removed during forwarding setup (06:08 UTC); NS restored to Cloudflare at 06:20 UTC. **DS record to be re-added at GoDaddy on/after 2026-10-25** (DNSSEC "pending" until then).
- 2026-10-22: OPERATIONS.md and AGENTS.md revised after a fresh-reader test (rollback version choice, DNSSEC move order, token rotation commands, agent switching, maintainer access). Added `.nvmrc` (Node 24).
