// backend/routers/api/voteRouter.js

import { Router } from "express";
import * as VoteController from "../../controllers/VoteController.js";

const router = Router();

/**
 * POST /api/vote
 * Body: { userId, queueItemId, isUpvote }
 * Description: Submits or updates a user's vote for a specific queue item.
 */
router.post("/", VoteController.submitVote);

export default router;