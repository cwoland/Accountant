import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import aiRoutes from './routes/ai.js';
import debtRoutes from './routes/debts.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import goalRoutes from './routes/goals.js';
import pushRoutes from './routes/push.js';
import budgetRoutes from './routes/budget.js';

dotenv.config();
connectDB();

const app = express();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много попыток входа.' },
});

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Вы исчерпали лимит запросов. Попробуйте через час.' },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Слишком много запросов. Попробуйте позже.' },
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/ai',           aiLimiter,   aiRoutes);
app.use('/api/accounts',     apiLimiter,  accountRoutes);
app.use('/api/transactions', apiLimiter,  transactionRoutes);
app.use('/api/categories',   apiLimiter,  categoryRoutes);
app.use('/api/debts',        apiLimiter,  debtRoutes);
app.use('/api/users',        apiLimiter,  userRoutes);
app.use('/api/messages',     apiLimiter,  messageRoutes);
app.use('/api/goals',        apiLimiter,  goalRoutes);
app.use('/api/push',         apiLimiter,  pushRoutes);
app.use('/api/budget',       apiLimiter,  budgetRoutes);


app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});