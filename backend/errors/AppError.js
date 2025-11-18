// backend/errors/AppError.js

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
