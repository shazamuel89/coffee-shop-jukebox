// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';


import corsOptions from './config/corsOptions.js';
import { logger } from './middleware/logEvents.js';
import errorHandler from './middleware/errorHandler.js';


// Import routers
import healthRouter from './routes/health.js';
import dbCheckRouter from './routes/dbCheck.js';
import searchRouter from './routes/search.js';
import requestRouter from './routes/request.js';
import voteRouter from './routes/vote.js';
import queueRouter from './routes/queue.js';
import rulesRouter from './routes/rules.js';
import reportRouter from './routes/report.js';


const app = express();
const PORT = process.env.PORT || 3000;


// MIDDLEWARE

// Custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for json
app.use(express.json());


// ROUTES

// Simple backend connection check
app.use("/health", healthRouter);

// Simple database connection check
app.use("/dbcheck", dbCheckRouter);

// For sending a search term and receiving results
app.use("/api/search", searchRouter);

// For sending a song request
app.use("/api/request", requestRouter);

// For voting on a song
app.use("/api/vote", voteRouter);

// For getting queue data and overriding queue
app.use("/api/queue", queueRouter);

// For viewing and changing request rules
app.use("/api/rules", rulesRouter);

// For requesting reports
app.use("/api/report", reportRouter);


// Define a route for any not found routes
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));