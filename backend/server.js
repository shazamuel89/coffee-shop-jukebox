// backend/server.js
import express from "express";
import cors from "cors";

import healthRouter from "./routes/health.js";
import dbCheckRouter from "./routes/dbcheck.js"; 

const app = express();
app.use(cors());
app.use(express.json());

// simple home
app.get("/", (_req, res) => res.send("Hello world!"));

// routes
app.use("/api/health", healthRouter);
app.use("/api/dbcheck", dbCheckRouter); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
