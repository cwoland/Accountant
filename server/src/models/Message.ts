import { Schema, model, type Types } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  account: Types.ObjectId;
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMessage>(
  {
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

schema.index({ account: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', schema);