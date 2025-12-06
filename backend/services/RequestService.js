// backend/services/QueueService.js

import * as SpotifyAPIAdapter from '../adapters/SpotifyAPIAdapter.js';
import * as RuleModel from '../models/RuleModel.js';
import * as UserModel from '../models/UserModel.js';
import * as TrackService from '../services/TrackService.js';


// Main function that handles requests and calls helper functions, returns bool for if request was accepted
export const processTrackRequest = async ({ spotifyTrackId, requestedByUserId }) => {
    // Get track's full metadata
    const trackMetadata = await SpotifyAPIAdapter.fetchTrackMetadata({ spotifyTrackId });

    // Get all current rules
    const rules = await RuleModel.fetchRules();

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
    const userLastRequestTimestamp = await UserModel.fetchLastRequestTime({ userId: requestedByUserId });

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
    const inQueueCheck = await QueueModel.checkForTrack({ spotifyTrackId });

    // If track is already in queue, then send a notification
    if (inQueueCheck) {
        await notifyUser({
            type:   'inQueueFailure',
            userId: requestedByUserId,
        });
        return { added: false };
    }

    // Store the track's metadata for easier system access
    await TrackService.storeTrack({ trackMetadata });

    // Send successfully requested track to queue
    await QueueService.storeSuccessfulRequest({ spotifyTrackId, requestedByUserId });

    // Update user's last request time
    await UserModel.updateLastRequestTime({ userId: requestedByUserId });

    // Notify user of successful request
    await notifyUser({
        type:   'success',
        userId: requestedByUserId,
    });
    return { added: true };
};

// Checks the track against the rules and returns object with bool for passing and description of rule broken
const evaluateTrackAgainstRules = ({ trackMetadata, rules }) => {
    if (!trackMetadata) {
        return { passed: false, ruleBroken: { description: "Track metadata missing" } };
    }

    // Convert array of row objects into dictionary for fast lookup
    const rulesByName = Object.fromEntries(
        rules.map(rule => [rule.name, rule])
    );

    // === 1. Explicit Track Disallowed ===
    if (rulesByName.explicitDisallowed?.value?.disallowed) {
        if (trackMetadata.isExplicit) {
            return {
                passed: false,
                ruleBroken: rulesByName.explicitDisallowed
            };
        }
    }

    // === 2. Max Length Rule ===
    const maxLengthRule = rulesByName.maxLengthMs;
    if (maxLengthRule?.value?.max_duration_ms !== undefined) {
        const maxMs = maxLengthRule.value.max_duration_ms;

        if (trackMetadata.duration > maxMs) {
            return {
                passed: false,
                ruleBroken: maxLengthRule
            };
        }
    }

    // Passed all rules
    return { passed: true };
};

// Checks current time against last request timestamp and cooldown rule, returns object with bool for allowed and wait time in ms
const checkUserRequestCooldown = ({ userLastRequestTimestamp, rules }) => {
    // Convert array → lookup object
    const rulesByName = Object.fromEntries(
        rules.map(rule => [rule.name, rule])
    );

    const cooldownRule = rulesByName.requestCooldown;
    if (!cooldownRule) {
        // No cooldown rule → always allow
        return { allowed: true, waitTimeInMs: 0 };
    }

    const cooldownMinutes = cooldownRule.value?.request_cooldown_minutes;
    if (cooldownMinutes === undefined) {
        // Bad rule → allow
        return { allowed: true, waitTimeInMs: 0 };
    }

    // If user has never requested anything, allow
    if (!userLastRequestTimestamp || !userLastRequestTimestamp.last_request_time) {
        return { allowed: true, waitTimeInMs: 0 };
    }

    const lastReq = new Date(userLastRequestTimestamp.last_request_time);
    const now = new Date();

    const cooldownMs = cooldownMinutes * 60 * 1000;
    const elapsed = now - lastReq;
    const remaining = cooldownMs - elapsed;

    if (remaining > 0) {
        return {
            allowed: false,
            waitTimeInMs: remaining
        };
    }

    return { allowed: true, waitTimeInMs: 0 };
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
const createNotificationMessage = ({ type, details }) => {
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
