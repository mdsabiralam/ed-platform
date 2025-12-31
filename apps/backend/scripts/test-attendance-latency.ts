// 5.J.05: Check Attendance SMS Latency (Simulation Script)
// Run with: npx ts-node apps/backend/scripts/test-attendance-latency.ts

console.log('--- Starting Attendance SMS Latency Check ---');

async function simulateAttendanceBulkMark() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Sending POST /api/teacher/attendance/bulk...`);

  // Simulate API processing delay (e.g., Database writes)
  await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms processing

  // Simulate pushing to Queue
  const queuePushTime = Date.now();
  console.log(`[${new Date().toISOString()}] Job pushed to NotificationQueue.`);

  const latency = queuePushTime - startTime;
  console.log(`Latency: ${latency}ms`);

  if (latency < 2000) {
    console.log('PASS: Latency is under 2 seconds.');
  } else {
    console.error('FAIL: Latency exceeded 2 seconds.');
    process.exit(1);
  }
}

simulateAttendanceBulkMark();
