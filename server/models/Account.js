import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            default: 'Совместный счёт',
            trim: true,
            maxlength: 50,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                status: { type: String, enum: ['pending', 'active'], default: 'pending' },
                joinedAt: { type: Date },
            },
        ],
        isPersonal: {
            type: Boolean,
            default: false,
        },
        currency: {
            type: String,
            default: 'RUB',
            enum: ['RUB', 'USD', 'EUR'],
        },
        color: {
            type: String,
            default: '#7c6af7',
        },
        icon: {
            type: String,
            default: '👥',
        },
    },
    { timestamps: true }
);

const Account = mongoose.model('Account', accountSchema);
export default Account;