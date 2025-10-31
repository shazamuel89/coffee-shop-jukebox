// backend/controllers/QueueController.js

import { loadQueue, saveQueue } from "../services/queueStore.js";

import * as QueueService from '../services/QueueService.js';
import validateParameterTypes from '../utils/validateParameterTypes.js';


//sanitizes & trims strings
function cleanStr(val = "", max = 120) {
  const s = String(val)
    .replace(/[\u0000-\u001F]/g, "") // remove control chars
    .replace(/\s+/g, " ")            // collapse spaces
    .trim();
  return s.length > max ? s.slice(0, max) : s;
}

// GET /api/queue?userId=${userId}
export const getQueue = async (req, res) => {
  try {
    const { userId } = req.query;

    // userId is optional, since admin may not provide it

    const typeError = validateParameterTypes({ userId }, { userId: "number" });
    if (typeError) {
      return res.status(400).json({ success: false, error: typeError });
    }

    // Safely parse userId into number (or null if not provided)
    const parsedUserId = userId ? parseInt(userId, 10) : null;

    // Ask QueueService for full queue + this user's votes
    const queueData = await QueueService.getQueue(parsedUserId);

    res.json({
      success: true,
      count: queueData.length,
      items: queueData,
    });
  } catch (err) {
    console.error("Error in getQueue:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to load queue" });
  }
};

// POST /api/queue { title, artist, requestedBy? }
export const addQueueItem = (req, res) => {
  // sanitize
  const title = cleanStr(req.body?.title, 120);
  const artist = cleanStr(req.body?.artist, 120);
  const requestedBy = cleanStr(req.body?.requestedBy ?? "anon", 60);

  // validate
  if (!title || !artist) {
    return res.status(400).json({ error: "title and artist are required" });
  }
  if (title.length > 120 || artist.length > 120) {
    return res.status(400).json({ error: "title/artist too long (max 120)" });
  }
  if (requestedBy.length > 60) {
    return res.status(400).json({ error: "requestedBy too long (max 60)" });
  }

  const items = loadQueue();
  const item = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    title: String(title),
    artist: String(artist),
    requestedBy: requestedBy ? String(requestedBy) : "anon",
    addedAt: new Date().toISOString(),
    up: 0,
    down: 0,
  };

  items.push(item);
  saveQueue(items);
  res.status(201).json({ ok: true, item });
};

// DELETE /api/queue/:id -> remove one item by id
export const deleteQueueItem = (req, res) => {
  const { id } = req.params;
  const items = loadQueue();
  const idx = items.findIndex((i) => i.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "not found" });
  }

  const [removed] = items.splice(idx, 1);
  saveQueue(items);
  res.json({ ok: true, removed });
};

// PATCH /api/queue/:id/vote { dir: "up" | "down" }
export const voteQueueItem = (req, res) => {
  const { id } = req.params;
  const dir = (req.body?.dir || "").toLowerCase();

  if (!["up", "down"].includes(dir)) {
    return res.status(400).json({ error: "dir must be 'up' or 'down'" });
  }

  const items = loadQueue();
  const item = items.find((i) => i.id === id);

  if (!item) return res.status(404).json({ error: "not found" });

  if (dir === "up") item.up += 1;
  else item.down += 1;

  saveQueue(items);
  res.json({ ok: true, item });
};