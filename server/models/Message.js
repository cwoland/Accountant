import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:    { type: String,required: true, trim: true, maxlength: 10000 },
}, { timestamps: true });

messageSchema.index({ account: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);