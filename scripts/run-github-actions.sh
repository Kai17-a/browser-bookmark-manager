#!/bin/sh
set -eu

repo_root=$(cd "$(dirname "$0")/.." && pwd)
workflow="${1:-.github/workflows/pr-tests.yml}"
event="${2:-pull_request}"
shift 2>/dev/null || true

if ! command -v act >/dev/null 2>&1; then
    cat >&2 <<'EOF'
act is required but not installed.
Install it first, then rerun this script.
EOF
    exit 1
fi

if [ ! -f "$repo_root/$workflow" ]; then
    echo "Workflow not found: $workflow" >&2
    exit 1
fi

cd "$repo_root"

exec act \
    -W "$workflow" \
    "$event" \
    "$@"
