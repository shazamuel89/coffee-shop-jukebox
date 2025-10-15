import { Router } from "express";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() as now");
    res.json({ message: "✅ Connected to PostgreSQL!", time: rows[0].now });
  } catch (err) {
    res.status(500).json({ message: "❌ Database connection failed", error: err.message });
  }
});

export default router;
