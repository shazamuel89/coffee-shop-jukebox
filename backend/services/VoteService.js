import { storeVote, fetchUserVotesForQueueItems } from "../models/VoteModel.js";
import { fetchQueueItem, updateVoteCountAndSkip } from "../models/QueueModel.js";
import { NotFoundError } from "../errors/AppError.js";
//import { getRules } from "../models/RuleModel.js";
//import { broadcastVoteChange } from "../services/RealtimeService.js";


export const applyVote = async ({ queueItemId, userId, isUpvote }) => {
    // Fetch the relevant queue item to update vote data
    const queueItem = await fetchQueueItem(queueItemId);
    if (queueItem == null) {
        throw new NotFoundError("Queue item not found.");
    }

    // Extract the votes for the queue item and add the current vote
    let { upvotes, downvotes } = queueItem;

    // Record the vote in Votes table
    const storeVoteResult = await storeVote(queueItemId, userId, isUpvote);

    // Check if user had already voted on the queue item and if their vote changed, recalculate votes accordingly
    if (storeVoteResult.outcome === "inserted") {
        isUpvote ? upvotes++ : downvotes++;
    } else if (storeVoteResult.outcome === "switched") {
        if (isUpvote) {
            upvotes++;
            downvotes--;
        } else {
            upvotes--;
            downvotes++;
        }
    } // else storeVoteOperation.operation === "unchanged"

    // Request the rule for votes from RuleModel
    const { voteThreshold, minimumVotes } = { voteThreshold: { value: 0.6 }, minimumVotes: { value: 5 } };//await getRules(["voteThreshold", "minimumVotes"]);
    if (voteThreshold == null) {
        throw new NotFoundError("voteThreshold not found.");
    }
    if (minimumVotes == null) {
        throw new NotFoundError("minimumVotes not found.");
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

export const getUserVotesForQueueItems = async (userId, queueItemIds) => {
    // Fetch votes from user on current queue items
    const rows = await fetchUserVotesForQueueItems(userId, queueItemIds);

    // Create dictionary with queue item id as the key and vote type as the value
    return (rows || []).map(row => ({
        queueItemId: row.queueItemId,
        isUpvote: row.isUpvote,
    }));
}

const determineSkipStatus = (upvotes, downvotes, voteThreshold, minimumVotes) => {
    const totalVotes = upvotes + downvotes;
    if (totalVotes < minimumVotes) {        // If there are not enough votes
        return false;                       // Then item should not be skipped yet
    }
    const ratio = downvotes / totalVotes;   // Get percentage of downvotes in totalVotes
    return (ratio >= voteThreshold);        // Skip if percentage of downvotes is at or above threshold
};