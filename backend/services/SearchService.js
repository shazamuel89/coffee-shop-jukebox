import { searchSpotify } from "../adapters/SpotifyAPIAdapter.js";

export async function searchTracks(term) {
  // Hook for business rules (rate limits, filters) if needed later
  return await searchSpotify(term);
}
