import { pool } from "../config/dbConn.js";
import camelcaseKeys from "camelcase-keys";


/**
 * Checks if a track already exists in the queue.
 * 
 * @async
 * @function checkForTrack
 * @param {object} params - Parameters object
 * @param {string} params.spotifyTrackId - Spotify track ID to look for
 * @returns {Promise<boolean>} True if the track is already in the queue, otherwise false
 * 
 * @description
 * Executes a lightweight existence query against the Queue table
 * and returns whether any row matches the given Spotify track ID.
 */
export const checkForTrack = async ({ spotifyTrackId }) => {
  const query = `
    SELECT 1
    FROM Queue
    WHERE spotify_track_id = $1
    LIMIT 1;
  `;

  const { rows } = await pool.query(query, [spotifyTrackId]);
  return rows.length > 0;
};

/**
 * Inserts a new track into the queue at the next available position.
 *
 * This function:
 * - Starts a database transaction.
 * - Locks the Queue table and reads the highest current position.
 * - Calculates the next position safely under concurrency.
 * - Inserts the new queue item with spotifyTrackId, requestedBy, and isRequest.
 * - Commits the transaction and returns the newly created row.
 *
 * Transactions are used to guarantee ordering correctness when multiple
 * inserts happen at the same time. If anything fails, the transaction is
 * rolled back and the error is rethrown.
 *
 * @param {Object} params
 * @param {string} params.spotifyTrackId - Spotify track ID being queued.
 * @param {number|null} [params.requestedBy=null] - User ID if this was user-requested; null for system/default additions.
 * @param {boolean} params.isRequest - Whether this track is a user request.
 * @returns {Promise<Object>} The inserted queue row.
 */
export const appendQueueItem = async ({ spotifyTrackId, requestedBy = null, isRequest }) => {
  const client = await pool.connect();
  
  // Must have try/catch/finally to ensure transactions are closed and potentially rolled back properly
  try {
    await client.query('BEGIN');

    // Lock the table so nobody else can change positions while we read MAX()
    const { rows: maxRows } = await client.query(`
      SELECT
        COALESCE(MAX(position), 0) AS maxPosition
      FROM
        Queue
      FOR UPDATE;
    `);

    const nextPosition = maxRows[0].maxPosition + 1;

    const insertQuery = `
      INSERT INTO
        Queue (spotify_track_id, requested_by, is_request, position)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const parameters = [spotifyTrackId, requestedBy, isRequest, nextPosition];
    const { rows } = await client.query(insertQuery, parameters);
    await client.query('COMMIT');
    const row = rows[0];
    return row ? camelcaseKeys(row) : null;
  } catch(err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Retrieves a single queue item (with joined track metadata) by its ID.
 *
 * @param {number} queueItemId - The ID of the queue item to fetch.
 * @returns {Promise<Object|null>} - Returns the queue item object, or null if not found.
 */
export const fetchQueueItem = async ({ queueItemId }) => {
  const query = `
    SELECT
      q.*, t.*
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
  const row = rows[0];
  return row ? camelcaseKeys(row) : null;
};

/**
 * Retrieves the full queue with merged metadata from the Tracks table.
 *
 * This function:
 * - Performs a joined SELECT between Queue and Tracks using spotify_track_id.
 * - Returns each queue item along with full track metadata (title, artists, genres, etc.).
 * - Uses explicit column aliases to ensure camel-cased response keys.
 * - Orders the results so:
 *   - The "now playing" track appears first.
 *   - Remaining items are sorted by position, then by time added.
 *
 * No transaction is required since this function is read-only. If the queue is
 * empty, an empty array is returned.
 *
 * @returns {Promise<Array<Object>>} A list of queue items with full track metadata.
 */
export const fetchQueue = async () => {
  const query = `
    SELECT
      q.id,
      q.spotify_track_id AS "spotifyTrackId",
      q.requested_by AS "requestedBy",
      q.is_now_playing AS "isNowPlaying",
      q.is_request AS "isRequest",
      q.position,
      q.upvotes,
      q.downvotes,
      q.will_be_skipped AS "willBeSkipped",
      q.added_at AS "addedAt",

      t.title,
      t.artists::json AS "artists",
      t.release_name AS "releaseName",
      t.release_id AS "releaseId",
      t.cover_art_url AS "coverArtUrl",
      t.genres::json AS "genres",
      t.is_explicit AS "isExplicit",
      t.duration_ms AS "durationMs",
      t.last_fetched AS "lastFetched"
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
  // Don't need to use camelcaseKeys since aliases had to be provided to allow conversion to json
  return rows;
};

/**
 * Updates the upvote/downvote counts and skip status for a queue item.
 *
 * @param {Object} params
 * @param {number} params.queueItemId - The queue item ID.
 * @param {number} params.upvoteCount - New upvote count.
 * @param {number} params.downvoteCount - New downvote count.
 * @param {boolean} params.willBeSkipped - Whether the item should be skipped.
 * @returns {Promise<Object|null>} The updated queue item or null if not found.
 */
export const updateVoteCountAndSkip = async ({ queueItemId, upvoteCount, downvoteCount, willBeSkipped }) => {
  const query = `
    UPDATE Queue
    SET
      upvotes = $2,
      downvotes = $3,
      will_be_skipped = $4
    WHERE
      id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [queueItemId, upvoteCount, downvoteCount, willBeSkipped]);
  const row = rows[0];
  return row ? camelcaseKeys(row) : null;
};

