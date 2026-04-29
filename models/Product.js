const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, maxlength: 300 },
    description: { type: String }, // HTML content
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category: { type: String, default: 'Genel' },
    brand: { type: String, default: 'DEER DERI' },
    images: [{
        url: { type: String },
        order: { type: Number, default: 0 }
    }],
    mainImage: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
}, {
    timestamps: true
});

// Index for slug lookups
productSchema.index({ slug: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
