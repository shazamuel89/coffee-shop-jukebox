import { pool } from '../config/dbConn.js';

/**
 * Store the metadata for a single track.
 *
 * @param {object} track - The track and its associated metadata.
 */
const storeTrack = async ({ track }) => { 
    const { spotifyTrackId, title, artists, releaseName, releaseId, coverArtUrl, genres, isExplicit, duration, lastFetched } = track;
    const query = `
	    INSERT INTO
	        Tracks
	        (spotify_track_id, title, artists, release_name, release_id, cover_art_url, genres, is_explicit, duration_ms, last_fetched)
	    VALUES
	        ($1, $2, $3::jsonb, $4, $5, $6, $7::jsonb, $8, $9, $10)
	    ON CONFLICT
	        (spotify_track_id)
	    DO UPDATE SET
	        title = EXCLUDED.title,
	        artists = EXCLUDED.artists,
	        release_name = EXCLUDED.release_name,
    	    release_id = EXCLUDED.release_id,
    	    cover_art_url = EXCLUDED.cover_art_url,
    	    genres = EXCLUDED.genres,
    	    is_explicit = EXCLUDED.is_explicit,
    	    duration_ms = EXCLUDED.duration_ms,
    	    last_fetched = EXCLUDED.last_fetched
        RETURNING 1;
    `;
    const parameters = [spotifyTrackId, title, JSON.stringify(artists), releaseName, releaseId, coverArtUrl, JSON.stringify(genres), isExplicit, duration, lastFetched];
    try {
	    const { rows } = await pool.query(query, parameters);
        return (rows.length > 0);
    } catch(err) {
	    console.error("Error in TrackModel.storeTrack:", err);
    	throw err;
    }
}

export {
    storeTrack,
};
