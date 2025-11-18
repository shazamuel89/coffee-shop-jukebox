import { applyVote } from "../services/VoteService.js";
import validateRequestBody from "../utils/validateRequestBody.js";

export const submitVote = async (req, res) => {
    validateRequestBody(req.body, {
        queueItemId: { type: 'number', required: true },
        userId:      { type: 'number', required: true },
        isUpvote:    { type: 'boolean', required: true },
    });

    // All parameters present and types confirmed, so extract them
    const { queueItemId, userId, isUpvote } = req.body;

    // Pass to the service layer
    await applyVote({ queueItemId, userId, isUpvote });

    // Send confirmation response with result
    return res.status(200).json({ vote: updatedVote });
};