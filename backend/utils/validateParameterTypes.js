/**
 * Validates that given parameters match their expected data types.
 * Returns an error message string if a type mismatch is found, or null if all match.
 * 
 * @param {Object} dataObject - The object to validate (usually req.body)
 * @param {Object} expectedTypes - Key/value pairs of expected parameter types
 *   e.g. { queueItemId: "number", userId: "number", isUpvote: "boolean" }
 * @returns {string|null} Error message string if mismatch, or null if all types are valid
 */

const validateParameterTypes = (dataObject, expectedTypes) => {
    // For each name/type pair in the expected types object
    for (const [parameterName, expectedType] of Object.entries(expectedTypes)) {
        // Grab the actual value found in the data
        const actualValue = dataObject[parameterName];

        // Skip parameters that are undefined/null - could mean that parameter is not required, so handle separately
        if (typeof actualValue === 'undefined' || actualValue === null) continue;

        // If parameter's type doesn't match expected type, return error message
        if (typeof actualValue !== expectedType) {
            return `${paramName} does not match the expected type (${expectedType}).`;
        }
    }
    // Return null if all provided parameters match expected types
    return null;
};

export default validateParameterTypes;
