import express from 'express';

import healthRouter from './routers/healthRouter.js';

const app = express();

// ROUTES
app.use('/health', healthRouter);

export default app;