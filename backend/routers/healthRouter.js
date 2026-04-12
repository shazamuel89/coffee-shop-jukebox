import { Router } from "express";
import pool from "../config/dbConn.js";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        // Simple query to ping the DB
        await pool.query("SELECT 1;");

        res.json({
            ok: true,
            db: "up",
            time: new Date().toISOString(),
            uptime: process.uptime(),
            env: process.env.NODE_ENV || 'development',
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            db: "down",
            error: err.message,
            time: new Date().toISOString(),
        });
    }
});

export default router;
