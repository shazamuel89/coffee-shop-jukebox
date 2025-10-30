// backend/middleware/errorHandler.js

// 404 for anything that didn't match a route
export function notFound(_req, res) {
  res.status(404).json({ error: "Not found" });
}

// Central error handler for thrown/rejected errors
export function errorHandler(err, _req, res, _next) {
  const status = err?.status || 500;
  const message = err?.message || "Server error";
  // optional: log in dev
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", status, message);
  }
  res.status(status).json({ error: message });
}