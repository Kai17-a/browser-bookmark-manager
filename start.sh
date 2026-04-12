#!/bin/sh
set -e

export API_PORT="${API_PORT:-8000}"
if [ -z "${API_BASE_URL:-}" ]; then
  export API_BASE_URL="/api"
fi
export NUXT_PUBLIC_API_BASE_URL="${NUXT_PUBLIC_API_BASE_URL:-$API_BASE_URL}"
export NUXT_PUBLIC_API_PORT="${NUXT_PUBLIC_API_PORT:-$API_PORT}"
export DATABASE_URL="${DATABASE_URL:-/data/bookmark.db}"

RUNTIME_CONFIG_FILE="/usr/share/nginx/html/runtime-config.js"
INDEX_FILE="/usr/share/nginx/html/index.html"

js_string() {
  value=$1
  escaped=$(printf '%s' "$value" | sed "s/'/'\\\\''/g")
  printf "'%s'" "$escaped"
}

cat > "$RUNTIME_CONFIG_FILE" <<EOF
window.__BOOKMARK_MANAGER_CONFIG__ = {
  apiBaseUrl: $(js_string "$NUXT_PUBLIC_API_BASE_URL"),
  apiPort: $(js_string "$NUXT_PUBLIC_API_PORT")
};
EOF

if ! grep -q 'runtime-config.js' "$INDEX_FILE"; then
  sed -i 's#</head>#  <script src="/runtime-config.js"></script>\n</head>#' "$INDEX_FILE"
fi

fastapi run api/main.py --host 0.0.0.0 --port "$API_PORT" &
API_PID=$!

nginx -g 'daemon off;' &
FRONTEND_PID=$!

trap 'kill "$API_PID" "$FRONTEND_PID" 2>/dev/null || true' INT TERM
trap 'kill "$API_PID" "$FRONTEND_PID" 2>/dev/null || true' EXIT

while kill -0 "$API_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

wait "$API_PID" 2>/dev/null || true
wait "$FRONTEND_PID" 2>/dev/null || true
exit 1
