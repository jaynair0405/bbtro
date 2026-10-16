#!/bin/sh
# Lobby CMS tests: parsers against data/cms-report/lobby-upload, store + drill against the local DB.
set -e
cd "$(dirname "$0")/../.."
for t in lobbies fsdn wrworlist whlist nightlist prlist lobbyStore lobbyDrill; do node "scripts/test/$t.test.js" 2>&1 | grep -v '^\[dotenv'; done
echo "all lobby CMS tests OK"
