// backend/services/SearchService.js
import { searchTracksOnSpotify } from "../adapters/spotifyAPIAdapter.js";

/**
 * Runs business logic (currently none)
 * Delegates to adapter
 * Returns cleaned results to controller
 */
export async function searchTracks(term) {
  if (!term || typeof term !== "string") {
    throw new Error("Search term is required and must be a string.");
  }

  // (Business logic placeholder — none currently)
  // Example of future logic:
  // - sanitize term
  // - enforce min length
  // - log analytics

  // Step: delegate to Spotify adapter
  const rawResults = await searchTracksOnSpotify(term);

  // (Business logic placeholder — none currently)
  // Example of future logic:
  // - filter out explicit content
  // - apply result caps
  // - reorder based on custom priority

  return rawResults;
}