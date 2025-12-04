// backend/adapters/SpotifyAPIAdapter.js

import dotenv from 'dotenv';
import { AppError, BadRequestError, NotFoundError, UnauthorizedError } from '../errors/AppError';

dotenv.config();

// Declare variables outside function scope that last for the life of the server
let cachedToken = null;
let tokenExpiresAt = 0;

const tokenRequestUrl = 'https://accounts.spotify.com/api/token';
const searchRequestUrl = (term, limit = 10) => {
    return `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}&limit=${limit}`;
};
const trackRequestUrl = (spotifyTrackId) => {
    return `https://api.spotify.com/v1/tracks/${spotifyTrackId}`;
};


// Requests an access token from Spotify's API
const getSpotifyAccessToken = async () => {
    const now = Date.now();

    // Reuse token if not expired
    if (cachedToken && now < tokenExpiresAt) {
        return cachedToken;
    }

    const credentials = Buffer
        .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
        .toString("base64");
    
    const response = await fetch(tokenRequestUrl, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials"
    });

    if (!response.ok) {
        throw new UnauthorizedError("Failed to get Spotify access token");
    }

    const data = await response.json();

    // Cache token and expiration time
    cachedToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;

    return cachedToken;
};

// Requests from Spotify's API a list of search results from the term
export const requestSearchResults = async ({ term, limit }) => {
    if (!term || typeof term !== "string") {
        throw new BadRequestError("Search term must be a non-empty string.");
    }

    const accessToken = await getSpotifyAccessToken();

    const response = await fetch(searchRequestUrl(term, limit), {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new AppError(`Failed to fetch search results from Spotify`, response.status);
    }

    const data = await response.json();

    return cleanSearchResults({ rawData: data });
};

// Requests full metadata for a track specified by id
export const fetchTrackMetadata = async ({ spotifyTrackId }) => {
    const accessToken = await getSpotifyAccessToken();

    const response = await fetch(trackRequestUrl(spotifyTrackId), {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    if (response.status === 404) {
        throw new NotFoundError(`Spotify track not found: ${spotifyTrackId}`);
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch track metadata for ID: ${spotifyTrackId}`);
    }

    const data = await response.json();

    return cleanTrackMetadata({ rawData: data });
};

// Creates a playlist on the admin's Spotify account using the top tracks list
export const createTopTracksPlaylist = async ({ topTracksList }) => {

};

// Normalizes Spotify's search track results into a clean internal format
const cleanSearchResults = ({ rawData }) => {
    const items = rawData?.tracks?.items || [];
    const cleaned = [];

    for (const item of items) {
        cleaned.push({
            id: item.id,
            uri: item.uri,
            name: item.name,

            durationMs: item.duration_ms,
            explicit: item.explicit,
            popularity: item.popularity ?? null,
            previewUrl: item.preview_url ?? null,

            spotifyUrl: item.external_urls?.spotify ?? null,
            isPlayable: item.is_playable ?? false,

            artists: (item.artists ?? []).map(a => ({
                id: a.id,
                name: a.name,
                uri: a.uri,
                spotifyUrl: a.external_urls?.spotify ?? null
            })),

            album: item.album ? {
                id: item.album.id,
                name: item.album.name,
                uri: item.album.uri,
                spotifyUrl: item.album.external_urls?.spotify ?? null,

                releaseDate: item.album.release_date ?? null,
                totalTracks: item.album.total_tracks ?? null,

                images: item.album.images ?? []  // [{url, height, width}]
            } : null
        });
    }

    return cleaned;
};

// Clean a full Spotify "track metadata" JSON response
const cleanTrackMetadata = ({ rawData }) => {
    if (!rawData || typeof rawData !== "object") {
        throw new Error("Invalid track metadata response");
    }

    const {
        id,
        name,
        duration_ms,
        explicit,
        popularity,
        preview_url,
        is_local,
        disc_number,
        track_number,
        external_ids,
        artists,
        album
    } = rawData;

    return {
        id,
        name,

        durationMs: duration_ms,
        explicit,
        popularity,
        previewUrl: preview_url,
        isLocal: is_local,
        discNumber: disc_number,
        trackNumber: track_number,
        isrc: external_ids?.isrc ?? null,

        artists: (artists ?? []).map(artist => ({
            id: artist.id,
            name: artist.name,
            uri: artist.uri ?? null,
            spotifyUrl: artist.external_urls?.spotify ?? null
        })),

        album: album ? {
            id: album.id,
            name: album.name,
            uri: album.uri ?? null,
            spotifyUrl: album.external_urls?.spotify ?? null,
            releaseDate: album.release_date ?? null,
            totalTracks: album.total_tracks ?? null,
            images: album.images ?? []   // [{ url, height, width }]
        } : null
    };
};
