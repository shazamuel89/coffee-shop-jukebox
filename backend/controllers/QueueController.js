// backend/controllers/QueueController.js

import * as QueueService from '../services/QueueService.js';
import validateRequestBodyOrQuery from '../utils/validateRequestBodyOrQuery.js';


/**
 * Retrieves the queue for the authenticated user, optionally annotated with user-specific data.
 *
 * Route: GET '/'
 *
 * @async
 * @function getQueue
 * @param {object} req - Express request object (contains authenticated `user`)
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with queue data or an error status code
 *
 * @description
 * - Extracts the user's ID and role from authentication middleware.
 * - Delegates to QueueService.getQueue to fetch queue items.
 * - Returns `200` with queue data on success, or `500` on internal error.
 */
export const getQueue = async (req, res) => {
  // No need to validate existence of user id since it has gone through authentication middleware
  // No need to validate type of user id since it has gone through authentication middleware

  // Extract user's id and role (service needs to know if admin or not)
  const userId = req.query.userId;  // Temporarily pass in query parameters
  const role = 'customer';  // Temporary hard coding

  // Pass to the service layer
  const queueData = await QueueService.getQueue({ userId, role });
    
  // Success, return data
  return res.status(200).json({ queue: queueData });
};

/**
 * Removes a queue item identified by its ID.
 *
 * Route: DELETE '/:queueItemId'
 *
 * @async
 * @function removeQueueItem
 * @param {object} req - Express request object (contains `queueItemId` route param)
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends `204` on success, `404` if not found, or error codes
 *
 * @description
 * - Extracts `queueItemId` from route params.
 * - Delegates to QueueService.removeQueueItem.
 * - Returns:
 *    - `204` if the item was removed
 *    - `404` if the item does not exist
 *    - `500` if an internal error occurs
 */
export const removeQueueItem = async (req, res) => {
  const { queueItemId } = req.params;

  // queueItemId is a required parameter, but don't need to check existence since if it didn't exist it wouldn't use this route
  // No need to validate type of queueItemId since it will always be a string from req.params

  // Pass to the service layer
  await QueueService.removeQueueItem({ queueItemId });

  // Success, return response
  return res.status(204).send();
};

/**
 * Attempts to skip the currently playing track by verifying that the
 * frontend-provided queueItemId matches the backend's now-playing ID.
 *
 * Route: POST '/skip'
 *
 * @async
 * @function skipNowPlaying
 * @param {object} req - Express request object (expects `queueItemId` and optionally `requestedByUserId` in body)
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends `204` on success, `409` on mismatch, or validation errors
 *
 * @description
 * - Validates required body fields and their types.
 * - Calls QueueService.sendSkipUpdate to perform version check and skip logic.
 * - Returns:
 *    - `204` if skip is accepted
 *    - `409` if the queueItemId is out-of-sync (client stale)
 *    - `400` for validation errors
 *    - `500` for internal server errors
 */
export const skipNowPlaying = async (req, res) => {
  validateRequestBodyOrQuery({
    data: req.body,
    schema: {
      queueItemId:        { type: 'number', required: true },
      requestedByUserId:  { type: 'number', required: false },
    }
  });

  // All parameters present and types confirmed, so extract them
  const { queueItemId, requestedByUserId } = req.body;

  // Pass to the service layer
  await QueueService.sendSkipUpdate({ queueItemId, requestedByUserId });

  // Send confirmation response
  return res.status(204).send();
};

/**
 * Executes startup tasks for the queue system (e.g., resetting state for a new day).
 *
 * Route: POST '/startup'
 *
 * @async
 * @function startDay
 * @param {object} __req - Unused Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends `204` on success or error status codes
 *
 * @description
 * - Performs system-level initialization at the start of a day/session.
 * - No parameters required.
 * - Delegates to QueueService.startDay.
 * - Returns:
 *    - `204` on success
 *    - `400` if service reports a failure
 *    - `500` if an internal error occurs
 */
export const startDay = async (__req, res) => {
  // No required parameters for startDay()
  // No parameters, so data types don't need validation
  // No parameters to extract

  await QueueService.startDay();

  // Send confirmation response
  return res.status(204).send();
};
