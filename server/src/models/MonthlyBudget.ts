import { Schema, model, type Types } from 'mongoose';

export interface IMonthlyBudget {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  year: number;
  month: number;
  amount: number;
}

const schema = new Schema<IMonthlyBudget>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

schema.index({ user: 1, year: 1, month: 1 }, { unique: true });

export const MonthlyBudget = model<IMonthlyBudget>('MonthlyBudget', schema);