import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 concurrent users
    { duration: '1m', target: 100 },  // Stay at 100
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
  // 1. Register first to get Application ID
  // Note: specific logic to generate unique parents for load test or reuse?
  // User says "Send 100 concurrent requests to POST /api/admission/matriculate".
  // This implies applications already exist or we create them on the fly.

  const payload = {
    tenantId: 'd6b7b7e0-4f5c-4b5f-8f8f-0f6f6f6f6f6f', // Replace with valid ID
    studentName: `LoadTest Student ${__VU}-${__ITER}`,
    parentName: `Parent ${__VU}`,
    parentMobile: `999${__VU}${__ITER}`, // Unique per iteration/VU
    email: `loadtest${__VU}${__ITER}@example.com`
  };

  // Register
  let res = http.post(`${BASE_URL}/admission/register`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  const appId = res.json('id');

  if (appId) {
      // Matriculate
      let matRes = http.post(`${BASE_URL}/admission/matriculate`, JSON.stringify({ applicationId: appId }), {
        headers: { 'Content-Type': 'application/json' },
      });

      check(matRes, {
        'is status 201': (r) => r.status === 201,
      });
  }

  sleep(1);
}
