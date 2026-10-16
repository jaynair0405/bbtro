#!/bin/sh
# CLI CMS tests: lobby parsers against data/cms-report/lobby-upload, Due List parser against data/cms-report/FP_GR_COUN.csv, store + drill against the local DB.
set -e
cd "$(dirname "$0")/../.."
# Each test's exit code must decide, not grep's: the pipe once hid a syntax error and a
# failed assertion behind "all lobby CMS tests OK".
for t in lobbies fsdn wrworlist whlist nightlist prlist lobbyStore lobbyDay lobbyDrill duelistParse duelistFacts duelistMonitoring duelistRoute; do
  out=$(node "scripts/test/$t.test.js" 2>&1) || { printf '%s\n' "$out" | grep -v '^\[dotenv'; echo "FAILED: $t"; exit 1; }
  printf '%s\n' "$out" | grep -v '^\[dotenv'
done
echo "all lobby CMS tests OK"
