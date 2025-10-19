# WhatsApp Accountability Bot - 1 Day MVP PRD

**Version:** 1.0 MVP  
**Build Time:** 8 hours  
**Target Users:** 5-10 beta testers

---

## 1. What We're Building

A WhatsApp bot that:
1. Captures user goals (text message)
2. Sends daily reminders (8 AM)
3. Logs completion (user replies "done" or "nope")
4. Tracks streaks (consecutive days completed)
5. Responds supportively (no judgment)

That's it. Nothing else.

---

## 2. Core Features (4 Only)

### Feature 1: Goal Capture
- User texts: "I want to read 1 hour daily"
- Bot extracts and stores goal
- Bot responds: "🎯 Locked in! Let's go! 💪"

### Feature 2: Daily Reminder
- Bot sends: "How's the reading? Did you do it? 📚"
- Time: 8 AM (hardcoded for MVP)
- User has 24 hours to respond

### Feature 3: Progress Logging
- User replies: "Done" or "Nope" or "45 mins"
- Bot logs it with date
- Bot responds with streak count

### Feature 4: Streak Display
- Counts consecutive "Done" days
- Shows in every response: "🔥 Streak: 5 days"
- Resets on "Nope" but with supportive message, not shame

---

## 3. Tech Stack (Minimal)

| Component | Choice |
|-----------|--------|
| Backend | Node.js + Express |
| Messaging | Twilio WhatsApp |
| Database | JSON file (users.json) |
| LLM | OpenAI (simple prompts only) |
| Scheduling | node-cron |
| Hosting | Railway or Replit |

---

## 4. Database Schema (JSON Only)

```json
{
  "+919876543210": {
    "name": "Raj",
    "goal": "read 1 hour daily",
    "createdAt": "2025-10-19",
    "streak": 3,
    "lastCompleted": "2025-10-19",
    "history": [
      {"date": "2025-10-19", "completed": true},
      {"date": "2025-10-18", "completed": true},
      {"date": "2025-10-17", "completed": true},
      {"date": "2025-10-16", "completed": false}
    ]
  }
}
```

---

## 5. API Endpoints (3 Only)

```
POST /webhook
  → Receives WhatsApp message
  → Parses intent (goal, done, nope, help)
  → Sends response

GET /users/:phone
  → Returns user data (for testing)

POST /reminders
  → Triggers daily 8 AM check-in for all users
```

---

## 6. User Flows

### Flow 1: New User
```
User: "I want to read 1 hour daily"
Bot: "🎯 Locked in! I'll remind you daily. Let's go! 💪"
```

### Flow 2: Daily Check-In
```
Bot (8 AM): "How's the reading? Did you do it? 📚"
User: "Done"
Bot: "YES! 🔥 Streak: 1 day! See you tomorrow!"
```

### Flow 3: Missed Day
```
Bot (8 AM): "How's the reading? Did you do it? 📚"
User: "Nope"
Bot: "No worries! Tomorrow's a fresh start. You got this! 💙"
Streak resets to 0
```

---

## 7. Tone Rules (Simple)

**For "Done":**
- "YES! 🔥 Crushing it!"
- "I KNEW you'd do it! 💪"
- Rotate 3 variations max

**For "Nope":**
- "No worries! Tomorrow's a fresh start! 💙"
- "It happens! You're still here. That matters! 🚀"
- Never say: failed, lazy, behind, weak

**For partial (e.g., "45 mins"):**
- "45 mins?! Still crushing it! 💪"
- "That counts! Effort matters! ✨"

---

## 8. Technical Implementation (4 Hours)

### Step 1: Setup (30 min)
- Twilio account + WhatsApp sandbox
- Node.js project with Express
- Deploy to Railway

### Step 2: Webhook Handler (60 min)
```javascript
POST /webhook → Parse message
├── Extract intent (goal/done/nope)
├── Update users.json
├── Generate response
└── Send via Twilio
```

### Step 3: Daily Reminders (60 min)
```javascript
node-cron
├── Every day at 8 AM
├── Loop through all users
├── Send: "How's the [GOAL]?"
└── Skip if already replied today
```

### Step 4: Streak Logic (30 min)
```javascript
If user says "Done" today:
├── Check if yesterday was "Done"
├── If yes: streak++
├── If no: streak = 1
└── Save to users.json

If user says "Nope":
├── streak = 0
└── Send supportive message
```

---

## 9. Code Skeleton

