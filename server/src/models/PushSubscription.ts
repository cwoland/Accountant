import { Schema, model, type Types } from 'mongoose';

export interface IPushSubscription {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent: string;
  lastSeenAt: Date;
  createdAt: Date;
}

const schema = new Schema<IPushSubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: '', maxlength: 300 },
    lastSeenAt: { type: Date, default: () => new Date() },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const PushSubscription = model<IPushSubscription>('PushSubscription', schema);