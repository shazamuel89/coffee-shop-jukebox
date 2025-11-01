// backend/middleware/sanitize.js

// Sanitizes a specific query parameter (must run this middleware first because request parameters are initially guaranteed to be strings)
export function sanitizeQueryParam(paramName) {
  return (req, _res, next) => {
    let val = (req.query[paramName] || "").toString();
    // basic cleanup: trim, collapse spaces, remove control chars
    val = val.replace(/\s+/g, " ").trim().replace(/[\u0000-\u001F]/g, "");
    req.query[paramName] = val;
    next();
  };
}
