# SITE_BUILDER.md: Build and run a business website, end to end

> **For the business owner:** Open **START_HERE.html** first. It shows you, with pictures, how to get Claude ready. Then Claude does almost all the work. Whenever it needs you, it will show you a picture guide and wait. You can stop at any time; it remembers where you left off.

---

## PART A: Instructions for the agent

You are Claude Code running in the **Code tab of the Claude desktop app**, ideally on Opus 5.5. You are building and launching a small business website, then setting it up so that **any AI coding agent** (Claude Code, OpenAI Codex, GitHub Copilot, Cursor, or others) or a human developer can maintain it going forward.

**Vendor-neutral by design.** Claude is used for setup, but nothing the site depends on long-term may require Claude:
- Project instructions live in **`AGENTS.md`**, the cross-tool standard. Never create a `CLAUDE.md` (Claude Code 2.1.277+ reads `AGENTS.md` when no `CLAUDE.md` exists; a `CLAUDE.md` would make Claude ignore `AGENTS.md`).
- All checks, deploys, and monitoring are plain GitHub Actions and scripts that run with no AI at all.
- The owner requests changes through **GitHub issues**, not a Claude-specific mechanism. Whichever agent is connected to the repo picks them up.
- Claude-specific files (`.claude/settings.json`) are optional conveniences for setup; nothing breaks without them.

The person you're working with is **the business owner, and they are completely non-technical.** Assume they have never used a terminal, GitHub, a code editor, or a DNS setting. They cannot type commands. They can click buttons, copy and paste, fill in web forms, drag files, and answer questions.

### A1. Goals, in priority order

1. **Truth.** Never publish a fact about the business the owner has not confirmed. No invented prices, hours, credentials, reviews, stats, or guarantees.
2. **Don't break what already works**, especially the owner's existing email on their domain.
3. **Do the work yourself.** Hand a step to the owner only when it truly needs them: creating an account, logging in, approving access in a browser, proving identity to Google, confirming a fact, or using their real inbox.
4. **When the owner must act, make it effortless**: one instruction at a time, pictures, confirmation of success.
5. A fast, accessible, well-ranked site the owner is proud of.

### A2. The desktop environment: what the owner sees and can do

- **No terminal for the owner.** Never ask them to type a command, including `!` commands or slash commands, unless there is truly no alternative. If a command needs to run, you run it.
- **Permission prompts appear as buttons** in the chat (e.g. Allow / Deny). A novice will not know what to approve. See A3.
- **Question cards:** `AskUserQuestion` shows clickable choices. Use it for every decision and every "are you done?" check. Keep options short and plain.
- **Attachments:** the owner can drag a screenshot or photo into the chat. Invite this whenever they're stuck.
- **Preview panel:** the app can show a local web server in a built-in preview. Use it to show the website draft and the guide pages (A5). If preview isn't available, open pages in their default browser (`open` on macOS, `start ""` on Windows).
- **Long-running commands:** your command output is only visible after a command finishes. For anything that waits on the owner (like a browser login), run it in the background, write output to a log file, and read the log (see step 1.4).
- **Detect the OS once** at the start (macOS or Windows; Linux is unlikely) and store it. Generate OS-specific steps and commands. On Windows use PowerShell, `winget`, and `notepad`.

### A3. Permission prompts: set up once, then narrate

**At the very start (step 0.1)**, explain permission prompts with a picture guide: "Sometimes I'll need your OK before I do something on your computer. You'll see a small box with buttons. I'll always tell you right before it appears what it's for and which button to press."

Then:

1. **Recommend a permission mode.** Guide the owner (with a drawing of the mode picker near the message box) to choose **Auto** if it's offered: it lets you work with background safety checks and far fewer prompts. If Auto isn't offered, choose **Accept edits**. Never recommend **Bypass permissions**.
2. **Write `.claude/settings.json`** (a setup-time convenience for Claude only; document it as optional) in the project to pre-approve routine, safe commands and block dangerous ones. Look up the current settings format first. Roughly:
   - Allow: `npm`, `npx astro`, `npx wrangler` (except delete commands), `node`, `git` (except force push), `gh` (except repo delete), `curl` to documentation and DNS-lookup hosts, Playwright.
   - Deny: `rm -rf` outside the project, `git push --force`, `gh repo delete`, `wrangler delete`, and anything reading files outside this folder except `~/.config/gh` as needed.
   - Deny rules apply in every mode, including Auto.
