// backend/routers/api/queueRouter.js

import { Router } from "express";

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

router.get("/", getQueue);
router.delete("/:queueItemId", confirmAdmin, removeQueueItem);
router.post("/skip", confirmAdmin, skipNowPlaying);
router.post("/play", confirmAdmin, playNowPlaying);
router.post("/pause", confirmAdmin, pauseNowPlaying);
router.post("/startup", confirmAdmin, startDay);

export default router;