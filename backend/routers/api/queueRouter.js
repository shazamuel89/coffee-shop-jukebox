// backend/routers/api/queueRouter.js

import { Router } from "express";
import asyncHandler from "../../middleware/asyncHandler.js";
import confirmAdmin from "../../middleware/confirmAdmin.js";

// Import get and alter queue operations from queue controller
import {
  getQueue,
  removeQueueItem,
  skipNowPlaying,
  startDay,
} from "../../controllers/QueueController.js";

// Import play/pause operations from playback adapter
import {
  playNowPlaying,
  pauseNowPlaying,
} from "../../adapters/SpotifyPlaybackAdapter.js";

const router = Router();

router.get("/", asyncHandler(getQueue));
router.delete("/:queueItemId", confirmAdmin, asyncHandler(removeQueueItem));
router.post("/skip", confirmAdmin, asyncHandler(skipNowPlaying));
router.post("/play", confirmAdmin, asyncHandler(playNowPlaying));
router.post("/pause", confirmAdmin, asyncHandler(pauseNowPlaying));
router.post("/startup", confirmAdmin, asyncHandler(startDay));

export default router;