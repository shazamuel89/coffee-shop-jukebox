// backend/controllers/RequestController.js

import * as RequestService from '../services/RequestService.js';
import validateRequestBody from '../utils/validateRequestBody.js';


/**
 * Handles a customer’s track request submission.
 *
 * Validates the incoming request body, then forwards the request
 * to the RequestService for rule evaluation, cooldown checks,
 * queue duplication checks, and potential queue insertion.
 *
 * Responds with:
 * - 201 Created if the track was successfully added to the queue
 * - 200 OK if the request was valid but denied by business rules
 *
 * Any validation or internal errors are thrown and handled by
 * the global error middleware.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const requestTrack = async (req, res) => {
    validateRequestBody(req.body, {
        spotifyTrackId:     { type: 'string', required: true },
        requestedByUserId:  { type: 'number', required: true },
    });

    // All parameters present and types confirmed, so extract them
    const { spotifyTrackId, requestedByUserId } = req.body;

    // Pass to the service layer
    await RequestService.processTrackRequest({ spotifyTrackId, requestedByUserId });

    // Send confirmation response with status code depending on whether request was accepted
    if (result.added) {
        return res.status(201).send();
    } else {
        return res.status(200).send();
    }
};