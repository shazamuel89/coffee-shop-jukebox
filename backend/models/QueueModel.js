import { pool } from "../config/dbConn.js";

/**
 * Retrieves all queue items with track metadata joined from Tracks table.
 *
 * Returned item shape:
 * {
 *   id,
 *   isNowPlaying,
 *   upvotes,
 *   downvotes,
 *   willBeSkipped,
 *   title,
 *   artists,       // JSON (array/object) from Tracks.artists
 *   releaseName,
 *   coverArtUrl
 * }
 *
 * @returns {Promise<Array>}
 */
const getAllQueueItems = async () => {
    const query = `
        SELECT
            q.id,
            q.is_now_playing AS "isNowPlaying",
            q.upvotes,
            q.downvotes,
            q.will_be_skipped AS "willBeSkipped",
            q.requested_by AS "requestedBy",

            t.title,
            t.artists::text AS artists,
            t.release_name AS "releaseName",
            t.cover_art_url AS "coverArtUrl"
        FROM
            Queue q
        JOIN
            Tracks t
        ON
            q.spotify_track_id = t.spotify_track_id
        ORDER BY
            q.is_now_playing DESC, q.position ASC, q.added_at ASC;
    `;
    try {
        const { rows } = await pool.query(query);
        return rows;
    } catch (err) {
        console.error("Error in QueueModel.getAllQueueItems:", err);
        throw err;
    }
};

/**
 * Retrieves a single queue item (with joined track metadata) by its ID.
 *
 * @param {number} queueItemId - The ID of the queue item to fetch.
 * @returns {Promise<Object|null>} - Returns the queue item object, or null if not found.
 */
const getQueueItem = async (queueItemId) => {
    const query = `
        SELECT
            q.id,
            q.spotify_track_id AS "spotifyTrackId",
            q.is_now_playing AS "isNowPlaying",
            q.upvotes,
            q.downvotes,
            q.will_be_skipped AS "willBeSkipped",
            q.requested_by AS "requestedBy",

            t.title,
            t.artists::text AS artists,
            t.release_name AS "releaseName",
            t.cover_art_url AS "coverArtUrl"
        FROM
            Queue q
        JOIN
            Tracks t
        ON
            q.spotify_track_id = t.spotify_track_id
        WHERE
            q.id = $1
        LIMIT 1;
    `;
    const parameters = [queueItemId];
    try {
        const { rows } = await pool.query(query, parameters);
        return rows[0] || null;
    } catch (err) {
        console.error("Error in QueueModel.getQueueItem:", err);
        throw err;
    }
};

/**
 * Updates the upvote/downvote counts and skip status for a queue item.
 *
 * @param {number} queueItemId
 * @param {number} upvotes
 * @param {number} downvotes
 * @param {boolean} willBeSkipped
 */
const updateVoteCountAndSkip = async (queueItemId, upvotes, downvotes, willBeSkipped) => {
    const query = `
        UPDATE Queue
        SET
            upvotes = $2,
            downvotes = $3,
            will_be_skipped = $4
        WHERE
            id = $1;
    `;
    const parameters = [queueItemId, upvotes, downvotes, willBeSkipped];
    try {
        await pool.query(query, parameters);
    } catch (err) {
        console.error("Error in QueueModel.updateVoteCountAndSkip:", err);
        throw err;
    }
};

export {
    getQueueItem,
    getAllQueueItems,
    updateVoteCountAndSkip,
};
