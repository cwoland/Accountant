import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        name: {
            type: String,
            required: [true, 'Название категории обязательно'],
            trim: true,
            maxlength: [50, 'Название не более 50 символов'],
        },
        type: {
            type: String,
            enum: ['income', 'expense', 'both'],
            default: 'both',
        },
        icon: {
            type: String,
            default: '💰',
        },
        color: {
            type: String,
            default: '#6366f1',
        },
        isMandatory: {
            type: Boolean,
            default: false,
        },
        isSystem: {
            type: Boolean,
            default: false,
        },
        hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    },
    { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;