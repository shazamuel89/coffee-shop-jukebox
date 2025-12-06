// backend/middleware/errorHandler.js

// Handles routes that didn't match anything
export function notFound(req, _res, next) {
  next({
    status: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

// Centralized error handler
export function errorHandler(err, _req, res, _next) {
  // Default behavior if someone throws a plain Error
  const status = err.status || 500;
  const message = err.message || "Server error";

  const isProduction = process.env.NODE_ENV === "production";

  // In development, give full stack traces
  if (!isProduction) {
    console.error("ERROR:", {
      status,
      message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: message,
    ...(isProduction ? {} : { stack: err.stack }), // stack only in dev
  });
}
