import { Logger } from '@nestjs/common';
import axios from 'axios';

// 10.J.2 Load Test: Simulate 500 concurrent users
// This script simulates 500 users hitting the Commerce/SaaS endpoints concurrently.
// It is a basic load test script using Promises.

const TARGET_URL = 'http://localhost:3000/api/saas/plans'; // Example endpoint
const CONCURRENT_USERS = 500;
const logger = new Logger('LoadTest');

async function simulateUser(userId: number) {
  try {
    const start = Date.now();
    await axios.get(TARGET_URL);
    const duration = Date.now() - start;
    // logger.log(`User ${userId}: Request completed in ${duration}ms`);
    return { success: true, duration };
  } catch (error) {
    logger.error(`User ${userId}: Request failed - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runLoadTest() {
  logger.log(`Starting load test with ${CONCURRENT_USERS} concurrent users...`);

  const userPromises: Promise<any>[] = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i + 1));
  }

  const results = await Promise.all(userPromises);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((acc, curr: any) => acc + (curr.duration || 0), 0) / (successful || 1);

  logger.log('------------------------------------------------');
  logger.log(`Load Test Completed.`);
  logger.log(`Total Requests: ${CONCURRENT_USERS}`);
  logger.log(`Successful: ${successful}`);
  logger.log(`Failed: ${failed}`);
  logger.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
  logger.log('------------------------------------------------');
}

runLoadTest();
