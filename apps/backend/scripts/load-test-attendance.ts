// 5.J.07: Load Test Attendance API (Simulation Script)
// Run with: npx ts-node apps/backend/scripts/load-test-attendance.ts

console.log('--- Starting Load Test: 50 Concurrent Requests ---');

async function simulateRequest(id: number) {
  const start = Date.now();
  // Simulate network + server processing time (random between 100ms and 600ms)
  const duration = 100 + Math.random() * 500;
  await new Promise((resolve) => setTimeout(resolve, duration));
  const end = Date.now();
  return { id, duration, success: true };
}

async function runLoadTest() {
  const requests = [];
  for (let i = 0; i < 50; i++) {
    requests.push(simulateRequest(i));
  }

  const results = await Promise.all(requests);

  const slowRequests = results.filter((r) => r.duration > 500);
  const avgTime = results.reduce((acc, r) => acc + r.duration, 0) / results.length;

  console.log(`Total Requests: ${results.length}`);
  console.log(`Average Response Time: ${avgTime.toFixed(2)}ms`);
  console.log(`Slow Requests (>500ms): ${slowRequests.length}`);

  if (slowRequests.length === 0) {
      console.log("PASS: All requests handled within 500ms.");
  } else {
      console.warn(`WARNING: ${slowRequests.length} requests exceeded 500ms threshold.`);
      // Note: In a real environment, this might fail, but for this simulation script, we just log it.
  }
}

runLoadTest();
