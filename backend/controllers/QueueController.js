// backend/controllers/QueueController.js
import { Router } from "express";
import { loadQueue, saveQueue } from "../services/queueStore.js";

const router = Router();

// GET /api/queue -> list items
router.get("/", (_req, res) => {
  const items = loadQueue();
  res.json({ count: items.length, items });
});

// POST /api/queue { title, artist, requestedBy? } -> add item
router.post("/", (req, res) => {
  const { title, artist, requestedBy } = req.body || {};
  if (!title || !artist) {
    return res.status(400).json({ error: "title and artist are required" });
  }
  const items = loadQueue();
  const item = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    title: String(title),
    artist: String(artist),
    requestedBy: requestedBy ? String(requestedBy) : "anon",
    addedAt: new Date().toISOString(),
    up: 0,
    down: 0
  };
  items.push(item);
  saveQueue(items);
  res.status(201).json({ ok: true, item });
});

export default router;