/**
 * Deletes a queue item and shifts the positions of all items behind it.
 *
 * This function:
 * - Starts a transaction.
 * - Fetches the queue item's position.
 * - Deletes the item and returns the deleted row.
 * - Decrements the position of all items with a greater position.
 * - Commits the transaction.
 *
 * If the item does not exist, returns null and performs no updates.
 *
 * @param {Object} params
 * @param {number} params.queueItemId - The ID of the queue item to delete.
 * @returns {Promise<Object|null>} The deleted queue item with camelCased keys, or null if not found.
 */
export const deleteQueueItem = async ({ queueItemId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Fetch the item's position (needed to shift others)
    const positionResult = await client.query(`
      SELECT
        position
      FROM
        Queue
      WHERE
        id = $1
      FOR UPDATE;`,
      [queueItemId]
    );

    if (positionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const { position } = positionResult.rows[0];

    // Delete the item
    const deleteResult = await client.query(`
      DELETE FROM
        Queue
      WHERE
        id = $1
      RETURNING
        *;`,
      [queueItemId]
    );

    const deletedRow = deleteResult.rows[0];

    // Shift positions of remaining items
    await client.query(`
      UPDATE
        Queue
      SET
        position = position - 1
      WHERE
        position > $1;`,
      [position]
    );

    await client.query('COMMIT');

    return camelcaseKeys(deletedRow);
  } catch(err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Advances the queue by removing the current "now playing" item and
 * promoting the next eligible item to now playing.
 * 
 * This function:
 * - Deletes the item marked is_now_playing = true.
 * - Repeatedly removes items at the front of the queue that have
 *   will_be_skipped = true, collecting the requested_by user IDs of any
 *   skipped requested tracks.
 * - Shifts positions upward after each deletion to maintain a compact queue.
 * - Marks the next available item as is_now_playing = true.
 * - Runs inside a database transaction to guarantee queue consistency under concurrency.
 * 
 * @returns {Promise<{ nowPlayingItem: Object|null, skippedUserIds: number[] }>}
 * An object containing the newly promoted now-playing queue item, or null
 * if the queue is empty, and a list of user IDs whose requests were skipped.
 */
export const advanceQueue = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const skippedUserIds = [];

    // Remove current now playing item
    const deleteNowPlayingQuery = `
      DELETE FROM
        Queue
      WHERE
        is_now_playing = TRUE
      RETURNING
        id, requested_by AS "requestedBy", position
    `;
    const { rows: deletedRows } = await client.query(deleteNowPlayingQuery);

    const nowPlayingExisted = deletedRows.length > 0;

    const shiftPositionsQuery = `
      UPDATE
        Queue
      SET
        position = position - 1
      WHERE
        position > 1
    `;

    // Shift positions only if something was removed
    if (nowPlayingExisted) {
      await client.query(shiftPositionsQuery);
    }

    // Repeatedly remove items with will_be_skipped = true
    while (true) {
      const frontQuery = `
        SELECT
          *
        FROM
          Queue
        ORDER BY
          position ASC
        LIMIT 1
      `;
      const { rows: frontRows } = await client.query(frontQuery);
      const front = frontRows[0];

      if (!front || !front.will_be_skipped) break;

      // Record skipped user ID if this was a user request
      if (front.is_request) {
        skippedUserIds.push(front.requested_by);
      }

      // Delete skipped track
      const deleteSkippedQuery = `
        DELETE FROM
          Queue
        WHERE
          id = $1
      `;
      await client.query(deleteSkippedQuery, [front.id]);

      // Shift remaining positions
      await client.query(shiftPositionsQuery);
    }

    // Mark the next item as now playing
    const promoteQuery = `
      UPDATE
        Queue
      SET
        is_now_playing = TRUE
      WHERE
        position = 1
      RETURNING
        *
    `;

    const { rows: promotedRows } = await client.query(promoteQuery);
    const nowPlayingItem = promotedRows[0] || null;

    await client.query('COMMIT');

    return {
      nowPlayingItem: nowPlayingItem ? camelcaseKeys(nowPlayingItem) : null,
      skippedUserIds
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Clears all queue items from the Queue table.
 *
 * This function is used for full daily resets, wiping all entries so the queue starts empty.
 *
 * @returns {Promise<void>} Resolves when the queue has been cleared.
 */
export const deleteQueue = async () => {
  await pool.query(`DELETE FROM Queue;`);
};

/**
 * Retrieves the queue item that is currently marked as "now playing".
 * 
 * This function:
 * - Selects the queue row where is_now_playing is true.
 * - Returns the row in camelCased form for consistency with the API layer.
 * - Returns null if no track is currently marked as now playing.
 * 
 * This query assumes that at most one queue item can be marked as
 * is_now_playing = true at any time, as enforced by the queue update logic.
 * 
 * @returns {Promise<Object|null>} The now-playing queue item, or null if none exists.
 */
export const getNowPlayingItem = async () => {
  const query = `
    SELECT
      *
    FROM
      Queue
    WHERE
      is_now_playing = TRUE
    LIMIT
      1
  `;

  const { rows } = await pool.query(query);
  const row = rows[0];
  return row ? camelcaseKeys(row) : null;
};
