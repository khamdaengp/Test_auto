import { test, expect } from '@playwright/test';

test.describe('Automated API Request Test Suite', () => {
  const BASE_URL = 'http://10.120.44.76:8500';

  test('POST /ApiGateway/CoreService/UserLogin - should return 200', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/ApiGateway/CoreService/UserLogin`, {
      data: {
        "appCode": "mbccs",
        "isEncrypt": false,
        "prefix": "856",
        "username": "BCCS3_FULL",
        "password": "654321a@"
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('sessionId');
    expect(body.username).toBe('BCCS3_FULL');
  });
});
