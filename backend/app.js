import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import corsOptions from './config/corsOptions.js';
import healthRouter from './routers/healthRouter.js';

const app = express();

// Use Helmet to add HTTP security headers
app.use(helmet());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create logs directory if it doesn't exist
const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, 'access.log'),
    { flags: 'a' } // This means logs will be appended
);

// For production, put detailed logs into logfile, for dev, put logs into console
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: accessLogStream }));
} else {
    app.use(morgan('dev'));
}

// Enable Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Use built-in middleware for parsing JSON
app.use(express.json());

// ROUTES
app.use('/health', healthRouter);

export default app;
