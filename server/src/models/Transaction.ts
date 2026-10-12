import { Schema, model, type Types } from 'mongoose';

export interface ITransaction {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  account: Types.ObjectId | null;
  type: 'income' | 'expense';
  amount: number;
  category: Types.ObjectId;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurringParent: Types.ObjectId | null;
  nextRunAt: Date | null;
  recurringAnchorDay: number | null;
  recurringStoppedAt: Date | null;
  transfer: Types.ObjectId | null;
  split: { user: Types.ObjectId; share: number }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    account: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Сумма должна быть больше нуля'],
      validate: {
        validator: Number.isInteger,
        message: 'Сумма должна быть целым числом копеек',
      },
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    date: { type: Date, default: () => new Date() },
    isRecurring: { type: Boolean, default: false },
    recurringPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null,
    },
    recurringParent: { type: Schema.Types.ObjectId, ref: 'Transaction', default: null },
    nextRunAt: { type: Date, default: null },
    recurringAnchorDay: { type: Number, default: null, min: 1, max: 31 },
    recurringStoppedAt: { type: Date, default: null },
    transfer: { type: Schema.Types.ObjectId, default: null },
    split: {
      type: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        share: {
          type: Number,
          required: true,
          min: 0,
          validate: { validator: Number.isInteger, message: 'Доля — целое число копеек' },
        },
        _id: false,
      }],
      default: [],
    },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, account: 1, date: -1 });
transactionSchema.index({ account: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });
transactionSchema.index({ description: 'text' });
transactionSchema.index({ nextRunAt: 1 }, { sparse: true });
transactionSchema.index({ nextRunAt: 1 }, { sparse: true });
transactionSchema.index({ recurringParent: 1 }, { sparse: true });
transactionSchema.index({ transfer: 1 }, { sparse: true });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);