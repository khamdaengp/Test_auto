import { test, expect } from '@playwright/test';

test.describe('Automated API Request Test Suite', () => {
  const BASE_URL = 'http://10.120.44.76:8500';

  test('POST /ApiGateway/CoreService/UserLogin - should return 200', async ({ request }, testInfo) => {
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
    const status = response.status();
    const bodyText = await response.text();
    if (testInfo) {
      await testInfo.attach('api-response.json', { body: bodyText, contentType: 'application/json' });
      await testInfo.attach('api-status', { body: String(status), contentType: 'text/plain' });
    }
    console.log('Response body:', bodyText);
    expect(status).toBe(200);
    const body = JSON.parse(bodyText);
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('sessionId');
    expect(body.username).toBe('BCCS3_FULL');
  });
});
