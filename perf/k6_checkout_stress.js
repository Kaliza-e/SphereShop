import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    sign_in_load: {
      executor: 'constant-vus',
      vus: 80,
      duration: '60s',
      exec: 'signInScenario',
    },
    checkout_stress: {
      executor: 'per-vu-iterations',
      vus: 150,
      iterations: 1,
      maxDuration: '60s',
      exec: 'checkoutStressScenario',
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export function signInScenario() {
  const payload = JSON.stringify({
    login: '0781000001',
    password: 'Kigali2026',
  });
  const headers = { 'Content-Type': 'application/json' };
  const res = http.post(`${BASE_URL}/auth/login`, payload, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'duration < 600ms': (r) => r.timings.duration < 600,
  });
  sleep(1);
}

export function checkoutStressScenario() {
  const payload = JSON.stringify({
    productId: 'prod-5', // LOW-05 stock 3
    quantity: 1,
  });
  const headers = { 'Content-Type': 'application/json' };
  const res = http.post(`${BASE_URL}/cart/items`, payload, { headers });

  check(res, {
    'status is 200 or 400': (r) => r.status === 200 || r.status === 400,
    'no 500 error': (r) => r.status !== 500,
  });
}
