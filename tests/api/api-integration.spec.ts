import { test, expect } from '@playwright/test';

test.describe('API Testing Suite (Playwright Request)', () => {
  const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

  test('GET /posts/1 - should return single post with valid schema', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/posts/1`);

    // Status code verification
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // Headers verification
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');

    // Body schema verification
    const body = await response.json();
    expect(body).toHaveProperty('id', 1);
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('body');
    expect(typeof body.title).toBe('string');
  });

  test('POST /posts - should create new resource and return status 201', async ({ request }) => {
    const newPostPayload = {
      title: 'Automated QA Test Post',
      body: 'Verified via Playwright API testing fixture',
      userId: 42,
    };

    const response = await request.post(`${API_BASE_URL}/posts`, {
      data: newPostPayload,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.title).toBe(newPostPayload.title);
    expect(body.body).toBe(newPostPayload.body);
    expect(body.userId).toBe(newPostPayload.userId);
    expect(body).toHaveProperty('id');
  });

  test('GET /posts/999999 - should handle 404 Not Found cleanly', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/posts/999999`);
    expect(response.status()).toBe(404);
  });
});
