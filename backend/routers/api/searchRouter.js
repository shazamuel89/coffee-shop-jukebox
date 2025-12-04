// backend/routers/api/searchRouter.js

import { Router } from "express";
import asyncHandler from "../../middleware/asyncHandler.js";
import { searchTracks } from "../../controllers/SearchController.js";

const router = Router();

// GET /api/search?term=term
router.get("/", asyncHandler(searchTracks));

export default router;