#!/bin/sh
# Publishes the live state to GitHub (and so to GitHub Pages): records new
# commits on the integrity chain, writes data/dashboard.json, and pushes
# launches/, .chain/, data/ and index.html. Run from cron, e.g. every 10 minutes:
#   */10 * * * * cd /opt/bundlepad && deploy/publish.sh >> /var/log/bundlepad-publish.log 2>&1
# Needs a deploy key with write access (GitHub → repo → Settings → Deploy keys).
set -eu
cd "$(dirname "$0")/.."
git pull --ff-only --quiet
node src/index.js track >/dev/null
node src/index.js pages >/dev/null
git add launches .chain data index.html memory.json
if git diff --cached --quiet; then
  exit 0
fi
git -c user.name="Bundlepad backend" -c user.email="backend@bundlepad.invalid" commit --quiet -m "Publish launch state ($(date -u +%Y-%m-%dT%H:%MZ))"
git push --quiet
