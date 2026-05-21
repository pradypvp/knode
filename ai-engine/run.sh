#!/bin/sh
cd "$(dirname "$0")"
PORT="${PORT:-8010}"
exec .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port "$PORT"
