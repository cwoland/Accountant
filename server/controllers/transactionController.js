import Transaction from '../models/Transaction.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1,
      limit = 20, sortBy = 'date', order = 'desc', accountId } = req.query;

    const filter = accountId ? { account: accountId } : { user: req.user._id, account: null };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon color isMandatory')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { startDate, endDate, accountId } = req.query;

    const match = accountId ? { account: accountId } : { user: req.user._id, account: null };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const byCategory = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          type: '$_id.type',
          category: '$categoryInfo.name',
          icon: '$categoryInfo.icon',
          color: '$categoryInfo.color',
          total: 1,
          count: 1,
        },
      },
    ]);

    const monthly = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const income = stats.find((s) => s._id === 'income')?.total || 0;
    const expense = stats.find((s) => s._id === 'expense')?.total || 0;

    res.json({
      summary: { income, expense, balance: income - expense },
      byCategory,
      monthly,
    });
  } catch (err) {
    next(err);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date, isRecurring, recurringPeriod, tags, accountId } =
      req.body;

    if (accountId) {
      const Account = (await import('../models/Account.js')).default;
      const account = await Account.findById(accountId);
      if (!account) return res.status(404).json({ message: 'Счёт не найден.' });
      const hasAccess = account.owner.toString() === req.user._id.toString() || 
      account.members.some(m => m.user.toString() === req.user._id.toString() && m.status === 'active');
      if (!hasAccess) return res.status(403).json({ message: 'Нет доступа к счёту.' });
    }

    if (!type || !amount || !category)
      return res.status(400).json({ message: 'Тип, сумма и категория обязательны.' });

    const transaction = await Transaction.create({
      user: req.user._id,
      account: accountId || null,
      type,
      amount,
      category,
      description,
      date: date || Date.now(),
      isRecurring: isRecurring || false,
      recurringPeriod: recurringPeriod || null,
      tags: tags || [],
    });

    await transaction.populate('category', 'name icon color isMandatory');
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction)
      return res.status(404).json({ message: 'Транзакция не найдена.' });

    if (transaction.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });

    const fields = ['type', 'amount', 'category', 'description', 'date', 'isRecurring', 'recurringPeriod', 'tags'];
    fields.forEach((f) => { if (req.body[f] !== undefined) transaction[f] = req.body[f]; });

    await transaction.save();
    await transaction.populate('category', 'name icon color isMandatory');
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction)
      return res.status(404).json({ message: 'Транзакция не найдена.' });

    if (transaction.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });

    await transaction.deleteOne();
    res.json({ message: 'Транзакция удалена.' });
  } catch (err) {
    next(err);
  }
};