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
    return res.status(200).json({ data: queueData });
  } catch (err) {
    console.error("Error in getQueue: ", err);
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
    console.error("Error in removeQueueItem: ", err);
    return res.status(500).json({ error: "Failed to remove the queue item." })
  }
};

export const skipNowPlaying = (__req, res) => {
  
}

export const startDay = (req, res) => {

}