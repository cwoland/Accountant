import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Имя обязательно'],
            trim: true,
            maxlength: [50, 'Не более 50 символов'],
        },
        email: {
            type: String,
            required: [true, 'Email обязателен'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Некорректный email'],
        },
        password: {
            type: String,
            required: [true, 'Пароль обязателен'],
            minlength: [8, 'Минимум 8 символов'],
            select: false,
        },
        avatar: {
            type: String,
            default: '',
        },
        currency: {
            type: String,
            default: 'RUB',
            enum: ['RUB', 'USD', 'EUR'],
        },
        monthlyBudget: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (done) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    done();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
