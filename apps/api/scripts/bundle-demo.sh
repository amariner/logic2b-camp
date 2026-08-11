#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$repo_root"

site_dist="apps/site/dist"
web_dist="apps/web/dist"
dashboard_dist="apps/dashboard/dist"

web_demos=(
  "olivar:1"
  "riuclar:1"
  "duna:1"
  "delta:1"
  "pinadamar:2"
  "serralta:2"
  "vinyes:2"
  "tarongers:2"
  "carrasca:3"
  "mardefondo:3"
)
manager_demos=(pinadamar serralta vinyes tarongers carrasca mardefondo)

pnpm --filter @logic-camp/site build
BASE_PATH=/demo pnpm --filter @logic-camp/web build

rm -rf "$site_dist/demo" "$site_dist/admin"
for entry in "${web_demos[@]}"; do
  slug="${entry%%:*}"
  rm -rf "$site_dist/demos/$slug"
done
cp -r "$web_dist" "$site_dist/demo"

for entry in "${web_demos[@]}"; do
  slug="${entry%%:*}"
  tier="${entry##*:}"
  TENANT="$slug" TIER="$tier" BASE_PATH="/demos/$slug" pnpm --filter @logic-camp/web build
  mkdir -p "$site_dist/demos"
  cp -r "$web_dist" "$site_dist/demos/$slug"
done

pnpm --filter @logic-camp/dashboard build
cp -r "$dashboard_dist" "$site_dist/admin"

for slug in "${manager_demos[@]}"; do
  VITE_DEMO_SCENARIO="$slug" BASE_PATH="/demos/$slug/gestion" pnpm --filter @logic-camp/dashboard build
  mkdir -p "$site_dist/demos/$slug/gestion"
  cp -r "$dashboard_dist/." "$site_dist/demos/$slug/gestion"
done

node apps/api/scripts/check-demo-links.mjs