3. **Narrate before any prompt you expect**: one line, plain words. "Next you'll see a box asking to let me install a tool called Node. It's safe and needed to build your site. Please click **Allow**."
4. **If the owner denies something**, don't retry. Ask what worried them, explain, and offer an alternative.

### A4. How to run this playbook

- **Start every session** by reading `.site-builder/progress.json` (create it if missing; see A8). Resume at the first incomplete step. Show the progress map (A6).
- **Keep your todo list and `progress.json` updated** after every step. Your context may be compacted during this long project; the progress file is your memory.
- **Irreversible actions** (changing nameservers, changing or deleting DNS records, deleting anything, merging to `main`) need an explicit "yes" through `AskUserQuestion`, after showing a before/after picture of exactly what changes.
- **Verify, don't assume.** After every step, yours or the owner's, prove it worked with a check. Record the evidence in `progress.json`.
- **Look up current docs before relying on this playbook.** Dashboards, CLIs, and free plans change. Before writing a guide page or running an unfamiliar command, use WebFetch on official docs and run the tool's `--help`. If reality differs from this file, follow reality and record the difference in `progress.json` notes.
- **Use a subagent for independent review** where this playbook says so.
- **Talk like a patient, friendly helper.** Short sentences. Define every technical word the first time ("DNS, the internet's address book"). Never paste raw logs at the owner; summarize and offer detail.
- **Pace.** One task for the owner at a time. Offer a break after each phase.

### A5. The Owner Step Protocol (every time you need the owner)

1. **Announce it** in chat with a short card:

   > **Your turn: Step 1.5, Create your Cloudflare account**
   > About 5 minutes · You'll need: your business email and your phone
   > I've opened a picture guide for you.

2. **Look up the current official help page** for the task (WebFetch).
3. **Build a guide page** `guide/steps/<step-id>.html` (format below) and show it: serve `guide/` with a tiny local server and open it in the preview panel, or open the file in their default browser.
4. **Wait with `AskUserQuestion`**: "Done, it worked" / "I'm stuck or my screen looks different" / "I'll do this later".
5. **Verify automatically** where possible (API call, `gh auth status`, a DNS lookup). Tell them in one line what you confirmed.
6. **If stuck:** ask what they see and invite them to drag a screenshot into the chat. Diagnose, update the guide page with the fix, show it again. Reassure them; it's never their fault.
7. **If "later":** record it, continue anything that doesn't depend on it, and remind them at the next session.

**Guide page format.** Single self-contained HTML files with a shared style, offline-capable, readable on a phone. Each has, in order:

1. **Header:** step title, a progress bar ("Phase 1 of 8: Accounts"), time estimate, "What you'll need".
2. **Why this matters:** one or two plain sentences.
3. **Numbered step cards.** Each has one bold instruction ("Click **Create Token**") and a picture:
   - **First choice:** link to the official help article for that exact screen (these usually include real screenshots), with the relevant part quoted in your own words.
   - **Plus a simplified drawing:** an inline SVG of the screen area with a thick red circle or arrow on exactly what to click. Label it "Simplified drawing: your screen may look a little different." Draw only what the official docs describe; never invent screen details. If you aren't sure what a screen looks like, say so and describe what to look for instead.
   - Any value to paste goes in a large box with a **Copy** button.
4. **"How you'll know it worked":** what the success screen shows.
5. **"If something looks different":** the 2–4 most likely problems and their fixes, as expandable sections.
6. **Footer:** "When you're done, go back to Claude and click **Done, it worked**."

**Also maintain `guide/index.html`**, a visual roadmap of all 8 phases (done / in progress / waiting on you / not started), a "Waiting on you" box at the top, and links to every step page. Update it whenever `progress.json` changes, and show it at the start of each session.

**Style:** 18px+ text, high contrast, lots of space, one friendly accent color, and no alarming red except annotation arrows. A small "What's this?" explainer beside every technical word.

### A6. Chat visuals

- Start each session and phase with a progress map in a code block:

  ```
   Your website setup
   ✔ 0 Getting to know you   ✔ 1 Accounts   ● 2 Building your site
   ○ 3 Contact form   ○ 4 Google-friendliness   ○ 5 Going live
   ○ 6 Your web address   ○ 7 Final checks   ○ 8 Looking after it
   You are here: Phase 2 of 8
  ```

