import { applyVote } from "../services/VoteService.js";
import validateRequestBodyOrQuery from "../utils/validateRequestBodyOrQuery.js";

export const submitVote = async (req, res) => {
    validateRequestBodyOrQuery({
        data: req.body,
        schema: {
            queueItemId: { type: 'number', required: true },
            userId:      { type: 'number', required: true },
            isUpvote:    { type: 'boolean', required: true },
        }
    });

    // All parameters present and types confirmed, so extract them
    const { queueItemId, userId, isUpvote } = req.body;

    // Pass to the service layer
    await applyVote({ queueItemId, userId, isUpvote });

    // Send confirmation response with result
    return res.status(200).json({ vote: updatedVote });
};