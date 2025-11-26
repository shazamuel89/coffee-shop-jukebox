// backend/routers/api/reportRouter.js

import { Router } from "express";
import asyncHandler from "../../middleware/asyncHandler.js";
import confirmAdmin from "../../middleware/confirmAdmin.js";
import { getSummary } from "../../controllers/ReportController.js";

const router = Router();

// Admin-only summary report
// GET /api/report
router.get("/", confirmAdmin, asyncHandler(getSummary));

export default router;
