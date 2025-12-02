# Unit Testing Guide

This folder contains all **unit tests** for the Coffee Shop Jukebox backend.

Each test targets a single function or module in isolation, without involving the database, API calls, or other services.

## How to Run Unit Tests

1. Make sure dependencies are installed  
   `npm install`

2. Run all unit tests  
   `npm run test:unit`

3. (Optional) Run a specific test file  
   `npx jest unit_testing/RuleService.test.js`

## Test Framework

- **Jest** is used as the testing framework.
- The configuration is defined in `package.json` under `"jest"`.
- Each test file should end with `.test.js`.

## Test Naming Convention

Use descriptive test names like this:  
`test("should reject a song if it exceeds the length limit", () => { ... });`

## Example

```js
import { applyRules } from "../backend/services/RuleService.js";

test("should reject a song exceeding the max length", () => {
  const song = { duration_ms: 400000 };
  const rules = { maxDuration: 300000 };
  const result = applyRules(song, rules);
  expect(result.passed).toBe(false);
});
```

## Notes

- Mock any external dependencies like database calls or API requests using `jest.mock()`.
- Keep each test small and focused on one function or behavior.
- Run tests frequently during development to catch regressions early.

