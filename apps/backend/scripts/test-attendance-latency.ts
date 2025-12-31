const BASE_URL = 'http://localhost:3000/api';

async function testAttendanceLatency() {
  console.log('Starting Attendance Latency Test...');

  const payload = {
    studentIds: ['s1', 's2'],
    status: 'ABSENT',
    date: new Date().toISOString(),
  };

  try {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}/teacher/attendance/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'test-school',
      },
      body: JSON.stringify(payload),
    });

    const end = Date.now();
    const networkLatency = end - start;

    if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);

        const receivedAt = new Date(data.receivedAt).getTime();
        const pushedAt = new Date(data.pushedAt).getTime();
        const internalLatency = pushedAt - receivedAt;

        console.log(`Internal Processing Latency: ${internalLatency}ms`);
        console.log(`Total Network Latency: ${networkLatency}ms`);

        if (internalLatency < 2000) {
            console.log('✅ PASS: Internal Latency under 2s');
        } else {
            console.log('❌ FAIL: Internal Latency exceeded 2s');
        }
    } else {
        console.log('Error:', await response.text());
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAttendanceLatency();
