import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import aiRoutes from './routes/ai.js';
import debtRoutes from './routes/debts.js';
import userRoutes from './routes/users.js';

import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const rooms = new Map();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const accountId = url.searchParams.get('accountId');
    const token = url.searchParams.get('token');

    if (!account || !token) { ws.close(); return; }

    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch { ws.close(); return; }

    if (!rooms.has(accountId)) rooms.set(accountId, new Set());
    rooms.get(accountId).add({ ws, userId });

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            const room = rooms.get(accountId);
            if (!room) return;

            const broadcast = JSON.stringify({
                type: 'message',
                userId,
                text: msg.text,
                timestamp: new Date().toISOString(),
            });

            room.forEach(({ ws: client }) => {
                if (client.readyState === 1) client.send(broadcast);
            });
        } catch {}
    });

    ws.on('close', () => {
        const room = rooms.get(accountId);
        if (room) {
            room.forEach(item => { if (items.ws === ws) room.delete(item); });
            if (room.size === 0) rooms.delete(accountId);
        }
    });
});

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/users', userRoutes);


app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});