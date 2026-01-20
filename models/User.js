const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // SHA-256 Hashed
    phone: { type: String },
    tcId: { type: String },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, default: 'customer' }, // 'admin' or 'customer'
    addresses: [{
        title: String,
        address: String,
        city: String,
        district: String,
        phone: String
    }]
});

// Prevent model recompilation error in serverless environment
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
