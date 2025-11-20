import { pool } from "../config/dbConn.js";

/**
 * Stores vote data in Votes table, checking if the user has already voted on that queue item, and if so, then simply updates the vote direction on the same vote item.
 *
 * @param {number} queueItemId - The ID of the queue item to fetch.
 * @param {number} userId - The ID of the user for whom the vote status is being checked.
 * @param {boolean} isUpvote
 * @return {string} - Returns a string stating whether the vote has been "inserted", "switched", or "unchanged".
 */
const storeVote = async (queueItemId, userId, isUpvote) => {
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
            END AS outcome;
    `;
    const parameters = [queueItemId, userId, isUpvote];
    try {
        const { rows } = await pool.query(query, parameters);
        return rows[0].outcome;
    } catch(err) {
        console.error("Error in VoteModel.storeVote:", err);
        throw err;
    }
}

/**
 * Retrieves all votes for queue items from a user from Votes.
 *
 * @param {number} userId 
 * @param {array} queueItemIds - The items in queue.
 * @return {Promise<Array>} - Returns all votes from a user.
 */
const fetchUserVotesForQueueItems = async (userId, queueItemIds) => {
    const query = `
        SELECT
            queue_item_id,
            is_upvote
        FROM
            Votes
        WHERE
            user_id = $1
            AND
            queue_item_id = ANY($2)
    `;
    const parameters = [userId, queueItemIds];
    try {
        const { rows } = await pool.query(query, parameters);
        return rows;
    } catch(err) {
        console.error("Error in VoteModel.fetchUserVotesForQueueItems:", err);
        throw err;
    }
}

/**
 * Delete all entries in Votes table.
 *
 * @return {Promise<Array>}
 */
const deleteAllVotes = async () => {
    const query = `
        DELETE
        FROM
            Votes
    `;
    try {
        const { rows } = await pool.query(query);
        return rows;
    } catch(err) {
        console.error("Error in VoteModel.deleteAllVotes:", err);
        throw err;
    }
}

export {
    storeVote,
    fetchUserVotesForQueueItems,
    deleteAllVotes,
};
