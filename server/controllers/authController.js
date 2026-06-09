import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => 
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const register = async (req, res, next) => {
    try {
        console.log('RAW BODY:', JSON.stringify(req.body));
        const name = req.body.name?.trim();
        const email = req.body.emal?.trim().toLowerCase();
        const password = req.body.password;

        console.log('PARSED -> name: ', name, '| email:', email, '| password exists:', !!password);

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Заполните все поля.'});

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ message: 'Email уже зарегистрирован' });

        const user = await User.create({ name, email, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            currency: user.currency,
            monthlyBudget: user.monthlyBudget,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password)
            return res.status(400).json({ message: 'Заполните все поля' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Неверный email или пароль'});

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            currency: user.currency,
            monthlyBudget: user.monthlyBudget,
            avatar: user.avatar,
            token: generateToken(user._id),
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
