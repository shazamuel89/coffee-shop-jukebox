import VoteModel from "../models/VoteModel.js";
import QueueModel from "../models/QueueModel.js";
import RuleModel from "../models/RuleModel.js";
import RealtimeService from "../services/RealtimeService.js";

// Simple DRY helper function to standardize errors
const errorResponse = (errorMessage) => ({
    success: false,
    error,
});

const applyVote = async ({ queueItemId, userId, isUpvote }) => {
    // Record the vote in Votes table and verify success
    const storeVoteResult = await VoteModel.storeVote(queueItemId, userId, isUpvote);
    if (!storeVoteResult?.success) {
        return errorResponse("Failed to store vote in Votes table.");
    }
    
    // Fetch the relevant queue item to update vote data
    const queueItem = await QueueModel.getItem(queueItemId);
    if (queueItem == null) {
        return errorResponse("Queue item not found.");
    }

    // Extract the votes for the queue item and add the current vote
    let { upvotes, downvotes } = queueItem;
    isUpvote? upvotes++ : downvotes++;

    // Request the rule for votes from RuleModel
    const { voteThreshold, minimumVotes } = await RuleModel.getRules(["voteThreshold", "minimumVotes"]);
    if (voteThreshold == null) {
        return errorResponse("voteThreshold not found.");
    }
    if (minimumVotes == null) {
        return errorResponse("minimumVotes not found.");
    }

    // Evaluate skip condition
    const willBeSkipped = determineSkipStatus(upvotes, downvotes, voteThreshold, minimumVotes);

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

const determineSkipStatus = (upvotes, downvotes, voteThreshold, minimumVotes) => {
    const totalVotes = upvotes + downvotes;
    if (totalVotes < minimumVotes) {        // If there are not enough votes
        return false;                       // Then item should not be skipped yet
    }
    const ratio = downvotes / totalVotes;   // Get percentage of downvotes in totalVotes
    return (ratio >= voteThreshold);        // Skip if percentage of downvotes is at or above threshold
};

export default { applyVote };