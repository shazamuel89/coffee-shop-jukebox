import express from 'express';


// Import routers
import healthRouter from './routers/healthRouter.js';


const app = express();
const PORT = process.env.PORT || 3000;


// ROUTES

// Simple backend connection check
app.use("/health", healthRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));