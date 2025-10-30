// backend/routes/api/vote.js

import { Router } from "express";
const router = Router();

// Optional: simple test route
router.get("/", (_req, res) => {
  res.json({ message: "Vote route placeholder" });
});

export default router;