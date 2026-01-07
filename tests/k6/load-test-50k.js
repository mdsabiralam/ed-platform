import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10m', target: 50000 }, // Ramp up to 50k users over 10 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.01'], // Error rate should be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000'; // Adjust as needed

export default function () {
  // 1. Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'student@example.com',
    password: 'password123',
  });

  const success = check(loginRes, {
    'login status is 201': (r) => r.status === 201,
  });

  if (!success) {
    errorRate.add(1);
    return;
  }

  const token = loginRes.json('access_token');
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 2. Fetch Dashboard
  const dashboardRes = http.get(`${BASE_URL}/api/student/dashboard`, params);
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // 3. View Report Card
  // Assuming we need to fetch a specific report card. Using a placeholder ID.
  const reportCardRes = http.get(`${BASE_URL}/api/academic/marksheet/pdf/latest`, params);
  check(reportCardRes, {
    'report card status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // 4. Logout (Client-side mostly, but calling endpoint if exists)
  // Assuming stateless JWT, but let's simulate a logout call if applicable or just end session
  sleep(1);
}
