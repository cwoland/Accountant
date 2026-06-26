import MonthlyBudget from '../models/MonthlyBudget.js';
import User from '../models/User.js';

export const getBudget = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        const budget = await MonthlyBudget.find({
            user: req.user._id,
            year: Number(year),
            month: Number(month),
        });

        if (!budget) {
            const user = await User.findById(req.user._id);
            return res.json({ amount: user?.monthlyBudget || 0, isDefault: true });
        }

        res.json({ amount: budget.amount, isDefault: false });
    } catch (err) {
        next(err);
    }
};

export const setBudget = async (req, res, next) => {
    try {
        const { year, month, amount } = req.body;
        if (!year || !month || amount === undefined)
            return res.status(400).json({ message: 'Все поля обязательны' });

        const budget = await MonthlyBudget.findOneAndUpdate(
            { user: req.user._id, year: Number(year), month: Number(month) },
            { amount: Number(amount) },
            { upsert: true, new: true }
        );
        res.json(budget);
    } catch (err) {
        next(err);
    }
};