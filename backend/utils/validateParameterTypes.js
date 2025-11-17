/**
 * Validates that given parameters match their expected data types.
 * Returns an error message string if a type mismatch is found, or null if all match.
 *
 * @param {Object} dataObject - The object to validate (e.g. req.body, req.query, etc.)
 * @param {Object} expectedTypes - Key/value pairs of expected parameter types
 *   e.g. { queueItemId: "number", userId: "number", isUpvote: "boolean" }
 * @returns {string|null} Error message string if mismatch, or null if all are valid
 */
const validateParameterTypes = (dataObject, expectedTypes) => {
  for (const [parameterName, expectedType] of Object.entries(expectedTypes)) {
    const actualValue = dataObject[parameterName];

    // Allow undefined/null to pass (use validateRequiredParameters separately)
    if (typeof actualValue === "undefined" || actualValue === null) continue;

    let valid = false;

    switch (expectedType) {
      case "number":
        valid = Number.isFinite(Number(actualValue));
        break;
      case "boolean":
        valid =
          actualValue === true ||
          actualValue === false ||
          actualValue === "true" ||
          actualValue === "false";
        break;
      case "string":
        valid = typeof actualValue === "string";
        break;
      default:
        valid = typeof actualValue === expectedType;
    }

    if (!valid) {
      return `${parameterName} does not match the expected type (${expectedType}).`;
    }
  }

  return null;
};

export default validateParameterTypes;