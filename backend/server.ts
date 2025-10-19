import express, { Request, Response } from 'express';
import twilio from 'twilio';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types
interface UserHistory {
  date: string;
  completed: boolean;
}

interface User {
  name?: string;
  goal: string;
  createdAt: string;
  streak: number;
  lastCompleted: string | null;
  history: UserHistory[];
}

interface Users {
  [phone: string]: User;
}

// Initialize Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Helper: Load users from JSON file
function loadUsers(): Users {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return {};
}

// Helper: Save users to JSON file
function saveUsers(users: Users): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Helper: Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper: Get yesterday's date in YYYY-MM-DD format
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Helper: Send WhatsApp message via Twilio
async function sendWhatsApp(phone: string, message: string): Promise<void> {
  try {
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`
    });
    console.log(`Message sent to ${phone}`);
  } catch (error) {
    console.error(`Error sending message to ${phone}:`, error);
  }
}

// Helper: Generate supportive response for "done"
function getDoneResponse(streak: number): string {
  const responses = [
    `YES! 🔥 Streak: ${streak} ${streak === 1 ? 'day' : 'days'}! 💪`,
    `I KNEW you'd do it! 🔥 Streak: ${streak} ${streak === 1 ? 'day' : 'days'}! 💪`,
    `Crushing it! 🔥 Streak: ${streak} ${streak === 1 ? 'day' : 'days'}! See you tomorrow! 💪`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper: Generate supportive response for "nope"
function getNopeResponse(): string {
  const responses = [
    "No worries! Tomorrow's a fresh start. You got this! 💙",
    "It happens! You're still here. That matters! 🚀",
    "All good! Every day is a new chance. Let's go! 💙"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper: Generate response for partial completion
function getPartialResponse(text: string): string {
  const responses = [
    `${text}?! Still crushing it! 💪`,
    `That counts! Effort matters! ✨`,
    `Progress is progress! Keep going! 🚀`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// POST /webhook - Main webhook handler for incoming WhatsApp messages
app.post('/webhook', async (req: Request, res: Response) => {
  const phone = req.body.From;
  const text = req.body.Body?.toLowerCase().trim() || '';
  
  console.log(`Received message from ${phone}: ${text}`);
  
  const users = loadUsers();
  let response = '';
  
  // Goal capture (new user or updating goal)
  if (text.includes('want') || text.includes('goal')) {
    const goalText = req.body.Body.trim(); // Keep original capitalization
    users[phone] = {
      goal: goalText,
      createdAt: getTodayDate(),
      streak: 0,
      lastCompleted: null,
      history: []
    };
    response = `🎯 Locked in! I'll remind you daily. Let's go! 💪`;
    saveUsers(users);
    await sendWhatsApp(phone, response);
  }
  
  // User says "done"
  else if (text === 'done' || text === 'yes') {
    if (!users[phone]) {
      response = "Hey! Set a goal first. Text: 'I want to [your goal]'";
    } else {
      const today = getTodayDate();
      const yesterday = getYesterdayDate();
      
      // Check if already logged today
      const alreadyLoggedToday = users[phone].history.some(h => h.date === today);
      
      if (alreadyLoggedToday) {
        response = "You already logged today! See you tomorrow! 🎉";
      } else {
        // Update streak
        if (users[phone].lastCompleted === yesterday) {
          users[phone].streak++;
        } else {
          users[phone].streak = 1;
        }
        
        users[phone].lastCompleted = today;
        users[phone].history.push({ date: today, completed: true });
        
        response = getDoneResponse(users[phone].streak);
        saveUsers(users);
      }
    }
    await sendWhatsApp(phone, response);
  }
  
  // User says "nope" or "no"
  else if (text === 'nope' || text === 'no' || text === 'not today') {
    if (!users[phone]) {
      response = "Hey! Set a goal first. Text: 'I want to [your goal]'";
    } else {
      const today = getTodayDate();
      users[phone].streak = 0;
      users[phone].history.push({ date: today, completed: false });
      
      response = getNopeResponse();
      saveUsers(users);
    }
    await sendWhatsApp(phone, response);
  }
  
  // Partial completion (e.g., "45 mins")
  else if (text.match(/\d+\s*(min|mins|minutes|hour|hours|hrs)/)) {
    if (!users[phone]) {
      response = "Hey! Set a goal first. Text: 'I want to [your goal]'";
    } else {
      const today = getTodayDate();
      const yesterday = getYesterdayDate();
      
      // Treat partial as completed
      if (users[phone].lastCompleted === yesterday) {
        users[phone].streak++;
      } else {
        users[phone].streak = 1;
      }
      
      users[phone].lastCompleted = today;
      users[phone].history.push({ date: today, completed: true });
      
      response = getPartialResponse(text) + ` 🔥 Streak: ${users[phone].streak} ${users[phone].streak === 1 ? 'day' : 'days'}!`;
      saveUsers(users);
    }
    await sendWhatsApp(phone, response);
  }
  
  // Help command
  else if (text === 'help' || text === 'info') {
    response = `I track your goals! 📊\n\n` +
               `• Set goal: "I want to [goal]"\n` +
               `• Log completion: "done"\n` +
               `• Log skip: "nope"\n` +
               `• Check status: "status"\n\n` +
               `I'll remind you daily at 8 AM! Let's go! 🚀`;
    await sendWhatsApp(phone, response);
  }
  
  // Status check
  else if (text === 'status' || text === 'streak') {
    if (!users[phone]) {
      response = "You haven't set a goal yet! Text: 'I want to [your goal]'";
    } else {
      const user = users[phone];
      response = `📊 Your Status:\n\n` +
                 `Goal: ${user.goal}\n` +
                 `🔥 Streak: ${user.streak} ${user.streak === 1 ? 'day' : 'days'}\n` +
                 `Started: ${user.createdAt}\n` +
                 `Last completed: ${user.lastCompleted || 'Never'}\n\n` +
                 `Keep crushing it! 💪`;
    }
    await sendWhatsApp(phone, response);
  }
  
  // Unknown command
  else {
    response = `Not sure what you meant! 🤔\n\n` +
               `Try:\n` +
               `• "I want to [goal]" - set goal\n` +
               `• "done" - mark complete\n` +
               `• "nope" - mark incomplete\n` +
               `• "help" - get info`;
    await sendWhatsApp(phone, response);
  }
  
  res.status(200).send('OK');
});

// GET /users/:phone - Get user data (for testing)
app.get('/users/:phone', (req: Request, res: Response) => {
  const phone = req.params.phone;
  const users = loadUsers();
  
  if (users[phone]) {
    res.json(users[phone]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// GET /users - Get all users (for testing)
app.get('/users', (req: Request, res: Response) => {
  const users = loadUsers();
  res.json(users);
});

// POST /reminders - Manual trigger for reminders (for testing)
app.post('/reminders', async (req: Request, res: Response) => {
  const users = loadUsers();
  let count = 0;
  
  for (const [phone, user] of Object.entries(users)) {
    await sendWhatsApp(phone, `How's the ${user.goal}? Did you do it? 📚`);
    count++;
  }
  
  res.json({ message: `Reminders sent to ${count} users` });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Daily reminder at 8 AM (server timezone)
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily reminders at 8 AM...');
  const users = loadUsers();
  
  for (const [phone, user] of Object.entries(users)) {
    const today = getTodayDate();
    
    // Skip if user already responded today
    const alreadyRespondedToday = user.history.some(h => h.date === today);
    
    if (!alreadyRespondedToday) {
      await sendWhatsApp(phone, `How's the ${user.goal}? Did you do it? 📚`);
    }
  }
  
  console.log('Daily reminders completed');
});

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
  console.log('Created users.json file');
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Accountability Bot Server running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`⏰ Daily reminders scheduled for 8 AM`);
});

