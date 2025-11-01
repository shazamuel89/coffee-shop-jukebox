// backend/routers/api/reportRouter.js

import { Router } from "express";
const router = Router();

// Optional: simple test route
router.get("/", (_req, res) => {
  res.json({ message: "Report route placeholder" });
});

export default router;