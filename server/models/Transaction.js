import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['income', 'expense'],
            required: [true, 'Тип транзакции обязателен'],
        },
        amount: {
            type: Number,
            required: [true, 'Сумма обязательна'],
            min: [0.01, 'Сумма должна быть больше нуля'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Описание не более 200 символов'],
            default: '',
        },
        date: {
            type: Date,
            default: Date.now,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurringPeriod: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly', null],
            default: null,
        },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;