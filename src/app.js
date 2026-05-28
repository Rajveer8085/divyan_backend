import { existsSync, mkdirSync } from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { config } from './config/env.js';
import contactRoutes from './routes/contact.routes.js';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import { UPLOAD_DIR } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Ensure the uploads directory exists.
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

// Behind a reverse proxy (Nginx, Render, etc.) so rate-limit sees the real IP.
app.set('trust proxy', 1);

// crossOriginResourcePolicy 'cross-origin' lets the frontend (different origin) load /uploads images.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (config.clientUrls.includes(origin)) return callback(null, true);
    if (!config.isProd && LOCALHOST.test(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: false,
};
console.log("Origin:", origin);
console.log("Allowed:", config.clientUrls);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(compression());
if (!config.isTest) app.use(morgan(config.isProd ? 'combined' : 'dev'));

// Serve uploaded files.
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// Health + root
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/', (req, res) => res.json({ name: 'Divyan Technologies API', version: '1.0.0' }));

// Feature routes
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// 404 + centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
