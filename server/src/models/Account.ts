import { Schema, model, type Types } from 'mongoose';
import type { Currency } from '@accountant/shared';

export interface IMember {
  user: Types.ObjectId;
  status: 'pending' | 'active';
  joinedAt: Date | null;
}

export interface IAccount {
  _id: Types.ObjectId;
  name: string;
  owner: Types.ObjectId;
  members: IMember[];
  currency: Currency;
  color: string;
  icon: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'active'], default: 'pending' },
    joinedAt: { type: Date, default: null },
  },
  { _id: false },
);

const accountSchema = new Schema<IAccount>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: { type: [memberSchema], default: [] },
    currency: { type: String, enum: ['RUB', 'USD', 'EUR'], default: 'RUB' },
    color: { type: String, default: '#2B5CC4' },
    icon: { type: String, default: 'users' },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

accountSchema.index({ 'members.user': 1, 'members.status': 1 });

export const Account = model<IAccount>('Account', accountSchema);