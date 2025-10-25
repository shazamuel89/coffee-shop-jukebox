// backend/controllers/QueueController.js
import { Router } from "express";
import { loadQueue, saveQueue } from "../services/queueStore.js";

const router = Router();

// GET /api/queue
router.get("/", (_req, res) => {
  const items = loadQueue();
  res.json({ count: items.length, items });
});

// POST /api/queue { title, artist, requestedBy? }
router.post("/", (req, res) => {
  const { title, artist, requestedBy } = req.body || {};
  if (!title || !artist) return res.status(400).json({ error: "title and artist are required" });

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

// DELETE /api/queue/:id  -> remove one item by id
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const items = loadQueue();
  const idx = items.findIndex((i) => i.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "not found" });
  }

  const [removed] = items.splice(idx, 1);
  saveQueue(items);
  return res.json({ ok: true, removed });
});


export default router;   // <-- IMPORTANT

