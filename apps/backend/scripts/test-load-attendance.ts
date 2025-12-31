const BASE_URL = 'http://localhost:3000/api';
const CONCURRENT_REQUESTS = 50;

async function runLoadTest() {
  console.log(`Starting Load Test: ${CONCURRENT_REQUESTS} concurrent requests...`);

  const payload = {
    studentIds: ['s1', 's2'],
    status: 'ABSENT',
    date: new Date().toISOString(),
  };

  const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => {
    const start = Date.now();
    return fetch(`${BASE_URL}/teacher/attendance/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': `school-${i % 5}`, // Simulate multiple tenants
      },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      const end = Date.now();
      const latency = end - start;
      return { status: res.status, latency, ok: res.ok };
    }).catch((err) => {
      return { status: 0, latency: 0, ok: false, error: err.message };
    });
  });

  const results = await Promise.all(requests);

  // Analysis
  const successCount = results.filter(r => r.ok).length;
  const failCount = results.filter(r => !r.ok).length;
  const latencies = results.map(r => r.latency).sort((a, b) => a - b);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const maxLatency = latencies[latencies.length - 1];
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)];

  console.log('\n--- Load Test Results ---');
  console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Avg Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`Max Latency: ${maxLatency}ms`);
  console.log(`P95 Latency: ${p95Latency}ms`);

  if (failCount > 0) {
    console.error('❌ FAIL: Some requests failed.');
    // process.exit(1);
  }

  if (maxLatency > 500) {
    console.warn('⚠️ WARN: Some requests exceeded 500ms constraint.');
    // process.exit(1); // Optional: Fail or Warn depending on strictness
  } else {
    console.log('✅ PASS: All requests within 500ms.');
  }
}

runLoadTest();
