import mongoose from 'mongoose';

const monthlyBudgetSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year:   { type: Number, required: true },
  month:  { type: Number, required: true, min: 1, max: 12 },
  amount: { type: Number, required: true, min: 0 },
}, { timestamps: true });

monthlyBudgetSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model('MonthlyBudget', monthlyBudgetSchema);