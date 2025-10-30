// backend/controllers/SearchController.js

export const handleSearch = (req, res) => {
  const q = (req.query.q || "").toString().trim();

  if (!q) {
    return res.status(400).json({ error: "Missing query param ?q=" });
  }
  res.json({
    q,
    results: [{ id: "mock1", title: "Blinding Lights", artist: "The Weekend" }]
  });
}