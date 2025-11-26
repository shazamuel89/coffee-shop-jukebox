// backend/controllers/SearchController.js
import { BadRequestError } from "../errors/AppError.js";
import { searchTracks } from "../services/SearchService.js";

export const handleSearch = async (req, res) => {
  const q = (req.query.q || "").toString().trim();

  if (!q) {
    // Clear string message works better with your error middleware
    throw new BadRequestError("Missing query param ?q=");
  }

  // Call the search service and capture the results
  const results = await searchTracks(q);

  // Send the query and results back to the client
  return res.status(200).json({
    q,
    results,
  });
};
