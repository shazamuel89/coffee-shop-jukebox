import { Router } from "express";

const router = Router();

// Basic "am I alive?" check
router.get("/", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

export default router;