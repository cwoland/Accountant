import Debt from '../models/Debt.js';

export const getDebts = async (req, res, next) => {
  try {
    const debts = await Debt.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(debts);
  } catch (err) { next(err); }
};

export const createDebt = async (req, res, next) => {
  try {
    const { name, totalAmount, currency, dueDate, isOwed, creditor, note } = req.body;
    if (!name || !totalAmount)
      return res.status(400).json({ message: 'Название и сумма обязательны.' });

    const debt = await Debt.create({
      user: req.user._id,
      name, totalAmount, currency: currency || req.user.currency || 'RUB',
      dueDate, isOwed: isOwed !== false, creditor, note,
    });
    res.status(201).json(debt);
  } catch (err) { next(err); }
};

export const addPayment = async (req, res, next) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Долг не найден.' });
    if (debt.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });

    const { amount, note } = req.body;
    debt.payments.push({ amount, note, date: new Date() });
    debt.paidAmount += amount;
    await debt.save();
    res.json(debt);
  } catch (err) { next(err); }
};

export const deleteDebt = async (req, res, next) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Долг не найден.' });
    if (debt.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });
    await debt.deleteOne();
    res.json({ message: 'Удалено.' });
  } catch (err) { next(err); }
};