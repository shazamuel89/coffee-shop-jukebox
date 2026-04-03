import express from 'express';
import cors from 'cors';

import corsOptions from './config/corsOptions.js';

import healthRouter from './routers/healthRouter.js';

const app = express();

// Enable Cross Origin Resource Sharing
app.use(cors(corsOptions));

// ROUTES
app.use('/health', healthRouter);

export default app;