#!/bin/sh
# CLI CMS tests: lobby parsers against data/cms-report/lobby-upload, Due List parser against data/cms-report/FP_GR_COUN.csv, store + drill against the local DB.
set -e
cd "$(dirname "$0")/../.."
for t in lobbies fsdn wrworlist whlist nightlist prlist lobbyStore lobbyDay lobbyDrill duelistParse; do node "scripts/test/$t.test.js" 2>&1 | grep -v '^\[dotenv'; done
echo "all lobby CMS tests OK"
