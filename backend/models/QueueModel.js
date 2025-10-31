// backend/models/QueueModel.js
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
export const getAllQueueItems = async () => {
  const query = `
    SELECT
      q.id,
      q.is_now_playing AS "isNowPlaying",
      q.upvotes,
      q.downvotes,
      q.will_be_skipped AS "willBeSkipped",
      q.requested_by AS "requestedBy",

      t.title,
      t.artists,
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