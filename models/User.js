import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Auth & verification
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Password reset
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

    // Relations to other models
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);