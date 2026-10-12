import { Schema, model, type Types } from 'mongoose';

export interface ICategoryBudget {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  category: Types.ObjectId;
  year: number;
  month: number;
  amount: number;
}

const schema = new Schema<ICategoryBudget>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    amount: {
      type: Number, required: true, min: 0,
      validate: { validator: Number.isInteger, message: 'Сумма — целое число копеек' },
    },
  },
  { timestamps: true },
);

schema.index({ user: 1, year: 1, month: 1, category: 1 }, { unique: true });

export const CategoryBudget = model<ICategoryBudget>('CategoryBudget', schema);