// backend/config/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

export async function testDBConnection() {
  try {
    const { rows } = await pool.query("SELECT NOW() as now");
    return { ok: true, time: rows[0].now };
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return { ok: false, error: error.message };
  }
}

export { pool };
