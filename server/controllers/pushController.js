import PushSubscription from '../models/PushSubscription.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { sendPush } from '../utils/pushService.js';

export const subscribe = async (req, res, next) => {
    try {
        const { subscription } = req.body;
        if (!subscription)
            return res.status(400).json({ message: 'Подписка обязательна' });

        await PushSubscription.findOneAndUpdate(
            { user: req.user._id },
            { user: req.user._id, subscription },
            { upsert: true, new: true }
        );

        res.json({ message: 'Подписка сохранена' });
    } catch (err) { next(err); }
};

export const unsubscribe = async (req, res, next) => {
    try {
        await PushSubscription.deleteOne({ user: req.user._id });
        res.json({ message: 'Подписка удалена' });
    } catch (err) { next(err); }
};

export const getVapidKey = async (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

export const pushToUser = async (userId, payload) => {
    const sub = await PushSubscription.findOne({ user: userId });
    if (!sub) return;
    const result = await sendPush(sub.subscription, payload);
    if (result === 'expired') await PushSubscription.deleteOne({ user: userId });
};

export const notifyMandatory = async (req, res, next) => {
    try {
        const mandatoryCategories = await Category.find({ isMandatory: true, isSystem: true });
        const users = await User.find({});
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let notified = 0;
        for (const user of users) {
            const paidIds = await Transaction.distinct('category', {
                user: user._id,
                date: { $gte: startOfMonth },
                type: 'expense',
            });

            const unpaid = mandatoryCategories.filter(
                (c) => !paidIds.map(String).includes(String(c._id))
            );

            if (unpaid.length > 0) {
                await pushToUser(user._id, {
                    title: 'Обязательные платежи',
                    body: `Не оплачено: ${unpaid.map((c) => c.name).slice(0, 3).join(', ')}`,
                    icon: '/pwa-192.png',
                    url: '/mandatory',
                });
                notified++;
            }
        }

        res.json({ message: `Уведомление ${notified} пользователей` });
    } catch (err) { next(err); }
};

export const notifyMonthlyStats = async (req, res, next) => {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);

        const users = await User.find({});
        for (const user of users) {
            const txs = await Transaction.find({
                user: user._id, date: { $gte: start, $lt: end },
            });

            const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const balance = income - expense;

            await pushToUser(user._id, {
                title: 'Итоги месяца',
                body: `Доходы: ${income.toLocaleString('ru')} ₽ · Расходы: ${expense.toLocaleString('ru')} ₽ · Баланс: ${balance.toLocaleString('ru')} ₽`,
                icon: '/pwa-192.png',
                url: '/',
            });
        }

        res.json({ message: 'Статистика отправлена' });
    } catch (err) { next(err); }
};