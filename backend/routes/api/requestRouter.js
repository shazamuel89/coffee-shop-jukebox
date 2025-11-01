// backend/routes/api/requestRouter.js

import { Router } from "express";
const router = Router();

// Optional: simple test route
router.get("/", (_req, res) => {
  res.json({ message: "Request route placeholder" });
});

export default router;