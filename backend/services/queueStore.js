// backend/services/queueStore.js

import fs from "fs";
import path from "path";

const SNAPSHOT = path.resolve("./data/queue.json");

function ensureStore() {
  const dir = path.dirname(SNAPSHOT);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(SNAPSHOT)) fs.writeFileSync(SNAPSHOT, "[]");
}

export function loadQueue() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(SNAPSHOT, "utf-8"));
  } catch {
    return [];
  }
}

export function saveQueue(items) {
  ensureStore();
  fs.writeFileSync(SNAPSHOT, JSON.stringify(items, null, 2));
}
