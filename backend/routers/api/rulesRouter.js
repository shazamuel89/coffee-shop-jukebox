// backend/routers/api/rulesRouter.js

import { Router } from "express";
const router = Router();

// Optional: simple test route
router.get("/", (_req, res) => {
  res.json({ message: "Rules route placeholder" });
});

export default router;