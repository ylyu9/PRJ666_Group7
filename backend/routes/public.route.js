import express from "express";
const router = express.Router();

// Public endpoint 1: Health check
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date(),
        version: "1.0.0"
    });
});

// Public endpoint 2: Server time
router.get("/time", (req, res) => {
    const serverTime = {
        utc: new Date().toUTCString(),
        local: new Date().toString(),
        timestamp: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    res.status(200).json(serverTime);
});

export default router; 