const BASE_URL = 'http://localhost:3000/api';
const TENANT_ID = 'test-school-id'; // Replace with valid ID if needed

async function testLatency() {
  console.log('Starting Notification Latency Test...');

  // Mock Data
  const routineId = 'test-routine-id'; // Requires valid routine ID in DB
  const startPayload = { routineId };

  const start = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/academic/live/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
      },
      body: JSON.stringify(startPayload),
    });

    const end = Date.now();
    const latency = end - start;

    console.log(`Response received in ${latency}ms`);
    console.log('Status:', response.status);

    if (response.ok) {
        const data = await response.json();
        console.log('Data:', data);
    } else {
        console.log('Error Text:', await response.text());
    }

    if (latency < 2000) {
      console.log('✅ PASS: Latency is under 2000ms');
    } else {
      console.log('❌ FAIL: Latency exceeded 2000ms');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLatency();
