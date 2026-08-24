import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema(
  {
    identity: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: { type: String, enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'], required: true, index: true },
    codeHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ identity: 1, purpose: 1, createdAt: -1 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
