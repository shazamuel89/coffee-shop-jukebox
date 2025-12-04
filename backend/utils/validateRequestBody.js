// backend/utils/validateParams.js
import { BadRequestError } from "../errors/AppError.js";

export default function validateRequestBody(data, schema) {
    for (const [key, rules] of Object.entries(schema)) {
        const { type, required = false } = rules;
        const value = data[key];

        // Missing field
        if (required && (value === undefined || value === null)) {
            throw new BadRequestError(`Missing required field: ${key}`);
        }

        // Skip type check if value is absent and not required
        if (value === undefined || value === null) {
            continue;
        }

        // Type validation
        let isValid = false;

        switch (type) {
            case "number":
                isValid = Number.isFinite(Number(value));
                break;

            case "boolean":
                isValid =
                    value === true ||
                    value === false ||
                    value === "true" ||
                    value === "false";
                break;

            case "string":
                isValid = typeof value === "string";
                break;

            default:
                isValid = typeof value === type;
        }

        if (!isValid) {
            throw new BadRequestError(`${key} must be of type ${type}`);
        }
    }
}
