import Account from '../models/Account.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.status': 'active' },
      ],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(accounts);
  } catch (err) {
    next(err);
  }
};

export const getInvites = async (req, res, next) => {
  try {
    const invites = await Account.find({
      'members.user': req.user._id,
      'members.status': 'pending',
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(invites);
  } catch (err) {
    next(err);
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const { name, currency, color, icon, inviteEmail } = req.body;

    if (!inviteEmail)
      return res.status(400).json({ message: 'Email участника обязателен.' });

    const invitee = await User.findOne({ email: inviteEmail.trim().toLowerCase() });
    if (!invitee)
      return res.status(404).json({ message: 'Пользователь не найден.' });

    if (invitee._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Нельзя пригласить себя.' });

    const account = await Account.create({
      name: name || 'Совместный счёт',
      owner: req.user._id,
      currency: currency || req.user.currency || 'RUB',
      color: color || '#7c6af7',
      icon: icon || '👥',
      members: [{ user: invitee._id, status: 'pending' }],
    });

    await account.populate('owner', 'name email avatar');
    await account.populate('members.user', 'name email avatar');

    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account)
      return res.status(404).json({ message: 'Счёт не найден.' });

    const member = account.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member)
      return res.status(403).json({ message: 'Приглашение не найдено.' });

    member.status = 'active';
    member.joinedAt = new Date();
    await account.save();

    res.json({ message: 'Приглашение принято.' });
  } catch (err) {
    next(err);
  }
};

export const declineInvite = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account)
      return res.status(404).json({ message: 'Счёт не найден.' });

    account.members = account.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );
    await account.save();

    res.json({ message: 'Приглашение отклонено.' });
  } catch (err) {
    next(err);
  }
};

export const leaveAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account)
      return res.status(404).json({ message: 'Счёт не найден.' });

    if (account.owner.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Владелец не может покинуть счёт. Удалите его.' });

    account.members = account.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );
    await account.save();

    res.json({ message: 'Вы покинули счёт.' });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account)
      return res.status(404).json({ message: 'Счёт не найден.' });

    if (account.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Только владелец может удалить счёт.' });

    await Transaction.updateMany({ account: account._id }, { account: null });
    await account.deleteOne();

    res.json({ message: 'Счёт удалён.' });
  } catch (err) {
    next(err);
  }
};

export const getAccountStats = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate('owner', 'name avatar')
      .populate('members.user', 'name avatar');

    if (!account)
      return res.status(404).json({ message: 'Счёт не найден.' });

    const isParticipant =
      account.owner._id.toString() === req.user._id.toString() ||
      account.members.some(
        (m) => m.user._id.toString() === req.user._id.toString() && m.status === 'active'
      );

    if (!isParticipant)
      return res.status(403).json({ message: 'Нет доступа.' });

    const transactions = await Transaction.find({ account: account._id })
      .populate('category', 'name icon color')
      .sort({ date: -1 });

    const byUser = {};
    const allMembers = [
      account.owner,
      ...account.members.filter((m) => m.status === 'active').map((m) => m.user),
    ];

    allMembers.forEach((u) => {
      byUser[u._id] = { name: u.name, avatar: u.avatar, total: 0, count: 0 };
    });

    transactions.forEach((tx) => {
      const uid = tx.user.toString();
      if (byUser[uid]) {
        byUser[uid].total += tx.amount;
        byUser[uid].count += 1;
      }
    });

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    res.json({
      account,
      transactions: transactions.slice(0, 20),
      stats: {
        totalExpense,
        totalIncome,
        balance: totalIncome - totalExpense,
        byUser: Object.values(byUser),
      },
    });
  } catch (err) {
    next(err);
  }
};