import mongoose from 'mongoose';

const pushSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('PushSubscription', pushSchema);