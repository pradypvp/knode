#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/shashwatsingh/Desktop/AI"
BACKEND_URL="${BACKEND_PROXY_URL:-http://127.0.0.1:4000}"

start_one() {
  local idx="$1"
  local port="$2"
  local dir="${ROOT}/frontend${idx}"
  local log="${ROOT}/frontend${idx}.log"

  if [ ! -d "$dir" ]; then
    echo "Missing directory: $dir"
    exit 1
  fi

  echo "Starting frontend${idx} on :${port} (log: ${log})"
  (
    cd "$dir"
    BACKEND_PROXY_URL="$BACKEND_URL" npm run dev -- --port "$port"
  ) >"$log" 2>&1 &
}

start_one 1 3001
start_one 2 3002
start_one 3 3003
start_one 4 3004

echo ""
echo "Started 4 frontend instances:"
echo "  http://localhost:3001"
echo "  http://localhost:3002"
echo "  http://localhost:3003"
echo "  http://localhost:3004"
echo ""
echo "To stop them later:"
echo "  pkill -f \"next dev --port 3001\""
echo "  pkill -f \"next dev --port 3002\""
echo "  pkill -f \"next dev --port 3003\""
echo "  pkill -f \"next dev --port 3004\""
