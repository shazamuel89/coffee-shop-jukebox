import VoteModel from "../models/VoteModel.js";
import QueueModel from "../models/QueueModel.js";
import RuleModel from "../models/RuleModel.js";
import RealtimeService from "../services/RealtimeService.js";

// Simple DRY helper function to standardize errors
const errorResponse = (errorMessage) => ({
    success: false,
    error: errorMessage,
});

const applyVote = async ({ queueItemId, userId, isUpvote }) => {
    // Record the vote in Votes table and verify success
    const storeVoteResult = await VoteModel.storeVote(queueItemId, userId, isUpvote);
    if (!storeVoteResult?.success) {
        return errorResponse("Failed to store vote in Votes table.");
    } // Will use storeVoteResult later below

    // Fetch the relevant queue item to update vote data
    const queueItem = await QueueModel.getItem(queueItemId);
    if (queueItem == null) {
        return errorResponse("Queue item not found.");
    }

    // Extract the votes for the queue item and add the current vote
    let { upvotes, downvotes } = queueItem;

    // Check if user had already voted on the queue item and if their vote changed, recalculate votes accordingly
    if (storeVoteResult.change === "inserted") {
        isUpvote ? upvotes++ : downvotes++;
    } else if (storeVoteResult.change === "switched") {
        if (isUpvote) {
            upvotes++;
            downvotes--;
        } else {
            upvotes--;
            downvotes++;
        }
    } // else storeVoteResult.change === "unchanged"

    // Request the rule for votes from RuleModel
    const { voteThreshold, minimumVotes } = await RuleModel.getRules(["voteThreshold", "minimumVotes"]);
    if (voteThreshold == null) {
        return errorResponse("voteThreshold not found.");
    }
    if (minimumVotes == null) {
        return errorResponse("minimumVotes not found.");
    }

    // Evaluate skip condition
    const willBeSkipped = determineSkipStatus(upvotes, downvotes, voteThreshold.value, minimumVotes.value);

    // Store updated queue item and confirm success
    const updateVoteCountAndSkipResult = await QueueModel.updateVoteCountAndSkip(queueItemId, upvotes, downvotes, willBeSkipped);
    if (!updateVoteCountAndSkipResult?.success) {
        return errorResponse("Vote count and skip status failed to update in the queue.");
    }

    // Broadcast vote changes to clients
    RealtimeService.broadcastVoteChange({
        queueItemId,
        upvotes,
        downvotes,
        willBeSkipped,
    });
    
    // Return success for completion of applyVote()
    return { success: true };
};

const getUserVotesForQueueItems = async (userId, queueItemIds) => {
    // Fetch votes from user on current queue items
    const rows = await VoteModel.getVotesForUserAndQueueItems(userId, queueItemIds);

    // Create dictionary with queue id as the key and vote type as the value
    const result = {};
    for (const row of rows) {
        result[row.queueId] = row.isUpvote;
    }

    // Send dictionary of vote types per queue item back to QueueService, any non-voted queue items will be None
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

export default {
    applyVote,
    getUserVotesForQueueItems,
};