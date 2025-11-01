import { jest } from "@jest/globals";
import { sanitizeQueryParam } from "../../../middleware/sanitize.js";

describe("sanitizeQueryParam middleware", () => {
  test("trims and collapses extra spaces", () => {
    const req = { query: { name: "   John    Doe   " } };
    const res = {};
    const next = jest.fn();

    sanitizeQueryParam("name")(req, res, next);

    expect(req.query.name).toBe("John Doe");
    expect(next).toHaveBeenCalled();
  });

  test("removes control characters", () => {
    const req = { query: { title: "Hello\u0000World\u001F!" } };
    const res = {};
    const next = jest.fn();

    sanitizeQueryParam("title")(req, res, next);

    expect(req.query.title).toBe("HelloWorld!");
    expect(next).toHaveBeenCalled();
  });

  test("handles missing query param gracefully", () => {
    const req = { query: {} };
    const res = {};
    const next = jest.fn();

    sanitizeQueryParam("missing")(req, res, next);

    expect(req.query.missing).toBe("");
    expect(next).toHaveBeenCalled();
  });
});