```javascript
// index.js
const express = require('express');
const twilio = require('twilio');
const cron = require('node-cron');
const fs = require('fs');

const app = express();
let users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

// Webhook: receive message
app.post('/webhook', async (req, res) => {
  const phone = req.body.From;
  const text = req.body.Body.toLowerCase();
  
  let response = '';
  
  if (text.includes('want') || text.includes('goal')) {
    // Goal capture
    response = `🎯 Locked in! I'll remind you daily. Let's go! 💪`;
    users[phone] = {
      goal: text,
      streak: 0,
      lastCompleted: null,
      history: []
    };
  } 
  else if (text === 'done') {
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (users[phone].lastCompleted === yesterday) {
      users[phone].streak++;
    } else {
      users[phone].streak = 1;
    }
    users[phone].lastCompleted = today;
    users[phone].history.push({date: today, completed: true});
    
    response = `YES! 🔥 Streak: ${users[phone].streak} days! 💪`;
  } 
  else if (text === 'nope') {
    users[phone].streak = 0;
    response = `No worries! Tomorrow's a fresh start. You got this! 💙`;
  }
  
  // Save and send
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  await sendWhatsApp(phone, response);
  
  res.send('ok');
});

// Daily reminder at 8 AM
cron.schedule('0 8 * * *', async () => {
  for (let [phone, user] of Object.entries(users)) {
    await sendWhatsApp(phone, `How's the ${user.goal}? Did you do it? 📚`);
  }
});

// Send WhatsApp message
async function sendWhatsApp(phone, message) {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
  await client.messages.create({
    body: message,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${phone}`
  });
}

app.listen(3000);
```

---

## 10. Deployment Checklist

- [ ] Create Twilio account (free trial: $15)
- [ ] Get WhatsApp sandbox number
- [ ] Create Node.js project
- [ ] Create `users.json` file (empty object `{}`)
- [ ] Deploy to Railway or Replit (15 min)
- [ ] Get webhook URL from deployment
- [ ] Add webhook to Twilio dashboard
- [ ] Test with 1 phone number
- [ ] Invite 5-10 beta testers

---

## 11. Success Criteria (Day 1)

- [ ] Bot receives and parses messages (no crashes)
- [ ] Goal capture works
- [ ] Daily reminder sends at 8 AM
- [ ] Streak logic correct
- [ ] 5+ users test without errors
- [ ] At least 1 user completes 1 "Done" day
- [ ] No shame language in any response

---

## 12. Known Limitations (Day 1)

- Only 1 goal per user (no multi-goal)
- Only 1 reminder time (8 AM, hardcoded)
- No NLU (simple keyword matching)
- No database (JSON file, works for 10 users)
- No user authentication
- Streak resets on "nope" immediately (no nuance)
- No weekly summaries

---

## 13. V1.0 Features (Day 2-3)

- [ ] Multi-goal support (up to 3)
- [ ] Custom reminder time per user
- [ ] Better intent detection (NLU)
- [ ] PostgreSQL database
- [ ] User onboarding flow
- [ ] Weekly summary message
- [ ] Fix any bugs from Day 1

---

## 14. Time Breakdown

| Task | Time |
|------|------|
| Twilio setup + testing | 30 min |
| Node.js webhook handler | 90 min |
| Goal capture logic | 30 min |
| Streak calculator | 30 min |
| Daily reminders (cron) | 30 min |
| Response templates & tone | 30 min |
| Deployment | 30 min |
| Testing + bug fixes | 60 min |
| **Total** | **~5 hours** |

**Buffer: 3 hours for unexpected issues**

---

## 15. Deployment Steps (Exact)

### Step 1: Twilio
1. Go to twilio.com, create account
2. Get WhatsApp sandbox number
3. Generate API credentials

### Step 2: Railway/Replit
1. Create new Node project
2. Push code to GitHub
3. Connect to Railway → deploy
4. Get live URL

### Step 3: Connect
1. Copy webhook URL from Railway
2. Add to Twilio dashboard: `https://your-app.railway.app/webhook`
3. Test by sending message

### Step 4: Cron Jobs
1. Deploy code with node-cron
2. Railway runs it 24/7 automatically

---

## 16. Testing Script

```
Test 1: Goal capture
  Send: "I want to work out 30 mins daily"
  Expected: "🎯 Locked in! I'll remind you daily. Let's go! 💪"

Test 2: Done
  Send: "done"
  Expected: "YES! 🔥 Streak: 1 day! 💪"

Test 3: Done again (next day)
  Send: "done"
  Expected: "YES! 🔥 Streak: 2 days! 💪"

Test 4: Nope
  Send: "nope"
  Expected: "No worries! Tomorrow's a fresh start. You got this! 💙"
  (Streak should reset to 0)

Test 5: Help
  Send: "help"
  Expected: "I track your goals! Text 'done' if you completed it, 'nope' if not."
```

---

## 17. File Structure

```
project/
├── index.js (main server)
├── users.json (user data)
├── package.json
├── .env (TWILIO credentials)
└── README.md
```

---

**Ready to build? Start with Step 1: Twilio setup. You've got 8 hours. Let's go! 🚀**