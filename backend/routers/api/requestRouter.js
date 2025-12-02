// backend/routers/api/requestRouter.js

import { Router } from "express";
import asyncHandler from "../../middleware/asyncHandler.js";

// Import request operation from request controller
import {
  requestTrack,
} from "../../controllers/RequestController.js";

const router = Router();

router.post("/", asyncHandler(requestTrack));

export default router;