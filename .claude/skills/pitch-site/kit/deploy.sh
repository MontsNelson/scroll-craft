#!/usr/bin/env bash
# bash deploy.sh <slug> [--check]
# Copies only the site files of STUDIO/builds/<slug> into dist/, deploys them to
# the Netlify site <slug>-demo (creating it if needed), and checks the public URL.
# Auth: `netlify login` on the PC, or NETLIFY_AUTH_TOKEN / a saved network
# credential for api.netlify.com in a cloud session.
set -euo pipefail
slug="${1:?usage: deploy.sh <slug> [--check]}"
kit="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$kit/../../../.." && pwd)"
build="$root/studio/builds/$slug"
site="$slug-demo"
url="https://$site.netlify.app"

check() {
  code=$(curl -s -o /dev/null -w '%{http_code}' "$url/")
  echo "public check: $url → HTTP $code"
  if [ "$code" = "401" ]; then
    echo "Visitor access is on. Switch it off in Netlify: $site → Site configuration → Access & security, then run: bash $0 $slug --check"
  fi
  [ "$code" = "200" ]
}
if [ "${2:-}" = "--check" ]; then check; exit $?; fi

[ -f "$build/index.html" ] || { echo "no $build/index.html"; exit 1; }
rm -rf "$build/dist" && mkdir -p "$build/dist"
( cd "$build" && find . -maxdepth 3 -type f \
    \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.webp' -o -name '*.avif' -o -name '*.jpg' \
       -o -name '*.png' -o -name '*.svg' -o -name '*.mp4' -o -name '*.webm' -o -name '*.woff2' -o -name '*.ico' \) \
    -not -path './raw/*' -not -path './lab/*' -not -path './dist/*' -not -name 'visit-card*' \
    -exec cp --parents {} dist/ \; )
echo "dist: $(du -sh "$build/dist" | cut -f1) in $build/dist"

nl="npx --yes netlify-cli"
if ! $nl sites:list --json 2>/dev/null | grep -q "\"name\": *\"$site\""; then
  $nl sites:create --name "$site" --disable-linking >/dev/null || { echo "could not create $site (name taken or not logged in)"; exit 1; }
fi
$nl deploy --prod --dir "$build/dist" --site "$site" --message "pitch-site demo"
check
