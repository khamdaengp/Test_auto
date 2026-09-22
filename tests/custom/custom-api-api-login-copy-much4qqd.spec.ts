import { test, expect } from '@playwright/test';

test.describe('Automated API Request Test Suite', () => {
  const BASE_URL = 'http://10.120.44.76:8500';

  test('POST /ApiGateway/CoreService/UserRouting - should return 200', async ({ request }, testInfo) => {
    const response = await request.post(`${BASE_URL}/ApiGateway/CoreService/UserRouting`, {
      data: {
        "wsCode": "WS_searchRptV2",
        "wsRequest": {
          "type": "R580_GET_LST_CONNECTOR_CODE_WITH_SALE_STAFF_STATUS"
        },
        "username": "BCCS3_FULL",
        "sessionId": "93c568eb-ac86-4a70-ac9f-ecf582ceef33",
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYmNjc3xCQ0NTM19GVUxMIiwidXNlcm5hbWUiOiJtYmNjc3xCQ0NTM19GVUxMIiwiaXNzIjoibWJjY3MtY2xpZW50IiwiaWF0IjoxNzkwMDY1MTI1LCJleHAiOjE3OTAxNTE1MjV9.xVLoX0fedBcnCLtq1MGHXrc65RWn7PnOSw3pk-I8ZS8"
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
    expect(body).toHaveProperty('errorCode');
    expect(body.errorCode).toBe('S200');
    expect(body).toHaveProperty('result');
    expect(body.result).toHaveProperty('callId');
  });
});
