// backend/controllers/SearchController.js
import { Router } from "express";

const router = Router();

// GET /api/search?q=term  (simple mock so it always works)
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) return res.status(400).json({ error: "Missing query param ?q=" });
  res.json({
    q,
    results: [{ id: "mock1", title: "Blinding Lights", artist: "The Weeknd" }]
  });
});

export default router;

