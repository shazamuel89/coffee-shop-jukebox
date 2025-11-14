import { applyVote } from "../services/VoteService.js";
import validateRequiredParameters from "../utils/validateRequiredParameters.js";
import validateParameterTypes from "../utils/validateParameterTypes.js";

export const submitVote = async (req, res) => {
    try {
        const requiredParameters = ['queueItemId', 'userId', 'isUpvote'];
        const expectedTypes = {
            queueItemId: 'number',
            userId:      'number',
            isUpvote:    'boolean',
        };

        // Verify that all required parameters are present
        const missingError = validateRequiredParameters(req.body, requiredParameters);
        if (missingError) {
            // If missing parameters, return the formatted error message
            return res.status(400).json({ error: missingError });
        }

        // Validate parameter data types
        const typeError = validateParameterTypes(req.body, expectedTypes);
        if (typeError) {
            // If parameter types don't match expected types, return the formatted error message
            return res.status(400).json({ error: typeError });
        }

        // All parameters present and types confirmed, so extract them
        const { queueItemId, userId, isUpvote } = req.body;

        // Pass to the service layer
        const updatedVote = await applyVote({ queueItemId, userId, isUpvote });
        
        // Check if operation returned a failure for the success object
        if (!updatedVote.success) {
            return res.status(404).json({ error: updatedVote.error });
        }

        // Send confirmation response with result
        res.status(200).json({ vote: updatedVote });
    } catch (err) {
        console.error("Error in VoteController.submitVote: ", err);
        return res.status(500).json({ error: "Server error submitting vote." });
    }
};