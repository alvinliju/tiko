// Simple Test Script for WhatsApp Accountability Bot
// Run with: ts-node test-simple.ts (after starting server)

const BASE_URL = 'http://localhost:3000';
const PHONE = 'whatsapp:+919876543210';

async function makeRequest(url: string, method: string = 'GET', body?: any) {
  const options: any = { method };
  
  if (body) {
    const params = new URLSearchParams(body);
    options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    options.body = params;
  }
  
  const response = await fetch(url, options);
  return response;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🧪 Testing WhatsApp Accountability Bot\n');
  console.log('========================================\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing Health Check...');
    const health = await (await makeRequest(`${BASE_URL}/health`)).json();
    console.log('✅ Server is healthy:', health.status);
    console.log('');
    
    // Test 2: Set a Goal
    console.log('2️⃣  Testing Goal Capture...');
    await makeRequest(`${BASE_URL}/webhook`, 'POST', {
      From: PHONE,
      Body: 'I want to work out 30 mins daily'
    });
    console.log('✅ Goal set successfully');
    await sleep(500);
    console.log('');
    
    // Test 3: Check User Data
    console.log('3️⃣  Checking User Data...');
    const user = await (await makeRequest(`${BASE_URL}/users/${PHONE}`)).json();
    console.log('✅ User:', JSON.stringify(user, null, 2));
    console.log('');
    
    // Test 4: Mark as Done
    console.log('4️⃣  Testing "Done" Response...');
    await makeRequest(`${BASE_URL}/webhook`, 'POST', {
      From: PHONE,
      Body: 'done'
    });
    console.log('✅ Marked as done');
    await sleep(500);
    console.log('');
    
    // Test 5: Check Streak
    console.log('5️⃣  Checking Streak...');
    const userAfterDone = await (await makeRequest(`${BASE_URL}/users/${PHONE}`)).json();
    console.log(`✅ Streak: ${userAfterDone.streak} day(s)`);
    console.log('');
    
    // Test 6: Test Status Command
    console.log('6️⃣  Testing Status Command...');
    await makeRequest(`${BASE_URL}/webhook`, 'POST', {
      From: PHONE,
      Body: 'status'
    });
    console.log('✅ Status command works');
    await sleep(500);
    console.log('');
    
    // Test 7: Test Help
    console.log('7️⃣  Testing Help Command...');
    await makeRequest(`${BASE_URL}/webhook`, 'POST', {
      From: PHONE,
      Body: 'help'
    });
    console.log('✅ Help command works');
    await sleep(500);
    console.log('');
    
    // Test 8: Test Partial Completion
    console.log('8️⃣  Testing Partial Completion...');
    await makeRequest(`${BASE_URL}/webhook`, 'POST', {
      From: PHONE,
      Body: '45 mins'
    });
    console.log('✅ Partial completion tracked');
    await sleep(500);
    console.log('');
    
    // Test 9: Check Final State
    console.log('9️⃣  Final User State...');
    const finalUser = await (await makeRequest(`${BASE_URL}/users/${PHONE}`)).json();
    console.log('✅ Final State:', JSON.stringify(finalUser, null, 2));
    console.log('');
    
    console.log('========================================');
    console.log('✅ All tests passed!\n');
    console.log('💡 Next Steps:');
    console.log('   1. Set up Twilio account (twilio.com)');
    console.log('   2. Get WhatsApp sandbox number');
    console.log('   3. Add credentials to .env file');
    console.log('   4. Deploy to Railway/Replit');
    console.log('   5. Test with real WhatsApp messages!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();

