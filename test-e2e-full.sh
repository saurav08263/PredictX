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

echo ""
echo "========================================"
echo "TEST 1: Open http://localhost:3000/"
echo "========================================"
agent-browser close 2>/dev/null || true
sleep 1
agent-browser open http://127.0.0.1:3000/
sleep 2

agent-browser snapshot 2>&1 > /tmp/snapshot-home.txt
echo "--- Home page snapshot ---"
agent-browser snapshot -c 2>&1

# Check for page title and step indicator
if rg -q "STEP 1 OF 10" /tmp/snapshot-home.txt; then
  echo "✅ STEP 1 OF 10 label found on home page"
else
  echo "❌ STEP 1 OF 10 label NOT found on home page"
fi

if rg -q "PredicTX" /tmp/snapshot-home.txt; then
  echo "✅ PredicTX heading found"
else
  echo "❌ PredicTX heading NOT found"
fi

echo ""
echo "========================================"
echo "TEST 2: Check 10-step flow indicator"
echo "========================================"
# Get the step text
STEP_TEXT=$(rg "STEP.*OF 10" /tmp/snapshot-home.txt 2>/dev/null || echo "NOT FOUND")
echo "Step indicator text: $STEP_TEXT"

echo ""
echo "========================================"
echo "TEST 3: Click BTC (Step 1 - Select Coin)"
echo "========================================"
# Get fresh refs
agent-browser snapshot -i 2>&1 > /tmp/snapshot-interactive.txt
BTC_REF=$(rg "BTC/USDT" /tmp/snapshot-interactive.txt | head -1 | rg -o '\[ref=e[0-9]+\]' | rg -o 'e[0-9]+')
echo "BTC button ref: @${BTC_REF}"

if [ -n "$BTC_REF" ]; then
  agent-browser click @${BTC_REF}
  sleep 2
  echo "✅ Clicked BTC button"
else
  echo "❌ Could not find BTC button"
fi

# Check step 2
agent-browser snapshot 2>&1 > /tmp/snapshot-step2.txt
echo "--- Step 2 snapshot ---"
agent-browser snapshot -c 2>&1

if rg -q "STEP 2 OF 10" /tmp/snapshot-step2.txt; then
  echo "✅ STEP 2 OF 10 label found after selecting BTC"
else
  echo "❌ STEP 2 OF 10 label NOT found after selecting BTC"
fi

if rg -q "Select Timeframe" /tmp/snapshot-step2.txt; then
  echo "✅ 'Select Timeframe' heading found"
else
  echo "❌ 'Select Timeframe' heading NOT found"
fi

echo ""
echo "========================================"
echo "TEST 4: Click 60s (Step 2 - Select Time)"
echo "========================================"
agent-browser snapshot -i 2>&1 > /tmp/snapshot-interactive2.txt
SIXTY_REF=$(rg "60s ROUND" /tmp/snapshot-interactive2.txt | head -1 | rg -o '\[ref=e[0-9]+\]' | rg -o 'e[0-9]+')
echo "60s button ref: @${SIXTY_REF}"

if [ -n "$SIXTY_REF" ]; then
  agent-browser click @${SIXTY_REF}
  sleep 3
  echo "✅ Clicked 60s button"
else
  echo "❌ Could not find 60s button"
fi

# Check step 3
agent-browser snapshot 2>&1 > /tmp/snapshot-step3.txt
echo "--- Step 3 snapshot ---"
agent-browser snapshot -c 2>&1

if rg -q "STEP 3 OF 10" /tmp/snapshot-step3.txt; then
  echo "✅ STEP 3 OF 10 label found after selecting 60s"
else
  echo "❌ STEP 3 OF 10 label NOT found after selecting 60s"
fi

if rg -q "Live Price\|Current Price\|PRICE" /tmp/snapshot-step3.txt; then
  echo "✅ Price/chart related text found"
else
  echo "⚠️  Price/chart related text not clearly found"
fi

