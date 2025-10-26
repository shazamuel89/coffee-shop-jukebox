// backend/server.js
import express from "express";
import cors from "cors";

// static imports (consistent with "type": "module")
import healthRouter from "./routes/health.js";
import dbCheckRouter from "./routes/dbcheck.js";
import searchRouter from "./controllers/SearchController.js";
import queueRouter from "./controllers/QueueController.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get("/", (_req, res) => res.send("Hello world!"));
app.use("/api/health", healthRouter);
app.use("/api/dbcheck", dbCheckRouter);
app.use("/api/search", searchRouter);
app.use("/api/queue", queueRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
