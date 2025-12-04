// backend/routers/api/searchRouter.js

import { Router } from "express";
import { handleSearch } from "../../controllers/SearchController.js";
import asyncHandler from "../../middleware/asyncHandler.js";

const router = Router();

// GET /api/search?q=term (simple mock so it always works)
router.get("/", asyncHandler(handleSearch));

export default router;