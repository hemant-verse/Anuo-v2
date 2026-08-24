import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    whatsapp: { type: String, trim: true },
    telegram: { type: String, trim: true },
    instagram: { type: String, trim: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    isNegotiable: { type: Boolean, default: false },
    category: { type: String, required: true, trim: true, index: true },
    condition: { type: String, required: true, enum: ['New', 'Like New', 'Good', 'Fair'] },
    images: [{ type: String, trim: true }],
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contacts: { type: ContactSchema, required: true },
    moderationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
    availabilityStatus: { type: String, enum: ['AVAILABLE', 'RESERVED', 'SOLD'], default: 'AVAILABLE', index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ moderationStatus: 1, availabilityStatus: 1, category: 1, createdAt: -1 });
ProductSchema.index({ moderationStatus: 1, availabilityStatus: 1, title: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
