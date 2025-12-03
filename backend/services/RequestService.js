// backend/services/QueueService.js

import * as SpotifyAPIAdapter from '../adapters/SpotifyAPIAdapter.js';
import * as RuleModel from '../models/RuleModel.js';
import * as UserModel from '../models/UserModel.js';
import * as TrackService from '../services/TrackService.js';


// Main function that handles requests and calls helper functions, returns bool for if request was accepted
export const processTrackRequest = async ({ spotifyTrackId, requestedByUserId }) => {
    // Get track's full metadata
    const trackMetadata = SpotifyAPIAdapter.fetchTrackMetadata({ spotifyTrackId });

    // Get all current rules
    const rules = RuleModel.fetchRules();

    // Check if track meets the rules
    const ruleCheck = evaluateTrackAgainstRules({ trackMetadata, rules });

    // If a rule was broken, then send a notification
    if (!ruleCheck.passed) {
        await notifyUser({
            type: 'ruleFailure',
            details: ruleCheck.ruleBroken.description,
            userId: requestedByUserId,
        });
        return { added: false };
    }

    // Get time of last request from requesting user
    const userLastRequestTimestamp = UserModel.fetchLastRequestTime({ userId });

    // Check if the user has waited long enough to request again
    const cooldownCheck = checkUserRequestCooldown({ userLastRequestTimestamp, rules });

    // If user has not waited long enough to request, then send a notification
    if (!cooldownCheck.allowed) {
        await notifyUser({
            type: 'cooldownFailure',
            details: cooldownCheck.waitTimeInMs,
            userId: requestedByUserId,
        });
        return { added: false };
    }

    // Check if track being requested is already in the queue
    const inQueueCheck = QueueModel.checkForTrack({ spotifyTrackId });

    // If track is already in queue, then send a notification
    if (inQueueCheck) {
        await notifyUser({
            type: 'inQueueFailure',
            userId: requestedByUserId,
        });
        return { added: false };
    }

    // Store the track's metadata for easier system access
    TrackService.storeTrack({ trackMetadata });

    // Send successfully requested track to queue
    QueueService.storeSuccessfulRequest({ spotifyTrackId, requestedByUserId });

    // Notify user of successful request
    await notifyUser({
        type: 'success',
        userId: requestedByUserId,
    });
    return { added: true };
};

// Checks the track against the rules and returns object with bool for passing and rule broken
const evaluateTrackAgainstRules = async ({ trackMetadata, rules }) => {

};

// Checks current time against last request timestamp and cooldown rule, returns object with bool for allowed and wait time in ms
const checkUserRequestCooldown = async ({ userLastRequestTimestamp, rules }) => {

};

// DRY helper function to create and send notification
const notifyUser = async ({ type, details, userId }) => {
    const message = createNotificationMessage({ type, details });
    await sendNotification({ notificationMessage: message, userId });
};

// Form a message communicating reason for request denial (or success) and any extra details
const createNotificationMessage = async ({ type, details }) => {
    // Need types: ruleFailure, cooldownFailure, inQueueFailure, success
    
};

// Sends notification to NotificationService
const sendNotification = async ({ notificationMessage, userId }) => {

};