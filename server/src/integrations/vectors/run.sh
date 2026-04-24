#!/bin/bash
# Production run script for the SwiftRoute AI Embedder
cd "$(dirname "$0")"
source venv/bin/activate
exec gunicorn -k uvicorn.workers.UvicornWorker embedder:app --workers 4 --bind 0.0.0.0:5001
