import { Schema, model, type Types } from 'mongoose';
import { INKS } from '@accountant/shared';

export interface ICategory {
  _id: Types.ObjectId;
  user: Types.ObjectId | null;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  ink: number;
  isMandatory: boolean;
  dueDay: number | null;
  isSystem: boolean;
  hiddenFor: Types.ObjectId[];
  archivedAt: Date | null;
}

const schema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    type: { type: String, enum: ['income', 'expense', 'both'], default: 'both' },
    icon: { type: String, default: 'circle' },
    ink: { type: Number, default: 10, min: 0, max: INKS.length - 1 },
    isMandatory: { type: Boolean, default: false },
    dueDay: { type: Number, default: null, min: 1, max: 31 },
    isSystem: { type: Boolean, default: false },
    hiddenFor: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

schema.index({ isSystem: 1, archivedAt: 1 });

export const Category = model<ICategory>('Category', schema);