echo ""
echo "========================================"
echo "TEST 5: Verify Live Price with chart"
echo "========================================"
# Check for price display and CHOOSE DIRECTION button
if rg -q "CHOOSE DIRECTION" /tmp/snapshot-step3.txt; then
  echo "✅ 'CHOOSE DIRECTION' button found"
else
  echo "❌ 'CHOOSE DIRECTION' button NOT found"
fi

echo ""
echo "========================================"
echo "TEST 6: Click CHOOSE DIRECTION (Step 4)"
echo "========================================"
agent-browser snapshot -i 2>&1 > /tmp/snapshot-interactive3.txt
DIR_REF=$(rg "CHOOSE DIRECTION" /tmp/snapshot-interactive3.txt | head -1 | rg -o '\[ref=e[0-9]+\]' | rg -o 'e[0-9]+')
echo "CHOOSE DIRECTION ref: @${DIR_REF}"

if [ -n "$DIR_REF" ]; then
  agent-browser click @${DIR_REF}
  sleep 2
  echo "✅ Clicked CHOOSE DIRECTION button"
else
  echo "❌ Could not find CHOOSE DIRECTION button"
fi

# Check step 4
agent-browser snapshot 2>&1 > /tmp/snapshot-step4.txt
echo "--- Step 4 snapshot ---"
agent-browser snapshot -c 2>&1

if rg -q "STEP 4 OF 10" /tmp/snapshot-step4.txt; then
  echo "✅ STEP 4 OF 10 label found after CHOOSE DIRECTION"
else
  echo "⚠️  STEP 4 OF 10 label NOT found (checking for direction UP/DOWN)"
fi

if rg -q "UP" /tmp/snapshot-step4.txt; then
  echo "✅ 'UP' direction option found"
else
  echo "❌ 'UP' direction option NOT found"
fi

if rg -q "DOWN" /tmp/snapshot-step4.txt; then
  echo "✅ 'DOWN' direction option found"
else
  echo "❌ 'DOWN' direction option NOT found"
fi

echo ""
echo "========================================"
echo "TEST 7: Click UP (Step 5 - Set Amount)"
echo "========================================"
agent-browser snapshot -i 2>&1 > /tmp/snapshot-interactive4.txt
UP_REF=$(rg "UP" /tmp/snapshot-interactive4.txt | head -1 | rg -o '\[ref=e[0-9]+\]' | rg -o 'e[0-9]+')
echo "UP button ref: @${UP_REF}"

if [ -n "$UP_REF" ]; then
  agent-browser click @${UP_REF}
  sleep 2
  echo "✅ Clicked UP button"
else
  echo "❌ Could not find UP button"
fi

# Check step 5
agent-browser snapshot 2>&1 > /tmp/snapshot-step5.txt
echo "--- Step 5 snapshot ---"
agent-browser snapshot -c 2>&1

if rg -q "STEP 5 OF 10" /tmp/snapshot-step5.txt; then
  echo "✅ STEP 5 OF 10 label found after clicking UP"
else
  echo "⚠️  STEP 5 OF 10 label NOT found"
fi

echo ""
echo "========================================"
echo "TEST 8: Verify Amount Options"
echo "========================================"
if rg -q "Set Amount\|Amount\|AMOUNT" /tmp/snapshot-step5.txt; then
  echo "✅ Amount-related heading/text found"
else
  echo "⚠️  Amount-related heading/text not clearly found"
fi

# Check for amount values (like 10, 50, 100, etc.)
AMOUNT_OPTIONS=$(rg -o "₹[0-9,]+" /tmp/snapshot-step5.txt 2>/dev/null | sort -u || echo "none found")
echo "Amount options found: $AMOUNT_OPTIONS"

echo ""
echo "========================================"
echo "TEST 9: Take screenshot"
echo "========================================"
agent-browser screenshot /home/z/my-project/test-e2e-screenshot.png
echo "✅ Screenshot saved to /home/z/my-project/test-e2e-screenshot.png"

echo ""
echo "========================================"
echo "SUMMARY"
echo "========================================"
echo "Server PID: $SERVER_PID (still running)"
echo "All tests completed. Check results above."

# Keep the server running for a bit
echo "Server is still running on port 3000"
