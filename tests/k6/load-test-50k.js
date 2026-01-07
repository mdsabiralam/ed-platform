import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 5000 },  // Ramp to 5k
    { duration: '5m', target: 20000 }, // Ramp to 20k
    { duration: '3m', target: 50000 }, // Ramp to 50k (Peak)
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95th percentile response time must be < 500ms
    errors: ['rate<0.01'],            // Error rate must be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000/api'; // Target Staging/Local

export default function () {
  // 1. Login
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: 'test-user@alpha.school',
    password: 'password123',
  });

  const loginSuccess = check(loginRes, {
    'login status is 201': (r) => r.status === 201,
  });

  if (!loginSuccess) {
    errorRate.add(1);
    return;
  }

  const token = loginRes.json('accessToken');
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  sleep(1);

  // 2. Fetch Dashboard
  const dashboardRes = http.get(`${BASE_URL}/principal/dashboard`, params);
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);

  // 3. View Report Card (Marksheet)
  // Assuming we have a student ID. In a real test, we might extract this from dashboard.
  // Using a hardcoded placeholder for the load test script structure.
  const studentId = 'student-uuid-placeholder';
  const termId = 'term-uuid-placeholder';

  const reportRes = http.get(`${BASE_URL}/academic/marksheet/pdf/${studentId}?termId=${termId}`, params);
  check(reportRes, {
    'report status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // 4. Logout
  // Assuming client-side token discard, but if there's a revoke endpoint:
  // http.post(`${BASE_URL}/auth/logout`, {}, params);
}
