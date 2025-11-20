// backend/models/VoteModel.js

import { pool } from "../config/dbConn.js";
import camelcaseKeys from "camelcase-keys";


// Store vote data in Votes table, checking if the user has already voted on that queue item, and if so, then simply update the vote direction on the same vote item
// Return the updated row and a string stating whether the vote has been "inserted", "switched", or "unchanged"
export const storeVote = async (queueItemId, userId, isUpvote) => {
    const query = `
        INSERT INTO
            Votes
            (queue_item_id, user_id, is_upvote)
        VALUES
            ($1, $2, $3)
        ON CONFLICT
            (user_id, queue_item_id)
        DO UPDATE SET
            is_upvote = EXCLUDED.is_upvote,
            timestamp = NOW()
        WHERE
            Votes.is_upvote <> EXCLUDED.is_upvote
        RETURNING
            CASE
                WHEN
                    xmax = 0
                THEN
                    'inserted'
                WHEN
                    Votes.is_upvote <> EXCLUDED.is_upvote
                THEN
                    'switched'
                ELSE
                    'unchanged'
            END AS outcome,
            *;
    `;

    const parameters = [queueItemId, userId, isUpvote];
    const { rows } = await pool.query(query, parameters);
    const row = rows[0];
    return row ? camelcaseKeys(row) : null;
};

// Retrieve all votes from user for the queue items from Votes table
export const fetchUserVotesForQueueItems = async (userId, queueItemIds) => {
    const query = `
        SELECT
            queue_item_id,
            is_upvote
        FROM
            Votes
        WHERE
            user_id = $1
            AND
            queue_item_id = ANY($2);
    `;

    const parameters = [userId, queueItemIds];
    const { rows } = await pool.query(query, parameters);
    return rows ? camelcaseKeys(rows) : null;
};

// Delete all entries in Votes table
export const deleteAllVotes = async () => {
    await pool.query(`DELETE FROM Votes`);
};
