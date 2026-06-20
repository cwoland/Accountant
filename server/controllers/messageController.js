import Message from '../models/Message.js';
import { pushToUser } from './pushController.js';
import Account from '../models/Account.js';

const checkAccess = async (accountId, userId) => {
    const account = await Account.findById(accountId);
    if (!account) return false;
    return (
        account.owner.toString() === userId.toString() || 
        account.members.some(
            (m) => m.user.toString() === userId.toString() && m.status === 'active'
        )
    );
};

export const getMessages = async (req, res, next) => {
    try {
        const { accountId } = req.params;
        if (!(await checkAccess(accountId, req.user._id)))
            return res.status(403).json({ message: 'Нет доступа.' });

        const messages = await Message.find({ account: accountId })
            .populate('user', 'name avatar')
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (err) { next(err); }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { accountId } = req.params;
        const { text } = req.body;

        if (!text?.trim())
            return res.status(400).json({ message: 'Сообщение не может быть пустым' });

        if (!(await checkAccess(accountId, req.user._id)))
            return res.status(403).json({ message: 'Нет доступа' });

        const message = await Message.create({
            account: accountId,
            user: req.user._id,
            text: text.trim(),
        });

        const account = await Account.find(accountId)
            .populate('owner', '_id')
            .populate('members.user', '_id');
        
        const allMembers = [
            account.owner._id,
            ...account.members.filter(m => m.status === 'active').map(m => m.user._id),
        ];

        for (const memberId of allMembers) {
            if (memberId.toString() !== req.user._id.toString()) {
                await pushToUser(memberId, {
                    title: `💬${account.name}`,
                    body: `${req.user.name}: ${text.slice(0, 60)}`,
                    icon: '/pwa-192.png',
                    url: '/accounts',
                });
            }
        }

        await message.populate('user', 'name avatar');
        res.status(201).json(message);
    } catch (err) { next(err); }
};