// backend/controllers/RequestController.js

import * as RequestService from '../services/RequestService.js';
import validateRequestBody from '../utils/validateRequestBody.js';


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