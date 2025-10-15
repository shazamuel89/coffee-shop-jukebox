import { Router } from "express";
import { testDBConnection } from "../config/dbConn.js";

const router = Router();

router.get("/", async (_req, res) => {
  // Call test function and get result
  const result = await testDBConnection();

  if (result.ok) {
    res.json({ message: "✅ Connected to PostgreSQL!", time: result.time });
  } else {
    res.status(500).json({ message: "❌ Database connection failed", error: result.error });
  }
});

export default router;