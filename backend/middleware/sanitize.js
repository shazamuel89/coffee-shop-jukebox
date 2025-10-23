// backend/middleware/sanitize.js
export function sanitizeQueryParam(paramName) {
  return (req, _res, next) => {
    let val = (req.query[paramName] || "").toString();
    // basic cleanup: trim, collapse spaces, remove control chars
    val = val.replace(/\s+/g, " ").trim().replace(/[\u0000-\u001F]/g, "");
    req.query[paramName] = val;
    next();
  };
}
