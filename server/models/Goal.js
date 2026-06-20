import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'RUB' },
  deadline: { type: Date },
  icon: { type: String, default: 'target' },
  color: { type: String, default: '#7c6af7' },
  note: { type: String, trim: true },
  completed: { type: Boolean, default: false },
  contributions: [{
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    note: { type: String },
  }],
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);