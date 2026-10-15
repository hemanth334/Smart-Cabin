const http = require('http');
const { app, server, io } = require('../server');
const { io: Client } = require('socket.io-client');
const fs = require('fs');

async function testPhase1And2() {
  const PORT = 3456;
  
  // Start server on test port 3456
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    // 1. Test GET /api/status
    console.log('Testing GET /api/status...');
    const getRes = await fetch(`http://localhost:${PORT}/api/status`);
    if (getRes.status !== 200) throw new Error(`GET /api/status failed with ${getRes.status}`);
    const getData = await getRes.json();
    console.log('GET /api/status Response:', {
      faculty: getData.faculty.name,
      state: getData.current_status.state,
      reason: getData.current_status.activity_reason
    });

    if (!getData.faculty || !getData.current_status || !getData.timetable_today) {
      throw new Error('Schema validation failed for GET /api/status');
    }

    // 2. Test Socket.io Client and status_updated broadcast
    console.log('Connecting socket client...');
    const socket = Client(`http://localhost:${PORT}`);
    
    let receivedSocketEvent = false;
    let socketReceivedData = null;

    socket.on('status_updated', (data) => {
      receivedSocketEvent = true;
      socketReceivedData = data;
      console.log('-> Socket received status_updated event:', data.current_status.state, '-', data.current_status.activity_reason);
    });

    // Wait a brief moment for socket connection & initial message
    await new Promise((r) => setTimeout(r, 500));

    // 3. Test POST /api/status
    console.log('Testing POST /api/status...');
    const postPayload = {
      state: 'busy',
      activity_reason: 'In Meeting with Dean',
      location: 'Cabin 304, Block B',
      expected_return: '03:30 PM'
    };

    const postRes = await fetch(`http://localhost:${PORT}/api/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload)
    });

    if (postRes.status !== 200) throw new Error(`POST /api/status failed with ${postRes.status}`);
    const postResult = await postRes.json();
    console.log('POST /api/status Response success:', postResult.success);

    // Wait for broadcast to reach socket client
    await new Promise((r) => setTimeout(r, 500));

    if (!receivedSocketEvent || socketReceivedData?.current_status?.state !== 'busy') {
      throw new Error('Socket.io did not broadcast updated state!');
    }
    console.log('✓ Socket.io broadcast verified successfully!');

    // 4. Test Static File Serving
    console.log('Testing static file serving...');
    const indexRes = await fetch(`http://localhost:${PORT}/index.html`);
    if (indexRes.status !== 200) throw new Error('Failed to serve /index.html');
    const adminRes = await fetch(`http://localhost:${PORT}/admin.html`);
    if (adminRes.status !== 200) throw new Error('Failed to serve /admin.html');
    const loginRes = await fetch(`http://localhost:${PORT}/login.html`);
    if (loginRes.status !== 200) throw new Error('Failed to serve /login.html');
    console.log('✓ Static files served successfully!');

    // Reset status back to available
    const resetPayload = {
      state: 'available',
      activity_reason: 'In Cabin - Consultations Open',
      location: 'Cabin 304, Block B',
      expected_return: null
    };
    await fetch(`http://localhost:${PORT}/api/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetPayload)
    });
    console.log('✓ Status reset to initial available state.');

    socket.disconnect();
    server.close();
    console.log('\nALL PHASE 1 & PHASE 2 CHECKS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    server.close();
    process.exit(1);
  }
}

testPhase1And2();
