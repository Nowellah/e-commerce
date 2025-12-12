import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    isVerified: { type: Boolean, default: false },
    password: { type: String, required: true},
    role: { type: String, enum: ['user', 'admin'], default: 'user',}
}, { timestamps: true });

export default mongoose.model('user', userSchema);