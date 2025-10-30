// backend/routers/search.js
import { Router } from "express";
import { handleSearch } from "../../controllers/SearchController.js";

const router = Router();

// GET /api/search?q=term (simple mock so it always works)
router.get("/", handleSearch);

export default router;