import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'RUB' },
  dueDate: { type: Date },
  isOwed: { type: Boolean, default: true },
  creditor: { type: String, trim: true },
  note: { type: String, trim: true },
  payments: [{
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    note: { type: String },
  }],
}, { timestamps: true });

export default mongoose.model('Debt', debtSchema);