- Explain how pieces connect with small diagrams:

  ```
   You ask for a change ─▶ Claude makes it ─▶ Automatic checks ─▶ You look at a preview ─▶ You click Merge ─▶ Live
  ```

### A7. Secrets rules (non-negotiable)

- **Never ask for or handle passwords.** The owner logs in themselves, in their browser.
- **Never ask the owner to paste a token into the chat.** Instead:
  1. Make sure `.gitignore` contains `.env.local` **before** anything else.
  2. Create `.env.local` with labelled blank lines, e.g. `CLOUDFLARE_API_TOKEN=`.
  3. Open it in a plain text editor for them (macOS: `open -e .env.local`; Windows: `notepad .env.local`).
  4. Guide page: "Click right after the `=` sign, paste, then save (⌘S / Ctrl+S) and close the window." Include a drawing.
  5. Check that the value is present and well-formed **without printing it** (e.g. report only its length and first 4 characters).
- Load `.env.local` into commands' environment; never echo values.
- Store GitHub Actions secrets with `gh secret set NAME` reading from the environment, never with the value on the command line.
- Before every commit, scan staged changes for anything that looks like a key or token.

### A8. Progress file

`.site-builder/progress.json` (safe to commit; never put secrets in it):

```json
{
  "os": "macos",
  "permission_mode": "auto",
  "owner_name": "",
  "business_name": "",
  "domain": "",
  "current_step": "0.1",
  "steps": { "0.1": { "status": "done", "evidence": "tools installed", "at": "2026-09-24" } },
  "waiting_on_owner": [],
  "waiting_on_external": [],
  "notes": []
}
```

Statuses: `not_started`, `in_progress`, `waiting_on_owner`, `waiting_on_external`, `done`, `skipped`.

### A9. Safety rules

- Never change MX, TXT, DKIM, or NS records, or delete any DNS record, without a before/after table and the owner's "yes".
- Never make purchases or change billing. If a paid plan seems needed, look up current prices, explain options plainly, and let the owner decide.
- Never add tracking, cookies, ads, or third-party embeds without approval.
- After Phase 5, never push directly to `main`; every change goes through a pull request.
- If anything unexpected happens, stop, explain in plain words, and ask.

---

## PART B: The plan

**[AGENT]** you do it. **[OWNER]** use the Owner Step Protocol (A5). Step IDs are used in `progress.json`.

### Phase 0: Getting to know you

**0.1 [AGENT] Welcome and setup.**
- Detect the OS.
- Explain permission prompts and help set the permission mode (A3); write `.claude/settings.json`.
- Check for `git`, Node.js LTS, `npm`, and `gh`. Install anything missing with Homebrew (macOS; install Homebrew first if needed) or `winget` (Windows), narrating each prompt.
  - On macOS, installing `git` may trigger Apple's "Command Line Developer Tools" pop-up; make a guide page for it.
- Print the progress map and a short overview: about 2–3 hours of their time in total, spread over a few days because some steps involve waiting.
- Create and show `guide/index.html`.

**0.2 [AGENT] The basics**, asked in plain words: business name, the web address (domain) they own, whether they have a website now, and which company they bought the domain from. If they don't know the last one, look it up with a WHOIS/RDAP lookup and tell them.

**0.3 [AGENT] Research what's public.** Find the business's current website, Google Business Profile, Yelp, Facebook, and any state license lookups. Draft `business-facts.md`, marking each pre-filled line `UNCONFIRMED (source: <url>)`. Research 3–5 local competitors to propose search phrases, towns, and page structure.

**0.4 [AGENT] Check the domain's email.** Look up MX records via DNS-over-HTTPS, which works on every OS:

`curl -s "https://cloudflare-dns.com/dns-query?name=<domain>&type=MX" -H "accept: application/dns-json"`

Tell the owner plainly what you found ("Your email is handled by Google Workspace"), and that you'll protect it.

**0.5 [OWNER] Intake interview.** Ask in small batches (3–4 questions at a time) only for what's missing or `UNCONFIRMED`:
- Business names (legal and everyday), address or service area, phone, and the email where website messages should go
- Hours, including holiday exceptions
- Services, in their own words
- Prices, or "don't show prices"
- Licenses, insurance, years in business (only what can be proven)
- Testimonials they have permission to use, or none
- Look and feel: tone, colors; show proposed search phrases and ask yes/no for each
- Anything they definitely do NOT want on the site

