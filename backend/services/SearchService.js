// backend/services/SearchService.js

import * as SpotifyAPIAdapter from "../adapters/SpotifyAPIAdapter.js";

// Temporary setting for search results limit, may later be available as an admin setting
const resultLimit = 20;

export async function searchTracks({ term }) {
    const searchResults = await SpotifyAPIAdapter.requestSearchResults({
        term,
        limit: resultLimit,
    });

    const formattedTracks = searchResults.map(track => ({
        id: track.id,
        name: track.name,

        durationMs: track.durationMs,
        explicit: track.explicit,
        
        spotifyUrl: track.spotifyUrl,

        artists: (track.artists ?? []).map(artist => ({
            name: artist.name,
            spotifyUrl: artist.spotifyUrl,
        })),

        album: track.album ? {
            name: track.album.name,
            spotifyUrl: track.album.spotifyUrl,
            images: track.album.images,
        } : null
    }));

    return formattedTracks;
}
