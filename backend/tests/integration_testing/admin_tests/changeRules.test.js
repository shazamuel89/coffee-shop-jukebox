import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// 🧠 IMPORTANT: mock before importing router so mocks apply correctly
jest.unstable_mockModule("../../../services/RuleService.js", () => ({
  updateRules: jest.fn(),
}));

jest.unstable_mockModule("../../../services/NotificationService.js", () => ({
  notifyRulesChanged: jest.fn(),
}));

// Now import the mocked modules
const { updateRules } = await import("../../../services/RuleService.js");
const { notifyRulesChanged } = await import("../../../services/NotificationService.js");

// Import your router *after* the mocks are declared
const { default: ruleRouter } = await import("../../../routers/api/ruleRouter.js");

// Minimal express setup
const app = express();
app.use(express.json());
app.use("/api/rules", ruleRouter);

describe("Integration: Admin changes rules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully update rules and send notification", async () => {
    // Arrange
    updateRules.mockResolvedValue({ success: true });
    notifyRulesChanged.mockResolvedValue();

    const newRules = { maxSongs: 5, cooldownMinutes: 10 };

    // Act
    const response = await request(app)
      .post("/api/rules")
      .send(newRules)
      .set("Authorization", "Bearer mock-admin-token");

    // Assert
    expect(response.status).toBe(200);
    expect(updateRules).toHaveBeenCalledWith(newRules);
    expect(notifyRulesChanged).toHaveBeenCalled();
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/rules/i),
      })
    );
  });

  it("should handle validation errors gracefully", async () => {
    const response = await request(app)
      .post("/api/rules")
      .send({ maxSongs: -1 }); // invalid data

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
