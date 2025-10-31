import { storeVote, fetchUserVotesForQueueItems } from "../models/VoteModel.js";
import { getQueueItem, updateVoteCountAndSkip } from "../models/QueueModel.js";
//import { getRules } from "../models/RuleModel.js";
//import { broadcastVoteChange } from "../services/RealtimeService.js";

// Simple DRY helper function to standardize errors
const errorResponse = (errorMessage) => ({
    success: false,
    error: errorMessage,
});

const applyVote = async ({ queueItemId, userId, isUpvote }) => {
    // Fetch the relevant queue item to update vote data
    const queueItem = await getQueueItem(queueItemId);
    if (queueItem == null) {
        return errorResponse("Queue item not found.");
    }

    // Extract the votes for the queue item and add the current vote
    let { upvotes, downvotes } = queueItem;

    // Record the vote in Votes table
    const storeVoteOperation = await storeVote(queueItemId, userId, isUpvote);

    // Check if user had already voted on the queue item and if their vote changed, recalculate votes accordingly
    if (storeVoteOperation === "inserted") {
        isUpvote ? upvotes++ : downvotes++;
    } else if (storeVoteOperation === "switched") {
        if (isUpvote) {
            upvotes++;
            downvotes--;
        } else {
            upvotes--;
            downvotes++;
        }
    } // else storeVoteOperation === "unchanged"

    // Request the rule for votes from RuleModel
    const { voteThreshold, minimumVotes } = { voteThreshold: { value: 0.6 }, minimumVotes: { value: 5 } };//await getRules(["voteThreshold", "minimumVotes"]);
    if (voteThreshold == null) {
        return errorResponse("voteThreshold not found.");
    }
    if (minimumVotes == null) {
        return errorResponse("minimumVotes not found.");
    }

    // Evaluate skip condition
    const willBeSkipped = determineSkipStatus(upvotes, downvotes, voteThreshold.value, minimumVotes.value);

    // Store updated queue item
    await updateVoteCountAndSkip(queueItemId, upvotes, downvotes, willBeSkipped);

    // Broadcast vote changes to clients
    /*
    broadcastVoteChange({
        queueItemId,
        upvotes,
        downvotes,
        willBeSkipped,
    });
    */

    return { success: true };
};

const getUserVotesForQueueItems = async (userId, queueItemIds) => {
    // Fetch votes from user on current queue items
    const rows = await fetchUserVotesForQueueItems(userId, queueItemIds);

    // Create dictionary with queue item id as the key and vote type as the value
    const result = {};
    for (const row of rows) {
        result[row.queue_item_id] = row.is_upvote;
    }
    // Return dictionary of vote types per queue item, any non-voted queue items will be None
    return result;
}

const determineSkipStatus = (upvotes, downvotes, voteThreshold, minimumVotes) => {
    const totalVotes = upvotes + downvotes;
    if (totalVotes < minimumVotes) {        // If there are not enough votes
        return false;                       // Then item should not be skipped yet
    }
    const ratio = downvotes / totalVotes;   // Get percentage of downvotes in totalVotes
    return (ratio >= voteThreshold);        // Skip if percentage of downvotes is at or above threshold
};

export {
    applyVote,
    getUserVotesForQueueItems,
};