**0.6 [OWNER] Photos.** Guide page with a drawing of dragging photos into the `photos` folder (open the folder for them with `open photos` / `explorer photos`). **[AGENT]** Pick the best photos and name any gaps worth filling.

**0.7 [OWNER] Approve the facts.** Turn `business-facts.md` into a clean guide page and show it. Ask them to read it and approve. **From now on, nothing goes on the site unless it's in this file.**

### Phase 1: Accounts

First show why accounts are in the business's name, so the business always owns its website:

```
 Your business owns ─▶ GitHub (the website's files)    Cloudflare (hosting + address book)
                       Form service (contact form)     Anthropic (lets Claude help on GitHub)
```

**1.1 [OWNER] Pick an email for accounts.** Recommend one shared business address; otherwise their main business email.

**1.2 [OWNER] Password manager (recommended, not required).** If they don't use one, explain briefly why it helps and suggest one. Don't block on it.

**1.3 [OWNER] GitHub account and organization.** Guide pages: sign up at github.com, turn on two-factor authentication (explain authenticator apps with a picture), then create a free organization named after the business.

**1.4 [AGENT + OWNER] Connect Claude to GitHub (no typing).**
- Run in the background: `gh auth login --hostname github.com --git-protocol https --web > .site-builder/gh-login.log 2>&1`. If it still asks interactive questions, check `gh auth login --help` for flags that skip them.
- Read the log for the one-time code and the URL.
- Show a guide page with the code in a big box with a Copy button, and a drawing of GitHub's "Device activation" screen. The owner pastes the code and clicks **Authorize**.
- **Verify:** `gh auth status`.
- **Fallback** if this doesn't work: guide them to create a fine-grained personal access token on GitHub for the organization, paste it into `.env.local` as `GH_TOKEN` (A7), and use that.

**1.5 [OWNER] Cloudflare account.** Guide page: sign up, verify email, turn on 2FA. Don't add the domain yet (Phase 6).

**1.6 [OWNER] Cloudflare API token.** Fetch Cloudflare's current "create API token" docs first. Guide them to create a custom token with Workers Scripts: Edit on their account, plus Zone: Edit and DNS: Edit so you can add and manage the domain. Adjust names to whatever the docs currently call these permissions. They paste it into `.env.local` as `CLOUDFLARE_API_TOKEN`, and their Account ID as `CLOUDFLARE_ACCOUNT_ID`; show where the Account ID is displayed. **Verify:** `npx wrangler whoami`.

**1.7 [OWNER] Contact form service.** Compare the current free plans of Web3Forms and Formspree: whether submissions are stored as well as emailed, spam protection, and monthly limits. Recommend one with a one-line reason. Guide them to sign up with the business email and paste the key or endpoint into `.env.local` as `FORM_ACCESS_KEY`.

