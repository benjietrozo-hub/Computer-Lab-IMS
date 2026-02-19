/**
 * Diagnostic script for real-time activity logs
 * This script will help identify where the issue is
 */

const WebSocket = require('ws');
const http = require('http');

console.log('🔍 Starting Real-Time Logs Diagnostic...\n');

// Test 1: Check if notification server is running
console.log('Test 1: Checking if notification server is running...');
http.get('http://localhost:8082', (res) => {
  console.log('✅ Notification server is running (HTTP responded)');
  runTest2();
}).on('error', (err) => {
  console.error('❌ Notification server is NOT running!');
  console.error('   Please start it with: node notification-server-simple.js');
  process.exit(1);
});

function runTest2() {
  // Test 2: Check WebSocket connection
  console.log('\nTest 2: Testing WebSocket connection...');
  
  const ws = new WebSocket('ws://localhost:8082');
  let identified = false;
  let receivedBroadcast = false;
  
  ws.on('open', () => {
    console.log('✅ WebSocket connection established');
    
    // Test 3: Send identification
    console.log('\nTest 3: Sending identification as admin...');
    const identifyMessage = {
      type: 'identify',
      userId: 9999,
      role: 'admin'
    };
    ws.send(JSON.stringify(identifyMessage));
    console.log('   Sent:', JSON.stringify(identifyMessage));
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received message:', message.type);
      
      if (message.type === 'identified') {
        console.log('✅ Server confirmed identification');
        identified = true;
        
        // Test 4: Send test broadcast
        setTimeout(() => {
          console.log('\nTest 4: Sending test broadcast...');
          sendTestBroadcast();
        }, 500);
      }
      
      if (message.type === 'activity_log') {
        console.log('✅ Received activity log broadcast!');
        console.log('   Log details:', {
          action: message.payload.action,
          module: message.payload.module,
          user: message.payload.user_name,
          description: message.payload.description
        });
        receivedBroadcast = true;
        
        // All tests passed
        setTimeout(() => {
          console.log('\n' + '='.repeat(60));
          console.log('🎉 ALL TESTS PASSED!');
          console.log('='.repeat(60));
          console.log('\nThe real-time logging system is working correctly.');
          console.log('\nIf you\'re still not seeing logs in the browser:');
          console.log('1. Open browser console (F12)');
          console.log('2. Check for WebSocket connection messages');
          console.log('3. Verify you\'re logged in as admin');
          console.log('4. Make sure "Real-Time ON" button is enabled');
          console.log('5. Check browser console for any errors');
          ws.close();
          process.exit(0);
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Error parsing message:', err.message);
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    process.exit(1);
  });
  
  ws.on('close', () => {
    if (!receivedBroadcast) {
      console.log('\n⚠️  WebSocket closed before receiving broadcast');
      console.log('   This might indicate a server issue');
    }
  });
  
  // Timeout if no identification received
  setTimeout(() => {
    if (!identified) {
      console.error('\n❌ FAILED: No identification confirmation received');
      console.error('   The server might not be sending confirmation messages');
      ws.close();
      process.exit(1);
    }
  }, 3000);
}

function sendTestBroadcast() {
  const testLog = {
    log: {
      user_id: 9999,
      user_name: 'Diagnostic Test',
      user_email: 'test@diagnostic.com',
      user_role: 'admin',
      action: 'test',
      module: 'diagnostic',
      entity_type: 'test',
      entity_id: 1,
      entity_name: 'Diagnostic Test',
      description: 'This is a diagnostic test broadcast',
      severity: 'info',
      device_type: 'desktop',
      browser: 'Node.js',
      os: 'Server',
      is_bot: false,
      created_at: new Date().toISOString()
    }
  };
  
  fetch('http://localhost:8082/broadcast-activity-log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testLog)
  })
    .then(response => response.json())
    .then(data => {
      console.log('   Broadcast response:', data);
      if (data.success) {
        console.log(`   ✅ Broadcast sent to ${data.sent} admin clients`);
      } else {
        console.error('   ❌ Broadcast failed:', data.error);
      }
    })
    .catch(error => {
      console.error('   ❌ Broadcast request failed:', error.message);
    });
}
