import { Schema, model, type Types } from 'mongoose';
import type { Currency } from '@accountant/shared';

export interface IPayment {
  amount: number;
  date: Date;
  note: string;
}

export interface IDebt {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  totalAmount: number;
  paidAmount: number;
  currency: Currency;
  dueDate: Date | null;
  isOwed: boolean;
  creditor: string;
  note: string;
  settledAt: Date | null;
  payments: IPayment[];
  createdAt: Date;
  updatedAt: Date;
}

const integerAmount = {
  type: Number,
  required: true,
  min: [1, 'Сумма должна быть больше нуля'],
  validate: { validator: Number.isInteger, message: 'Сумма — целое число копеек' },
} as const;

const paymentSchema = new Schema<IPayment>(
  {
    amount: integerAmount,
    date: { type: Date, default: () => new Date() },
    note: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { _id: false },
);

const schema = new Schema<IDebt>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    totalAmount: integerAmount,
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
      validate: { validator: Number.isInteger, message: 'Сумма — целое число копеек' },
    },
    currency: { type: String, enum: ['RUB', 'USD', 'EUR'], default: 'RUB' },
    dueDate: { type: Date, default: null },
    isOwed: { type: Boolean, default: true },
    creditor: { type: String, trim: true, maxlength: 80, default: '' },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    settledAt: { type: Date, default: null },
    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true },
);

schema.index({ user: 1, settledAt: 1, dueDate: 1 });

export const Debt = model<IDebt>('Debt', schema);