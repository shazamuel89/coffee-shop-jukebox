// backend/services/QueueService.js

import * as QueueModel from "../models/QueueModel.js";
import * as VoteService from "./VoteService.js";
import * as RealtimeService from "./RealtimeService.js";
import * as TrackModel from "../models/TrackModel.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../errors/AppError.js";


/**
 * Stores a newly approved track request in the queue and broadcasts a realtime update.
 *
 * @async
 * @function storeSuccessfulRequest
 * @param {object} params
 * @param {string} params.spotifyTrackId - Spotify track ID being added to the queue
 * @param {number} params.requestedByUserId - ID of the user making the request
 * @returns {Promise<void>}
 *
 * @description
 * Performs the following steps:
 * 1. Appends a new queue item to the database using `QueueModel.appendQueueItem()`,
 *    which handles queue positioning and returns the inserted record.
 * 2. Retrieves full track metadata from `TrackModel.getTrack()` so the realtime payload
 *    does not require clients to make additional fetches.
 * 3. Combines the queue item and metadata into a single hydrated object.
 * 4. Emits a realtime `queueChanged` event through `RealtimeService` to notify all
 *    subscribed clients that a new item has been added.
 */
export const storeSuccessfulRequest = async ({ spotifyTrackId, requestedByUserId }) => {
  const newQueueItem = await QueueModel.appendQueueItem({
    spotifyTrackId,
    requestedBy: requestedByUserId,
    isRequest: true,
  });

  const trackMetadata = await TrackModel.getTrack({ spotifyTrackId });
  const queueItemWithMetadata = {
    ...newQueueItem,
    metadata: trackMetadata,
  };
  
  RealtimeService.emit({
    eventName: 'queueChanged',
    payload: {
      type: 'itemAdded',
      queueItem: queueItemWithMetadata,
    },
  });
};

/**
 * Updates a queue item's vote counts and skip flag, then broadcasts changes.
 *
 * @async
 * @function storeUpdatedVotes
 * @param {object} params
 * @param {number} params.queueItemId
 * @param {number} params.upvoteCount
 * @param {number} params.downvoteCount
 * @param {boolean} params.willBeSkipped
 *
 * @description
 * - Saves updated vote totals and skip status via QueueModel.
 * - Emits a `votesChanged` event so clients can update their UI.
 * - Payload includes the item ID, new vote counts, skip state, and update type.
 */
export const storeUpdatedVotes = async ({ queueItemId, upvoteCount, downvoteCount, willBeSkipped }) => {
  await QueueModel.updateVoteCountAndSkip({ queueItemId, upvoteCount, downvoteCount, willBeSkipped });

  RealtimeService.emit({
    eventName: 'votesChanged',
    payload: {
      type: 'itemUpdated',
      queueItemId,
      upvoteCount,
      downvoteCount,
      willBeSkipped,
    },
  });
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
  const queueItems = await QueueModel.fetchQueue();

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
  console.log("QUEUE WITH VOTES:", queueWithVotes)
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
  const queueAdvanced = await QueueModel.advanceQueue();
  // Putting this one off until later.
  // The whole process of a track ending needs reworking.
  // On no requests in the queue, I want the song to be selected by looking into the default playlist at the bookmarked offset and then 
  // separately requesting that song, not playing directly from the default playlist but individually.
  
};

/**
 * Emits a realtime update indicating that playback has been paused.
 *
 * @async
 * @function sendPauseUpdate
 * @param {object} params
 * @param {number} params.playbackDuration - Current playback position in milliseconds
 *
 * @description
 * Sends a `playbackChanged` event to all clients, marking playback as paused
 * and providing the current playback duration.
 */
export const sendPauseUpdate = async ({ playbackDuration }) => {
    RealtimeService.emit({
    eventName: 'playbackChanged',
    payload: {
      type: 'playbackPaused',
      playbackDuration,
    },
  });
};

/**
 * Emits a realtime update indicating that playback has resumed.
 *
 * @async
 * @function sendPlayUpdate
 * @param {object} params
 * @param {number} params.playbackDuration - Current playback position in milliseconds
 *
 * @description
 * Sends a `playbackChanged` event to all clients, marking playback as resumed
 * and providing the current playback duration.
 */
export const sendPlayUpdate = async ({ playbackDuration }) => {
  RealtimeService.emit({
    eventName: 'playbackChanged',
    payload: {
      type: 'playbackResumed',
      playbackDuration,
    },
  });
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

// Request top 100 requested tracks from HistoryModel and build default playlist on Spotify from them, saving the playlist URI in the db
export const buildDefaultPlaylist = async () => {

}

/**
 * Initializes the jukebox system for a new day.
 *
 * @async
 * @function startDay
 * @returns {Promise<void>} Resolves when the system has been reset, a new default playlist
 *                          has been created and stored, and playback has begun.
 *
 * @description
 * - Clears all existing queue entries and all vote records to ensure a clean system state.
 * - Builds a new default playlist by:
 *   - Retrieving the top-requested tracks from the History table.
 *   - Passing those tracks to Spotify via `SpotifyAPIAdapter` to create a playlist.
 *   - Persisting the resulting playlist URI (and initializing the bookmark index) in the database.
 * - All reset operations (queue deletion, vote deletion, playlist creation) run concurrently
 *   for efficiency, as none depend on each other.
 * - After the playlist is created, delegates to `playDefaultPlaylist()` to:
 *   - Fetch the most recently created default playlist entry.
 *   - Begin playback using Spotify’s SDK at the stored track index (starting at 0).
 * - This function represents the entry point for an admin's "Start Jukebox System" action.
 */
export const startDay = async () => {
  const deleteQueuePromise = QueueModel.deleteQueue();
  const deleteAllVotesPromise = VoteModel.deleteAllVotes();
  // buildDefaultPlaylist may need to return the spotify playlist URI
  const buildDefaultPlaylistPromise = buildDefaultPlaylist();

  // Concurrently run processes
  await Promise.all([deleteQueuePromise, deleteAllVotesPromise, buildDefaultPlaylistPromise]);

  await playDefaultPlaylist();
};
