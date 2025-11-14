// backend/controllers/QueueController.js

import * as QueueService from '../services/QueueService.js';
import validateRequiredParameters from '../utils/validateRequiredParameters.js';
import validateParameterTypes from '../utils/validateParameterTypes.js';


// Route: '/'
// Fetch list of queue items for a specific user
export const getQueue = async (req, res) => {
  try {
    // No need to validate existence of user id since it has gone through authentication middleware

    // No need to validate type of user id since it has gone through authentication middleware

    // Extract user's id and role (service needs to know if admin or not)
    const userId = req.user.id;
    const role = req.user.role;

    // Pass to the service layer
    const queueData = await QueueService.getQueue({ userId, role });
    
    // Success, return data
    return res.status(200).json({ queue: queueData });
  } catch (err) {
    console.error("Error in QueueController.getQueue:", err);
    return res.status(500).json({ error: "Failed to load queue." });
  }
};

// Route: '/:queueItemId'
// Remove a queue item from the queue
export const removeQueueItem = async (req, res) => {
  try {
    const { queueItemId } = req.params;

    // queueItemId is a required parameter, but don't need to check existence since if it didn't exist it wouldn't use this route

    // No need to validate type of queueItemId since it will always be a string from req.params

    // Pass to the service layer
    const removedQueueItem = await QueueService.removeQueueItem({ queueItemId });

    // If queue item not found, return a failure response
    if (!removedQueueItem.success) {
      return res.status(404).json({ error: removedQueueItem.error });
    }

    // Success, return response
    return res.status(204).send();
  } catch(err) {
    console.error("Error in QueueController.removeQueueItem:", err);
    return res.status(500).json({ error: "Failed to remove the queue item." })
  }
};

// Route: '/skip'
// Validate queueItemId provided in request body, then send skip request to QueueService
export const skipNowPlaying = async (req, res) => {
  try {
    const requiredParameters = ['queueItemId'];
    const expectedTypes = {
      queueItemId: 'string',
    };

    // Verify that all required parameters are present
    const missingError = validateRequiredParameters(req.body, requiredParameters);
    if (missingError) {
      return res.status(400).json({ error: missingError });
    }

    // Validate parameter data types
    const typeError = validateParameterTypes(req.body, expectedTypes);
    if (typeError) {
      return res.status(400).json({ error: typeError });
    }

    // All parameters present and types confirmed, so extract them
    const { queueItemId } = req.body;

    // Pass to the service layer
    const skippedTrack = await QueueService.sendSkipUpdate({ queueItemId });

    // Check if service returned a failure (meaning a mismatch between frontend skipped track and backend now playing)
    if (!skippedTrack.success) {
      return res.status(409).json({ error: skippedTrack.error });
    }

    // Send confirmation response
    return res.status(204).send();
  } catch(err) {
    console.error("Error in QueueController.skipNowPlaying:", err);
    return res.status(500).json({ error: "Server error while skipping track." });
  }
}

// Route: '/startup'
// Tell QueueService to run startup tasks
export const startDay = async (__req, res) => {
  try {
    // No required parameters for startDay()

    // No parameters, so data types don't need validation

    // No parameters to extract

    const dayStarted = await QueueService.startDay();

    // Check if operation returned a failure
    if (!dayStarted.success) {
      return res.status(400).json({ error: dayStarted.error });
    }

    // Send confirmation response
    return res.status(204).send();
  } catch(err) {
    console.error("Error in QueueController.startDay:", err);
    return res.status(500).json({ error: "Server error running startup tasks." });
  }
}