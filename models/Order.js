const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        tc: { type: String },
    },
    shippingAddress: {
        title: { type: String },
        line1: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String },
        postalCode: { type: String },
    },
    billingAddress: {
        title: { type: String },
        line1: { type: String },
        city: { type: String },
        district: { type: String },
        postalCode: { type: String },
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String },
        slug: { type: String },
    }],
    subtotal: { type: Number, required: true },
    couponCode: { type: String },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['creditCard', 'cashOnDelivery'],
        default: 'creditCard'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingMethod: {
        type: String,
        enum: ['standard', 'express', 'door'],
        default: 'standard'
    },
    trackingNumber: { type: String },
    notes: { type: String },
}, {
    timestamps: true
});

// Auto-generate orderNumber before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `SIP-${dateStr}-${randomPart}`;
    }
    next();
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
