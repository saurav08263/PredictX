#!/bin/bash
set -e

# Start the server in the background
cd /home/z/my-project
NODE_ENV=production node .next/standalone/server.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
for i in $(seq 1 15); do
  if curl -s -o /dev/null http://127.0.0.1:3000/ 2>/dev/null; then
    echo "SERVER IS UP"
    break
  fi
  sleep 1
done

# Verify server is running
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/)
echo "HTTP Response code: $HTTP_CODE"

# Open browser
echo "=== Opening browser ==="
agent-browser open http://127.0.0.1:3000/ 2>&1 || true
sleep 3

# Try alternate addresses if localhost failed
agent-browser open http://21.0.6.184:3000/ 2>&1 || true
sleep 3

agent-browser open http://0.0.0.0:3000/ 2>&1 || true
sleep 3

# Take snapshot
echo "=== Taking snapshot ==="
agent-browser snapshot -c 2>&1 || true

# Try via the Caddy proxy
echo "=== Trying via Caddy proxy port 81 ==="
agent-browser open http://localhost:81/ 2>&1 || true
sleep 3
agent-browser snapshot -c 2>&1 || true

# Check server status
echo "=== Final check ==="
ps -p $SERVER_PID -o pid= 2>/dev/null && echo "Server process still alive" || echo "Server process died"
ss -tlnp 2>/dev/null | rg 3000 && echo "Port 3000 still listening" || echo "Port 3000 not listening"

echo "=== DONE ==="
