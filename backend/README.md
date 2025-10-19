# WhatsApp Accountability Bot - Backend

A simple WhatsApp bot for daily accountability and goal tracking using Twilio.

## Features

- 📝 Goal capture and tracking
- ⏰ Daily reminders at 8 AM
- 🔥 Streak counting
- 💬 Supportive responses (no shame!)
- 📊 Status tracking

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Twilio credentials:

```bash
cp .env.example .env
```

Get your Twilio credentials:
- Go to [twilio.com](https://twilio.com)
- Create account (free trial: $15)
- Get WhatsApp sandbox number
- Copy Account SID and Auth Token

Get your Gemini API key:
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Click "Get API Key"
- Create a new API key
- Copy it!

### 3. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Endpoints

### POST /webhook
Main webhook handler for incoming WhatsApp messages.

### GET /users
Get all users (for testing).

### GET /users/:phone
Get specific user data.

### POST /reminders
Manually trigger reminders for all users.

### GET /health
Health check endpoint.

## User Commands

- **Set goal:** "I want to read 1 hour daily"
- **Mark complete:** "done"
- **Mark incomplete:** "nope"
- **Check status:** "status"
- **Get help:** "help"

## Deployment

### Railway
1. Push code to GitHub
2. Create new project on Railway
3. Connect GitHub repo
4. Add environment variables
5. Deploy!

### Replit
1. Import from GitHub
2. Add secrets (env vars)
3. Run!

## Connect Twilio Webhook

1. Get your deployed URL (e.g., `https://your-app.railway.app`)
2. Go to Twilio Dashboard → WhatsApp Sandbox Settings
3. Add webhook URL: `https://your-app.railway.app/webhook`
4. Test by sending a message!

## Testing

Send these messages to test:

1. "I want to work out 30 mins daily" → Goal set
2. "done" → Streak: 1 day
3. "done" (next day) → Streak: 2 days
4. "nope" → Streak resets, supportive message
5. "status" → Check your stats
6. "help" → Get command list

## File Structure

```
backend/
├── server.ts          # Main server (all logic here!)
├── users.json         # User data storage
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── .env              # Environment variables (not tracked)
├── .env.example      # Template for .env
└── README.md         # This file
```

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Messaging:** Twilio WhatsApp API
- **AI:** Google Gemini API (for dynamic responses)
- **Scheduling:** node-cron
- **Storage:** JSON file (simple!)

## Success Criteria

- ✅ Bot receives and parses messages
- ✅ Goal capture works
- ✅ Daily reminders at 8 AM
- ✅ Streak logic is correct
- ✅ No shame language
- ✅ Supportive responses

## Known Limitations (MVP)

- Only 1 goal per user
- 8 AM reminder time (hardcoded)
- Simple keyword matching (no NLU)
- JSON file storage (works for 10-100 users)
- Server timezone for cron jobs

## Future Improvements (V1.0)

- Multiple goals per user
- Custom reminder times
- Better intent detection (NLU)
- PostgreSQL database
- Weekly summaries
- User timezone support

---

**Ready to go! 🚀**

