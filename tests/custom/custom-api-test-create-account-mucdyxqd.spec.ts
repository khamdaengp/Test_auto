import { test, expect } from '@playwright/test';

test.describe('Automated API Request Test Suite', () => {
  const BASE_URL = 'http://10.120.44.76:8500/ApiGateway/CoreService';

  test('POST /UserRouting - should return 200', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/UserRouting`, {
      data: {
  "sessionId": "8dc95448-7c30-46f7-a6f1-761114dcbb23",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYmNjc3xCQ0NTM19GVUxMIiwidXNlcm5hbWUiOiJtYmNjc3xCQ0NTM19GVUxMIiwiaXNzIjoibWJjY3MtY2xpZW50IiwiaWF0IjoxNzkwMDYzMjkyLCJleHAiOjE3OTAxNDk2OTJ9.muP0ITPBBR5N9exvaLJiCkH2bUBTRuxJTk_9ZlNbfnA",
  "username": "BCCS3_FULL",
  "wsCode": "WS_createConnectorCodeWithSaleStaff",
  "wsRequest": {
      "type": "1",
    "branch": "41",
    "businessCenter": "3367",
    "saleStaff": "550112094",
    "stationCode": "VIC0126",
    "cableBoxCode": "I01-VIC0126",
    "account": null,
    "status": "1",
    "branchName": "BOP Vientiane Capital",
    "businessCenterName": "VIC 05 (Naxaythong district)",
    "saleStaffName": "550112094_Mr Sorlaphai thiengthavexay"
  }
},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('errorCode');
    expect(body.errorCode).toBe('S200');
    expect(body).toHaveProperty('result');
  });
});