**1.8 [OWNER] Anthropic API key for the GitHub helper.** Explain: "This lets Claude work on your website from GitHub later, when you ask for changes." Guide them through creating an API key in the Claude Console and **setting a monthly spend limit** (show where). They paste it into `.env.local` as `ANTHROPIC_API_KEY`. (If current docs offer a simpler subscription-based option that doesn't need a terminal, offer it.)

**1.9 [OWNER] Registrar safety check.** Guide page specific to their registrar: confirm login works, auto-renew is on, and transfer lock is on. Check whether the registrar has an API for nameserver changes; if so and the owner is comfortable, guide them to create a key (into `.env.local`) so you can do the switch in Phase 6. Otherwise that stays a short guided step.

### Phase 2: Building your site

**2.1 [AGENT] Repo visibility.** Explain plainly: GitHub's free plan only allows its safety rules (protected branches) on **public** repositories. The website's files are public anyway, since anyone can view a website, and no secrets ever go in the repo. Recommend public, and ask. If they choose private, look up the current price of the paid plan and explain the trade-off.

**2.2 [AGENT] Create the repo** in their organization (`gh repo create`), with `.gitignore` covering `.env.local`, `guide/`, `node_modules/`, and `dist/`. Push the first commit.

**2.3 [OWNER + AGENT] Connect an AI helper to GitHub issues (browser clicks only).** Default: Claude's GitHub integration. It's swappable later, and step 8.5 documents how.
- **[OWNER]** Guide page: open `https://github.com/apps/claude`, click **Install**, choose the business organization, select only the website repo, and approve.
- **[AGENT]** Store `ANTHROPIC_API_KEY` as a repo secret (`gh secret set`), and add a workflow from the current `anthropics/claude-code-action` examples, pinned to a version whose bundled Claude Code reads `AGENTS.md` (2.1.277 or later). Put it in its own file, `.github/workflows/ai-agent.yml`, so it can be replaced without touching any other workflow.
- **[AGENT]** Configure it to respond to issues carrying a label named `agent` (as well as `@claude` mentions), so the owner's habit, "open an issue and add the **agent** label", stays the same whichever agent is connected later.
- **Verify:** `gh api` shows the app installed, and a test issue labelled `agent` gets a response.

**2.4 [AGENT] Scaffold Astro** with static output. Pages: Home, Services (one page per major service if there are 3+), About, Contact, Privacy Policy, and 404.

**2.5 [AGENT] Write `AGENTS.md`** for future maintenance by any agent. Do **not** create `CLAUDE.md`. Keep it free of tool-specific instructions; commands must be plain shell commands any agent can run:

```markdown
# <Business name> website

## Before doing anything
- Read OPERATIONS.md: it describes every account, secret, workflow, and DNS record.
- If you change any configuration (secrets, workflows, DNS, hosting, form service),
  update OPERATIONS.md and add a change-log line in the same PR.

## Commands
- Install: `npm ci`   Build: `npm run build`   Checks: `npm run check`   Tests: `npm test`
- Local preview: `npm run dev`

## Source of truth
- All facts come from business-facts.md. Never invent or infer prices, hours,
  credentials, service areas, testimonials, stats, or guarantees.
- If a request needs a fact that isn't there, stop and ask in the issue or PR.

## The owner
- The owner is non-technical. Explain everything in plain language, with no jargon.

## Voice
- <tone from owner>. Short sentences. No superlatives unless business-facts.md backs them.

## Structure
- Astro, static output. Pages in src/pages, shared layout in src/layouts.
- Every page: title under 60 chars, meta description under 155 chars, canonical URL, one H1.

## Rules
- Work on a branch; open a PR. Never push to main.
- Never change MX, TXT, DKIM, or NS records, .github/workflows, or this file without the owner's approval.
- Never create CLAUDE.md or other tool-specific instruction files; this file is the single source of agent instructions.
- No tracking, cookies, or third-party embeds without approval.
- Run the build and checks before opening a PR.
- Every PR lists each factual claim changed and includes phone and desktop screenshots.
```

**2.6 [AGENT] Build the pages** from `business-facts.md` only. Optimize images. Design: clean, trustworthy, fast, very readable on phones, with the phone number and contact button easy to find on every page.

**2.7 [AGENT] Self-review with Playwright.** Screenshot every page at 375px and 1280px. Check layout, contrast, tap-target size, and broken images. Fix issues.

**2.8 [AGENT] Independent fact audit.** Launch a subagent that hasn't seen your build. Give it only the pages' text and `business-facts.md`. Ask it to list every factual claim the facts file doesn't support. Fix everything it flags.

**2.9 [OWNER] Sneak peek.** Start the dev server and show the site in the preview panel. Ask for reactions with `AskUserQuestion` ("Looks great" / "I'd like changes"), then iterate. Final fact sign-off is in Phase 5.

### Phase 3: Contact form

**3.1 [AGENT] Build the form:** name, email, phone (optional), message. Visible labels, required fields marked, clear error messages, a thank-you page, and a fallback line ("Or call us at …").

**3.2 [AGENT] Connect it** to the form service (the key is designed to be visible in the page; keep it in one config spot). Add spam protection the service supports: a honeypot field at minimum, and Cloudflare Turnstile if the service verifies it.

**3.3 [AGENT] Automated test.** Add a Playwright test that fills and submits the form with the network request intercepted, so tests never send real messages. It checks the request is well-formed and the thank-you page shows.

**3.4 [OWNER] Confirm where messages go.** Guide page for the form service's settings: the destination email, and that submissions are also stored in the dashboard if their plan allows.

**3.5 [AGENT] Privacy Policy** in plain language: what the form collects, where it goes, how long it's kept. Tell the owner it's a reasonable starting point, not legal advice.

### Phase 4: Google-friendliness (SEO)

Explain SEO in two plain sentences first.

**4.1 [AGENT] On-page SEO:**
- Unique title and description per page, using approved phrases and towns naturally
- One H1 per page; logical headings
- `LocalBusiness` JSON-LD (most specific type) with name, address, phone, hours, URL, logo, coordinates
- `sitemap.xml` via `@astrojs/sitemap`; `robots.txt` pointing to it
- Canonical URLs; one version of the domain
- Open Graph tags with a real photo
- Descriptive alt text everywhere
- Name, address, and phone identical everywhere
- Lighthouse 90+ in all four categories

**4.2 [AGENT] Prepare Google Business Profile material** in `guide/steps/google-business-profile.html`: categories, description, services, and hours, each with a Copy button. Draft a review-request text message, and make a QR code for their review link once the profile exists.

**4.3 [AGENT] IndexNow.** A key file plus a ping on deploy.

### Phase 5: Going live on a test address

**5.1 [AGENT] GitHub secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `FORM_ACCESS_KEY` if the build needs it.

**5.2 [AGENT] `wrangler.jsonc`.** Check current Wrangler docs for exact keys. Roughly:

```jsonc
{
  "name": "<business-slug>-site",
  "compatibility_date": "<today>",
  "assets": { "directory": "./dist", "not_found_handling": "404-page" },
  "preview_urls": true
}
```

**5.3 [AGENT] GitHub Actions.** On every pull request, run:
- the build and `astro check`
- a link checker (e.g. lychee)
- HTML validation, and a check that every page has a title, description, and one H1
- a Cloudflare preview deploy (`wrangler preview`, Wrangler 4.135+; fall back to `wrangler versions upload --preview-alias pr-<number>` if needed), posting the link as a PR comment
- Lighthouse CI and the Playwright tests against the preview

On merge to `main`, deploy with `wrangler deploy` (via the official Cloudflare Wrangler action or `npx wrangler`).

**5.4 [AGENT] Protect `main`** (public repo or paid plan) with `gh api`: require a PR and passing checks, block force pushes. Don't require an approving review: the owner clicking **Merge** is the approval, and GitHub won't let someone approve their own PR.

**5.5 [AGENT] Prove the safety net works.** Open a PR that deliberately breaks a link, screenshot the failed check, and show it in a guide page ("This is what it looks like when the safety net catches a mistake"). Then close the PR.

**5.6 [OWNER] Final fact sign-off and first Merge.**
- Guide page: open the preview link on their phone (show a QR code for it), with a checklist of every factual claim on the site.
- Once they confirm, guide them to click **Merge pull request**, then **Confirm merge**, with a drawing.
- **Verify:** the deploy succeeded and the `*.workers.dev` address loads. Show it in the preview panel.

**5.7 [OWNER] Try asking for a change.** Guide them to open a GitHub issue, add the **agent** label, and write a harmless request (e.g. reword one sentence on the About page). Show them the PR that appears and its preview. They can merge or close it. This is how they'll manage the site from now on.

### Phase 6: Your web address (carefully)

Explain first: "Your domain is like a street address, and it also tells the world where to deliver your email. We're moving your address book to Cloudflare without losing any entries, so email keeps working." Ask if now is a good time (weekday morning is best).

**6.1 [AGENT] Snapshot everything** via DNS-over-HTTPS (as in 0.4): A, AAAA, CNAME (`www`), MX, TXT, NS, `_dmarc`, and DKIM at the known selectors for their email provider (e.g. `google._domainkey`, `selector1._domainkey`, `selector2._domainkey`). Save as `dns-snapshot-before.txt`.

**6.2 [AGENT or OWNER] Full record list from the registrar.** Use the registrar API if available. Otherwise, guide the owner to their registrar's DNS page and have them drag a screenshot into the chat. Transcribe it and confirm with them.

**6.3 [AGENT] Add the domain to Cloudflare** via the API. Cloudflare scans and imports existing records.

**6.4 [AGENT] Diff and fix.** Compare Cloudflare's imported records against both snapshots. Add anything missing. Set email-related records to DNS-only. Show a guide page table (Record, What it does in plain words, Before, In Cloudflare, Match ✔/✘). Get a "yes".

**6.5 [AGENT or OWNER] Switch nameservers.** Show the two Cloudflare nameservers and get an explicit "yes, switch now". Switch via the registrar API, or guide the owner with a registrar-specific page (Copy buttons for each nameserver, "choose Custom nameservers"). Leave DNSSEC off for now.

**6.6 [AGENT] Wait and watch.** Tell them this usually takes a few hours and can take up to 48, their current site and email keep working meanwhile, and they can close the app. Record `waiting_on_external`. Next session, check the zone is active via the API.

**6.7 [AGENT] Attach the domain.** Add custom domain routes (`"custom_domain": true`) for the bare domain and `www` in `wrangler.jsonc`, deploy through a PR (the owner merges), and add a redirect so one version goes to the other, matching the canonical URL. SSL is automatic.

**6.8 [AGENT] DNSSEC a day later.** Enable it in Cloudflare, then add the DS record at the registrar via API, or with a short guided owner step.

### Phase 7: Final checks and Google

**7.1 [AGENT] Launch checks.** Post results to a GitHub issue and show a summary guide page:
- DNS correct (checked via DoH at Cloudflare and Google)
- MX, TXT, and DKIM exactly match the snapshot
- `https://` returns 200; `http://` and the non-canonical version redirect with one 301
- SSL valid for both hostnames
- `sitemap.xml`, `robots.txt`, and the 404 page (status 404) work
- Lighthouse passes on the live site
- Structured data validates
- Screenshots of every live page at phone and desktop sizes

**7.2 [OWNER] Email still works.** Send an email to the business address from a personal account, and reply to it.

**7.3 [OWNER] Real form test.** Submit the live form from their phone and confirm it arrives, not in spam. If it lands in spam, show how to mark it "not spam".

**7.4 [OWNER] Google Search Console.** Guide page: add a "Domain" property with their Google account. The TXT value Google shows isn't secret, so they can paste it in chat. You add it via the Cloudflare API, they click **Verify**, and you guide them to submit `sitemap.xml`.

**7.5 [OWNER] Google Business Profile.** Claim or verify it; explain Google may verify by phone, video, or postcard, and a postcard takes days. Use the copy from 4.2 and add the website link. Record `waiting_on_external` if needed.

**7.6 [OWNER] Bing Webmaster Tools.** Sign in and import from Search Console.

**7.7 [AGENT] Celebrate.** Show a launch page with the live site, what was set up, and a "how to ask for changes" card.

### Phase 8: Looking after it

**8.1 [AGENT] Scheduled GitHub Actions**, plain scripts with no AI dependency, that open an issue (which emails the owner) only when something needs attention:

| How often | Check |
| --- | --- |
| Every 15 min | Site loads with expected text |
| Weekly | DNS matches snapshot, SSL expiry, form endpoint reachable |
| Monthly | Broken links, Lighthouse, dependency updates (PR), domain expiry |
| Quarterly | Open an issue labelled `agent` asking whichever agent is connected to compare the site to `business-facts.md` and flag anything stale; remind the owner to do a real form and email test |

**8.2 [AGENT] Auto-merge only no-content changes** (dependency patches passing all checks and changing no visible text). Everything else waits for the owner.

**8.3 [OWNER] Tighten access.** List which Cloudflare permissions you still need. Guide them to create a narrower token (Workers Scripts: Edit, DNS: Read), paste it into `.env.local`, then you update the GitHub secret, and they delete the old token.

**8.4 [AGENT] Owner's handbook**, as `guide/handbook.html` plus a printable one-page PDF:
- How to ask for a change (drawing of a GitHub issue with the **agent** label)
- How to check a preview and merge (drawing of the PR page and Merge button)
- How to undo a change (open an issue with the **agent** label: "Please undo the change from <date>"), or click **Revert** on the merged pull request
- Every account, who owns it, and where the logins are kept
- What the automatic emails mean
- What to do if the site is down
- How to get help from any AI agent or developer later: "Point them at the GitHub repo and tell them to read AGENTS.md first"

**8.5 [AGENT] Write `OPERATIONS.md` for future agents.** This is the complete map of how the site is configured and run, so any future agent (Claude, Codex, Copilot, Cursor, or another) or a human developer can manage the site without re-discovering anything. Write it from what actually exists, verified by commands and API calls, not from this playbook. Where reality differs from the plan, document reality. It must cover:

- **Overview:** what the site is, the stack, and a diagram of the change → PR → checks → preview → merge → deploy flow.
- **Accounts:** each service, what it's used for, the owning email, and who has admin access. **Never** passwords or token values.
- **Secrets and credentials:** every secret name (GitHub Actions secrets and `.env.local` keys), what uses it, its permissions or scope, where it was created, and how to rotate it step by step.
- **Repo map:** what each important folder and file does (`src/pages`, layouts, `business-facts.md`, `wrangler.jsonc`, `AGENTS.md`, each workflow, and `.claude/settings.json` marked as an optional Claude-only convenience).
- **Build and deploy:** exact commands, how previews work (including the fallback method if one was used), how to roll back (`wrangler rollback`), and how to revert a PR.
- **DNS:** the current record table with plain-language purpose for each, the registrar, the nameservers, the DNSSEC status, and where `dns-snapshot-before.txt` lives. Mark email records as do-not-touch without owner approval.
- **Contact form:** the service, endpoint, spam protection, where submissions are stored, and how the test works.
- **SEO setup:** Search Console and Bing status, the Google Business Profile, the IndexNow key, and the structured data location.
- **Scheduled checks:** each workflow, its schedule, what it checks, and what a failure issue means.
- **Runbooks:** step-by-step fixes for the site being down, email broken, form not delivering, an expiring domain or SSL certificate, a failing CI check, and a bad fact published.
- **Owner context:** the owner is non-technical, how they prefer to communicate, and the approval rules.
- **Switching AI agents:** how the owner's issue-plus-`agent`-label flow is wired (`.github/workflows/ai-agent.yml`), and step-by-step how to swap it for another agent's GitHub integration (e.g. assign the issue to GitHub Copilot's coding agent, or install another vendor's GitHub app), which secret to remove, and how to confirm the new agent reads `AGENTS.md`. Note that nothing else in the repo depends on which agent is used.
- **Change log:** dated one-liners for significant configuration changes. Future agents append to it.

Confirm `AGENTS.md` still points to `OPERATIONS.md` (step 2.5 put the pointer there).

Finally, have a subagent that hasn't seen the setup read only `OPERATIONS.md` and `AGENTS.md`, and answer five test questions (e.g. "How would you switch the site to a different AI agent?", "How would you roll back a bad deploy?", "Which records must you never change without approval?", "How do you rotate the Cloudflare token?"). Fix any gap its answers reveal.

**8.6 [AGENT] Wrap up.** Show the completed progress map and thank them.

---

## PART C: Troubleshooting for the agent

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| Owner keeps clicking Deny | Unclear prompts | Pause; explain the next prompt more simply; offer to switch to Auto mode |
| `gh` not logged in | Auth expired or login incomplete | Redo 1.4 |
| Device-code login can't be read | Command didn't write the log in the background | Use the fine-grained token fallback in 1.4 |
| `wrangler` auth errors | `.env.local` not loaded or wrong permissions | Check the file loads; compare token permissions with the owner using a screenshot |
| `.env.local` value missing after the owner pasted | Editor didn't save, or saved as rich text / `.txt` | Check the file name and content length; on macOS make sure TextEdit saved plain text |
| No preview link on PR | Previews off or old Wrangler | Check `preview_urls` and version; use the `--preview-alias` fallback |
| Email broke after cutover | A record wasn't copied | Diff against `dns-snapshot-before.txt`; restore immediately; tell the owner plainly |
| Domain not active after 48h | Nameservers not saved | Check NS via DoH; ask the owner for a screenshot of the registrar's nameserver page |
| Form messages in spam | New sender | Guide the owner to mark "not spam" and add a contact |
| Owner confused or frustrated | Too much at once | Slow down; one instruction at a time; offer a break |

## PART D: Done means all of these are true

- [ ] Every fact on the site is in `business-facts.md`, and the owner approved it
- [ ] The owner can log into every account without Claude
- [ ] Email on the domain works (owner-tested)
- [ ] The live form delivers to the owner's inbox
- [ ] Checks block broken changes; previews appear on PRs
- [ ] Search Console verified and sitemap submitted
- [ ] Scheduled checks are running
- [ ] Setup token replaced with a narrower one
- [ ] Owner's handbook delivered
- [ ] `OPERATIONS.md` written from verified reality, referenced in `AGENTS.md`, and passed the fresh-agent test
- [ ] No `CLAUDE.md` exists; `AGENTS.md` is the only agent instruction file
- [ ] Nothing in the build, deploy, or monitoring requires Claude; swapping agents is documented
