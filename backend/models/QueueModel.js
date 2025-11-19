// backend/models/QueueModel.js
import { pool } from "../config/dbConn.js";


// Looks for track in queue and returns success
export const checkForTrack = async ({ spotifyTrackId }) => {

};

// Adds a successful customer request to queue
export const appendQueueItem = async ({ queueItemData }) => {

};

// Retrieves data for specific queue item
/**
 * Retrieves a single queue item (with joined track metadata) by its ID.
 *
 * @param {number} queueItemId - The ID of the queue item to fetch.
 * @returns {Promise<Object|null>} - Returns the queue item object, or null if not found.
 */
export const fetchQueueItem = async ({ queueItemId }) => {
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

  const { rows } = await pool.query(query, [queueItemId]);
  return rows[0] || null;
};

// Fetches all queue data
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
export const fetchQueue = async () => {
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

  const { rows } = await pool.query(query);
  return rows;
};

// Updates vote data for specific queue item
/**
 * Updates the upvote/downvote counts and skip status for a queue item.
 *
 * @param {number} queueItemId
 * @param {number} upvotes
 * @param {number} downvotes
 * @param {boolean} willBeSkipped
 */
export const updateVoteCountAndSkip = async ({ queueItemId, upvoteCount, downvoteCount, willBeSkipped }) => {
  const query = `
    UPDATE Queue
    SET
      upvotes = $2,
      downvotes = $3,
      will_be_skipped = $4
    WHERE
      id = $1;
  `;

  await pool.query(query, [queueItemId, upvoteCount, downvoteCount, willBeSkipped]);
};

// Deletes specific queue item and returns it, shifting positions of others behind it
export const deleteQueueItem = async ({ queeuItemId }) => {

};

// Remove front queue item and shift others up, if tracks are skipped due to votes, append usernames of requested skipped tracks to a list, return new front queue item and list of users whose requests were skipped
export const advanceQueue = async () => {

};

// Deletes all data in queue
export const deleteQueue = async () => {

};

// Retrieve data for the first item in the queue (now playing)
export const getNowPlayingItem = async () => {

};