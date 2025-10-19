#!/bin/bash

# WhatsApp Accountability Bot - Test Script
# Run this after starting the server with: npm run dev

BASE_URL="http://localhost:3000"
PHONE="whatsapp:+919876543210"

echo "🧪 Testing WhatsApp Accountability Bot"
echo "========================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Set a Goal
echo "2️⃣  Testing Goal Capture..."
curl -X POST "$BASE_URL/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=$PHONE&Body=I want to work out 30 mins daily" \
  -s
echo ""
echo ""

# Wait a bit
sleep 1

# Test 3: Check User Data
echo "3️⃣  Checking User Data..."
curl -s "$BASE_URL/users/$PHONE" | jq '.'
echo ""
echo ""

# Test 4: Mark as Done
echo "4️⃣  Testing 'Done' Response..."
curl -X POST "$BASE_URL/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=$PHONE&Body=done" \
  -s
echo ""
echo ""

# Wait a bit
sleep 1

# Test 5: Check Streak
echo "5️⃣  Checking Streak (should be 1 day)..."
curl -s "$BASE_URL/users/$PHONE" | jq '.streak'
echo ""
echo ""

# Test 6: Test Status Command
echo "6️⃣  Testing Status Command..."
curl -X POST "$BASE_URL/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=$PHONE&Body=status" \
  -s
echo ""
echo ""

# Test 7: Test Nope Response
echo "7️⃣  Testing 'Nope' Response..."
curl -X POST "$BASE_URL/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=$PHONE&Body=nope" \
  -s
echo ""
echo ""

# Wait a bit
sleep 1

# Test 8: Check Streak Reset
echo "8️⃣  Checking Streak Reset (should be 0)..."
curl -s "$BASE_URL/users/$PHONE" | jq '.streak'
echo ""
echo ""

# Test 9: Test Partial Completion
echo "9️⃣  Testing Partial Completion (45 mins)..."
curl -X POST "$BASE_URL/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=$PHONE&Body=45 mins" \
  -s
echo ""
echo ""

# Test 10: Test Help Command
echo "🔟 Testing Help Command..."
curl -X POST "$BASE_URL/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=$PHONE&Body=help" \
  -s
echo ""
echo ""

# Test 11: Get All Users
echo "1️⃣1️⃣  Getting All Users..."
curl -s "$BASE_URL/users" | jq '.'
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "💡 To test with real WhatsApp:"
echo "   1. Set up Twilio account"
echo "   2. Configure .env file"
echo "   3. Deploy to Railway/Replit"
echo "   4. Add webhook URL to Twilio"
echo "   5. Send WhatsApp messages!"

