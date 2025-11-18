// backend/services/QueueService.js
import * as QueueModel from "../models/QueueModel.js";
import * as VoteService from "./VoteService.js";
import * as RealtimeService from "./RealtimeService.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../errors/AppError.js";


// Tell QueueModel to store new queue item into queue, tell RealtimeService to update client devices
export const storeSuccessfulRequest = async ({ request }) => {

};

// Tell QueueModel to update a queue item's vote counts and skip flag, and send updates to RealtimeService
export const storeUpdatedVotes = async ({ upvoteCount, downvoteCount, willBeSkipped }) => {

};

/**
 * Retrieves all queue items, optionally annotated with the requesting user's vote data.
 *
 * @async
 * @function getQueue
 * @param {object} params - Parameters object
 * @param {number|null} params.userId - ID of the requesting user (required unless admin)
 * @param {string} params.role - Role of the requester ('admin' or 'customer')
 * @returns {Promise<Array>} Array of queue items, each including an `isUpvote` field
 *
 * @description
 * - Fetches all queue items from QueueModel.
 * - If requester is not admin, retrieves their votes for those items.
 * - Merges user vote data so each item includes `true`, `false`, or `"none"`.
 * - Throws if a non-admin request is missing a userId.
 */
export const getQueue = async ({ userId, role }) => {
  const isAdmin = (role === 'admin');

  // Retrieve all queue data from the QueueModel
  const queueItems = await QueueModel.getAllQueueItems();

  // If there are no items, short-circuit early
  if (!queueItems?.length) {
    return [];
  }

  // Extract queue item IDs for vote lookups
  const queueItemIds = queueItems.map((queueItem) => queueItem.id);

  let voteMap = new Map();

  // If role is not admin, get the user’s votes
  if (!isAdmin) {
    if (!userId) {
      throw new BadRequestError("userId required for non-admin GET queue request.");
    }

    const userVotes = await VoteService.getUserVotesForQueueItems(userId, queueItemIds);
    // userVotes should look like: [ { queueItemId: 5, isUpvote: true }, { queueItemId: 8, isUpvote: false }, ... ]
    // userVotes only contains queueItems that the user has voted on

    // Convert userVotes to map for O(1) time lookups
    voteMap = new Map(
      userVotes.map(userVote => [userVote.queueItemId, userVote.isUpvote])
    );
  }

  // Merge user votes into the queue data
  const queueWithVotes = queueItems.map(queueItem => ({
    ...queueItem,
    isUpvote: voteMap.get(queueItem.id) ?? "none",
  }));

  // Return the final merged queue data
  return queueWithVotes;
};

/**
 * Removes a queue item, shifts remaining items, and sends realtime + notification updates.
 *
 * @async
 * @function removeQueueItem
 * @param {object} params - Parameters object
 * @param {number} params.queueItemId - ID of the queue item to remove
 * @returns {Promise<object>} The deleted queue item returned from the model
 *
 * @description
 * - Delegates to QueueModel to delete the queue item and shift positions.
 * - Emits a `queueChanged` event through RealtimeService for all clients.
 * - If the removed item was a customer request, notifies that user.
 * - Operations after deletion run concurrently via Promise.all.
 * - Throws if the target queue item does not exist.
 */
export const removeQueueItem = async ({ queueItemId }) => {
  // Send request for removal of queue item and shifting of positions to QueueModel, receiving the deleted queue item
  const deletedQueueItem = await QueueModel.deleteQueueItem({ queueItemId });

  if (!deletedQueueItem) {
    throw new NotFoundError(`Queue item ${queueItemId} not found.`);
  }

  // Send change of queue to RealtimeService
  const emitPromise = RealtimeService.emit({
    eventName: "queueChanged",
    payload: {
      type: "itemRemoved",
      queueItemId,
    }
  });
    
  // Send id of the user who requested the removed queue item to NotificationService
  const notifyPromise = deletedQueueItem.isRequest
    ? NotificationService.notifyUser({
        userId: deletedQueueItem.requestedBy,
        type: "queueItemRemoved",
        queueItemId,
      })
    : Promise.resolve();

  // Execute both realtime update and notification concurrently
  await Promise.all([emitPromise, notifyPromise]);
    
  return deletedQueueItem;
};

// Tell QueueModel to advance queue, either handle default playlist needing to play or continue, or send request beginning to play to HistoryModel and send next track to play to SpotifyPlaybackAdapter, send queue update to RealtimeService, and tell NotificationService to notify users if their request was skipped due to votes
export const advanceQueue = async () => {

};

// Send an update to RealtimeService with playback duration
export const sendPauseUpdate = async () => {

};

// Send an update to RealtimeService with playback duration
export const sendPlayUpdate = async () => {

};

/**
 * Handles an admin skip action on the currently playing queue item.
 *
 * @async
 * @function sendSkipUpdate
 * @param {object} params - Parameters object
 * @param {number} params.queueItemId - ID of the queue item the admin intends to skip
 * @param {number|null} params.requestedByUserId - ID of the user who originally requested the track (null if not a request)
 * @returns {Promise<void>} Resolves when the queue is advanced and notifications have been sent
 *
 * @description
 * - Verifies that the provided queueItemId matches the actual now-playing item.
 * - Throws if no track is currently playing or if the IDs do not match.
 * - Delegates to `advanceQueue()` to trigger queue advancement, new playback, and realtime updates.
 * - If the skipped item was a user request, sends a notification to that user.
 * - All post-advance operations run sequentially for clarity and error traceability.
 */
export const sendSkipUpdate = async ({ queueItemId, requestedByUserId }) => {
  // Validate that the provided queueItemId matches the currently playing track
  const nowPlayingItem = await QueueModel.getNowPlayingItem();
  if (!nowPlayingItem) {
    throw new ConflictError("No track is currently playing.");
  }
  if (nowPlayingItem.id !== queueItemId) {
    throw new ConflictError(`Skip mismatch: attempted to skip ${queueItemId}, but now playing is ${nowPlayingItem.id}`);
  }

  // Advance the queue
  await advanceQueue();

  // If skipped track was a request, notify user whose request was skipped by admin
  if (requestedByUserId) {
    const message = buildSkippedRequestMessage(queueItemId);
    await NotificationService.notifyUser({
      userId: requestedByUserId,
      message,
    });
  }
};

// Send request through RealtimeService to play default playlist
export const playDefaultPlaylist = async () => {

};

// Tell QueueModel to empty the queue, tell VoteModel to empty the queue, request top tracks from HistoryModel, send list of tracks to SpotifyAPIAdapter to create default playlist and retrieve playlist URI, run QueueService.playDefaultPlaylist(), send first track to play to RealtimeService
export const startDay = async () => {

};
