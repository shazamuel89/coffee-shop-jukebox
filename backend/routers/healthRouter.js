import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
    res.json({
        ok: true,
        time: new Date().toISOString(),
        uptime: process.uptime(),
        env: process.env.NODE_ENV || 'development',
    });
});

export default router;