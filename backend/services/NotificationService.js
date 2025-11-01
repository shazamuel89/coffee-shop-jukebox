// backend/services/NotificationService.js

// simple stub for integration test
export function notifyRulesChanged(message = "Rules updated") {
  console.log("Mock notifyRulesChanged called with:", message);
  return { success: true };
}
