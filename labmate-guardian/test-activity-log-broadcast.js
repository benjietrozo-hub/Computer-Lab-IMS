/**
 * Test script to verify activity log broadcasting
 * Run this after starting the notification server to test the broadcast functionality
 */

const testLog = {
  log: {
    user_id: 6717,
    user_name: 'Test Admin',
    user_email: 'admin@test.com',
    user_role: 'admin',
    action: 'test',
    module: 'testing',
    entity_type: 'test',
    entity_id: 1,
    entity_name: 'Test Entity',
    description: 'This is a test activity log broadcast',
    severity: 'info',
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
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
    console.log('✅ Broadcast test result:', data);
    if (data.success) {
      console.log(`   Sent to ${data.sent} admin clients out of ${data.adminCount} admins (${data.totalClients} total clients)`);
    }
  })
  .catch(error => {
    console.error('❌ Broadcast test failed:', error);
  });
