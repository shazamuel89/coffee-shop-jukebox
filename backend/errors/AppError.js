// backend/errors/AppError.js

/**
 * HOW TO USE:
 * 
 * For models:
 * No error handling is needed in the model unless actions must be taken for specific errors.
 * 
 * For services:
 * Import error classes needed from this file.
 * Throw one of these errors below, giving a descriptive message as the argument.
 * Try/catch blocks are only needed when domain-specific messages need to be given for calls to a model function,
 * meaning that the service layer knows what the error from the model means for the overall system.
 * 
 * For controllers:
 * Import error classes needed from this file
 * Throw one of these errors below, giving a descriptive message as the argument.
 * No try/catch blocks should be needed, but if they are used, make sure to call next(err) in the catch block instead of throw err.
 * 
 * For routers:
 * Simply wrap all async function calls (essentially all controller functions) in asyncHandler, like this:
 * router.post("/startup", confirmAdmin, asyncHandler(startDay));
**/


export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

/**
 * Input validation fails
 * Missing fields
 * Wrong data shape
 * Bad search term format
 * Wrong type for parameters
 * Extra unexpected fields
**/
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

/**
 * User not logged in
 * Admin route accessed without login
 * Token missing or invalid
**/
export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

/**
 * Customer tries to use admin-only actions
 * Someone tries to skip / remove tracks without admin role
**/
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

/**
 * Queue item doesn't exist
 * Vote item not found
 * Rule not found
 * Genre not found
 * Report type does not exist
 * Track metadata not in DB
**/
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

/**
 * User tries to request a track already in the queue
 * Duplicate data
 * Trying to redo a vote that conflicts with business logic
 * Attempting to remove or skip a track already removed or already skipped
**/
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

/**
 * User violates "time between requests" rule
**/
export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}
