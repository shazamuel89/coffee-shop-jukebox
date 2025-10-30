// backend/controllers/SearchController.js
import { searchTracks } from "../services/SearchService.js";

export const handleSearch = async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();

    if (!q) {
      return res.status(400).json({ error: "Missing query param ?q=" });
    }

    const results = await searchTracks(q);

    // Final formatting (if any) would happen here
    res.json({
      q,
      results
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Search failed", details: err.message });
  }
}