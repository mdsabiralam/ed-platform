import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 100 },  // Stay at 100 users (simulating concurrency)
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'],    // Less than 1% failure
  },
};

export default function () {
  // Use a mock student ID and exam ID
  const studentId = 'student-123';
  const examId = 'term-1';

  // Update the URL if your environment uses a different port
  const url = `http://localhost:3000/api/academic/marksheet/pdf/${studentId}?examId=${examId}`;

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(url, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'is pdf': (r) => r.headers['Content-Type'] === 'application/pdf',
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
