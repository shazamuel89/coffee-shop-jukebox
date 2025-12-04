//sanitizes & trims strings
function cleanString({ val = "", max = 120 }) {
  const s = String(val)
    .normalize("NFKC")                     // Normalize unicode
    .replace(/[\u0000-\u001F\u007F]/g, "") // remove control chars
    .replace(/\s+/g, " ")                  // collapse spaces
    .trim();
  return s.length > max ? s.slice(0, max) : s;
}

export default cleanString;