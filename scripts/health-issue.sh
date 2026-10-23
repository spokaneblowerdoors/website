#!/usr/bin/env bash
# Opens, updates, or closes one "health-alert" issue per check title.
# Usage: scripts/health-issue.sh "<issue title>" <success|failure> <report.md>
# Needs GH_TOKEN and GH_REPO in the environment (set in .github/workflows/health.yml).
set -euo pipefail
title="$1"; outcome="$2"; report="$3"
run_url="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-$GH_REPO}/actions/runs/${GITHUB_RUN_ID:-0}"
existing=$(gh issue list --label health-alert --state open --search "in:title \"$title\"" --json number,title \
  --jq ".[] | select(.title == \"$title\") | .number" | head -1)

if [ "$outcome" = "success" ]; then
  if [ -n "$existing" ]; then
    gh issue close "$existing" --comment "✅ Fixed: the check passed again ($run_url). Closing automatically."
  fi
  echo "Check passed."
  exit 0
fi

body="$(printf '**What happened:** an automatic check of spokaneblowerdoors.com failed.\n\n**What to do:** nothing urgent unless the site is down for customers. If it is, see OPERATIONS.md → Runbooks, or add the **agent** label to this issue to ask the AI helper to investigate (it explains in plain words and changes nothing without your approval).\n\nThis issue closes itself when the check passes again.\n\n<details><summary>Technical details</summary>\n\n%s\n\nRun: %s\n</details>\n' "$(cat "$report")" "$run_url")"

if [ -n "$existing" ]; then
  gh issue comment "$existing" --body "Still failing ($run_url)."
else
  gh issue create --label health-alert --title "$title" --body "$body"
fi
exit 1
