import { Schema, model, type Types } from 'mongoose';
import type { Currency } from '@accountant/shared';

export interface IContribution {
  amount: number;
  date: Date;
  note: string;
}

export interface IGoal {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline: Date | null;
  icon: string;
  ink: number;
  note: string;
  completedAt: Date | null;
  contributions: IContribution[];
  createdAt: Date;
  updatedAt: Date;
}

const contributionSchema = new Schema<IContribution>(
  {
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: 'Сумма — целое число копеек' },
    },
    date: { type: Date, default: () => new Date() },
    note: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { _id: false },
);

const schema = new Schema<IGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: 'Сумма — целое число копеек' },
    },
    currentAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: ['RUB', 'USD', 'EUR'], default: 'RUB' },
    deadline: { type: Date, default: null },
    icon: { type: String, default: 'target', maxlength: 32 },
    ink: { type: Number, default: 4, min: 0, max: 11 },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    completedAt: { type: Date, default: null },
    contributions: { type: [contributionSchema], default: [] },
  },
  { timestamps: true },
);

schema.index({ user: 1, completedAt: 1, deadline: 1 });

export const Goal = model<IGoal>('Goal', schema);