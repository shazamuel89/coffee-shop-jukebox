# Integration Testing Guide

This folder contains all **integration tests** for the Coffee Shop Jukebox backend.

Integration tests verify that multiple components (controllers, services, models, routes, and database) work together correctly.

## How to Run Integration Tests

1. Make sure dependencies are installed  
   `npm install`

2. Ensure your test database is set up and accessible.

3. Run all integration tests  
   `npm run test:integration`

4. (Optional) Run a specific test file  
   `npx jest integration_testing/QueueFlow.test.js`

## Test Framework

- Uses **Jest** for test execution.
- May use **supertest** to make HTTP requests to Express routes.

## Test Naming Convention

Use descriptive names that represent the process being tested:  
`test("customer can request a song and admin sees it in the queue", async () => { ... });`

## Example

```js
import request from "supertest";
import app from "../backend/server.js";

test("POST /api/queue adds a valid song to the queue", async () => {
  const response = await request(app)
    .post("/api/queue")
    .send({ title: "Test Song", artist: "Test Artist", requestedBy: 1 });
  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
});
```

## Notes

- These tests may connect to your database or a test instance.
- Use realistic data to simulate real workflows (request → queue → vote → skip).
- Avoid using production credentials or real Spotify API keys in tests.
- Run integration tests before deployment to confirm all systems work together.

