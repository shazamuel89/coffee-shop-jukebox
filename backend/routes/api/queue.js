// backend/routes/api/queue.js

import { Router } from "express";
import {
  getQueue,
  addQueueItem,
  deleteQueueItem,
  voteQueueItem,
} from "../../controllers/QueueController.js"

const router = Router();

// Match controller functions to HTTP routes
router.get("/", getQueue);
router.post("/", addQueueItem);
router.delete("/:id", deleteQueueItem);
router.patch("/:id/vote", voteQueueItem);

export default router;