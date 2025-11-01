// backend/routers/api/ruleRouter.js

import { Router } from "express";
const router = Router();

// Optional: simple test route
router.get("/", (_req, res) => {
  res.json({ message: "Rule route placeholder" });
});

export default router;