import Goal from '../models/Goal.js';
import { pushToUser } from './pushController.js';

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) { next(err); }
};

export const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currency, deadline, icon, color, note } = req.body;
    if (!name || !targetAmount)
      return res.status(400).json({ message: 'Название и сумма обязательны.' });

    const goal = await Goal.create({
      user: req.user._id,
      name, targetAmount, currency: currency || 'RUB',
      deadline, icon: icon || 'target', color: color || '#7c6af7', note,
    });
    res.status(201).json(goal);
  } catch (err) { next(err); }
};

export const contribute = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Цель не найдена.' });
    if (goal.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });

    const { amount, note } = req.body;
    goal.contributions.push({ amount, note, date: new Date() });
    goal.currentAmount += amount;

    if (goal.currentAmount >= goal.targetAmount && !goal.completed) {
      goal.completed = true;
      await pushToUser(req.user._id, {
        title: '🎉 Цель достигнута!',
        body: `Поздравляем! Вы накопили на "${goal.name}"`,
        icon: '/pwa-192.png',
        url: '/goals',
      });
    }

    await goal.save();
    res.json(goal);
  } catch (err) { next(err); }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Цель не найдена.' });
    if (goal.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });
    await goal.deleteOne();
    res.json({ message: 'Цель удалена.' });
  } catch (err) { next(err); }
};