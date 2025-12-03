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
            type:       'ruleFailure',
            details:    ruleCheck.ruleBroken.description,
            userId:     requestedByUserId,
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
            type:       'cooldownFailure',
            details:    cooldownCheck.waitTimeInMs,
            userId:     requestedByUserId,
        });
        return { added: false };
    }

    // Check if track being requested is already in the queue
    const inQueueCheck = QueueModel.checkForTrack({ spotifyTrackId });

    // If track is already in queue, then send a notification
    if (inQueueCheck) {
        await notifyUser({
            type:   'inQueueFailure',
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
        type:   'success',
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

/**
 * Generates a user-facing notification message describing the
 * outcome of a track request, including details for failures.
 *
 * @async
 * @function createNotificationMessage
 * @param {object} params
 * @param {string} params.type - The type of notification
 *   ('ruleFailure', 'cooldownFailure', 'inQueueFailure', 'success')
 * @param {*} [params.details] - Optional extra data such as cooldown time in ms
 * @returns {Promise<string>} A formatted notification message
 *
 * @description
 * Produces human-readable messages for request success or failure,
 * including cooldown formatting when applicable.
 */
const createNotificationMessage = async ({ type, details }) => {
    switch (type) {
        case 'ruleFailure':
            return `Request denied: ${details}.`;
        case 'cooldownFailure':
            return `Request denied: You must wait ${formatCooldownTime(details)}.`;
        case 'inQueueFailure':
            return `Request denied: This track is already in the queue.`;
        default:
            return `Request was successfully added to the queue!`;
    }
};

// Sends notification to NotificationService
const sendNotification = async ({ notificationMessage, userId }) => {

};

/**
 * Converts a cooldown duration in milliseconds into a human-readable string.
 *
 * Examples:
 * - 750  → "less than 1 second"
 * - 65000 → "1 minute 5 seconds"
 * - 3720000 → "1 hour 2 minutes"
 *
 * @param {number} ms - The cooldown duration in milliseconds.
 * @returns {string} A formatted string describing the duration in hours, minutes, and seconds.
 */
const formatCooldownTime = (ms) => {
    if (ms < 1000) {
        return 'less than 1 second';
    }

    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));

    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

    return parts.join(' ');
};
