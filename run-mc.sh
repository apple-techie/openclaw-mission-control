#!/bin/bash
set -e

while true; do
  cd /root/.openclaw/openclaw-mission-control
  npm ci --include=optional --no-audit --no-fund
  npm run build
  HOST=0.0.0.0 PORT=3333 node node_modules/.bin/next start -H 0.0.0.0 -p 3333 >> /tmp/mc-dashboard.log 2>&1
  echo "[$(date)] MC crashed, restarting in 2s..." >> /tmp/mc-dashboard.log
  sleep 2
done
