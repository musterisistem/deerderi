const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'main' },
    siteName: { type: String, default: 'DEER DERİ' },
    shippingRates: {
        standard: { price: { type: Number, default: 100 }, days: { type: String, default: '2-3' } },
        express: { price: { type: Number, default: 200 }, days: { type: String, default: '1' } },
    },
    freeShippingThreshold: { type: Number, default: 2000 },
    paymentMethods: {
        creditCard: { type: Boolean, default: true },
        cashOnDelivery: { type: Boolean, default: true },
    },
    contact: {
        email: { type: String, default: 'info@deerderi.com' },
        phone: { type: String },
        address: { type: String },
        workingHours: { type: String, default: '09:00 - 18:00' },
    },
}, {
    _id: false,
    timestamps: true
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
