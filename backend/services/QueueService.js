// backend/services/QueueService.js
import * as QueueModel from "../models/QueueModel.js";
import * as VoteService from "./VoteService.js";

/**
 * Retrieves the full queue, optionally annotated with the user's votes.
 *
 * @param {number|null} userId - The ID of the user requesting the queue (null if admin or anonymous)
 * @returns {Promise<Array>} - The queue with optional user vote data merged in
 */
export const getQueue = async (userId = null) => {
  try {
    // Retrieve all queue data from the QueueModel
    const queueItems = await QueueModel.getAllQueueItems();

    // If there are no items, short-circuit early
    if (!queueItems || queueItems.length === 0) {
      return [];
    }

    // Extract queue item IDs for vote lookups
    const queueItemIds = queueItems.map((item) => item.id);

    // If userId is provided, get that user’s votes
    let userVotes = [];
    if (userId) {
      userVotes = await VoteService.getUserVotesForQueueItems(userId, queueItemIds);
      // userVotes should look like: [ { queueItemId: 5, isUpvote: true }, { queueItemId: 8, isUpvote: false }, ... ]
    }

    // Merge user votes into the queue data
    const queueWithVotes = queueItems.map((item) => {
      // Find this user's vote for the current queue item (if any)
      const userVote = userVotes.find((v) => v.queueItemId === item.id);

      return {
        ...item,
        isUpvote: userVote ? userVote.isUpvote : "none",
      };
    });

    // Return the final merged queue data
    return queueWithVotes;
  } catch (err) {
    console.error("Error in QueueService.getQueue:", err);
    throw err;
  }
};