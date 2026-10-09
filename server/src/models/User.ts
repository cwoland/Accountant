import { Schema, model, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { Currency } from '@accountant/shared';

const BCRYPT_ROUNDS = 12;

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: string;
  currency: Currency;
  monthlyBudget: number;
  onboardingCompleted: boolean;
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'Имя обязательно'], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Некорректный email'],
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    currency: { type: String, enum: ['RUB', 'USD', 'EUR'], default: 'RUB' },
    monthlyBudget: { type: Number, default: 0, min: 0 },
    onboardingCompleted: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.matchPassword = async function (
  this: IUser,
  candidate: string,
): Promise<boolean> {
  if (typeof candidate !== 'string' || candidate.length === 0) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', userSchema);