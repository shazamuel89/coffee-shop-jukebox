// backend/server.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';


import corsOptions from './config/corsOptions.js';
import { logger } from './middleware/logEvents.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';


// Import routers
import healthRouter from './routers/healthRouter.js';
import dbCheckRouter from './routers/dbCheckRouter.js';
import searchRouter from './routers/api/searchRouter.js';
import requestRouter from './routers/api/requestRouter.js';
import voteRouter from './routers/api/voteRouter.js';
import queueRouter from './routers/api/queueRouter.js';
import ruleRouter from './routers/api/ruleRouter.js';
import reportRouter from './routers/api/reportRouter.js';


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
app.use("/api/rule", ruleRouter);

// For requesting reports
app.use("/api/report", reportRouter);


// Define a route for any not found routes
app.use(notFound);

// Define a route for error handling
app.use(errorHandler);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));