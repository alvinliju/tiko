# 🚀 Quick Setup Guide - WhatsApp Accountability Bot with Gemini AI

## Prerequisites
- Node.js installed (v18+)
- A phone with WhatsApp
- 15 minutes of time

---

## Step 1: Get Gemini API Key (2 minutes) 🤖

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Click **"Create API key in new project"**
5. Copy the API key (starts with `AIza...`)
6. Keep it safe - you'll need it in Step 3!

**Note:** Gemini API has a generous free tier - perfect for testing!

---

## Step 2: Get Twilio WhatsApp Sandbox (5 minutes) 📱

1. Go to [Twilio](https://www.twilio.com/try-twilio)
2. Sign up for free account (you get $15 credit!)
3. Verify your email and phone number
4. Go to **Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
5. You'll see a WhatsApp Sandbox with:
   - A phone number (usually `+1 415 523 8886`)
   - A join code (like `join word-word`)
6. Open WhatsApp on your phone
7. Send the join code to the sandbox number
8. You'll get a confirmation message

**Get your credentials:**
- Go back to [Twilio Console](https://console.twilio.com)
- Find your **Account SID** (starts with `AC...`)
- Find your **Auth Token** (click "Show" to reveal)
- Note the **WhatsApp number** (from step 5)

---

## Step 3: Configure Your Server (2 minutes) ⚙️

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cat > .env << 'EOF'
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
EOF
```

4. Edit the `.env` file and replace:
   - `your_account_sid_here` → Your Twilio Account SID
   - `your_auth_token_here` → Your Twilio Auth Token
   - `your_gemini_api_key_here` → Your Gemini API key
   - Update the phone number if different

---

## Step 4: Test Locally (3 minutes) 🧪

1. Start the server:
```bash
npm run dev
```

You should see:
```
🚀 Accountability Bot Server running on port 3000
📱 Webhook URL: http://localhost:3000/webhook
⏰ Daily reminders scheduled for 8 AM
```

2. Test with curl (in another terminal):
```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 5: Deploy to Make It Public (5 minutes) 🌍

You need a public URL for Twilio to reach your webhook. Choose one:

### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
cd backend
railway init
railway up

# Add environment variables
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=your_token
railway variables set TWILIO_WHATSAPP_NUMBER=+14155238886
railway variables set GEMINI_API_KEY=AIzaxxxxxxxxx

# Get your URL
railway domain
```

Your URL will be something like: `https://your-app.railway.app`

### Option B: ngrok (Quick Local Testing)

```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# In terminal 1: Start your server
cd backend
npm run dev

# In terminal 2: Expose it
ngrok http 3000
```

Copy the URL that looks like: `https://abc123.ngrok.io`

---

## Step 6: Connect Twilio to Your Server (2 minutes) 🔗

1. Go to [Twilio WhatsApp Sandbox Settings](https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox)
2. Find **"When a message comes in"**
3. Enter your webhook URL:
   - Railway: `https://your-app.railway.app/webhook`
   - ngrok: `https://abc123.ngrok.io/webhook`
4. Method: **POST**
5. Click **Save**

---

## Step 7: Test with Real WhatsApp! 🎉

Open WhatsApp and send messages to your Twilio sandbox number:

### Test 1: Set a Goal
```
Message: I want to read 30 minutes daily
Expected: AI-generated personalized motivational response
```

### Test 2: Mark Complete
```
Message: done
Expected: AI-generated celebration with streak count
```

### Test 3: Check Status
```
Message: status
Expected: Your current stats and streak
```

### Test 4: Partial Completion
```
Message: 15 mins
Expected: Encouraging response for partial completion
```

### Test 5: Miss a Day
```
Message: nope
Expected: Supportive, understanding response (no shame!)
```

### Test 6: Get Help
```
Message: help
Expected: Command list and instructions
```

---

## 🎯 What Makes This Bot Special?

✅ **AI-Powered Responses** - Every response is unique and personalized using Gemini
✅ **Context-Aware** - Mentions your specific goal and progress
✅ **Supportive Tone** - Never judgmental, always encouraging
✅ **Streak Tracking** - Gamification to keep you motivated
✅ **Daily Reminders** - Automated check-ins at 8 AM

---

## 🐛 Troubleshooting

**Bot not responding?**
- Check server logs for errors
- Verify webhook URL in Twilio is correct
- Make sure server is running
- Check [Twilio Debugger](https://console.twilio.com/us1/monitor/logs/debugger)

**Gemini API errors?**
- Verify API key is correct
- Check you're within free tier limits
- Server falls back to static responses if API fails

**WhatsApp says "Not connected"?**
- Rejoin sandbox: Send join code again
- Sandbox expires after 3 days of inactivity

---

## 📊 Monitor Your Bot

**Check server health:**
```bash
curl https://your-app.railway.app/health
```

**View all users:**
```bash
curl https://your-app.railway.app/users
```

**Manually trigger reminders:**
```bash
curl -X POST https://your-app.railway.app/reminders
```

---

## 🎓 Next Steps

Once it's working:
1. Invite friends to test (they need to join Twilio sandbox too)
2. Monitor responses and adjust Gemini prompts if needed
3. Consider moving to Twilio production (requires business verification)
4. Add more features from the PRD!

---

**Need help?** Check the logs, they're your friend! 🚀

