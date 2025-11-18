// backend/controllers/SearchController.js
import { BadRequestError } from "../errors/AppError.js";
import { searchTracks } from "../services/SearchService.js";

export const handleSearch = async (req, res) => {
  const q = (req.query.q || "").toString().trim();

  if (!q) {
    throw new BadRequestError({ error: "Missing query param ?q=" });
  }

  await searchTracks(q);

  // Final formatting (if any) would happen here
  res.json({
    q,
    results
  });
}