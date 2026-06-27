import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => 
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: 'Заполните все поля.' });

    const cleanEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: cleanEmail });
    if (exists)
      return res.status(400).json({ message: 'Email уже зарегистрирован.' });

    const user = await User.create({ name: name.trim(), email: cleanEmail, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      avatar: user.avatar,
      token: generateToken(user._id),
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password)
      return res.status(400).json({ message: 'Заполните все поля.' });

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Неверный email или пароль.' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      avatar: user.avatar,
      token: generateToken(user._id),
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
    res.json(req.user);
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, currency, monthlyBudget, avatar } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'Пользователь не найден'});

        if (name) user.name = name;
        if (currency) user.currency = currency;
        if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            currency: user.currency,
            monthlyBudget: user.monthlyBudget,
            avatar: user.avatar,
            onboardingCompleted: user.onboardingCompleted,
        });
    } catch (err) {
        next(err);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.matchPassword(currentPassword)))
            return res.status(401).json({ message: 'Неверный пароль'});

        if (newPassword.length < 8)
            return res.status(400).json({ message: 'Пароль должен быть длиннее 8 символов'});

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Пароль успешно изменён' });
    } catch (err) {
        next(err);
    }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2)
      return res.status(400).json({ message: 'Минимум 2 символа' });

    const users = await User.find({
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    })
      .select('name email avatar')
      .limit(10);

      res.json(users);
  } catch (err) {
    next(err);
  }
};

export const completeOnboarding = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { onboardingCompleted: true },
      { new: true }
    );
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      avatar: user.avatar,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (err) {
    next(err);
  }
};